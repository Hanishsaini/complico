import json
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()
groq = Groq(api_key=os.getenv("GROQ_API_KEY"))

CONTROL_DETAILS = {
    "CC1.1": {"title": "Integrity and Ethical Values", "criteria": "Commitment to integrity and ethical values.", "procedure": "Review code of conduct and employee handbook."},
    "CC1.2": {"title": "Board Independence", "criteria": "Board independence from management.", "procedure": "Examine board minutes and charters."},
    "CC6.1": {"title": "Logical Access", "criteria": "Logical access security measures.", "procedure": "Inspect ACLs and authentication mechanisms."},
    "CC6.2": {"title": "User Provisioning", "criteria": "Process for granting/revoking access.", "procedure": "Review access request forms."},
    "CC6.3": {"title": "Security Training", "criteria": "Security awareness training.", "procedure": "Obtain training records."},
    "CC7.1": {"title": "Change Management", "criteria": "Change authorization and testing.", "procedure": "Inspect change tickets."},
    "CC7.2": {"title": "Risk Assessment", "criteria": "Risk identification and assessment.", "procedure": "Review risk register."},
    "CC8.1": {"title": "Vendor Risk", "criteria": "Third-party risk management.", "procedure": "Obtain vendor assessments."},
}

def generate_workpaper(control_id: str, document_text: str, company_context: str = "") -> dict:
    info = CONTROL_DETAILS.get(control_id)
    if not info:
        return {"error": f"Control {control_id} not found"}

    prompt = f"""Draft audit workpaper for {control_id} – {info['title']}.
Criteria: {info['criteria']}
Testing Procedure: {info['procedure']}
Company: {company_context if company_context else 'Not provided'}
Document: {document_text[:4000]}

Return JSON:
{{
    "control_id": "{control_id}",
    "control_title": "{info['title']}",
    "overall_assessment": "meets / partially meets / does not meet",
    "evidence_found": [{{"source_ref": "...", "relevant_text": "...", "analysis": "..."}}],
    "gaps_identified": [{{"description": "...", "impact": "...", "recommendation": "..."}}],
    "further_procedures": "..."
}}
"""
    try:
        response = groq.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {"error": str(e)}