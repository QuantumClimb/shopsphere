import json
import pandas as pd
from fuzzywuzzy import fuzz
from fuzzywuzzy import process
import re
import os

def load_data():
    with open("ocr_results_full.json", "r", encoding="utf-8") as f:
        ocr_data = json.load(f)
    
    df = pd.read_csv("parfumo_data.csv")
    df = df.dropna(subset=['Name', 'Brand'])
    df['search_text'] = df['Brand'].astype(str) + " " + df['Name'].astype(str)
    return ocr_data, df

BRANDS = [
    "Giorgio Armani", "Emporio Armani", "Dior", "Dolce & Gabbana", "Louis Vuitton", 
    "Parfums de Marly", "Carolina Herrera", "Creed", "Bvlgari", "Tom Ford", 
    "Billie Eilish", "Azzaro", "Versace", "Rasasi", "Marc Jacobs", "Gucci", 
    "Lancome", "Paco Rabanne", "Davidoff", "Yves Saint Laurent", "Prada", 
    "Valentino", "Maison Alhambra", "Sakamichi", "Jean Paul Gaultier", "Victoria's Secret",
    "Montblanc", "Hugo Boss"
]

def extract_metadata(text):
    text_lower = text.lower()
    brand = None
    for b in BRANDS:
        if b.lower() in text_lower:
            brand = b
            break
    
    concentration = None
    for c in ["Parfum", "Eau de Parfum", "EDP", "Eau de Toilette", "EDT", "Elixir"]:
        if c.lower() in text_lower:
            concentration = c
            break
            
    volume_match = re.search(r'(\d+)\s*ml', text, re.IGNORECASE)
    volume = int(volume_match.group(1)) if volume_match else None
    
    gender = "Unisex"
    if any(k in text_lower for k in ["homme", "uomo", "man", "male"]):
        gender = "Male"
    elif any(k in text_lower for k in ["femme", "donna", "woman", "female", "lady", "girl"]):
        gender = "Female"
    
    return brand, concentration, volume, gender

def match_perfumes():
    ocr_data, df = load_data()
    matched_results = []
    
    # Pre-calculate brand groups to speed up search
    brand_groups = {}
    for brand in BRANDS:
        brand_groups[brand] = df[df['Brand'].str.contains(brand, case=False, na=False)]['search_text'].tolist()
    
    global_choices = df['search_text'].tolist()
    
    total = len(ocr_data)
    print(f"Matching {total} OCR results with optimized search...")
    
    for i, (img_name, text) in enumerate(ocr_data.items()):
        if i % 10 == 0:
            print(f"Progress: {i}/{total} processed...")
            
        if not text or len(text) < 5:
            continue
            
        brand, concentration, volume, detected_gender = extract_metadata(text)
        
        # Search in brand-specific list if brand detected, otherwise global
        choices = brand_groups.get(brand, global_choices)
        if not choices:
            choices = global_choices
            
        match, score = process.extractOne(text, choices, scorer=fuzz.token_set_ratio)
        
        if score > 70:
            match_row = df[df['search_text'] == match].iloc[0]
            
            final_gender = detected_gender
            matched_name_lower = str(match_row['Name']).lower()
            if final_gender == "Unisex":
                if any(k in matched_name_lower for k in ["homme", "uomo", "man", "male"]):
                    final_gender = "Male"
                elif any(k in matched_name_lower for k in ["femme", "donna", "woman", "female", "lady", "girl"]):
                    final_gender = "Female"

            result = {
                "image": img_name,
                "ocr_text": text,
                "matched_name": str(match_row['Name']),
                "matched_brand": str(match_row['Brand']),
                "score": score,
                "top_notes": str(match_row['Top_Notes']) if pd.notna(match_row['Top_Notes']) else None,
                "middle_notes": str(match_row['Middle_Notes']) if pd.notna(match_row['Middle_Notes']) else None,
                "base_notes": str(match_row['Base_Notes']) if pd.notna(match_row['Base_Notes']) else None,
                "family": str(match_row['Main_Accords']) if pd.notna(match_row['Main_Accords']) else None,
                "concentration": concentration or (str(match_row['Concentration']) if pd.notna(match_row['Concentration']) else "EDP"),
                "volume": volume or 100,
                "gender": final_gender
            }
            matched_results.append(result)
            
    with open("matched_perfumes.json", "w", encoding="utf-8") as f:
        json.dump(matched_results, f, indent=2)
    
    print(f"Matched {len(matched_results)} perfumes. Results saved to matched_perfumes.json")

if __name__ == "__main__":
    match_perfumes()
