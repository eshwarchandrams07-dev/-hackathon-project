import io
from pypdf import PdfReader
from fastapi import HTTPException

def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        pages = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                pages.append(text.strip())
        
        full_text = "\n\n".join(pages).strip()
        if not full_text:
            raise HTTPException(status_code=400, detail="No readable text found in PDF.")
        return full_text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF extraction failed: {str(e)}")