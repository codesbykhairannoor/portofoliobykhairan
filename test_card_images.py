from bs4 import BeautifulSoup
import json

with open(r"D:\Portofolio\src\data\projects\about-2-2.json", "r", encoding="utf-8") as f:
    data = json.load(f)

content = data["content"]
soup = BeautifulSoup(content, "html.parser")

h5s = soup.find_all("h5")
print(f"Total H5 elements: {len(h5s)}")

for i, h5 in enumerate(h5s):
    title = h5.get_text(strip=True)
    
    # Let's find the description (the next text sibling)
    desc = ""
    sibling = h5.next_sibling
    while sibling:
        if isinstance(sibling, str):
            if sibling.strip():
                desc = sibling.strip()
                break
        elif sibling.name == "h5":
            break
        sibling = sibling.next_sibling
        
    # Let's search for an <a> tag and <img> tag nearby
    link_href = ""
    img_src = ""
    
    # We can look forward for siblings, or search the parent container
    parent = h5.parent
    if parent:
        link = parent.find("a", href=True)
        if link:
            link_href = link.get("href")
            
        img = parent.find("img")
        if img:
            img_src = img.get("src") or img.get("data-src")
            
    print(f"H5 #{i+1}: {title}")
    print(f"  Desc: {desc[:60]}...")
    print(f"  Link: {link_href}")
    print(f"  Img:  {img_src}")
