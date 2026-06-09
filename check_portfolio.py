import json

with open('src/data/portfolio.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("Checking src/data/portfolio.json...")
for cat in ['carousel', 'visual_design', 'website']:
    print(f"\nCategory: {cat}")
    for i, item in enumerate(data[cat]):
        missing = [key for key in ['title_en', 'title_id', 'description_en', 'description_id'] if key not in item]
        if missing:
            print(f"  [{i}]: Title: '{item.get('title')}', Slug: '{item.get('slug')}', missing keys: {missing}")
        else:
            print(f"  [{i}]: Title: '{item.get('title')}', Slug: '{item.get('slug')}' OK")
