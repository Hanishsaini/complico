import PyPDF2

def extract_text_from_pdf(pdf_path: str) -> str:
    text = ""
    with open(pdf_path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

def get_text_snippet(text: str, keyword: str, window: int = 300) -> str:
    if not keyword:
        return text[:window] + ("..." if len(text) > window else "")
    idx = text.lower().find(keyword.lower())
    if idx == -1:
        return text[:window] + ("..." if len(text) > window else "")
    start = max(0, idx - window // 2)
    end = min(len(text), idx + len(keyword) + window // 2)
    snippet = text[start:end].strip()
    if start > 0:
        snippet = "..." + snippet
    if end < len(text):
        snippet = snippet + "..."
    return snippet