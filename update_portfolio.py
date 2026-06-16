import json
import os

PORTFOLIO_FILE = r"d:\Portofolio\src\data\portfolio.json"

# Load portfolio
with open(PORTFOLIO_FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)

# 1. Move first 3 website items to the end
website_list = data.get("website", [])
if len(website_list) >= 3:
    first_three = website_list[:3]
    rest = website_list[3:]
    data["website"] = rest + first_three

# 2. Update projects in portfolio.json
for item in data.get("website", []):
    if item["slug"] == "dopamind":
        item["title"] = item["title"].replace("DopaMind", "Oneformind")
        item["title_en"] = item["title_en"].replace("DopaMind", "Oneformind")
        item["title_id"] = item["title_id"].replace("DopaMind", "Oneformind")
        item["description"] = item["description"].replace("DopaMind", "Oneformind")
        item["description_en"] = item["description_en"].replace("DopaMind", "Oneformind")
        item["description_id"] = item["description_id"].replace("DopaMind", "Oneformind")
        item["link"] = "/oneformind/"
        item["slug"] = "oneformind"

    elif item["slug"] == "karsachain":
        item["title"] = "Dlibration - Transparent Democracy"
        item["title_en"] = "Dlibration - Transparent Democracy & Immutable Governance"
        item["title_id"] = "Dlibration - Demokrasi Transparan & Tata Kelola Abadi"
        item["description"] = "Advanced AI + Blockchain platform for public deliberation and secure governance."
        item["description_en"] = "Advanced AI + Blockchain platform for public deliberation and secure governance."
        item["description_id"] = "Platform deliberasi publik pertama yang menggabungkan AI Generative AI Pro dan Blockchain Base untuk memastikan setiap suara rakyat abadi dan berimpact."
        item["link"] = "/dlibration/"
        item["slug"] = "dlibration"

# Save portfolio
with open(PORTFOLIO_FILE, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Updated portfolio.json")
