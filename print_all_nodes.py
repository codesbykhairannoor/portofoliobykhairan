from bs4 import BeautifulSoup
import json

with open(r"D:\Portofolio\src\data\projects\about-2-2.json", "r", encoding="utf-8") as f:
    data = json.load(f)

content = data["content"]
soup = BeautifulSoup(content, "html.parser")

elements = list(soup.children)
print(f"Total root elements: {len(elements)}")

for idx in range(220, min(310, len(elements))):
    el = elements[idx]
    if el.name:
        text = el.get_text(strip=True)
        if len(text) > 80:
            text = text[:80] + "..."
        print(f"Node {idx:03d}: <{el.name}> class={el.get('class')} -> '{text}'")
    elif isinstance(el, str) and el.strip():
        print(f"Node {idx:03d}: [TextNode] -> '{el.strip()[:80]}'")
