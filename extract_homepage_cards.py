from bs4 import BeautifulSoup
import json
import re

with open(r"D:\Portofolio\src\data\projects\about-2-2.json", "r", encoding="utf-8") as f:
    data = json.load(f)

content = data["content"]

# Let's search for h5 tags and print some text around them to understand the structure.
soup = BeautifulSoup(content, "html.parser")
h5s = soup.find_all("h5")

print(f"Found {len(h5s)} <h5> tags on the homepage.")

for idx, h5 in enumerate(h5s[:10]):
    print(f"\n--- H5 #{idx+1} ---")
    print("Tag Content:", h5.get_text(strip=True))
    
    # Let's inspect the siblings of h5
    siblings = []
    curr = h5.next_sibling
    # Get up to 5 siblings
    sibling_count = 0
    while curr and sibling_count < 5:
        if isinstance(curr, str):
            text = curr.strip()
            if text:
                siblings.append(f"TextNode: '{text}'")
                sibling_count += 1
        else:
            siblings.append(f"Tag: <{curr.name}> text='{curr.get_text(strip=True)}'")
            sibling_count += 1
        curr = curr.next_sibling
    print("Next Siblings:", "\n  ".join(siblings))
