import fitz  # PyMuPDF
import io
import os
from PIL import Image

def extract_pdf_data(pdf_path, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    doc = fitz.open(pdf_path)
    text_content = []
    
    for page_index in range(len(doc)):
        page = doc[page_index]
        text_content.append(f"--- Page {page_index + 1} ---")
        text_content.append(page.get_text())
        
        image_list = page.get_images(full=True)
        print(f"Found {len(image_list)} images on page {page_index + 1}")
        
        for image_index, img in enumerate(image_list):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            
            image = Image.open(io.BytesIO(image_bytes))
            image_filename = f"page{page_index + 1}_img{image_index + 1}.{image_ext}"
            image.save(os.path.join(output_dir, image_filename))
            print(f"Saved {image_filename}")

    with open(os.path.join(output_dir, "extracted_text.txt"), "w", encoding="utf-8") as f:
        f.write("\n".join(text_content))

if __name__ == "__main__":
    pdf_path = "BRANDED TURKEY PERFUME  2.pdf"
    output_dir = "extracted_pdf_data"
    extract_pdf_data(pdf_path, output_dir)
