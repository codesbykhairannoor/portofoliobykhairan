import json
import os

with open(r"D:\Portofolio\src\data\projects\about-2-2.json", "r", encoding="utf-8") as f:
    home = json.load(f)
    
content = home["content"]
print("Homepage Content Length:", len(content))

# Check which project slugs are mentioned
dest_dir = r"D:\Portofolio\src\data\projects"
files = [f[:-5] for f in os.listdir(dest_dir) if f.endswith(".json") and f != "about-2-2.json"]

print("\n--- Project Slugs found on Homepage ---")
for slug in files:
    if slug in content:
        print(f"Slug: {slug} is MENTIONED on homepage!")
    else:
        print(f"Slug: {slug} is NOT mentioned on homepage.")
