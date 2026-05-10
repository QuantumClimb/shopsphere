import pytesseract
from PIL import Image
import os
import json

# Set the tesseract path
pytesseract.pytesseract.tesseract_cmd = r"K:\I DRIVE\Tesseract-OCR\tesseract.exe"

def ocr_images(image_dir, num_images=10):
    results = {}
    images = [f for f in os.listdir(image_dir) if f.endswith(('.jpeg', '.jpg', '.png'))]
    images.sort()
    
    # Process only a subset first to verify
    for img_name in images[:num_images]:
        img_path = os.path.join(image_dir, img_name)
        print(f"Processing {img_name}...")
        try:
            text = pytesseract.image_to_string(Image.open(img_path))
            results[img_name] = text.strip()
        except Exception as e:
            results[img_name] = f"Error: {str(e)}"
            
    return results

if __name__ == "__main__":
    image_dir = "extracted_pdf_data"
    ocr_results = ocr_images(image_dir, num_images=20) # OCR first 20 images
    
    with open("ocr_results_sample.json", "w", encoding="utf-8") as f:
        json.dump(ocr_results, f, indent=2)
    
    print("OCR sample completed. Results saved to ocr_results_sample.json")
