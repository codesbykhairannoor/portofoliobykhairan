from bs4 import BeautifulSoup
import json

with open(r"D:\Portofolio\src\data\projects\about-2-2.json", "r", encoding="utf-8") as f:
    data = json.load(f)

content = data["content"]
soup = BeautifulSoup(content, "html.parser")

divs = soup.find_all("div")
print(f"Total <div> tags in content: {len(divs)}")

# Let's see some of the classes or structure of divs
for i, d in enumerate(divs[:10]):
    print(f"Div #{i+1}: class={d.get('class')}, id={d.get('id')}")
