import json
import re

with open(r"D:\Portofolio\src\data\projects\about-2-2.json", "r", encoding="utf-8") as f:
    data = json.load(f)

content = data["content"]

# Let's find "FundEx Web ReDesign"
pattern = r"(FundEx Web ReDesign.*?Read More)"
match = re.search(pattern, content, re.DOTALL)
if match:
    print("Match 1:")
    start_idx = max(0, match.start() - 200)
    end_idx = min(len(content), match.end() + 200)
    print(content[start_idx:end_idx])
else:
    # Let's search for "FundEx"
    idx = content.find("FundEx")
    if idx != -1:
        print("Found 'FundEx' at:", idx)
        print(content[idx-300:idx+600])
