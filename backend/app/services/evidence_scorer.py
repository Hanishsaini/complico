CONTROL_CHECKS = {
    "CC1.1": ["code of conduct", "ethical values", "integrity"],
    "CC1.2": ["board independence", "oversight", "independent director"],
    "CC6.1": ["access control", "authentication", "MFA", "firewall"],
    "CC6.2": ["access provisioning", "grant access", "revoke access"],
    "CC6.3": ["security awareness training", "phishing", "training"],
    "CC7.1": ["change management", "change request", "testing", "approval"],
    "CC7.2": ["risk assessment", "risk register", "risk methodology"],
    "CC8.1": ["vendor management", "third-party risk", "vendor assessment"],
}

def score_evidence(control_id: str, retrieved_chunks: list[str]) -> dict:
    checks = CONTROL_CHECKS.get(control_id, [])
    if not checks:
        return {"score": 0, "total": 0, "assessment": "does not meet", "details": []}

    evidence_text = " ".join(retrieved_chunks).lower()
    found = 0
    details = []
    for phrase in checks:
        present = phrase.lower() in evidence_text
        if present:
            found += 1
        details.append({"phrase": phrase, "found": present})

    total = len(checks)
    if found == total:
        assessment = "meets"
    elif found >= total // 2:
        assessment = "partially meets"
    else:
        assessment = "does not meet"

    return {
        "score": found,
        "total": total,
        "assessment": assessment,
        "details": details
    }