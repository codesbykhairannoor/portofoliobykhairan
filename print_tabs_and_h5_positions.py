from bs4 import BeautifulSoup
import json

with open(r"D:\Portofolio\src\data\projects\about-2-2.json", "r", encoding="utf-8") as f:
    data = json.load(f)

content = data["content"]
soup = BeautifulSoup(content, "html.parser")

elements = list(soup.children)
for idx, el in enumerate(elements):
    if el.name == "ul" and el.get("role") == "tablist":
        print(f"--- FOUND TABLIST at node index {idx} ---")
    elif el.name in ["h2", "h3", "h5", "h6"]:
        text = el.get_text(strip=True)
        print(f"Node {idx:03d}: <{el.name}>: {text[:50]}")
