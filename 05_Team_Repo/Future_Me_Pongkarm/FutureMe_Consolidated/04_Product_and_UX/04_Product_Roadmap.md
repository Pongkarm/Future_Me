# Product Roadmap

> **สถานะ:** `plan` — ไม่มี phase ใดถือว่า implementation complete เพียงเพราะมีเอกสารหรือ mockup

[← Development Plan](03_Development_Plan.md) · [Back to README](../README.md)

## Phase 1 — Consolidated foundation

สถานะ: `documented`

- รวม research base และ source audit
- กำหนด product concept, three-route contract และ target user flow
- รวบรวม Thai AI/RAG engineering research
- แยก evidence, design, business, assets และ quarantine
- ตั้ง RAG policy และ correction log

คำว่า documented หมายถึงมีเอกสารในคลัง ไม่ได้หมายความว่า engine หรือ API ถูก implement แล้ว

## Phase 2 — Discovery and validation design

สถานะ: `next`

- สัมภาษณ์กลุ่ม ม.5 ตามแผน
- ตรวจ RIASEC items และ mission rubrics กับผู้เชี่ยวชาญ
- กำหนด privacy notice, consent, safeguarding และ retention
- กำหนด KPI, baseline และวิธีวัด clarity
- ทดสอบ mockup กับผู้ใช้และ assistive technology

## Phase 3 — Working vertical slice

สถานะ: `planned`

| Item | Definition of done |
|---|---|
| Guest interview | รันได้โดยไม่ต้องมีบัญชีและลบ session ได้ |
| Scenario mission | มี rubric ที่ตรวจแล้วอย่างน้อยหนึ่งแบบ |
| Three routes | Balanced, Interest Growth, Practical Access พร้อม evidence/unknowns |
| Roadmap | prerequisite DAG + revision loop |
| 30-day plan | action ที่ตรวจแหล่งได้และแก้ไขได้ |
| Counselor summary | แสดงเฉพาะข้อมูลที่ policy อนุญาต |
| RAG | citation, refusal, retrieval evaluation และ source freshness |
| Test suite | rule, schema, access, safety และ regression tests |

## Phase 4 — Pre-pilot assurance

สถานะ: `planned`

- independent evaluation set
- bias/fairness review
- red-team prompt injection และ data leakage
- security and privacy review
- accessibility audit
- incident and escalation playbook
- training material สำหรับครูแนะแนว

## Phase 5 — School pilot

สถานะ: `planned`

- โรงเรียน 3–5 แห่ง หนึ่งภาคเรียน
- baseline และ follow-up
- วัด clarity, comprehension, follow-through, revision behaviour และ safety
- ทบทวน matrix weights จากข้อมูลจริงโดยไม่ overfit กลุ่มตัวอย่างเล็ก

## Phase 6 — Ecosystem integrations

สถานะ: `exploratory`

| Integration | สิ่งที่ต้องมีก่อน |
|---|---|
| DEEP identity/SSO | official API docs, technical access, legal basis และ partnership |
| NDLP content | content API/export, license และ data quality review |
| AIS Number Verify/OTP/SIM Swap/SMS | developer credentials, sandbox test และ production agreement |
| AIS Cloud | service/region/contract review, security design และ measured deployment |

MVP ต้องทำงานได้โดยไม่พึ่ง integration เหล่านี้

## Stop conditions

หยุดหรือปรับทิศทางก่อน pilot ถ้า:

- instrument ไม่ได้วัดสิ่งที่อ้าง
- engine ชี้นำเส้นทางตามเพศ ภูมิภาค ฐานะ หรือขนาดโรงเรียนอย่างไม่เป็นธรรม
- ครูแนะแนวเห็นว่าระบบแทนที่ judgment มากกว่าสนับสนุน
- consent และ privacy สำหรับผู้เยาว์ทำให้ปลอดภัยไม่ได้
- ผู้ใช้ตีความ route เป็นคำตัดสินหรือการรับประกันจนแก้ด้วย UX ไม่ได้

