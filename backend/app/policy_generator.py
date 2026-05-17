import json
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()
groq = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_policy(control_id: str, gap_reason: str, recommendation: str) -> dict:
    prompt = f"""You are a senior SOC2 compliance expert. Write a professional, audit-ready policy document for control **{control_id}**.

Gap identified: {gap_reason}
Recommended action: {recommendation}

Return a JSON object with:
{{
  "title": "Policy Title",
  "sections": {{
    "purpose": "1-2 sentences",
    "scope": "Who and what this applies to",
    "policy": "The actual policy statements",
    "procedures": "Step-by-step implementation procedures",
    "enforcement": "Consequences for non-compliance"
  }}
}}
"""
    try:
        response = groq.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception:
        return {
            "title": f"{control_id} Policy",
            "sections": {
                "purpose": f"To address the compliance gap for {control_id}.",
                "scope": "All employees, contractors, and systems.",
                "policy": recommendation,
                "procedures": "1. Review current practices\n2. Implement required controls\n3. Document evidence",
                "enforcement": "Non-compliance may result in disciplinary action."
            }
        }