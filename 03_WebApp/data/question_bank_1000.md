# Candidate 1,000-item question bank

`question_bank_1000.json` is a research-only asset reserved for later adaptive-assessment work.

## Current status

- The file contains 1,000 unique IDs and every declared branch target resolves.
- All 1,000 items contain distinct English and Thai strings, and source labels are present.
- The Thai and English wording still requires expert review and learner readability testing before use.
- The source labels describe the framework used while drafting an item. They do not prove that the wording is an official item or a validated psychometric measure.
- Content validity, language, accessibility, fairness, scoring, and branching still require expert and student review.

## Live application boundary

The running interview does **not** import this file. It uses the existing bilingual 30-item `questions.json` bank and applies a small deterministic rule after the first answer to choose two follow-up questions. Every learner still receives all 30 interest questions; only their order changes.

Run `npm run check:future-bank` to validate bilingual fields, IDs, dimensions, required source fields, and branch references. This separation keeps future research data available without presenting it as deployed or validated.
