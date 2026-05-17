import os, json, re, time
from groq import Groq
from dotenv import load_dotenv
from .pdf_parser import get_text_snippet
from .services.swarm import run_dual_agent

load_dotenv()
groq = Groq(api_key=os.getenv("GROQ_API_KEY"))

SOC2_INFO = {
    "CC1.1": "Integrity and ethical values",
    "CC1.2": "Board independence and oversight",
    "CC6.1": "Logical access security",
    "CC6.2": "User access provisioning",
    "CC6.3": "Security awareness training",
    "CC7.1": "Change management",
    "CC7.2": "Risk assessment",
    "CC8.1": "Vendor risk management",
}

def _extract_json(text: str):
    if not text: return None
    text = text.strip()
    try:
        data = json.loads(text)
        return data if isinstance(data, list) else [data]
    except:
        pass
    match = re.search(r'```(?:json)?\s*(\[.*?\])\s*```', text, re.DOTALL)
    if match:
        try: return json.loads(match.group(1))
        except: pass
    start = text.find('[')
    if start != -1:
        count = 0
        for i in range(start, len(text)):
            if text[i] == '[': count += 1
            elif text[i] == ']': count -= 1
            if count == 0:
                try: return json.loads(text[start:i+1])
                except: break
    return None

def _call_llm(prompt: str, expect_array: bool = True):
    for attempt in range(3):
        try:
            response = groq.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role":"user","content":prompt}],
                temperature=0.0,
                response_format={"type":"json_object"}
            )
            content = response.choices[0].message.content
            if expect_array:
                data = _extract_json(content)
                if data is not None: return data
                raise Exception("No valid JSON array")
            else:
                return json.loads(content)
        except Exception as e:
            if "429" in str(e) or "rate_limit" in str(e).lower():
                time.sleep((attempt+1)*10)
            else:
                if attempt == 2: raise e
                time.sleep(2)
    raise Exception("LLM failed")

def _analyze_single(control_id, document_text, framework_info=None):
    desc = framework_info.get(control_id, "") if framework_info else SOC2_INFO.get(control_id, "")
    prompt = f"""Analyze control {control_id} ({desc}).
Document: {document_text[:4000]}
Return JSON: {{"status":"covered/partial/gap","confidence":0-1,"rationale":"...","recommendation":"...","priority":"high/medium/low","action_steps":["..."],"evidence_sentence":"...","keyword":"..."}}"""
    try:
        data = _call_llm(prompt, expect_array=False)
        evidence = data.get("evidence_sentence","")
        snippet = get_text_snippet(document_text, evidence if evidence else data.get("keyword",""))
        if evidence: snippet = f"🔍 MATCH: \"{evidence}\"\n\n{snippet}"
        return {"control_id":control_id,"status":data.get("status","error"),"confidence":float(data.get("confidence",0)),"rationale":data.get("rationale",""),"recommendation":data.get("recommendation",""),"priority":data.get("priority","medium"),"action_steps":data.get("action_steps",[]) if isinstance(data.get("action_steps"),list) else [],"evidence_snippet":snippet,"evidence_sentence":evidence}
    except Exception as e:
        return {"control_id":control_id,"status":"error","confidence":0,"rationale":str(e),"recommendation":"","priority":"low","action_steps":[],"evidence_snippet":"","evidence_sentence":""}

def analyze_controls(control_ids, document_text, use_swarm=False, framework_info=None):
    if not control_ids: return []
    if use_swarm:
        results = []
        for cid in control_ids:
            desc = framework_info.get(cid, "") if framework_info else SOC2_INFO.get(cid, "")
            result = run_dual_agent(cid, desc, document_text)
            evidence = result.get("evidence_sentence","")
            snippet = get_text_snippet(document_text, evidence if evidence else result.get("keyword",""))
            if evidence: snippet = f"🔍 MATCH: \"{evidence}\"\n\n{snippet}"
            results.append({
                "control_id": cid,
                "status": result.get("status","error"),
                "confidence": float(result.get("confidence",0)),
                "rationale": result.get("rationale",""),
                "recommendation": result.get("recommendation",""),
                "priority": result.get("priority","medium"),
                "action_steps": result.get("action_steps",[]) if isinstance(result.get("action_steps"),list) else [],
                "evidence_snippet": snippet,
                "evidence_sentence": evidence
            })
            time.sleep(1)
        return results
    else:
        # Original batch with fallback logic
        controls_desc = "\n".join([f"- {cid}: {framework_info.get(cid, SOC2_INFO.get(cid, ''))}" for cid in control_ids])
        batch_prompt = f"""Analyze ALL these controls. Return JSON ARRAY of {len(control_ids)} objects:
{{"control_id":"...","status":"covered/partial/gap","confidence":0-1,"rationale":"...","recommendation":"...","priority":"high/medium/low","action_steps":["..."],"evidence_sentence":"...","keyword":"..."}}
Controls: {controls_desc}
Document: {document_text[:4000]}"""
        try:
            batch = _call_llm(batch_prompt, expect_array=True)
            results = []
            found = set()
            for item in batch:
                cid = item.get("control_id","")
                if cid in control_ids:
                    evidence = item.get("evidence_sentence","")
                    snippet = get_text_snippet(document_text, evidence if evidence else item.get("keyword",""))
                    if evidence: snippet = f"🔍 MATCH: \"{evidence}\"\n\n{snippet}"
                    results.append({
                        "control_id":cid,"status":item.get("status","error"),
                        "confidence":float(item.get("confidence",0)),
                        "rationale":item.get("rationale",""),
                        "recommendation":item.get("recommendation",""),
                        "priority":item.get("priority","medium"),
                        "action_steps":item.get("action_steps",[]) if isinstance(item.get("action_steps"),list) else [],
                        "evidence_snippet":snippet,"evidence_sentence":evidence})
                    found.add(cid)
            for cid in control_ids:
                if cid not in found:
                    results.append(_analyze_single(cid, document_text, framework_info))
            return results
        except Exception as e:
            print(f"Batch failed: {e}")
            return [_analyze_single(cid, document_text, framework_info) for cid in control_ids]