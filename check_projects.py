import os
import json

projects_dir = 'src/data/projects'
print("Checking src/data/projects JSON files...")
for filename in os.listdir(projects_dir):
    if filename.endswith('.json'):
        filepath = os.path.join(projects_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                keys = list(data.keys())
                has_bilingual = 'content_id' in data or 'content_en' in data or 'title_id' in data or 'title_en' in data
                print(f"  {filename}: keys={keys}, has_bilingual={has_bilingual}")
            except Exception as e:
                print(f"  {filename}: Error parsing: {e}")
