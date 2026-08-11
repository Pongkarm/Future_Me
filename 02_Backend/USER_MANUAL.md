# คู่มือโครงสถาปัตยกรรม Backend ของ FutureMe

> **สถานะ: scaffold ที่ยังไม่เชื่อมกับเว็บหลัก**
>
> ระบบที่ใช้งานได้จริงอยู่ใน [`03_WebApp/`](../03_WebApp/) โฟลเดอร์นี้ไม่ใช่ backend
> ของ flow ปัจจุบัน และไม่ควรใช้ผลลัพธ์แทนคำแนะนำจากเว็บ

## สิ่งที่มีอยู่

- ตัวอย่าง FastAPI และ Pydantic สำหรับภารกิจและ future-path record
- ที่เก็บข้อมูลในหน่วยความจำ ซึ่งหายเมื่อหยุด process
- โมดูลทดลอง RIASEC, STAR, multi-tier, decision matrix, route generator และ RAG
- ชุดทดสอบเฉพาะ scaffold

ชื่อคลาส `FuturePath` บางส่วนเป็นชื่อเดิมที่เก็บไว้เพื่อไม่ให้ schema import พัง
ชื่อผลิตภัณฑ์ปัจจุบันคือ **FutureMe AI**

## ขอบเขตความปลอดภัย

endpoint `POST /v1/future-paths` ถูกปิดเป็นค่าเริ่มต้น เพราะ matrix รุ่นเดิมใส่คะแนนตั้งต้นด้าน
ความเป็นไปได้ ค่าใช้จ่าย พื้นที่ และความยืดหยุ่น ทั้งที่ไม่มีข้อมูลยืนยันใน repository
จึงตอบ HTTP 501 เว้นแต่ตั้ง `FUTUREME_ENABLE_LEGACY_BACKEND=1` เพื่อทดสอบโค้ดเก่าในสภาพแวดล้อมแยก

ห้ามนำผลจากโหมดดังกล่าวไปอ้างว่าเป็นผลของระบบปัจจุบัน หรือเป็นคำแนะนำที่ผ่าน validation

## endpoint ที่มี

| Method | Path | พฤติกรรม |
|---|---|---|
| `GET` | `/` | แสดงสถานะ scaffold และรุ่น |
| `POST` | `/v1/missions/recommend` | คืนตัวอย่างภารกิจแบบคงที่ |
| `POST` | `/v1/missions/{id}/submissions` | ใช้ heuristic ที่ยังไม่ผ่าน validation |
| `POST` | `/v1/future-paths` | ปิดเป็นค่าเริ่มต้นและตอบ HTTP 501 |
| `GET` | `/v1/future-paths/{id}` | อ่านเฉพาะข้อมูลใน process ปัจจุบัน |

## การตรวจ scaffold ในเครื่อง

ควรใช้ virtual environment แยก โดยไฟล์ dependency ระบุรุ่นเดียวกับที่ใช้ตรวจระบบล่าสุด

```powershell
python -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements-dev.txt
.\.venv\Scripts\python -m pytest -q
.\.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

ชุดทดสอบ 18 รายการตรวจสัญญาของ scaffold และขอบเขตการกักโค้ดเก่า ไม่ได้ยืนยันความเที่ยงตรง
ของแบบสอบถามหรือทำให้ backend นี้กลายเป็นส่วนหนึ่งของเว็บหลัก

## สิ่งที่ยังไม่มี

- การเชื่อมกับเว็บ Next.js ปัจจุบัน
- ฐานข้อมูลถาวร ระบบบัญชี consent retention deletion หรือ audit log
- Qdrant และ RAG ที่ deploy และประเมินแล้ว
- ข้อมูล TCAS ค่าเล่าเรียน ทุน ที่พัก หรือค่าครองชีพระดับหลักสูตรที่ตรวจสอบแล้ว
- ระบบ cloud หรือการเชื่อม AIS/โรงเรียนที่ใช้งานจริง

เอนจินที่เป็นแหล่งอ้างอิงหลักอยู่ใน
[`03_WebApp/lib/decision-engine/`](../03_WebApp/lib/decision-engine/) และใช้กฎ 50/30/20
พร้อม refusal gate โดยกันข้อมูลเชิงปฏิบัติที่ไม่มีแหล่งออกจากการตัดสินใจ

อ่านรายละเอียดที่ [ขอบเขตสถาปัตยกรรม](../03_WebApp/docs/05-system-architecture.md),
[ขอบเขตข้อมูล](../03_WebApp/docs/data-coverage-and-governance.md) และ
[รายงานตรวจสอบ repository](../03_WebApp/docs/continuation-audit-2026-08-11.md)
