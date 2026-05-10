import pytesseract
from PIL import Image
import os
import json
import re

# Set the tesseract path
pytesseract.pytesseract.tesseract_cmd = r"K:\I DRIVE\Tesseract-OCR\tesseract.exe"

def clean_text(text):
    # Remove special characters and clean up whitespace
    text = text.replace('\n', ' ')
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def ocr_all_images(image_dir):
    results = {}
    images = [f for f in os.listdir(image_dir) if f.endswith(('.jpeg', '.jpg', '.png'))]
    images.sort(key=lambda x: int(re.search(r'page(\d+)_', x).group(1)) if re.search(r'page(\d+)_', x) else 0)
    
    total = len(images)
    print(f"Starting OCR on {total} images...")
    
    for i, img_name in enumerate(images):
        img_path = os.path.join(image_dir, img_name)
        if i % 10 == 0:
            print(f"Progress: {i}/{total}...")
        try:
            # We can use different configs for better results if needed
            text = pytesseract.image_to_string(Image.open(img_path))
            results[img_name] = clean_text(text)
        except Exception as e:
            results[img_name] = f"Error: {str(e)}"
            
    return results

if __name__ == "__main__":
    image_dir = "extracted_pdf_data"
    all_results = ocr_all_images(image_dir)
    
    with open("ocr_results_full.json", "w", encoding="utf-8") as f:
        json.dump(all_results, f, indent=2)
    
    print("Full OCR completed. Results saved to ocr_results_full.json")
