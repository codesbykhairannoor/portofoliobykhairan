from bs4 import BeautifulSoup
import json
import re
import os

with open(r"D:\Portofolio\src\data\projects\about-2-2.json", "r", encoding="utf-8") as f:
    data = json.load(f)

content = data["content"]
soup = BeautifulSoup(content, "html.parser")
elements = list(soup.children)

portfolio_data = {
    "carousel": [],
    "visual_design": [],
    "website": [],
    "skills": []
}

# Helper to find next sibling elements
def get_description_and_link(h_node, start_idx):
    desc = ""
    link_href = ""
    
    # 1. Look for text node immediately following
    idx = start_idx + 1
    while idx < len(elements):
        el = elements[idx]
        if isinstance(el, str):
            text = el.strip()
            if text:
                desc = text
                break
        elif el.name in ["h5", "h6", "h4", "h2", "style"]:
            break
        elif el.name == "p" and el.get_text(strip=True):
            desc = el.get_text(strip=True)
            if desc.startswith("Description:"):
                desc = desc[len("Description:"):].strip()
            break
        idx += 1
        
    # 2. Look for <a> tag
    idx = start_idx + 1
    while idx < len(elements):
        el = elements[idx]
        if el.name == "a":
            link_href = el.get("href", "")
            break
        elif el.name in ["h5", "h6", "h4", "h2"]:
            break
        idx += 1
        
    # Clean slug from href
    slug = ""
    if link_href:
        # e.g., /fundex-wesbsite-redesign/ -> fundex-wesbsite-redesign
        parts = [p for p in link_href.split("/") if p]
        if parts:
            slug = parts[-1]
            
    return desc, link_href, slug

# Let's map elements sequentially
# Carousel is Nodes 50 to 104
carousel_nodes = []
for idx in range(50, 105):
    el = elements[idx]
    if el.name in ["h5", "h6"]:
        carousel_nodes.append((idx, el))

for idx, h_el in carousel_nodes:
    title = h_el.get_text(strip=True)
    desc, link_href, slug = get_description_and_link(h_el, idx)
    
    # Find image before this h5 (looking backwards)
    img_src = ""
    back_idx = idx - 1
    while back_idx >= 0:
        prev_el = elements[back_idx]
        if prev_el.name == "img":
            img_src = prev_el.get("src", "")
            break
        elif prev_el.name in ["h5", "h6", "h4", "h2", "ul"]:
            break
        back_idx -= 1
        
    portfolio_data["carousel"].append({
        "title": title,
        "description": desc,
        "link": link_href,
        "slug": slug,
        "image": img_src
    })

# Visual Design is Nodes 114 to 150
vd_nodes = []
for idx in range(114, 151):
    el = elements[idx]
    if el.name in ["h5", "h6"]:
        vd_nodes.append((idx, el))

for idx, h_el in vd_nodes:
    title = h_el.get_text(strip=True)
    desc, link_href, slug = get_description_and_link(h_el, idx)
    
    # Find image before this h5
    img_src = ""
    back_idx = idx - 1
    while back_idx >= 0:
        prev_el = elements[back_idx]
        if prev_el.name == "img":
            img_src = prev_el.get("src", "")
            break
        elif prev_el.name in ["h5", "h6", "h4", "h2", "ul"]:
            break
        back_idx -= 1
        
    portfolio_data["visual_design"].append({
        "title": title,
        "description": desc,
        "link": link_href,
        "slug": slug,
        "image": img_src
    })

# Website is Nodes 158 to 236
web_nodes = []
for idx in range(158, 237):
    el = elements[idx]
    if el.name in ["h5", "h6"]:
        web_nodes.append((idx, el))

for idx, h_el in web_nodes:
    title = h_el.get_text(strip=True)
    desc, link_href, slug = get_description_and_link(h_el, idx)
    
    # Find image before this h5
    img_src = ""
    back_idx = idx - 1
    while back_idx >= 0:
        prev_el = elements[back_idx]
        if prev_el.name == "img":
            img_src = prev_el.get("src", "")
            break
        elif prev_el.name in ["h5", "h6", "h4", "h2", "ul"]:
            break
        back_idx -= 1
        
    portfolio_data["website"].append({
        "title": title,
        "description": desc,
        "link": link_href,
        "slug": slug,
        "image": img_src
    })

# Skills is Nodes 244 to 301
current_cat = None
for idx in range(240, 303):
    el = elements[idx]
    if el.name == "h4":
        current_cat = {
            "category": el.get_text(strip=True),
            "items": []
        }
        portfolio_data["skills"].append(current_cat)
    elif el.name == "img" and current_cat is not None:
        img_src = el.get("src", "")
        # Find next text node
        text_node = ""
        next_idx = idx + 1
        while next_idx < len(elements):
            next_el = elements[next_idx]
            if isinstance(next_el, str):
                text_node = next_el.strip()
                if text_node:
                    break
            elif next_el.name:
                break
            next_idx += 1
            
        current_cat["items"].append({
            "name": text_node,
            "icon": img_src
        })

# Write the final JSON file
os.makedirs(r"D:\Portofolio\src\data", exist_ok=True)
with open(r"D:\Portofolio\src\data\portfolio.json", "w", encoding="utf-8") as out:
    json.dump(portfolio_data, out, indent=2, ensure_ascii=False)

print("Compiled portfolio data successfully!")
print(f"Carousel items: {len(portfolio_data['carousel'])}")
print(f"Visual Design items: {len(portfolio_data['visual_design'])}")
print(f"Website items: {len(portfolio_data['website'])}")
print(f"Skills categories: {len(portfolio_data['skills'])}")
