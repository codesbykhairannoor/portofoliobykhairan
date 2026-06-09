import os
import json

dest_dir = r"D:\Portofolio\src\data\projects"

if os.path.exists(dest_dir):
    files = [f for f in os.listdir(dest_dir) if f.endswith('.json')]
    count = 0
    for file_name in files:
        file_path = os.path.join(dest_dir, file_name)
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        content = data.get('content', '')
        
        # Replace absolute image urls
        content_cleaned = content.replace("https://khairan.tech/wp-content/uploads/", "/wp-content/uploads/")
        content_cleaned = content_cleaned.replace("http://khairan.tech/wp-content/uploads/", "/wp-content/uploads/")
        
        # Replace absolute internal website links
        content_cleaned = content_cleaned.replace("href=\"https://khairan.tech/\"", "href=\"/\"")
        content_cleaned = content_cleaned.replace("href=\"https://khairan.tech/#", "href=\"/#")
        content_cleaned = content_cleaned.replace("href=\"https://khairan.tech/", "href=\"/")
        
        if content_cleaned != content:
            data['content'] = content_cleaned
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            count += 1
            
    print(f"Cleaned up urls in {count} JSON files.")
else:
    print("Projects directory not found")
