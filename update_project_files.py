import json
import os
import re

PROJECTS_DIR = r"d:\Portofolio\src\data\projects"

def update_sharesa():
    filepath = os.path.join(PROJECTS_DIR, "sharesa-digital.json")
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Replace Live Demo link in content
        data["content_en"] = re.sub(r'href=".*?"', 'href="https://sharesa.space"', data["content_en"])
        data["content_id"] = re.sub(r'href=".*?"', 'href="https://sharesa.space"', data["content_id"])
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print("Updated sharesa-digital.json")

def update_dopamind():
    old_path = os.path.join(PROJECTS_DIR, "dopamind.json")
    new_path = os.path.join(PROJECTS_DIR, "oneformind.json")
    
    if os.path.exists(old_path):
        with open(old_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Update text
        data["title"] = data["title"].replace("DopaMind", "Oneformind")
        data["slug"] = "oneformind"
        data["content_en"] = data["content_en"].replace("DopaMind", "Oneformind").replace("dopamind", "oneformind")
        data["content_id"] = data["content_id"].replace("DopaMind", "Oneformind").replace("dopamind", "oneformind")
        
        # Update live demo links
        data["content_en"] = re.sub(r'href=".*?"', 'href="https://oneformind.com"', data["content_en"])
        data["content_id"] = re.sub(r'href=".*?"', 'href="https://oneformind.com"', data["content_id"])
        
        with open(new_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        os.remove(old_path)
        print("Updated and renamed dopamind.json to oneformind.json")

def update_karsachain():
    old_path = os.path.join(PROJECTS_DIR, "karsachain.json")
    new_path = os.path.join(PROJECTS_DIR, "dlibration.json")
    
    content_en = """<h2>Project Overview</h2><p>Dlibration is an advanced AI + Blockchain platform for public deliberation and secure governance. It combines Generative AI and Blockchain to ensure every citizen's voice is immutable and impactful.</p><h2>The Challenge</h2><p>Conventional aspiration systems often fail because data is easily manipulated, lacks transparency in follow-ups, and bureaucracy is too slow to respond to thousands of voices.</p><h2>The Solution</h2><ul><li><b>Immutable Blockchain Records:</b> Eternal and transparent data.</li><li><b>AI-Driven Analysis:</b> Automatic policy summaries in seconds.</li><li><b>Real-time Public Audit:</b> Every government action is monitored.</li></ul><h2>🔗Link</h2><a href="https://deliberachain.vercel.app/">Live Demo</a>"""
    
    content_id = """<h2>Ringkasan Proyek</h2><p>Dlibration adalah platform deliberasi publik yang menggabungkan AI Generatif dan Blockchain untuk memastikan setiap suara rakyat abadi dan berdampak.</p><h2>Tantangan</h2><p>Sistem aspirasi konvensional sering gagal karena data mudah dimanipulasi, kurang transparansi tindak lanjut, dan birokrasi yang lambat merespons ribuan suara.</p><h2>Solusi</h2><ul><li><b>Rekam Blockchain Abadi:</b> Data transparan dan tidak dapat diubah.</li><li><b>Analisis AI:</b> Ringkasan kebijakan otomatis dalam hitungan detik.</li><li><b>Audit Publik Real-time:</b> Setiap tindakan pemerintah terpantau penuh.</li></ul><h2>🔗Link</h2><a href="https://deliberachain.vercel.app/">Live Demo</a>"""

    if os.path.exists(old_path):
        with open(old_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        data["title"] = "Dlibration - Transparent Democracy"
        data["slug"] = "dlibration"
        data["content_en"] = content_en
        data["content_id"] = content_id
        
        with open(new_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
        os.remove(old_path)
        print("Updated and renamed karsachain.json to dlibration.json")

update_sharesa()
update_dopamind()
update_karsachain()
