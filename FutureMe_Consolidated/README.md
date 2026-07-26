# FutureMe Consolidated Knowledge Base

คลังนี้รวมสาระจาก `Data` และ `FutureMe_AI_Hackathon_2026_Handover` โดยจัดใหม่ตามหน้าที่ของข้อมูล ไม่ยึดชื่อหรือที่อยู่ไฟล์เดิม

ต้นฉบับทั้งสองโฟลเดอร์ยังอยู่ครบและไม่ได้ถูกแก้ไข คลังนี้เป็นจุดอ้างอิงกลางสำหรับการวิจัย ออกแบบผลิตภัณฑ์ พัฒนาระบบ และสร้าง RAG ตั้งแต่วันที่ 26 กรกฎาคม 2026 เป็นต้นไป

## หลักที่ใช้รวมข้อมูล

1. ข้อเท็จจริงที่ขัดกันให้ยึด `00_Governance/SOURCE_AUDIT.md` และแหล่งอ้างอิงที่ตรวจแล้ว
2. ข้อมูลเชิงนโยบายหรือบริการที่ตรวจรายละเอียดไม่ได้ต้องติดสถานะ `unverified`
3. น้ำหนักคะแนน สถาปัตยกรรม เป้าหมาย pilot และแผนธุรกิจเป็น `design_assumption` จนกว่าจะมีผลทดสอบ
4. ข้อความว่า implemented, complete หรือ production-ready ต้องมีโค้ด ผลทดสอบ หรือ deployment artifact อยู่ในคลังนี้
5. ไฟล์ใน `99_Quarantine` ห้ามนำเข้า production RAG
6. ไฟล์ซ้ำแบบ byte-identical เก็บเพียงตำแหน่งเดียว

## โครงสร้าง

| โฟลเดอร์ | เนื้อหา | สถานะหลัก | ใช้กับ RAG |
|---|---|---|---|
| `00_Governance` | นโยบาย แหล่งอ้างอิง correction log และ metadata | controlling | ใช้กำกับทุกคำตอบ |
| `01_Evidence` | สถิติ หลักฐาน NDLP/DEEP และ AIS | verified/conditional/unverified | ใช้ตามสถานะราย claim |
| `02_Education_and_Careers` | หลักสูตร อาชีพ ทักษะ และ taxonomy | verified/conditional/seed | ใช้ได้พร้อม citation |
| `03_Assessment_and_Safety` | Socratic, MI, RIASEC, Laddering, STAR และ safety | framework/design_assumption | ใช้เพื่อสะท้อน ไม่ใช้วินิจฉัย |
| `04_Product_and_UX` | product spec, UX, development plan และ roadmap | design_assumption | ไม่ใช้เป็นหลักฐานภายนอก |
| `05_AI_Engineering` | Thai AI, RAG, evaluation, security และ cost | technical_reference | ตรวจเวอร์ชันก่อนใช้ |
| `06_System_Architecture` | target architecture, graph model และ flowchart | design_assumption | ใช้ออกแบบ ไม่อ้างว่า deploy แล้ว |
| `07_Business_and_Competition` | GTM, pilot, pitch และบริบทการแข่งขัน | hypothesis/target | ไม่ใช้เป็น outcome |
| `08_Examples` | โค้ดตัวอย่าง | prototype_scaffold | ไม่ถือเป็น product backend |
| `90_Assets` | mockup, ภาพ, วิดีโอ และรายงานประกอบ | presentation_only | ปิดโดยค่าเริ่มต้น |
| `99_Quarantine` | ต้นฉบับที่มี claim ผิดหรือยังไม่ปลอดภัย | quarantined | ห้ามใช้ |

## เริ่มอ่านจากตรงไหน

- ต้องการข้อเท็จจริงและตัวเลข: `01_Evidence`
- ต้องการหลักสูตรและเส้นทางอาชีพ: `02_Education_and_Careers`
- ต้องการออกแบบบทสนทนาและการประเมินอย่างปลอดภัย: `03_Assessment_and_Safety`
- ต้องการทำ Prototype: `04_Product_and_UX`, `05_AI_Engineering`, `06_System_Architecture` และ `08_Examples`
- ต้องการเตรียม pilot หรือ pitch: `07_Business_and_Competition`
- ต้องการตรวจว่ามีอะไรถูกแก้: `00_Governance/CORRECTION_LOG.md`

## ข้อจำกัดสำคัญ

คลังนี้ไม่มี source code ของผลิตภัณฑ์ FutureMe, test suite, full career corpus หรือ deployment artifact ที่พิสูจน์ว่า backend, Qdrant, AIS APIs, NDLP/DEEP integration หรือ AIS Cloud deployment ทำงานแล้ว โค้ดใน `08_Examples` เป็นตัวอย่าง workflow เท่านั้น

