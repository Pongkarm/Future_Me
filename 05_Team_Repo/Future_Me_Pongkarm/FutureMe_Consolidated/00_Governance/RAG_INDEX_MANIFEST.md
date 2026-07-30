# RAG Index Manifest

## Index ที่เปิดใช้

### `evidence_verified`

รวม:

- `01_Evidence/01_Labor_Market`
- ส่วนที่มีสถานะยืนยันแล้วใน `01_Evidence/02_NDLP_and_DEEP`
- `01_Evidence/03_AIS_Cloud_Evidence.md`
- `02_Education_and_Careers`
- `00_Governance/REFERENCES.md`

เงื่อนไข: ทุก chunk ต้องเก็บ `source_path`, `claim_status`, `source_url`, `checked_at`, `scope_note` และ `production_rag`

### `methods_and_safety`

รวม:

- `03_Assessment_and_Safety`
- `00_Governance/SOURCE_POLICY.md`

เงื่อนไข: คำตอบต้องระบุว่า framework ไม่ใช่การวินิจฉัย และแบบวัด FutureMe ยังไม่ผ่าน validation

### `product_design`

รวม:

- `04_Product_and_UX`
- `06_System_Architecture`
- `07_Business_and_Competition`

ใช้เพื่อช่วยทีมออกแบบเท่านั้น ห้ามผสมกับข้อเท็จจริงภายนอกโดยไม่แสดงสถานะ `design_assumption`, `target` หรือ `hypothesis`

### `engineering_reference`

รวม:

- `05_AI_Engineering`
- `08_Examples`

ใช้ตอบคำถามเชิงวิศวกรรม ต้องเตือนเรื่อง version, license, benchmark และสถานะ prototype

## สิ่งที่ปิด

- `90_Assets`
- `99_Quarantine`
- ข้อความใน metadata ที่มี `production_rag: false`
- PDF/HTML เดิมที่ยังไม่ได้สร้างฉบับ corrected

## กฎ retrieval

1. filter ตาม `production_rag=true` ก่อน semantic search
2. แยก index ของ evidence ออกจาก design และ pitch
3. ถ้า evidence ขัดกับ design ให้ evidence ชนะ
4. ถ้าพบเฉพาะ `unverified` ให้ปฏิเสธการยืนยันและบอกข้อมูลที่ต้องหาเพิ่ม
5. คำตอบเรื่องเกณฑ์สมัคร ราคา กำหนดการ รุ่นโมเดล หรือ API ต้องตรวจวันที่
6. ทุกคำตอบด้านการศึกษา อาชีพ และนโยบายต้องแนบ source path หรือ URL

