#!/usr/bin/env python3
"""Squeeze the programme index down to something a browser can carry.

data/programmes.json is 7.5 MB of readable JSON — right for a research
artefact, far too heavy for a page bundle. Nothing is dropped that the engine
reads; the weight is all repetition and fields the browser can derive:

  · RIASEC vectors are recomputed at runtime from routes.json, which the app
    already bundles — storing them twice is how the two drift apart
  · institution name, province and sector repeat across every programme at
    that institution, so they move into a table and rows hold an index
  · programme titles repeat across institutions ("หลักสูตรบัญชีบัณฑิต" many
    times over), so they get a table too
  · the eight route ids become a bitmask
  · the null columns (tuition, TCAS round, required scores, scholarships) are
    null for every single row, so they are stated once in meta rather than
    5,658 times — the gap is still declared, just not repeated

Output shape, all positional:

  institutions[i] = [id, name_th, province_iso, province_th, tuition_band]
  titles[j]       = programme title
  programmes[k]   = [titleIndex, institutionIndex, routeMask, seats|null]
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "data", "programmes.json")
OUT = os.path.join(HERE, "..", "..", "..", "03_WebApp", "Pre_Present", "data",
                   "programmes.json")


def main():
    with open(SRC, encoding="utf-8") as fh:
        payload = json.load(fh)
    rows = payload["programmes"]

    route_ids = sorted({r for p in rows for r in p["routes"]})
    route_bit = {r: 1 << i for i, r in enumerate(route_ids)}

    institutions, inst_index = [], {}
    titles, title_index = [], {}
    programmes = []

    for p in rows:
        key = p["institution_id"]
        if key not in inst_index:
            inst_index[key] = len(institutions)
            institutions.append([
                p["institution_id"], p["institution_th"],
                p["province_iso"], p["province_th"], p["tuition_band"],
            ])

        title = p["name_th"]
        if title not in title_index:
            title_index[title] = len(titles)
            titles.append(title)

        mask = 0
        for r in p["routes"]:
            mask |= route_bit[r]

        programmes.append([title_index[title], inst_index[key], mask,
                           p["seats_planned"]])

    out = {
        "meta": {
            "generatedBy": "01_Research/Recommendation_Engine/build/build_webapp_index.py",
            "source": payload["meta"]["sources"],
            "programmes": len(programmes),
            "institutions": len(institutions),
            "level": "ปริญญาตรี",
            # Absent for every row, so declared once. The UI reads this list to
            # tell the learner what nobody has checked, instead of the absence
            # being invisible.
            "missing": [
                "tuition_baht_per_year",
                "tcas_rounds",
                "required_subjects",
                "required_scores",
                "scholarships",
            ],
            "coverageNote": (
                "5,658 จาก 10,354 หลักสูตรปริญญาตรีในทะเบียน (54.6%) — "
                "นิติ รัฐศาสตร์ ครุศาสตร์ และภาษา ยังไม่มีเวกเตอร์ RIASEC"
            ),
        },
        "routeIds": route_ids,
        "institutions": institutions,
        "titles": titles,
        "programmes": programmes,
    }

    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, separators=(",", ":"))

    before = os.path.getsize(SRC)
    after = os.path.getsize(OUT)
    print(f"programmes    {len(programmes)}")
    print(f"institutions  {len(institutions)}  (was repeated per row)")
    print(f"titles        {len(titles)}  unique of {len(programmes)}")
    print(f"routes        {len(route_ids)} -> bitmask")
    print(f"size          {before/1e6:.1f} MB -> {after/1e6:.2f} MB "
          f"({after/before*100:.0f}%)")


if __name__ == "__main__":
    main()
