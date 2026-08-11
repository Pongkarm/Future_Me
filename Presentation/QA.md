# Presentation QA

Release: 0.2.0
Reviewed: 11 August 2026

## Content

- 15 slides, 16:9
- Narrative follows problem -> evidence -> data pipeline -> research -> product
  rules -> solution -> architecture -> validation -> roadmap
- Claims were reconciled against `01_Research/Data/SOURCE_AUDIT.md`
- Current prototype capabilities were checked against `03_WebApp/`
- Live, research-only and future inputs are separated: 30 live items, a
  90-item adaptive research design and a restored 1,000-item bilingual bank
- The implemented first-answer follow-up ordering and deterministic decision
  boundary are shown without describing either as validated assessment logic
- The current software snapshot passes 27 Vitest files / 533 tests and all 95
  Playwright browser journeys
- The data slide matches the release registry: 1,961 display rows, 1,375 unique
  institutions and 140 institutions with programme mappings
- Admission cycles, tuition, scholarships and living costs are shown as
  unavailable instead of being inferred
- Current and planned AI capabilities are labelled separately
- Unvalidated research, instruments, partnerships and outcomes are not
  presented as completed results
- Every slide has a `[Sources]` block in its speaker notes (15/15)

## Visual review

All 15 exported PDF pages were rendered to PNG and inspected. The review also
checked the data-pipeline, architecture, prototype, validation and roadmap
slides at full size.

Final pass confirmed:

- no visible text overlap or clipped content
- no content outside the slide canvas
- all three prototype screenshots render at usable resolution
- consistent margins, section labels, typography, numbering and citations
- diagrams remain readable at presentation size
- Thai and English text render correctly
- the current interview, routes and 30-day-plan screenshots are used
- the source template's 16:9 master, dark visual language and footer system are
  preserved; the template-fidelity check reports no issues

## File checks

- PDF: 15 pages, 960 x 540 pt, PDF 1.7, visually matched to the PPTX
- Fonts and bilingual text render correctly in the exported PDF
- PPTX: 15 slide XML parts, 0 empty slide placeholders and all media packaged
- Slide overflow test: passed
- Template-fidelity check: passed with 0 issues
