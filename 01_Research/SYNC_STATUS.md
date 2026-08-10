# Research data sync status

Synced from `Kong19565` into `Panussu` on 2026-08-10.

## Verified and rebuilt

- `Geography_and_Access/` is source-backed and reproducible. Its institution registry now uses the official MHESI academic-year 2566 register, while vocational outcomes remain the latest published OVEC 2566 release.
- The 77 province-access files and the app-ready `nearby.json` were regenerated after the registry refresh.
- Exact source URL, retrieval date, and source checksum are recorded in `Geography_and_Access/PROVENANCE.json`.

## Research-only imports

- `Comprehensive_Occupation_Skill_Matrix.md`, `Comprehensive_Occupation_Taxonomy.md`, `Global_Platforms_Benchmark.md`, and `theory_draft/` are useful research references, not active scoring inputs.
- `Audits/2026-08-06/` is a historical audit snapshot. It should not be treated as a current production audit.
- `03_WebApp/Pre_Present/data/question_bank_1000.json` remains unconnected to the live interview. Review its content and psychometric validity before activating it.
