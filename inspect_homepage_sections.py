from bs4 import BeautifulSoup
import json

with open(r"D:\Portofolio\src\data\projects\about-2-2.json", "r", encoding="utf-8") as f:
    data = json.load(f)

content = data["content"]
soup = BeautifulSoup(content, "html.parser")

print("--- Sequential Flow of Tags in Homepage ---")
child_count = 0
for child in soup.children:
    if child.name:
        text_snippet = child.get_text(strip=True)
        if len(text_snippet) > 80:
            text_snippet = text_snippet[:80] + "..."
        print(f"{child_count:03d}: <{child.name}> class={child.get('class')}, id={child.get('id')} -> text: '{text_snippet}'")
        child_count += 1
    elif isinstance(child, str) and child.strip():
        print(f"{child_count:03d}: [TextNode] -> '{child.strip()[:80]}...'")
        child_count += 1
