# Inventory and Deduplication Manifest

## แหล่งที่รวม

- `Data`: 31 ไฟล์เมื่อไม่นับ `.DS_Store`
- `FutureMe_AI_Hackathon_2026_Handover`: 135 ไฟล์เมื่อไม่นับ `.DS_Store`

หลังตัด hash ที่ตรงกับ `Data` และรวม hash ซ้ำภายใน Handover พบ payload ใหม่ 70 ชุด การนับนี้เป็นระดับไฟล์ ไม่ใช่จำนวนแนวคิด

## สำเนาที่ไม่นำเข้าซ้ำ

- `FutureMe_AI_Hackathon_2026_Handover/Data` ซ้ำกับ `Data` ยกเว้นหมวด 07
- `FutureMe_AI_Hackathon_2026_Handover/Future_Me/Data` ซ้ำกับ `Data`
- `Future_Me/FutureMe_AI_Master_Report.pdf` ซ้ำกับ Master Report ที่ root
- WebM ชื่อ hash สองไฟล์ที่ root ซ้ำกับวิดีโอใน `Pre_Present/assets/videos`
- `jump-thailand-2026-ideas.html` เล่าเนื้อหาเดียวกับ PDF จึงเก็บ PDF เป็น presentation asset และสรุปสาระไว้ใน Markdown

## เนื้อหาที่เก็บครบแต่เปลี่ยนตำแหน่ง

- Data หมวด 01, 05 และ AIS evidence → `01_Evidence`
- Data หมวด 02–03 → `02_Education_and_Careers`
- Data หมวด 04 → `03_Assessment_and_Safety`
- Pre_Present docs → หมวด 01, 04, 05, 06 และ 07 ตามหน้าที่
- Thai AI System Research → `05_AI_Engineering`
- Python examples → `08_Examples`
- mockup, SVG, รูป และวิดีโอไม่ซ้ำ → `90_Assets`
- เอกสารเดิมที่มี claim เสี่ยง → `99_Quarantine/Original_Materials`

