# FutureMe / FuturePath AI — Workspace

พื้นที่ทำงานสำหรับ **JUMP THAILAND Hackathon 2026** (AIS Academy x NIA)
FutureMe = ชื่อผลิตภัณฑ์ · FuturePath = ชื่อ engine ภายใน

จัดโครงสร้างใหม่เมื่อ 29 กรกฎาคม 2026 · อัปเดต GitHub snapshot เมื่อ 30 กรกฎาคม 2026

---

## สารบัญ

| โฟลเดอร์ | คืออะไร | ขนาดใน repository โดยประมาณ |
|---|---|---|
| [`01_Research/`](01_Research/) | ฐานความรู้และงานวิจัยทั้งหมด | 2.6M |
| [`02_Backend/`](02_Backend/) | โค้ด FastAPI + decision engine + RAG | 1.5M |
| [`03_WebApp/`](03_WebApp/) | prototype Next.js ที่รันได้จริง | 4M source (ไม่รวม dependency/build cache) |
| [`04_Design/`](04_Design/) | 11 design concepts + ตัวเปรียบเทียบ | 61M |
| [`05_Team_Repo/`](05_Team_Repo/) | snapshot งานของเพื่อนร่วมทีม | 23M (ไม่รวม `.git`) |
| [`06_Assets/`](06_Assets/) | ไฟล์สื่อต้นฉบับ | 19M |
| [`90_Archive/`](90_Archive/) | ของเก่าเก็บอ้างอิง ไม่ใช้ทำงานประจำวัน | 18M |
| [`99_Process/`](99_Process/) | บันทึกกระบวนการทำงานและ agent logs | 464K |
| [`Presentation/`](Presentation/) | สไลด์แก้ไขได้, PDF, source generator และภาพที่ใช้ตรวจ QA | 4.7M |

---

## 01_Research — ฐานความรู้

| ที่อยู่ | เนื้อหา |
|---|---|
| `Data/` | งานวิจัย 7 หมวด: สถิติว่างงาน/mismatch, หลักสูตรไทย, career-skill mapping, การสัมภาษณ์เชิงลึก (RIASEC/STAR), NDLP–DEEP, AIS Cloud, system blueprints |
| `Data/README.md` · `REFERENCES.md` · `SOURCE_AUDIT.md` · `RAG_DATA_SPEC.md` | สารบัญ แหล่งอ้างอิง ผลตรวจสอบ claim และสเปกข้อมูลสำหรับ RAG |
| `Thai_AI_System_Research/` | คู่มือ 18 บท: Thai NLP, SLM, RAG, embedding, LoRA/QLoRA, evaluation, security, cost + `examples/` โค้ดตัวอย่าง |
| `Source_Documents/` | เอกสารตั้งต้น: FutureMe_AI_Brief.pdf, FutureMe_AI_Deck.pdf, jump-thailand-2026-ideas |

## 02_Backend — โค้ดฝั่งเซิร์ฟเวอร์

```
app/decision_engine/   matrix, multi_tier, riasec, route_generator, star_eval
app/rag/               pipeline, qdrant_client
app/api/router.py      FastAPI endpoints
schemas/               Pydantic models 11 ไฟล์
scripts/               verify_system, generate_qwen_dataset, convert_data_to_pdf
tests/                 test_api, test_decision_engine, test_rag
```

อ่านก่อน: [`PROJECT.md`](02_Backend/PROJECT.md) (แผน M1–M4) และ [`USER_MANUAL.md`](02_Backend/USER_MANUAL.md) (คู่มือระบบ v2.0.0)

## 03_WebApp — prototype ที่ใช้เดโม

`Pre_Present/` — Next.js + TypeScript + Tailwind
git remote: `github.com/winxtxrgit/futureme-ai` · เอกสารในตัวอยู่ที่ `Pre_Present/docs/` 9 ไฟล์

**นี่คือแหล่งความจริงล่าสุดของ product spec** — ใหม่กว่าเอกสารเดียวกันใน `05_Team_Repo/`

```bash
cd 03_WebApp/Pre_Present && npm run dev
```

## 04_Design — คลัง design concept

11 concept (`01_Concept_01/` … `11_Concept_11/`) แต่ละอันมี wireframes, mockups, prototype, assets
`11_GenZ_Aurora_Direction/` คือทิศทางที่เลือก · `99_Final_Comparison/` เทียบทุกตัว · เปิด `index.html` เพื่อดูรวม

## 05_Team_Repo — ของเพื่อนร่วมทีม

`Future_Me_Pongkarm/` clone จาก `github.com/Pongkarm/Future_Me` (branch `pongkarm`)

ส่วนใหญ่คือ `01_Research/` และ `03_WebApp/` ที่ถูกจัดใหม่ **ของที่มีเฉพาะที่นี่:**

- `FutureMe_Consolidated/00_Governance/` — SOURCE_POLICY, CORRECTION_LOG, CONTENT_STATUS, RAG_INDEX_MANIFEST
- `FutureMe_Consolidated/07_Business_and_Competition/` — business strategy, pilot metrics, pitch script
- `reports/futureme-ai-infrastructure/` — รายงาน infrastructure คนละฉบับกับใน `90_Archive/`

⚠️ เอกสาร product ใน `04_Product_and_UX/` และ `90_Assets/Pre_Present/` ของ repo นี้เป็น snapshot **ก่อน** PR#6 — เก่ากว่า `03_WebApp/Pre_Present/` อย่าเอาไปทับ

## 90_Archive — เก็บอ้างอิง

`FutureMe_AI_Master_Report.pdf` / `.html` · วิดีโอ 3D 2 ไฟล์ · `reports/futureme-ai-version2/`
(`Data/` ที่ซ้ำถูกลบแล้ว ต้นฉบับอยู่ที่ `01_Research/Data/`)

## 99_Process — บันทึกกระบวนการ

`ORIGINAL_REQUEST.md` โจทย์ตั้งต้น · `.agents/` log การทำงาน 18 agent ตาม milestone M1–M4

## Presentation — สไลด์โครงการ

- `FutureMe_Project_Presentation.pptx` — ไฟล์นำเสนอที่แก้ไขได้
- `FutureMe_Project_Presentation.pdf` — PDF 15 หน้า
- `generate_presentation.py` — source สำหรับสร้างสไลด์
- `rendered/` และ `QA.md` — ภาพตรวจรายหน้าและผลตรวจคุณภาพ

## แบบสำรวจแบบปรับตัว (การออกแบบ · ยังไม่ลงแอป)

แบบสำรวจที่รันอยู่ถามคงที่ 30 ข้อเท่ากันทุกคน
การออกแบบระบบที่ **เปลี่ยนคำถามถัดไปตามคำตอบก่อนหน้า** อยู่ที่
[`01_Research/Adaptive_Questionnaire/`](01_Research/Adaptive_Questionnaire/) — 9 เอกสาร + คลังคำถาม 90 ข้อ

สิ่งที่การออกแบบนี้แก้จากคลังเดิม

| ปัญหาของคลัง 30 ข้อ | ในการออกแบบใหม่ |
|---|---|
| ทั้ง 30 ข้อเป็น `direction: "positive"` จึงแยกคนที่กด 5 รวดไม่ได้ | ข้อกลับด้าน 12 ข้อ (2 ข้อต่อมิติ) พร้อมกลไก `reverse-fail` ลดน้ำหนักคำตอบทั้งมิติ |
| 5 ข้อต่อมิติ ต่ำกว่า 8–12 ข้อที่ทำให้ Cronbach's α มีความหมาย | 10 ข้อที่ให้คะแนนต่อมิติ |
| "ไม่แน่ใจ" กับ "ไม่ชอบ" ถูกปฏิบัติเหมือนกัน | "ไม่แน่ใจ" ไม่นับเป็นหลักฐาน และนำไปสู่ข้อถามประสบการณ์ — ยังไม่เคยลอง ≠ ไม่ชอบ |
| ถามเท่ากันทุกคน ทั้งคนที่ชัดและคนที่ยังไม่รู้อะไรเลย | 18–34 ข้อ ตามความชัดของคำตอบ |
| คู่ตรงข้าม RIASEC ที่สูงทั้งคู่ดูเหมือนตอบขัดกัน | ข้อบูรณาการ 3 ข้อ · โปรไฟล์ความสอดคล้องต่ำไม่ใช่ความผิดพลาด |

หลักที่ยึดไว้เหมือนเดิม — คำตอบเดียวไม่ปิดเส้นทาง · ปฏิเสธดีกว่าเดา · เอนจินกฎเป็นผู้ตัดสิน ไม่ใช่ LLM

### ผลการจำลอง

กฎทั้งชุดถูกรันกับผู้ตอบสังเคราะห์ **5,000 คน** ก่อนแตะแอปจริง
([`sim/`](01_Research/Adaptive_Questionnaire/sim/)) — เจอ **13 จุดที่เอกสารเขียนไว้อย่างหนึ่งแต่รันแล้วได้อีกอย่าง**
แก้แล้วทั้งหมดและอัปเดตกลับเข้าเอกสารต้นทาง ตัวอย่างที่หนักที่สุด

- กฎ "ต้องมีข้อกลับด้านในมิติอันดับ 1" เรียกร้องข้อที่ตัวจัดตารางไม่มีวันส่งให้ → **23% ของเซสชันวิ่งชนเพดาน 34 ข้อ**
- ข้อ `self-efficacy` และ `intensity` รวม 12 ข้อ **ไม่เคยถูกถามเลยแม้แต่ครั้งเดียว** ใน 400 เซสชัน
- สาขาที่ปิดแล้วยังปิดอยู่ ทั้งที่ผู้เรียนตอบ "ชอบอย่างยิ่ง" ในมิตินั้น
- ข้อ L5 ที่ควรเจาะลึกมิติที่ชัดแล้ว กลับ **ลดความมั่นใจของมิตินั้นเอง**

หลังแก้: invariant ทั้ง 10 ข้อผ่าน · ทุกข้อในคลังเข้าถึงได้ 90/90 · ความยาวมัธยฐาน 26 ข้อ
ผู้ตอบที่ชัดเจนได้ 21 ข้อ ผู้ตอบที่กดผ่าน ๆ ได้ความมั่นใจ 0.18 (ระบบไม่สรุปให้)

**ยังไม่มีข้อใดผ่าน IOC · Cronbach's α · CFA** และยังไม่มีผู้ตอบจริงแม้แต่คนเดียว
การจำลองยืนยันว่ากฎ *สอดคล้องกันเอง* ไม่ได้ยืนยันว่ากฎ *ถูก*

## นโยบาย GitHub snapshot

โฟลเดอร์งานทั้งหมดด้านบนถูกเก็บไว้ แต่ไม่นำไฟล์ที่สร้างใหม่ได้หรือ metadata ของ repository
ซ้อนขึ้น GitHub ได้แก่ `node_modules/`, `.next/`, `test-results/`, `__pycache__/`,
`*.tsbuildinfo`, `.DS_Store` และ `.git/` ภายในแต่ละโปรเจกต์
