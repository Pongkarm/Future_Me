# Correction Log

บันทึกนี้รวบรวมจุดที่แก้จาก `Data` และ `FutureMe_AI_Hackathon_2026_Handover` เพื่อให้ตามย้อนกลับได้

## การแก้ข้อเท็จจริง

| ลำดับ | ข้อความเดิม | ฉบับที่ใช้ในคลังรวม | เหตุผล/สถานะ |
|---:|---|---|---|
| 1 | แรงงานไทย mismatch 68.6% | ถอนออกจากเนื้อหาหลัก | 68.6% ในเอกสารที่พบเป็นค่าความแม่นยำของแบบจำลอง ไม่ใช่อัตรา mismatch |
| 2 | TDRI วิเคราะห์ประกาศงาน 304,378 รายการ | 756,300 ประกาศจาก 23 เว็บไซต์ในช่วง 12 เดือนตามรายงานที่ตรวจ | แก้จำนวนและขอบเขต |
| 3 | งาน 63–65% ต้องการประสบการณ์ และ entry-level 22% | ถอนตัวเลขรวม ใช้คำว่าแตกต่างตามอาชีพและตำแหน่ง | ไม่พบหลักฐานตรง |
| 4 | 56% ของบัณฑิตจบใหม่ทำงานไม่ตรงสาย | 56% ของคนไทยที่มีการศึกษาสูงกว่ามัธยมปลายทำงานไม่ตรงสาขา | แก้กลุ่มประชากร ไม่จำกัดเฉพาะบัณฑิตจบใหม่ |
| 5 | 56% ของแรงงานโลก mismatch | 114 ประเทศในงาน ILO ครอบคลุม 56% ของการจ้างงานโลก | แก้ความหมายจากอัตราเป็น coverage |
| 6 | NDLP มี static RIASEC และไม่มีบทสนทนา | `unverified` ไม่ใช้เปรียบเทียบกับ FutureMe | แหล่งที่ตรวจยังไม่ยืนยัน module และพฤติกรรมระบบ |
| 7 | DEEP มี SSO/API พร้อมเชื่อม | เป็น future integration hypothesis | ยังไม่มีเอกสาร API, technical access หรือข้อตกลง |
| 8 | AIS Cloud รับประกัน data sovereignty 100% และ PDPA compliance | บริการ/data center บางส่วนอยู่ไทย ต้องยืนยัน service scope, region, contract และ application controls | ไม่ควรเหมารวมทุกบริการ |
| 9 | คลังมี 50+ career clusters/full corpus ใน Qdrant | คลังมี seed mapping 5 กลุ่มและตัวอย่างหลักสูตร | ไม่พบ full corpus หรือ vector index artifact |
| 10 | ระบบสร้างเส้นทาง 3–5 แบบ | product contract ปัจจุบันกำหนด 3 แบบ: Balanced, Interest Growth, Practical Access | ทำเอกสารและ schema ให้ตรงกัน |

## การแก้สถานะงาน

| ข้อความเดิม | สถานะใหม่ |
|---|---|
| มี working backend engine | `unverified implementation status` เพราะไม่พบ source code ผลทดสอบ หรือ project manifest |
| FastAPI/Pydantic endpoints เสร็จหรือทำงานอยู่ | target API specification จนกว่าจะนำโค้ดเข้าคลัง |
| Qdrant+BGE-M3 RAG ทำงานแล้ว | target architecture/prototype scaffold |
| verification agent/audit suite เสร็จ | ไม่ยืนยัน พบเฉพาะผล source audit แต่ไม่พบ script/test suite |
| AIS APIs, NDLP/DEEP และ AIS Cloud เชื่อมแล้ว | planned integration |
| carrier-grade / production-ready | target architecture ยังไม่ผ่าน production readiness review |
| RIASEC 30 ข้อและ mission rubric พร้อมใช้ | draft instrument ต้องผ่านผู้เชี่ยวชาญและ pilot |
| ข้อมูล RAG ผ่าน audit 100% | ใช้คำว่า “ผ่าน source audit รอบแรกตามไฟล์ที่มี” และยังต้องตรวจซ้ำตามรอบเวลา |

## การแก้โครงสร้าง

- ตัดสำเนา `Data` สองชุดใน Handover และเก็บ canonical content เพียงชุดเดียว
- เก็บวิดีโอ WebM จาก `Pre_Present/assets/videos` เพียงตำแหน่งเดียว ตัดสำเนาชื่อ hash ที่ root
- เก็บ Master Report และเอกสารพิตช์เดิมที่มี claim เสี่ยงไว้ใน `99_Quarantine/Original_Materials`
- แยกตัวอย่างโค้ดออกจากคู่มือวิศวกรรมไปไว้ใน `08_Examples`
- แยกไฟล์นำเสนอออกจากแหล่งข้อมูลที่ production RAG ใช้

