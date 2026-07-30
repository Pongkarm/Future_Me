# Source and Claim Policy

## ลำดับอำนาจของข้อมูล

เมื่อข้อความขัดกัน ให้ใช้ลำดับนี้:

1. แหล่งปฐมภูมิหรือหน้าทางการที่บันทึกใน `REFERENCES.md`
2. ผลตรวจใน `SOURCE_AUDIT.md`
3. เอกสารหมวด `01_Evidence`
4. เอกสารหลักสูตรและ framework ในหมวด 02–03
5. เอกสารออกแบบผลิตภัณฑ์ วิศวกรรม สถาปัตยกรรม และธุรกิจในหมวด 04–07
6. สื่อประกอบใน `90_Assets`
7. ไฟล์ใน `99_Quarantine` ซึ่งใช้ดูประวัติได้อย่างเดียว

## สถานะมาตรฐาน

| สถานะ | ความหมาย | วิธีใช้ |
|---|---|---|
| `verified` | มีแหล่งตรงรองรับและตรวจขอบเขตแล้ว | อ้างได้พร้อม citation และวันที่ |
| `conditional` | ถูกต้องเมื่อมีเงื่อนไขหรือขอบเขตประกอบ | ต้องกล่าวเงื่อนไขในคำตอบ |
| `technical_reference` | คู่มือหรือข้อมูลเทคนิคที่เปลี่ยนตามเวอร์ชัน | ตรวจเวอร์ชัน license benchmark และราคาก่อนตัดสินใจ |
| `seed` | ตัวอย่าง taxonomy หรือข้อมูลตั้งต้น ไม่ใช่ชุดเต็ม | ใช้ทำ Prototype แต่ห้ามเรียกว่า full corpus |
| `design_assumption` | ข้อเสนอด้านผลิตภัณฑ์ คะแนน หรือสถาปัตยกรรม | ใช้เป็นสมมติฐานเพื่อทดสอบ |
| `target` | เป้าหมายที่ตั้งไว้ ยังไม่ใช่ผลลัพธ์ | ห้ามเขียนว่าเกิดผลแล้ว |
| `unverified` | ยังไม่มีหลักฐานพอ | ห้ามตอบเป็นข้อเท็จจริง |
| `quarantined` | ผิด ขัดกับหลักฐาน หรือเสี่ยงทำให้เข้าใจผิด | ห้ามเข้า production RAG |

## กฎสำหรับคำว่าเสร็จและพร้อมใช้งาน

เอกสารจะใช้คำว่า implemented, complete, validated, production-ready หรือ deployed ได้ต่อเมื่อมีหลักฐานครบตามประเภทงาน:

- implementation: source code และคำสั่งรัน
- validation: ชุดทดสอบ วิธีวัด ข้อมูลทดสอบ และผลลัพธ์
- integration: API documentation, credential/access approval และ integration test
- deployment: environment manifest, deployment record และ health check
- psychometric validation: ผู้เชี่ยวชาญ เครื่องมือ ฉบับทดลอง กลุ่มตัวอย่าง และผล reliability/validity

ถ้าหลักฐานไม่อยู่ในคลัง ให้ใช้คำว่า `designed`, `specified`, `planned` หรือ `unverified implementation status`

## กฎข้อมูลผู้เยาว์

- เก็บเท่าที่จำเป็นและระบุวัตถุประสงค์ทุก field
- การแชร์ข้อมูลให้ผู้ปกครองหรือครูต้องมี policy เรื่องฐานกฎหมาย ความสัมพันธ์ สิทธิ์ถอน consent และข้อยกเว้นด้าน safeguarding
- raw transcript ไม่ควรเปิดให้บุคคลอื่นโดยค่าเริ่มต้น
- RIASEC และ mission rubric ใช้เพื่อการสำรวจ ไม่ใช่วินิจฉัยหรือคัดคน
- ทุกคำแนะนำต้องเปิดเผย uncertainty และให้ผู้ใช้แก้ข้อมูลหรือเปลี่ยนเส้นทางได้

