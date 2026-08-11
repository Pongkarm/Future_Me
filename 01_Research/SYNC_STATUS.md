# Research data sync status

Synced from `Kong19565` into `Panussu` on 2026-08-10.

## Verified and rebuilt

- `Geography_and_Access/` is source-backed and reproducible. Its institution registry now uses the official MHESI academic-year 2566 register, while vocational outcomes remain the latest published OVEC 2566 release.
- The 77 province-access files and the app-ready `nearby.json` were regenerated after the registry refresh.
- Exact source URL, retrieval date, and source checksum are recorded in `Geography_and_Access/PROVENANCE.json`.

## Research-only imports

- `Comprehensive_Occupation_Skill_Matrix.md`, `Comprehensive_Occupation_Taxonomy.md`, `Global_Platforms_Benchmark.md`, and `theory_draft/` are useful research references, not active scoring inputs.
- `Adaptive_Questionnaire/` keeps the smaller, documented 90-item research bank and simulations. It is not active in the live interview and must be validated before any future integration.
- `03_WebApp/Pre_Present/data/question_bank_1000.json` is restored as a bilingual future bank. Automated checks cover structure and branch targets, not content validity; the live interview does not import it.

## Web-app integration record

- On 2026-08-11, the `winxtxrgit` web-app implementation was integrated with this data set. The active prototype now has a 12-route catalogue and province-aware nearby-institution views.
- `data/nearby.json` intentionally keeps the regenerated Panussu version: 77 provinces and 1,961 options from the documented MHESI/OVEC source pipeline. It replaces the older 1,904-option copy from the web-app branch.
- The live interview still imports the existing 30-item `data/questions.json` instrument. A deterministic rule uses the first answer to move two existing items forward; it does not change the bank, scoring, or completion requirement.
