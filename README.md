# FutureMe AI — ระบบแนะแนวการศึกษาและเส้นทางอาชีพสำหรับเด็กไทย

> **ผลงานเข้าประกวด:** JUMP THAILAND Innovation Hackathon 2026 (AIS Academy x NIA)  
> **Core Concept:** *“ลองเส้นทางอนาคต ก่อนตัดสินใจจริง”* — ระบบประเมินและทดลองเส้นทางอาชีพด้วยหลักฐานจริง (Evidence-Based Guidance)

---

## 🌟 เอกสารสำคัญสำหรับกรรมการ (Submission Quick Links)

| เอกสารนำเสนอ | คำอธิบาย | ไฟล์ดาวน์โหลด / เข้าชม |
|---|---|:---:|
| **Official Pitch Deck (PDF)** | สไลด์นำเสนอฉบับทางการ 7 หน้า (16:9 Widescreen) สำหรับกรรมการ | [📄 `FutureMe_Presentation.pdf`](FutureMe_Presentation.pdf) |
| **Official Pitch Deck (HTML)** | สไลด์ต้นฉบับ HTML Responsive ปรับฟอนต์ Sarabun/Prompt | [🌐 `FutureMe_Presentation.html`](FutureMe_Presentation.html) |
| **Interactive Web App** | แอปพลิเคชัน Next.js 15.5 รันจริงพร้อม 11 หน้าจอ | [🚀 ดูวิธีเปิดแอปด้านล่าง](#-quick-start--วิธีรันแอปพลิเคชัน) |
| **Evidence & Theory Catalog** | ฐานงานวิจัย ทฤษฎีจิตวิทยา และสถิติอ้างอิง | [`01_Research/`](01_Research/) |

---

## 🧭 ปัญหาและทางแยกสำคัญ (WHAT & Problem Statement)

การศึกษาไทยกำลังเผชิญปัญหาช่องว่างขนาดใหญ่ระหว่างสิ่งที่เรียนกับความต้องการของตลาดแรงงานจริง:
* **56% ทำงานไม่ตรงสายที่เรียน:** ข้อมูลสำรวจจาก TDRI (2025)
* **27% ทำงานต่ำกว่าคุณวุฒิ:** ขาดทักษะเฉพาะทางที่ตลาดต้องการ
* **39% ทักษะจะเปลี่ยนไปใน 5 ปี:** รายงาน WEF Future of Jobs (2025)

### 📍 สองทางแยกสำคัญ (Consequential Choice Points)
1. **ทางแยก ม.3 (Choice Point 1):** สายสามัญ (ม.ปลาย) VS สายอาชีพ (ปวช.) VS ทางเลือกท้องถิ่น — เด็กต้องเลือกจากคำบอกเล่าโดยไม่เคยได้ทดลองปฏิบัติการจริง
2. **ทางแยก ม.6 / ปวช. (Choice Point 2):** มหาวิทยาลัย (TCAS) VS อาชีวะชั้นสูง (ปวส.) VS เข้าสู่ตลาดแรงงาน — เสี่ยงต่อการซิ่ว ย้ายคณะ หรือหลุดจากระบบการศึกษาเมื่อพบว่าไม่ใช่

---

## 💡 นวัตกรรมและหลักการทำงาน (HOW & Core Innovation)

> ### ⚙️ Core Principle: **“Rules decide. AI explains.”**
> FutureMe AI ไม่ใช้ AI มโนหรือแต่งเติมเส้นทางเอง (Zero Hallucination) แต่ใช้ **Deterministic Scoring Engine** ในการคำนวณความสอดคล้องทางคณิตศาสตร์ แมตช์กับ **23,257 หลักสูตรจริง** ทั่วประเทศ โดยมี AI ทำหน้าที่เป็น **Socratic Interviewer** ช่วยซักถามและอธิบายเหตุผล

```
[1. ANSWER (ประเมิน)]
  • 36-Item Holland RIASEC Questionnaire + Self-Efficacy Scale (6 มิติ)
  • Socratic Interview เจาะลึกความถนัดด้วย STAR Framework
  • Geolocation, Living Cost Index 5 ภาค และงบประมาณครอบครัว
        ⬇️
[2. TRY (ทดลองจริง)]
  • Scenario Missions ภารกิจจำลองการทำงานจริงในชีวิตประจำวัน
  • วัดผลจากพฤติกรรมการลงมือทำจริง ไม่ใช่แค่ความรู้สึก
        ⬇️
[3. REFLECT (สะท้อนผล)]
  • จับคู่ 23,257 หลักสูตรสถาบันการศึกษาจริง (16,908 ปวช./ปวส. + 6,349 ป.ตรี จาก 993 สถาบัน)
  • อธิบายเหตุผลเบื้องหลังคำแนะนำ พร้อมสร้าง 30-Day Action Roadmap
```

---

## 🔄 วงจรสะสมหลักฐานอัปเดตต่อเนื่อง (WHO & 5-Step Continuous Loop)

FutureMe ไม่ใช่แบบประเมินแบบครั้งเดียวจบ แต่คือ **ระบบนิเวศสะสมหลักฐาน (Continuous Evidence Loop)** ตลอดช่วงวัยเรียน:

$$\mathbf{Reflect} \xrightarrow{\text{ประเมินเวกเตอร์}} \mathbf{Try} \xrightarrow{\text{ทำภารกิจจำลอง}} \mathbf{Update} \xrightarrow{\text{สะท้อนผลหลังทำ}} \mathbf{Compare} \xrightarrow{\text{เทียบงบ/ย้ายถิ่น}} \mathbf{Act} \xrightarrow{\text{แผนมินิภารกิจ 30 วัน}}$$

* **Post-Mission Reflection:** AI ทักถามทันทีหลังจบมินิภารกิจ เพื่อ Re-calibrate เวกเตอร์ความถนัดแบบไดนามิก
* **Weekly Micro Check-in:** ชวนคุยสั้น ๆ สัปดาห์ละครั้ง เพื่อติดตามความสนใจที่เปลี่ยนแปลงไป
* **Data Ownership & PDPA:** นักเรียนเป็นเจ้าของข้อมูล 100% สามารถเลือกแชร์ข้อมูลให้กับครูแนะแนวหรือผู้ปกครองผ่าน Counselor Dashboard

---

## 📱 ภาพตัวอย่างระบบ Web Application (Live Showcase)

| 1. หน้าแรก (Landing Page) | 2. แบบประเมินจิตวิทยา (Interview) |
|:---:|:---:|
| ![Landing Page](03_WebApp/Pre_Present/assets/screenshots/app/landing-desktop.png) | ![Assessment](03_WebApp/Pre_Present/assets/screenshots/app/interview-desktop.png) |

| 3. จัดอันดับเส้นทาง (Ranked Routes) | 4. เปรียบเทียบหลักสูตร (Compare) |
|:---:|:---:|
| ![Routes](03_WebApp/Pre_Present/assets/screenshots/app/routes-desktop.png) | ![Compare](03_WebApp/Pre_Present/assets/screenshots/app/compare-desktop.png) |

| 5. แผนปฏิบัติการ 30 วัน (Action Plan) | 6. ภารกิจสะสมหลักฐาน (Scenario Mission) |
|:---:|:---:|
| ![Action Plan](03_WebApp/Pre_Present/assets/screenshots/app/plan-desktop.png) | ![Missions](03_WebApp/Pre_Present/assets/screenshots/app/mission-desktop.png) |

---

## 🏗️ โครงสร้าง Repository (Clean Hackathon Standard)

```
Pongkarm/Future_Me
├── 01_Research/                 # ฐานความรู้, งานวิจัย, Evidence Catalog & ข้อมูลหลักสูตร 23,257 รายการ
│   ├── Theory_and_Standards/    # เอกสารทฤษฎีจิตวิทยา Holland RIASEC, Psychometric Review & Scoring Engine
│   ├── Geography_and_Access/    # ข้อมูลพิกัดสถาบัน, ค่าเดินทาง และ Living Cost Index 5 ภาค
│   └── Thai_AI_System_Research/ # คู่มืองานวิจัย Thai NLP, SLM, Vector Embedding & Security
├── 02_Backend/                  # FastAPI Backend, Deterministic Engine & RAG Pipelines
├── 03_WebApp/                   # Next.js 15.5 Interactive Web Application (Pre_Present)
│   ├── app/                     # หน้าเพจทั้ง 11 Routes & API Endpoints
│   ├── components/              # UI Components ตามทิศทาง GenZ Aurora
│   ├── data/                    # ฐานข้อมูลหลักสูตรและแบบสอบถาม
│   └── lib/                     # Matching Engine, Cosine Similarity & Utilities
├── 04_Design/                   # Design Systems, Wireframes, UI Concepts (GenZ Aurora Direction)
├── 05_Assets/                   # Brand Assets, รูปภาพประกอบ และ Media
├── Presentation/                # Master Presentation Deck (FutureMe_Presentation.pdf + HTML)
├── Archive/                     # จัดเก็บประวัติการพัฒนาและเอกสารบันทึกกระบวนการย้อนหลัง
├── FutureMe_Presentation.pdf    # สไลด์นำเสนอทางการ 7 หน้า (PDF 16:9 Widescreen)
├── FutureMe_Presentation.html   # สไลด์นำเสนอทางการ 7 หน้า (HTML)
├── README.md                    # เอกสารภาพรวมโครงการฉบับสมบูรณ์
├── HANDOFF.md                   # รายงานสรุปสถานะการส่งมอบโครงการ
└── .gitignore                   # มาตรฐาน Git Ignore
```

---

## 💻 Quick Start — วิธีรันแอปพลิเคชัน

### ข้อกำหนดเบื้องต้น
* **Node.js:** เวอร์ชัน 20 ขึ้นไป
* **Package Manager:** npm

### ขั้นตอนการรัน
```bash
# 1. เข้าสู่โฟลเดอร์ Web Application
cd 03_WebApp/Pre_Present

# 2. ติดตั้ง dependencies (หากยังไม่ได้ติดตั้ง)
npm install

# 3. รันเซิร์ฟเวอร์สำหรับทดสอบ
npm run dev
```
เปิดบราวเซอร์ไปที่: **`http://localhost:3000`**

### การตรวจสอบคุณภาพโค้ด (Quality Checks)
```bash
npm run typecheck    # ตรวจสอบ TypeScript Types (0 Errors)
npm run lint         # ตรวจสอบ ESLint Coding Standards
npm run build        # ทดสอบการ Compile Production Bundle (17/17 Pages)
```

---

## 👥 ข้อมูลทีมผู้พัฒนา & พันธกิจ (Team & Vision)

* **โครงการ:** FutureMe AI — ระบบแนะแนวการศึกษาและเส้นทางอาชีพเพื่อลดปัญหาความไม่สอดคล้องทางการศึกษา (Educational Mismatch)
* **การสนับสนุนและเทคโนโลยี:** ขับเคลื่อนบนโครงสร้างพื้นฐาน AIS Cloud Database, Next.js และ Open Data ทางการศึกษาไทย (สอศ., ทปอ., กสศ.)
* **ลิขสิทธิ์:** MIT License (2026)
