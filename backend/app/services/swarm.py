import json
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()
groq = Groq(api_key=os.getenv("GROQ_API_KEY"))

def complete(model, messages, temperature=0.0):
    return groq.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature,
        response_format={"type": "json_object"},
    )

def run_dual_agent(control_id, description, document_text):
    """Two agents + tie-breaker for high-confidence determination."""
    prompt = f"""Analyze control {control_id} ({description}).
Document: {document_text[:4000]}
Return JSON:
{{"status":"covered/partial/gap","confidence":0-1,"rationale":"...","recommendation":"...","priority":"high/medium/low","action_steps":["..."],"evidence_sentence":"...","keyword":"..."}}"""

    # Primary agent (strong model)
    try:
        r1 = complete("llama-3.3-70b-versatile", [{"role":"user","content":prompt}])
        a1 = json.loads(r1.choices[0].message.content)
    except Exception:
        a1 = None

    # Secondary agent (fast/cheap)
    try:
        r2 = complete("llama-3.1-8b-instant", [{"role":"user","content":prompt}])
        a2 = json.loads(r2.choices[0].message.content)
    except Exception:
        a2 = None

    # If both agree, return primary's output (most trusted)
    if a1 and a2 and a1.get("status") == a2.get("status"):
        return a1

    # If one failed, return the other
    if not a1 and a2: return a2
    if not a2 and a1: return a1

    # Tie-breaker
    if a1 and a2:
        tb_prompt = f"""Two AI auditors disagreed on control {control_id}.
Auditor 1: {json.dumps(a1)}
Auditor 2: {json.dumps(a2)}
You are the senior auditor. Decide the final assessment and explain why.
Return JSON: {{"status":"covered/partial/gap","confidence":0-1,"rationale":"...","recommendation":"...","priority":"high/medium/low","action_steps":["..."],"evidence_sentence":"...","keyword":"..."}}"""
        try:
            r3 = complete("llama-3.3-70b-versatile", [{"role":"user","content":tb_prompt}])
            return json.loads(r3.choices[0].message.content)
        except Exception:
            return a1  # fallback to primary

    # Fallback if both None (should not happen)
    return {"status":"error","confidence":0,"rationale":"Both agents failed","recommendation":"","priority":"medium","action_steps":[],"evidence_sentence":"","keyword":""}