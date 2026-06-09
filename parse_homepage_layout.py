from bs4 import BeautifulSoup
import json
import re

with open(r"D:\Portofolio\src\data\projects\about-2-2.json", "r", encoding="utf-8") as f:
    data = json.load(f)

content = data["content"]
soup = BeautifulSoup(content, "html.parser")

print("--- Tabs found ---")
tabs = soup.find_all(attrs={"role": "tab"})
for tab in tabs:
    print(f"Tab: {tab.get('id')}, Text: {tab.get_text(strip=True)}, Tab Attr: {tab.get('data-tab')}")

print("\n--- Analysing Elementor Containers and Links ---")
# Let's find all project links and see their parents/surrounding text
links = soup.find_all("a")
for link in links:
    href = link.get("href", "")
    if href and ("/" in href or "#" in href) and href != "#" and "drive.google.com" not in href:
        # Find some ancestor or text
        parent_text = ""
        p = link.parent
        while p and p.name not in ["body", "html"]:
            # Check if there is some heading or class
            h = p.find(["h1", "h2", "h3", "h4", "h5", "h6"])
            if h:
                parent_text = h.get_text(strip=True)
                break
            p = p.parent
        print(f"Link: {href}, Text: {link.get_text(strip=True)}, Heading Ancestor: {parent_text}")

# Let's write a more refined script to find sections and extract HTML content of tabs if possible.
# Elementor usually structures things as containers with specific class names or IDs.
