# FutureMe — System Architecture & Execution Process Guide

เอกสารสรุป **โครงสร้างการทำงานเชิงลึก (Deep-Dive Architecture)**, **แผนภาพการประมวลผลระบบ (Execution Process Diagram)** และ **สถานะการพัฒนาโครงการ FutureMe** สำหรับใช้เป็นคู่มืออ้างอิงและการนำเสนอผลงาน

---

## 1. ภาพรวมสถานะโครงการตาม Roadmap (Project Phase Status)

โครงการ **FutureMe** เป็นระบบแนะแนวการศึกษาและอาชีพ AI สำหรับนักเรียน ม.3 เพื่อการตัดสินใจเลือกสายการเรียนต่อ โดยมีแผนการดำเนินงานแบ่งเป็น 6 เฟสหลักดังนี้:

```mermaid
graph LR
    P1[Phase 1: Project Setup<br>✅ เสร็จสมบูรณ์] --> P2[Phase 2: Frontend Web App<br>🚧 กำลังทำอยู่]
    P2 -.-> P3[Phase 3: AI Backend<br>⏳ เฟสถัดไป]
    P3 -.-> P4[Phase 4: AIS Cloud Infra<br>⏳ เฟสถัดไป]
    P4 -.-> P5[Phase 5: Testing<br>⏳ เฟสถัดไป]
    P5 -.-> P6[Phase 6: Presentation<br>⏳ เฟสถัดไป]

    style P1 fill:#10B981,stroke:#333,color:#fff
    style P2 fill:#F59E0B,stroke:#333,color:#fff,stroke-width:3px
    style P3 fill:#6366F1,stroke:#333,color:#fff
    style P4 fill:#7C3AED,stroke:#333,color:#fff
    style P5 fill:#06B6D4,stroke:#333,color:#fff
    style P6 fill:#EC4899,stroke:#333,color:#fff
```

### สรุปสถานะปัจจุบัน:
- 🟢 **Phase 1: Project Setup**: วาง Taxonomy 110 อาชีพ, โมเดลจิตวิทยา RIASEC 12 เส้นทาง และงานวิจัยระบบ
- 🟧 **Phase 2: Frontend Web App (กำลังทำ 🚧)**: พัฒนาตัวเว็บไซต์ Interactive Prototype (React + Vite) ประกอบด้วย 6 โมดูลหลัก
- 🟦 **Phase 3: AI Backend**: เตรียมเชื่อมต่อ FastAPI Backend, RAG Pipeline และ AI Model Core
- 🟪 **Phase 4: AIS Cloud Infra**: เตรียมความพร้อมสำหรับการ Deploy บน AIS Cloud Infrastructure
- 🩵 **Phase 5: Testing**: การทดสอบระบบและ E2E Tests
- 💗 **Phase 6: Presentation**: การจัดทำสไลด์และเตรียมนำเสนอผลงาน

---

## 2. End-to-End Execution Process Diagram (แผนภาพรวมการประมวลผลทั้งระบบ)

แผนภาพแสดงการประมวลผลตามลำดับขั้นตอน (Execution Flow) ตั้งแต่ฝั่งผู้ใช้งาน (Phase 2) การประมวลผลระบบหลังบ้าน (Phase 3) จนถึงสภาพแวดล้อมรันไทม์บน cloud (Phase 4):

```mermaid
flowchart TD
    %% Nodes & Styling
    classDef frontend fill:#F59E0B,stroke:#333,stroke-width:2px,color:#fff;
    classDef backend fill:#6366F1,stroke:#333,stroke-width:2px,color:#fff;
    classDef ai fill:#10B981,stroke:#333,stroke-width:2px,color:#fff;
    classDef cloud fill:#7C3AED,stroke:#333,stroke-width:2px,color:#fff;
    classDef user fill:#EC4899,stroke:#333,stroke-width:2px,color:#fff;

    Start([1. User Visits WebApp]):::user --> FE_Landing[Landing Page & Mascot Greeting]:::frontend

    subgraph Phase2_Exec [Phase 2: Frontend Web App Execution Flow]
        FE_Landing --> FE_Quiz[2. Career Profiling Test - RIASEC 12 Routes]:::frontend
        FE_Quiz --> FE_Score[3. Calculate Match Score & Show Top 3 Routes]:::frontend
        FE_Score --> FE_Roadmap[4. Dynamic 30-Day Interactive Roadmap]:::frontend
        FE_Roadmap --> FE_Dash[5. Personal Dashboard & Skill Radar]:::frontend
        FE_Dash --> FE_Port[6. Portfolio / Resume Builder & Export]:::frontend
    end

    subgraph Phase3_Exec [Phase 3: AI Backend Execution Services]
        FE_Quiz -.->|POST /api/v1/profiling/calculate| BE_Prof[Profiling Engine: Match 110 Occupations]:::backend
        FE_Roadmap -.->|POST /api/v1/roadmap/generate| BE_Road[Roadmap Generator Engine]:::backend
        FE_Dash -.->|POST /api/v1/coach/chat| BE_Coach[AI Pathfinder Controller]:::backend

        BE_Coach --> RAG_Pipeline[RAG Pipeline: Search Local Universities/Vocational Colleges]:::ai
        RAG_Pipeline --> Vector_DB[(Vector Knowledge Base)]:::ai
        BE_Coach --> LLM_Engine[LLM Engine: Socratic System Prompt + AI Core]:::ai
        LLM_Engine --> Guard[API Budget Guard & Token Cost Shield]:::ai
    end

    subgraph Phase4_Exec [Phase 4: AIS Cloud Infrastructure Runtime]
        Cloud_LB[AIS Cloud Load Balancer / Reverse Proxy]:::cloud --> NGINX_Container[Frontend NGINX Web Server]:::cloud
        Cloud_LB --> FastAPI_Container[FastAPI Backend Container]:::cloud
        FastAPI_Container --> Redis_Cache[(Redis Session & Cache)]:::cloud
        FastAPI_Container --> SQLite_DB[(SQLite / Postgres DB)]:::cloud
    end
```

---

## 3. โครงสร้างการทำงานของ Phase 2 (Frontend Web App Modules)

เว็บไซต์ที่กำลังพัฒนาอยู่ในปัจจุบัน ประกอบด้วย 6 โมดูลหลักที่เชื่อมโยงกันดังนี้:

| โมดูล (Module) | ไฟล์ซอร์สโค้ด | หน้าที่และการทำงานเชิงลึก |
| :--- | :--- | :--- |
| **1. Landing Page** | `LandingPage.jsx` | หน้าแรกต้อนรับด้วย Mascot Interactive ให้ข้อมูลโครงการ และปุ่มเลือกเริ่มต้น |
| **2. Career Profiling** | `CareerProfiling.jsx` | แบบทดสอบจิตวิทยา RIASEC 12 เส้นทางอาชีพ คำนวณเป็น 3 สายเรียนเด่นพร้อม % Match |
| **3. Dynamic Roadmap** | `DynamicRoadmap.jsx` | แสดงแผนปฏิบัติการ 30 วันแบบ Visual Interactive Ribbon กดเลือกภารกิจและติ๊กเสร็จแล้วได้ |
| **4. Personal Dashboard** | `PersonalDashboard.jsx` | แดชบอร์ดสรุปความก้าวหน้า แสดงกราฟทักษะ (Skill Radar) และสถิติส่วนบุคคล |
| **5. Portfolio Builder** | `PortfolioBuilder.jsx` | รวบรวมข้อมูลการประเมินและทักษะ สรุปเป็นไฟล์ Resume / Portfolio พร้อมส่งออก |
| **6. Language System** | `LanguageContext.jsx` | ระบบจัดการสลับภาษา (TH/EN) รองรับการใช้งานสองภาษาทั่วทั้งเว็บ |

---

## 4. แผนผังจุดเชื่อมต่อ Phase 4 (AIS Cloud Integration Architecture)

แผนภาพแสดงจุดที่ **Phase 4 (AIS Cloud Infra)** เข้าไปห่อหุ้มและเชื่อมต่อกับทุกส่วนของระบบ:

```mermaid
flowchart TD
    %% User Access Layer
    subgraph UserLayer ["User Access Layer (การเข้าถึงของผู้ใช้)"]
        User["นักเรียน / ผู้ใช้งาน (Student Users)"]
    end

    %% Phase 4: AIS Cloud Infra
    subgraph Phase4 ["Phase 4: AIS Cloud Infrastructure Engine"]
        DNS["AIS Cloud DNS / Domain"]
        LB["AIS Cloud Load Balancer & WAF"]
        CDN["AIS Cloud Storage / CDN"]
        Redis["AIS Cloud Redis Cache"]
        CloudDB["AIS Cloud Managed DB (Postgres/SQLite)"]
        VectorDB["AIS Cloud Vector DB (Qdrant)"]
        Monitor["AIS Cloud Security & Monitoring"]
    end

    %% Phase 2: Frontend Web App
    subgraph Phase2 ["Phase 2: Frontend Web App"]
        FE["Frontend Container (React + Vite)"]
    end

    %% Phase 3: AI Backend
    subgraph Phase3 ["Phase 3: AI Backend & Data Services"]
        BE["Backend Container (FastAPI)"]
        AIRAG["AI & RAG Engine"]
    end

    %% Phase 5 & 6: Operations & Live Demo
    subgraph Phase5 ["Phase 5 & 6: Operations & Live Demo"]
        Demo["Live Demo Endpoint (Presentation)"]
    end

    %% Integration Flow Connections
    User -->|1. เข้าผ่าน URL| DNS
    DNS -->|2. Route Traffic| LB
    LB -->|3. ดึงไฟล์เว็บ| CDN
    CDN -->|4. แสดงผลหน้าเว็บ| FE
    FE -->|5. ส่ง HTTPS API Request| LB
    LB -->|6. กระจาย Request| BE
    BE -->|7. เรียกประมวลผล AI| AIRAG
    BE -->|8. อ่าน/เขียน Cache| Redis
    BE -->|9. บันทึกข้อมูล| CloudDB
    BE -->|10. ค้นหาข้อมูลสถาบัน| VectorDB
    BE -->|11. ส่ง Log ตรวจสอบ| Monitor
    LB -.->|12. Endpoint นำเสนอผลงาน| Demo

    %% Color Styles
    style User fill:#EC4899,stroke:#333,color:#fff
    style Phase4 fill:#7C3AED,stroke:#333,color:#fff
    style Phase2 fill:#F59E0B,stroke:#333,color:#fff
    style Phase3 fill:#6366F1,stroke:#333,color:#fff
    style Phase5 fill:#06B6D4,stroke:#333,color:#fff
```

---

## 5. ตารางสรุปจุดเชื่อมโยงระบบ (System Integration Matrix)

| ส่วนประกอบ | โมดูลที่เชื่อมต่อ | หน้าที่ของ AIS Cloud Infra (Phase 4) |
| :--- | :--- | :--- |
| **Static Web Hosting** | Phase 2 Frontend (React/Vite) | โฮสต์ไฟล์ Static Web App และกระจายผ่าน CDN ให้โหลดหน้าเว็บได้รวดเร็ว |
| **API Compute Services** | Phase 3 Backend (FastAPI) | รัน Container Backend API พร้อมระบบ Auto-scaling เมื่อมีผู้ใช้งานเพิ่มขึ้น |
| **Database & Vector Storage** | Database / Vector Index | โฮสต์คลังข้อมูล 110 อาชีพ ข้อมูลโรงเรียน และ Vector DB สำหรับ RAG |
| **Security & Gateway** | Auth & API Guard | บริการ Load Balancer, SSL Certificate, WAF ป้องกันระบบ และควบคุม Rate Limit |
| **Live Presentation** | Phase 6 Live Demo | ให้บริการ Public URL สำหรับการสาธิตระบบสดในวันนำเสนอผลงาน |
