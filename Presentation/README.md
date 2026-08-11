# FutureMe AI presentation

> Release 0.2.0 - updated and reviewed 11 August 2026

This folder contains the current presentation set:

- [`FutureMe_Project_Presentation.pptx`](FutureMe_Project_Presentation.pptx) - editable 16:9 deck
- [`FutureMe_Project_Presentation.pdf`](FutureMe_Project_Presentation.pdf) - matching 15-page review copy
- [`QA.md`](QA.md) - content, visual, source-note, and file checks

The deck uses current app screenshots and verified repository evidence. It covers the live 30-item
questionnaire, first-answer follow-up ordering, deterministic 0-3 route boundary, data lineage,
1,961 display rows across 1,375 institutions, 140 institutions with programme mappings, and the
research-only 90-item and 1,000-item banks.

Release 0.2.0 passed 533 Vitest tests and 95 Playwright browser journeys. These results validate the
software and data contracts, not the questionnaire, recommendation weights, mission rubric, or
student outcomes. TCAS admissions, fees, scholarships, and living costs remain unavailable. The
FastAPI and RAG folders are separate research scaffolds and are not connected to the live app.

For the next update, edit the PPTX from current repository evidence, refresh every `[Sources]`
speaker-note block, export the PDF, and repeat the checks in [`QA.md`](QA.md).
