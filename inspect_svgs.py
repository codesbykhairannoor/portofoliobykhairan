from bs4 import BeautifulSoup
import json

with open(r"D:\Portofolio\src\data\projects\about-2-2.json", "r", encoding="utf-8") as f:
    data = json.load(f)

content = data["content"]
soup = BeautifulSoup(content, "html.parser")
elements = list(soup.children)

for idx in [108, 110]:
    el = elements[idx]
    print(f"Node {idx}: {str(el)[:200]}")
