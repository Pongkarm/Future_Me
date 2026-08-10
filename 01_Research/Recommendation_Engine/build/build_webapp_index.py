#!/usr/bin/env python3
"""Squeeze the programme index down to something a browser can carry.

data/programmes.json is readable JSON sized for a research artefact, far too
heavy for a page bundle. Nothing the engine reads is dropped; the weight is
repetition and fields the browser can derive:

  · institution name, province and sector repeat across every programme at
    that institution, so they move into a table and rows hold an index
  · programme titles repeat across institutions, so they get a table too
  · the ISCED field code, its title and its RIASEC vector are per-field, not
    per-programme, so they move into a field table
  · the null columns (tuition, TCAS round, required scores, scholarships) are
    null for every row, so they are stated once in meta rather than repeated
    thousands of times — the gap is still declared, just not restated

Output, all positional:

  fields[f]       = [iscedCode, title, [R,I,A,S,E,C], occupationsBehindIt]
  institutions[i] = [id, nameTh, provinceIso, provinceTh, tuitionBand]
  titles[j]       = programme title
  programmes[k]   = [titleIndex, institutionIndex, fieldIndex, seats|null,
                     productionCost|null, levelIndex]
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "data", "programmes.json")
OUT = os.path.join(HERE, "..", "..", "..", "03_WebApp", "Pre_Present", "data",
                   "programmes.json")

DIMENSIONS = ["R", "I", "A", "S", "E", "C"]

# index into this list is stored per programme
LEVELS = ["ปริญญาตรี", "ปวช.", "ปวส."]


def main():
    with open(SRC, encoding="utf-8") as fh:
        payload = json.load(fh)
    rows = payload["programmes"]

    fields, field_index = [], {}
    institutions, inst_index = [], {}
    titles, title_index = [], {}
    programmes = []

    vocational = []
    voc_path = os.path.join(HERE, "..", "data", "vocational.json")
    if os.path.exists(voc_path):
        with open(voc_path, encoding="utf-8") as fh:
            voc = json.load(fh)
        for v in voc["programmes"]:
            vocational.append({
                "isced": "VEC:" + v["field_subject"],
                "isced_title": v["field_subject"],
                "isced_occupations": 0,   # audited per subject, not per occupation count
                "name_th": v["name_th"],
                "institution_id": v["institution_id"],
                "institution_th": v["institution_th"],
                "province_iso": v["province_iso"],
                "province_th": v["province_th"],
                "tuition_band": v["tuition_band"],
                "riasec": v["riasec"],
                "seats_planned": v["students_enrolled"],
                "cost_per_year_production": None,
                "level": v["level"],
            })

    # Degrees first, then ปวช./ปวส. — the engine sorts on score, so order here
    # only decides tie-break stability.
    for p in rows + vocational:
        code = p["isced"]
        if code not in field_index:
            field_index[code] = len(fields)
            fields.append([code, p["isced_title"],
                           [round(p["riasec"][d], 4) for d in DIMENSIONS],
                           p["isced_occupations"]])

        key = p["institution_id"]
        if key not in inst_index:
            inst_index[key] = len(institutions)
            institutions.append([p["institution_id"], p["institution_th"],
                                 p["province_iso"], p["province_th"],
                                 p["tuition_band"]])

        title = p["name_th"]
        if title not in title_index:
            title_index[title] = len(titles)
            titles.append(title)

        cost = p["cost_per_year_production"]
        programmes.append([title_index[title], inst_index[key], field_index[code],
                           p["seats_planned"],
                           round(cost) if cost is not None else None,
                           LEVELS.index(p.get("level", "ปริญญาตรี"))])

    out = {
        "meta": {
            "generatedBy": "01_Research/Recommendation_Engine/build/build_webapp_index.py",
            "source": payload["meta"]["sources"],
            "programmes": len(programmes),
            "institutions": len(institutions),
            "fields": len(fields),
            "levels": LEVELS,
            "riasecSource": "O*NET 29.1 Interests, Occupational Interest scale, "
                            "US DOL/ETA, CC BY 4.0 — mapped to ISCED-F 2013 fields",
            "riasecStatus": "ค่า RIASEC วัดมาจริง · การจับคู่สาย ISCED กับกลุ่มอาชีพ "
                            "เป็นงานของทีมและยังไม่ผ่านการตรวจโดยผู้เชี่ยวชาญ",
            "costNote": "productionCost คือต้นทุนที่สถาบันใช้ผลิตนักศึกษาหนึ่งคนต่อปี "
                        "ไม่ใช่ค่าเทอมที่ผู้เรียนจ่าย",
            # Absent for every row. Read by the UI so the gap is visible.
            "missing": [
                "tuition_baht_per_year",
                "tcas_rounds",
                "required_subjects",
                "required_scores",
                "scholarships",
            ],
            "coverageNote": (
                f"ปริญญาตรี {len(rows)} หลักสูตร (88.8% ของที่ไม่ซ้ำในทะเบียน อว.) · "
                f"ปวช./ปวส. {len(vocational)} หลักสูตร จากทะเบียนนักเรียนของ สอศ. ปี 2568"
            ),
        },
        # top level, not inside meta: the engine reads it on every row
        "levels": LEVELS,
        "fields": fields,
        "institutions": institutions,
        "titles": titles,
        "programmes": programmes,
    }

    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, separators=(",", ":"))

    before = os.path.getsize(SRC)
    after = os.path.getsize(OUT)
    print(f"programmes    {len(programmes)}  (ตรี {len(rows)} · อาชีวะ {len(vocational)})")
    print(f"institutions  {len(institutions)}")
    print(f"fields        {len(fields)}  (ISCED-F detailed, each with its own vector)")
    print(f"titles        {len(titles)} unique of {len(programmes)}")
    print(f"with cost     {sum(1 for r in programmes if r[4] is not None)}")
    print(f"size          {before/1e6:.1f} MB -> {after/1e6:.2f} MB "
          f"({after/before*100:.0f}%)")


if __name__ == "__main__":
    main()
