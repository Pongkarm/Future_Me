# 🌐 Global Real-World Career Platforms Benchmark & Applied Research Backlog

> **Project:** FutureMe AI — Career & Educational Guidance System (Hackathon 2026)  
> **Governance Standard:** `00_Governance` Source & Research Metadata  
> **Branch:** `Kong19565`

---

## 📌 Executive Summary

This document provides a comprehensive research audit of **12 global career discovery and guidance platforms** across North America, Europe, Asia-Pacific, and modern AI EdTech ecosystems. It evaluates each platform's theoretical framework, implementation mechanisms, advantages, limitations, direct applicability to **FutureMe AI**, and categorizes non-applicable features into a structured **Deferred Research Backlog** for future iterations.

---

## 🏢 1. Categorized Platform Benchmark Matrix

### Category A: K-12 & School Guidance Platforms (North America & UK)

#### 1.1 **Xello (formerly Career Cruising — Canada/US)**
- **Core Framework:** Holland's RIASEC (Career Matchmaker) + Student Portfolios + Future-Ready Skills.
- **Implementation:** Interactive Storyboard portfolio tracking yearly goals, matching RIASEC interest codes to university majors and workplace skills.
- **Pros:** Visually engaging, excellent student progress tracking.
- **Cons:** Static question Bank; lacks conversational Socratic AI.
- **FutureMe AI Applicability:** 
  - ✅ **Applied:** Adapted into `app/plan/page.tsx` as a Visual 30-Day Roadmap Timeline.
- **Deferred Backlog:**
  - 📦 *Multi-year Career Storyboard & Student Portfolio Tracking (Grade 7–12).*

#### 1.2 **YouScience Brightpath (US)**
- **Core Framework:** RIASEC (Interests) + Johnson O'Connor Aptitude Framework (Brain-Game Aptitudes).
- **Implementation:** Mini brain-games measure innate cognitive aptitudes (spatial reasoning, pattern memory) alongside RIASEC interests to uncover hidden talent and reduce self-report bias.
- **Pros:** Discovers unstated talent; highly objective.
- **Cons:** Long assessment time (45–60 mins); complex game setup.
- **FutureMe AI Applicability:**
  - ✅ **Applied:** Adapted as Situational Missions (`data/missions.json`) to observe choices instead of relying solely on direct self-report.
- **Deferred Backlog:**
  - 📦 *Mini Aptitude Performance Games Engine.*

#### 1.3 **MajorClarity by Paper (US)**
- **Core Framework:** Experiential Micro-Learning + Micro-Credentials + RIASEC.
- **Implementation:** "Career Test-Drive" simulations where students complete 15–20 minute trial tasks before choosing academic tracks.
- **Pros:** Evidence-based trial reduces track-switching rates.
- **Cons:** Requires massive content generation for every trade.
- **FutureMe AI Applicability:**
  - ✅ **Applied:** Embedded as "Next Experiment" weekend trials in every route of `data/routes.json`.
- **Deferred Backlog:**
  - 📦 *Digital Activity Badges & Micro-credentials System.*

#### 1.4 **CareerExplorer by Sokanu (US & Global)**
- **Core Framework:** Machine Learning Psychometrics + 140 Trait Compatibility Model + Holland Codes.
- **Implementation:** Machine learning model evaluates user traits, values, and work environments to calculate percentage match against 800+ careers.
- **Pros:** High statistical depth and world-class UI.
- **Cons:** Black-box ML model; non-transparent criteria.
- **FutureMe AI Applicability:**
  - ⚠️ **Partial:** Adopted profile matching weights (%) in our deterministic engine while maintaining 100% transparent rules.
- **Deferred Backlog:**
  - 📦 *ML Feature Importance Weighting based on Thai student response datasets.*

#### 1.5 **Kuder Navigator & Kuder Journey (Global)**
- **Core Framework:** Super's Life-Span, Life-Space Theory + Person-Environment Fit + KCS.
- **Implementation:** 3-part assessment measuring Interests, Skills Confidence, and Work Values across life stages.
- **Pros:** 85+ years of research validation; extremely rigorous.
- **Cons:** Traditional, formal UI; less engaging for younger adolescents.
- **FutureMe AI Applicability:**
  - ✅ **Applied:** Adopted Work Values (cost, geography, time-to-earning) as hard feasibility constraints.
- **Deferred Backlog:**
  - 📦 *Skills Confidence Scale (Perceived Efficacy Assessment).*

#### 1.6 **Unifrog (UK & International)**
- **Core Framework:** Universal Destinations Platform + UK Gatsby Benchmarks.
- **Implementation:** Unified platform comparing university degrees, apprenticeships, and vocational routes side-by-side.
- **Pros:** Apple-to-apples comparison across all post-secondary pathways.
- **Cons:** Heavy UK-centric curriculum alignment (UCAS, A-Levels, BTEC).
- **FutureMe AI Applicability:**
  - ✅ **Applied:** Implemented as Side-by-Side Route Comparison in `app/compare/page.tsx`.
- **Deferred Backlog:**
  - 📦 *Counselor & Guidance Teacher Export Dashboard.*

---

### Category B: Higher Education & Work Adjustment Platforms

#### 1.7 **Focus 2 Career (US — Higher Education)**
- **Core Framework:** Theory of Work Adjustment (TWA) + RIASEC.
- **Implementation:** Matches university majors by evaluating correspondence between student work values and academic environment parameters.
- **Pros:** Deep work values assessment.
- **Cons:** Too abstract for early secondary school students.
- **FutureMe AI Applicability:**
  - ⚠️ **Deferred for Senior Track:** Suitable for ม.6 / ปวช.3 tertiary transition.
- **Deferred Backlog:**
  - 📦 *Work Environment Preference Assessment Module.*

---

### Category C: Asia-Pacific & Dual Vocational Systems

#### 1.8 **Careernet — 한국อาชีพวิจัย (KRIVET — South Korea)**
- **Core Framework:** National Career Information Standard + Asian K-RIASEC.
- **Implementation:** Tailored RIASEC assessment adapted for Asian family dynamics and competitive educational landscapes.
- **Pros:** Culturally aligned with Asian student experiences; rich vocational data.
- **Cons:** Centralized, rigid government portal structure.
- **FutureMe AI Applicability:**
  - ✅ **Applied:** Adapted vocational path framing (OVEC Modernization) in Thai career catalog.
- **Deferred Backlog:**
  - 📦 *Family & Social Expectation Assessment Module.*

#### 1.9 **MySkillsFuture (SSG — Singapore)**
- **Core Framework:** Skills Framework + National Skills Taxonomy + Transferable Pathways.
- **Implementation:** Maps transferable skills across industries, highlighting skills gaps and lifelong learning pathways.
- **Pros:** Highly modern; focuses on skills over formal titles.
- **Cons:** Oriented toward adult workforce rather than secondary students.
- **FutureMe AI Applicability:**
  - ✅ **Applied:** Displayed "Transferable Strengths" in recommendation cards.
- **Deferred Backlog:**
  - 📦 *Real-Time Skill-to-Job Market Engine.*

#### 1.10 **Planet-Berufe & BerufeNet (Federal Employment Agency — Germany)**
- **Core Framework:** Dual Vocational Education and Training (VET) + Practical Aptitude Matching.
- **Implementation:** German national portal guiding students into Dual Study (Apprenticeship + College) pathways.
- **Pros:** Equal parity of esteem between vocational and academic tracks.
- **Cons:** Highly specific to German labor law.
- **FutureMe AI Applicability:**
  - ✅ **Applied:** Incorporated Dual Vocational Education (DVE / ทวิภาคี) into EV Tech and Mechatronics routes.
- **Deferred Backlog:**
  - 📦 *Local Dual-Study Enterprise Finder Map.*

---

### Category D: Generative AI & Market Intelligence Platforms

#### 1.11 **Khanmigo Career Coach by Khan Academy (US)**
- **Core Framework:** Generative AI Socratic Tutoring + GPT-4 Guidance Architecture.
- **Implementation:** AI chat tutor asking open-ended Socratic questions to encourage student reflection.
- **Pros:** Natural, 24/7 conversational engagement.
- **Cons:** Hallucination risks on admission rules; high API token cost.
- **FutureMe AI Applicability:**
  - ✅ **Applied & Improved:** Resolved hallucination risk via our *"Rules Decide, LLM Communicates"* architecture.
- **Deferred Backlog:**
  - 📦 *Interactive AI Voice Guidance Assistant.*

#### 1.12 **Eightfold.ai / SkyHive (Global AI)**
- **Core Framework:** Deep Learning AI Skills Graph + Global Labor Intelligence.
- **Implementation:** Real-time labor market graph predicting skill demand shifts over 5-year horizons.
- **Pros:** Fresh real-time market data.
- **Cons:** B2B enterprise focus.
- **FutureMe AI Applicability:**
  - ⚠️ **Partial:** Used TDRI / WEF Future of Jobs 2025 statistical evidence.
- **Deferred Backlog:**
  - 📦 *Real-Time Labor Market Demand Graph API.*

---

## 🗄️ 2. Summary Table of Deferred Research Backlog

| Backlog Item | Origin Platform | Potential Application Phase |
| :--- | :--- | :--- |
| **Multi-year Career Storyboard** | Xello | Phase 2 — School-wide rollouts |
| **Mini Aptitude Performance Games** | YouScience | Phase 2 — Gamified assessment extension |
| **Micro-credentials & Activity Badges** | MajorClarity | Phase 2 — Student motivation system |
| **ML Feature Importance Weighting** | CareerExplorer | Phase 3 — National dataset model tuning |
| **Skills Confidence Scale** | Kuder Navigator | Phase 2 — Self-efficacy evaluation |
| **Counselor Export Dashboard** | Unifrog | Phase 2 — Teacher portal integration |
| **Work Environment Preference Module** | Focus 2 | Phase 3 — Tertiary transition module |
| **Family Expectation Assessment** | Careernet | Phase 2 — Thai cultural context module |
| **Real-Time Skill-to-Job Engine** | MySkillsFuture | Phase 3 — Labor market API integration |
| **Local Enterprise Finder Map** | Planet-Berufe | Phase 3 — OVEC vocational placement |
| **Interactive AI Voice Assistant** | Khanmigo | Phase 2 — Accessibility enhancement |
| **Real-Time Labor Market Graph API** | Eightfold.ai | Phase 3 — Enterprise analytics |

