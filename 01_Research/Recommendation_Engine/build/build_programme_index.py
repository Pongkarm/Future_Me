#!/usr/bin/env python3
"""Build the programme-level index the recommender ranks over.

Until now the engine stopped at twelve *routes* — "you might like engineering".
A learner cannot apply to a route. This joins three datasets that already exist
in the workspace so the engine can rank real programmes at real institutions:

  admission_plan.csv        MHESI programme register: 10,354 bachelor rows,
                            188 institutions, with the published intake plan
  institutions.json         1,358 located institutions (province, coordinates,
                            sector) from the VEC and MHESI registers
  routes.json               the twelve routes and their RIASEC weight vectors

## What this file deliberately does NOT invent

Tuition, TCAS round, required subject scores and scholarships are *not* in any
dataset we hold. They are written as null with a `missing` entry naming what
would have to be fetched, rather than being estimated from a sector average and
displayed as if measured. A learner who sees "ประมาณ 25,000 บาท" cannot tell
that nobody checked; a learner who sees "ไม่มีข้อมูล — ต้องดึงจาก TCAS" can.

The single derived field is `tuition_band`, which follows from the institution's
sector alone (public/private/autonomous) and is labelled `illustrative`. It
orders programmes coarsely; it is never printed as a number.

## Route matching

A programme's RIASEC vector is its route's vector — the same twelve vectors the
existing web app scores against, so the two cannot drift. Programmes matching no
route are dropped and counted, not silently absorbed: the coverage number is
printed on every run and quoted in the README.
"""
import collections
import csv
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
GEO = os.path.join(ROOT, "01_Research", "Geography_and_Access")
WEBAPP = os.path.join(ROOT, "03_WebApp", "Pre_Present")
OUT = os.path.join(HERE, "..", "data")

ENTRY_LEVELS = {"ปริญญาตรี"}

# Subject words as they appear in Thai programme titles. Taken verbatim from
# Geography_and_Access/build/build_programmes.py so one edit changes both.
ROUTE_SUBJECTS = {
    "sci-math-engineering":
        r"วิศวกรรม|วิทยาศาสตร|คณิตศาสตร|ฟิสิกส|เคมี|ชีววิทยา|สถิติ|เทคโนโลยีอุตสาหกรร",
    "vocational-digital":
        r"คอมพิวเตอร|เทคโนโลยีสารสนเทศ|ซอฟต์แวร|ดิจิทัล|สารสนเทศ|วิทยาการข้อมูล|ปัญญาประดิษฐ",
    "arts-design":
        r"ศิลป|ออกแบบ|นิเทศศาสตร|ดุริยางค|นาฏศิลป|ดนตรี|สถาปัตย|นฤมิต",
    "business-admin":
        r"บริหารธุรกิจ|บัญชี|การตลาด|เศรษฐศาสตร|การจัดการ|โลจิสติกส|การเงิน",
    "health-care":
        r"แพทยศาสตร|พยาบาล|เภสัช|สาธารณสุข|ทันตแพทย|กายภาพบำบัด|เทคนิคการแพทย|สหเวช",
    "university-ai-data":
        r"วิทยาการข้อมูล|ปัญญาประดิษฐ|วิทยาการคอมพิวเตอร|วิศวกรรมคอมพิวเตอร|สถิติประยุกต",
    "university-medtech-rehab":
        r"เทคนิคการแพทย|กายภาพบำบัด|กิจกรรมบำบัด|รังสีเทคนิค|สหเวชศาสตร",
    "university-digital-comm":
        r"นิเทศศาสตร|วารสารศาสตร|สื่อสารมวลชน|ดิจิทัลมีเดีย|ภาพยนตร",
}
PATTERNS = {r: re.compile(p) for r, p in ROUTE_SUBJECTS.items()}

# Sector -> coarse cost band. Derived from institution type, nothing else.
# Never rendered as a baht figure. See the module docstring.
SECTOR_BAND = {
    "มหาวิทยาลัยรัฐ": "public",
    "มหาวิทยาลัยในกำกับรัฐ": "autonomous",
    "มหาวิทยาลัยราชภัฎ": "rajabhat",
    "มหาวิทยาลัยเทคโนโลยีราชมงคล": "rajamangala",
    "มหาวิทยาลัยเอกชน": "private",
    "อุดมศึกษา": "unknown",
}


def norm(s):
    return re.sub(r"\s+", "", s or "").replace("ฯ", "")


def main():
    with open(os.path.join(GEO, "build", "admission_plan.csv"), encoding="utf-8-sig") as fh:
        rows = [r for r in csv.DictReader(fh) if r["LEV_NAME_TH"].strip() in ENTRY_LEVELS]

    with open(os.path.join(GEO, "data", "institutions.json"), encoding="utf-8") as fh:
        institutions = json.load(fh)
    by_name = {norm(i["name_th"]): i for i in institutions}

    with open(os.path.join(WEBAPP, "data", "routes.json"), encoding="utf-8") as fh:
        routes = {r["id"]: r for r in json.load(fh)["routes"]}

    programmes = []
    dropped_no_route = 0
    dropped_no_institution = 0
    seen = set()

    for row in rows:
        name = row["CURR_NAME"].strip()
        inst = by_name.get(norm(row["UNIV_NAME_TH"].strip()))
        if inst is None:
            dropped_no_institution += 1
            continue

        matched = sorted(r for r, pat in PATTERNS.items() if pat.search(name))
        if not matched:
            dropped_no_route += 1
            continue

        # The register reuses one CURR_ID across genuinely different variants of
        # a programme — "ดนตรีศึกษา (4 ปี)" and "ดนตรีศึกษา (5 ปี)" share an id
        # and are different things to apply to. Keying on the id alone silently
        # deleted 2,769 of them, so the title is part of the key.
        key = (row["CURR_ID"], name, inst["id"])
        if key in seen:
            continue
        seen.add(key)

        # A programme's interest vector is the mean of the vectors of every
        # route whose subject words it matched. Averaging rather than picking
        # keeps a joint programme ("วิศวกรรมคอมพิวเตอร์") honest about sitting
        # between two routes instead of being forced into one.
        vec = {d: 0.0 for d in "RIASEC"}
        for r in matched:
            for d, w in routes[r]["interestWeights"].items():
                vec[d] += w / len(matched)

        seats = row["TOTAL_PLAN"].strip()
        programmes.append({
            "programme_id": row["CURR_ID"],
            "name_th": name,
            "name_en": row["CURR_NAME_EN"].strip() or None,
            "institution_id": inst["id"],
            "institution_th": inst["name_th"],
            "sector": inst.get("sector"),
            "province_iso": inst.get("province_iso"),
            "province_th": inst.get("province_th"),
            "lat": inst.get("lat"),
            "lon": inst.get("lon"),
            "routes": matched,
            "riasec": {d: round(v, 4) for d, v in vec.items()},
            "seats_planned": int(seats) if seats.isdigit() else None,
            "tuition_band": SECTOR_BAND.get(inst.get("sector"), "unknown"),
            # Everything below is absent from every dataset we hold.
            "tuition_baht_per_year": None,
            "tcas_rounds": None,
            "required_subjects": None,
            "required_scores": None,
            "scholarships": None,
            "missing": [
                "tuition_baht_per_year: ต้องดึงจากประกาศค่าธรรมเนียมของแต่ละสถาบัน",
                "tcas_rounds / required_scores: ต้องดึงจาก mytcas.com (ยังไม่มี open API)",
                "scholarships: ต้องดึงจากหน้าทุนของแต่ละคณะ",
            ],
        })

    payload = {
        "meta": {
            "generated_by": "01_Research/Recommendation_Engine/build/build_programme_index.py",
            "sources": [
                "data.go.th dqe_11_01 — แผนการรับนักศึกษาของแต่ละหลักสูตร (via Geography_and_Access/build/admission_plan.csv)",
                "01_Research/Geography_and_Access/data/institutions.json",
                "03_WebApp/Pre_Present/data/routes.json — RIASEC weight vectors",
            ],
            "level": sorted(ENTRY_LEVELS),
            "programmes": len(programmes),
            "institutions": len({p["institution_id"] for p in programmes}),
            "dropped_no_route_match": dropped_no_route,
            "dropped_no_located_institution": dropped_no_institution,
            "unpriced": "tuition, TCAS round and required scores are null for every "
                        "row — no dataset in this workspace carries them",
        },
        "programmes": programmes,
    }

    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, "programmes.json"), "w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=1)

    total = len(rows)
    print(f"bachelor rows read           {total}")
    print(f"dropped · no located inst.   {dropped_no_institution}")
    print(f"dropped · no route match     {dropped_no_route}")
    print(f"programmes indexed           {len(programmes)}  "
          f"({len(programmes) / total * 100:.1f}% of rows read)")
    print(f"institutions covered         {len({p['institution_id'] for p in programmes})}")
    per_route = collections.Counter(r for p in programmes for r in p["routes"])
    for route, n in per_route.most_common():
        print(f"  {n:>5} programmes · {route}")


if __name__ == "__main__":
    main()
