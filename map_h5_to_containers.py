from bs4 import BeautifulSoup
import json

with open(r"D:\Portofolio\src\data\projects\about-2-2.json", "r", encoding="utf-8") as f:
    data = json.load(f)

content = data["content"]
soup = BeautifulSoup(content, "html.parser")

h5s = soup.find_all("h5")
print(f"Total H5 tags: {len(h5s)}")

# Let's print the parent path of classes for each H5 to find grouping
for i, h5 in enumerate(h5s):
    title = h5.get_text(strip=True)
    
    # Trace up to 4 parents
    p_path = []
    p = h5.parent
    while p and len(p_path) < 4:
        p_desc = f"{p.name}"
        if p.get("class"):
            p_desc += f".{'.'.join(p.get('class'))}"
        if p.get("id"):
            p_desc += f"#{p.get('id')}"
        p_path.append(p_desc)
        p = p.parent
        
    print(f"H5 #{i+1:02d}: {title}")
    print("  Parents:", " -> ".join(p_path))
