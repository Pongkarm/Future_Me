# FutureMe System Implementation Plan

> **สถานะ:** `design_assumption` — แผนนี้รวมสาระจากพิมพ์เขียวเดิมและแก้ claim เรื่อง integration, data sovereignty และสถานะ production แล้ว

## หลักสถาปัตยกรรม

1. Rules decide, LLM explains
2. RAG เป็นแหล่งความรู้ที่ตรวจและอัปเดตได้ ส่วน LoRA/QLoRA ใช้ปรับพฤติกรรมหรือรูปแบบเมื่อมี dataset ที่เหมาะสม
3. ระบบต้องทำงานได้โดยไม่พึ่ง NDLP, DEEP หรือ AIS APIs ใน MVP
4. DAG ใช้กับ prerequisite เท่านั้น การสำรวจเส้นทางต้องย้อนกลับและแตกแขนงได้
5. ข้อมูลผู้เยาว์เป็น private by default และเปิดเผยตาม policy ไม่ใช่ตามคำสัญญาแบบเด็ดขาด
6. การเลือก cloud ในไทยไม่ทำให้ผ่าน PDPA โดยอัตโนมัติ

## ขอบเขตหกระบบ

### 1. Identity and access

MVP ใช้ guest session หรือ identity provider ที่ทีมควบคุมได้ ส่วน AIS Number Verify, OTP, SIM Swap และ SMS เป็น planned integrations ที่ต้องมี credential, sandbox test และ production agreement

### 2. Two-phase evidence

- Socratic/STAR interview เก็บ self-report และตัวอย่างพฤติกรรมที่ผ่านมา
- scenario mission เก็บหลักฐานการลงมือทำแยกอีกชุด
- RIASEC เป็นสัญญาณความสนใจหลายมิติ
- instrument และ rubric ต้องผ่านผู้เชี่ยวชาญก่อน pilot

### 3. Recommendation and RAG

- hard constraints และ eligibility ใช้ deterministic rules
- retrieval ใช้ evidence corpus ที่มี source metadata
- LLM ทำหน้าที่ถาม สกัด และอธิบายภายใต้ structured output
- output มีสาม route: Balanced Next Step, Interest Growth, Practical Access
- คลังปัจจุบันมี seed mapping ไม่ใช่ full career corpus หรือ Qdrant collection

### 4. Roadmap

สร้าง prerequisite subgraph แบบ DAG สำหรับลำดับที่จำเป็น เช่น ต้องผ่านวิชาหรือเงื่อนไขก่อนสมัคร ส่วน progress, reflection, alternative route และการเปลี่ยนเป้าหมายใช้ graph ที่มี loop ได้

### 5. Privacy and roles

- นักเรียนเห็นข้อมูลของตน
- ผู้ปกครองและครูเห็น derived summary ตาม policy และสิทธิ์
- raw transcript ปิดโดยค่าเริ่มต้น
- ต้องมี consent record, access log, retention, deletion และ safeguarding policy

### 6. Deployment target

Target stack ที่เอกสารเสนอคือ Next.js, FastAPI, Qdrant, PostgreSQL, Docker/Kubernetes และ AIS Cloud powered by OCI แต่ทุก component ยังต้องผ่าน implementation, integration, load, security และ residency review

## Implementation sequence

| ลำดับ | งาน | Exit criteria |
|---:|---|---|
| 1 | source schema และ RAG allowlist | quarantine ถูกปิดและทุก chunk มี status |
| 2 | rule engine + three-route schema | deterministic tests ผ่าน |
| 3 | interview และ mission vertical slice | ผู้ใช้ทำ flow จบได้โดยไม่พึ่ง external integration |
| 4 | retrieval pipeline | citation/refusal/evaluation ผ่านเกณฑ์ที่กำหนด |
| 5 | graph roadmap | prerequisite acyclic และ revision loop ใช้ได้ |
| 6 | RBAC/privacy | access-control, consent, retention และ audit tests ผ่าน |
| 7 | safety/accessibility | red team, escalation และ WCAG review |
| 8 | pilot environment | monitoring, backup, incident response และ rollback พร้อม |

## หลักฐานที่ต้องเพิ่มก่อนเปลี่ยนสถานะ

- product repository และ reproducible setup
- schema และ API tests
- retrieval corpus manifest และ benchmark
- psychometric/rubric review
- threat model และ privacy impact assessment
- API access approvals
- cloud service/region/contract evidence
- deployment record, health check, load result และ incident plan

ผังระบบฉบับละเอียดอยู่ที่ [03_Detailed_System_Flowcharts.md](03_Detailed_System_Flowcharts.md)

