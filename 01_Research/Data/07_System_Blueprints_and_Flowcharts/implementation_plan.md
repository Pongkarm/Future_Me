# พิมพ์เขียวสถาปัตยกรรมระบบ FutureMe AI (Master System Architecture Blueprint)

> **เวทีการแข่งขัน:** JUMP THAILAND Hackathon 2026 (AIS Academy x NIA)
> **หัวข้อ:** AI เพื่ออนาคตการศึกษาไทย (AI for the Future of Thai Education)
> **สถานะปัจจุบัน:** แผนสถาปัตยกรรมอนาคต ไม่ใช่ระบบที่เชื่อมใช้งานแล้ว ส่วน AIS, RAG, Qdrant, PostgreSQL, multi-role dashboard และ cloud ยังเป็น research/planned
>
> **แหล่งใน repository:** [ภาพรวมข้อมูล](../README.md), [AIS Cloud & CAMARA research](../06_AIS_Cloud_and_Infrastructure/01_AIS_Cloud_Architecture_and_Deployment.md), [Detailed Flowcharts](detailed_system_flowcharts.md) และ [GED / สกร. / Homeschool](../02_Thai_National_Curricula/04_Non_Formal_and_Alternative_Education.md) ส่วนไฟล์เสียงคำแนะนำอาจารย์ไม่ได้เก็บใน branch นี้ จึงยังตรวจย้อนกลับไม่ได้

---

## 1. การสังเคราะห์คำแนะนำจากอาจารย์ (Advisor's Audio Insights Analysis)

เอกสารเดิมระบุว่าได้วิเคราะห์ไฟล์เสียงคำแนะนำอาจารย์ ซึ่งไม่ได้เก็บใน branch นี้ ร่วมกับ [FutureMe_AI_Brief.pdf](../../Source_Documents/FutureMe_AI_Brief.pdf) ข้อสรุปด้านล่างจึงเป็นสมมติฐานการออกแบบเดิมที่ต้องตรวจสอบก่อนนำไปพัฒนา:

1. **ไม่จำเป็นต้องใช้ LLM ตัวใหญ่ (Small LLM + RAG + LoRA):**
   * โมเดลใหญ่เปลืองงบและช้าเกินไป ให้ใช้ **Small Language Model (SLM)** ที่เก่งภาษาไทย (เช่น Typhoon-2 8B / Qwen2.5)
   * ใช้ **RAG (Retrieval-Augmented Generation)** เป็น "สมองที่สอง" เพื่อดึงบริบทอาชีพ หลักสูตร และงานวิจัยเฉพาะทาง
   * ใช้ **LoRA / QLoRA Adapter** ปรับแต่งการสร้างข้อความและสไตล์ภาษาไทย
2. **การแบ่งส่วนระหว่าง Rule-based และ LLM (Scoping Logic):**
   * ห้ามใช้ LLM ทำทุกอย่าง ให้แบ่งเป็น 2 ส่วน:
     * **Rule-based Engine:** ตัดสินใจในส่วนที่เป็นกฎเกณฑ์ตายตัว เช่น การคำนวณคะแนน RIASEC Matrix, การคัดกรองตามเงื่อนไขสายการเรียน/วุฒิ GED-สกร., และการจับคู่กลุ่มอาชีพหลัก
     * **LLM Engine:** ทำหน้าที่โต้ตอบสัมภาษณ์เชิงสนทนาแบบ Socratic, สกัดโปรไฟล์พฤติกรรม, และเรียบเรียงคำอธิบายแบบมีหลักฐาน (Explainable AI)
3. **การเข้าเติมเต็มระบบของประเทศ (Ecosystem Fit):**
   * ศึกษาความเป็นไปได้ในการเชื่อมแพลตฟอร์มกระทรวงศึกษาธิการ ([NDLP](../05_NDLP_Ministry_of_Education/01_NDLP_Platform_Architecture.md) และ [DEEP SSO](../05_NDLP_Ministry_of_Education/02_DEEP_and_Ecosystem_Integration.md)) โดยยังไม่มี integration จริงหรือหลักฐานว่าจะเพิ่มความแม่นยำ

---

## 2. ระบบ Interactive Pathfinder Roadmap (สไตล์ roadmap.sh)

เมื่อนักเรียนผ่านกระบวนการสัมภาษณ์ AI และภารกิจลองทำจริงแล้ว ระบบจะสร้าง **"Interactive Roadmap"** ที่เห็นเส้นทางทีละก้าว (Step-by-Step Node UI) จากจุดที่เด็กยืนอยู่ไปจนถึงเป้าหมายอาชีพ/โรงเรียน/มหาวิทยาลัย:

```
[จุดเริ่มต้น: สถานะปัจจุบัน] (เช่น ป.6 / ม.3 / ม.5 / เด็กสอบเทียบ GED / กศน.-สกร.)
         │
         ▼
[Milestone 1: ทักษะและภารกิจที่ต้องทำ] (Hard/Soft Skills + 30-Day Action Plan + คอร์สฟรี/Credit Bank)
         │
         ▼
[Milestone 2: สายการเรียน/ทางเลือกที่แนะนำ] (ม.ปลาย วิทย์/ศิลป์ หรือ อาชีวะ ปวช. 2567 / สอบเทียบ GED / สกร.)
         │
         ▼
[Milestone 3: เป้าหมายคณะ & มหาวิทยาลัย] (เกณฑ์ TCAS / เกณฑ์สอบ TGAT-TPAT-A-Level / ใบเทียบวุฒิ HSCES)
         │
         ▼
[Milestone 4: แฟ้มสะสมงานและประสบการณ์จริง] (Portfolio Project, กิจกรรม, คุณวุฒิ TPQI, การฝึกงาน)
         │
         ▼
[เป้าหมายปลายทาง: ตำแหน่งงานและสายอาชีพ] (Entry-level Role ➔ Senior Future Career)
```

---

## 3. สรุปคลังผังการทำงาน (Master & Sub-system Flowcharts Catalog)

แผนผังสถาปัตยกรรมอนาคตถูกบันทึกไว้ใน [detailed_system_flowcharts.md](detailed_system_flowcharts.md) ซึ่งประกอบด้วย:

1. **Master System Operations Flowchart:** แสดงกระบวนการทำงานภาพรวมตั้งแต่การยืนยันตัวตน AIS OTP / Number Verify ➔ Socratic AI Chat ➔ Scenario Mission Sandbox ➔ Qdrant Hybrid RAG ➔ Dynamic Roadmap Generator ➔ Multi-Role RBAC & PDPA Data View ➔ AIS Cloud Deployment
2. **Sub-system 1 Flowchart:** IAM & AIS Open API Authentication (CAMARA Standard Number Verify / OTP, SIM Swap API, OAuth2)
3. **Sub-system 2 Flowchart:** Sequential 2-Phase Assessment Engine (Socratic Dialogue, STAR Feature Extraction, Scenario Missions)
4. **Sub-system 3 Flowchart:** Hybrid Recommendation & RAG Knowledge Pipeline (Rule-based Filter, Qdrant Vector Search, LLM Synthesis)
5. **Sub-system 4 Flowchart:** Dynamic Pathfinder Roadmap Generator (DAG Graph Data Model, Topological Sort Algorithm)
6. **Sub-system 5 Flowchart:** Multi-Role RBAC & PDPA Privacy Dashboard (Student Privacy View, Parent Summary View, Counselor View)
7. **Sub-system 6 Flowchart:** AIS Cloud Infrastructure & Container Deployment (100% Thailand Data Sovereignty, Kubernetes OKE, VMware NSX Micro-segmentation)

---

## 4. ข้อกำหนดสถาปัตยกรรมและนโยบายความเป็นส่วนตัว (RBAC & PDPA Privacy Matrix)

```
                              ┌────────────────────────┐
                              │     นักเรียน (Student)  │
                              │  - เห็นข้อมูลตนเองครบ   │
                              │  - สิทธิ์การแชร์/ยินยอม  │
                              └───────────┬────────────┘
                                          │ (Consent Shared)
                   ┌──────────────────────┴──────────────────────┐
                   ▼                                             ▼
┌─────────────────────────────────────┐       ┌─────────────────────────────────────┐
│       ผู้ปกครอง (Parent View)        │       │       ครูแนะแนว (Teacher View)       │
│ - เห็นเฉพาะลูก/หลานในปกครอง          │       │ - เห็นเฉพาะนักเรียนในความดูแลทั้งหมด │
│ - เห็นเฉพาะสรุปความสนใจ & แผน 30 วัน │       │ - เห็น Dashboard สถิติชั้นเรียน     │
│ - ไม่เห็นข้อความสนทนาส่วนตัว (Chat) │       │ - ไม่เห็นข้อความสนทนาส่วนตัว (Chat) │
└─────────────────────────────────────┘       └─────────────────────────────────────┘
```

---

## 5. ไฟล์ที่เก็บใน repository

- [detailed_system_flowcharts.md](detailed_system_flowcharts.md)
- [implementation_plan.md](implementation_plan.md)

ลิงก์ artifact ส่วนตัวจากเครื่องผู้เขียนเดิมถูกนำออกจาก repository เพราะผู้ใช้อื่นเปิดไม่ได้
ให้ใช้ไฟล์ใน repository และ [สถาปัตยกรรมปัจจุบัน](../../../03_WebApp/docs/05-system-architecture.md)
เป็นแหล่งอ้างอิงแทน
