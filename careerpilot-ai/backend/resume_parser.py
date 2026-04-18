import PyPDF2
import docx
import os

async def extract_resume_text(file):
    filename = file.filename.lower()
    content = await file.read()

    if filename.endswith(".pdf"):
        with open("temp.pdf", "wb") as f:
            f.write(content)

        text = ""
        pdf = PyPDF2.PdfReader("temp.pdf")

        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text

        return text.lower()

    elif filename.endswith(".docx"):
        with open("temp.docx", "wb") as f:
            f.write(content)

        doc = docx.Document("temp.docx")
        text = ""

        for para in doc.paragraphs:
            text += para.text + " "

        return text.lower()

    else:
        return "unsupported file format"