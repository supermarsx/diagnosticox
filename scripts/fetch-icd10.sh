#!/usr/bin/env bash
set -euo pipefail

# Download ICD-10-CM codes from CDC/NCHS and normalize to NDJSON for local search.
# Requires: curl, python3

YEAR="${1:-2025}"
OUT_DIR="research/icd"
RAW_FILE="$OUT_DIR/icd10cm_codes_${YEAR}.txt"
NDJSON_FILE="$OUT_DIR/icd10.ndjson"

mkdir -p "$OUT_DIR"

SOURCE_URL="https://ftp.cdc.gov/pub/Health_Statistics/NCHS/Publications/ICD10CM/${YEAR}/icd10cm_codes_${YEAR}.txt"

echo "Fetching ICD-10-CM codes for ${YEAR}..."
curl -sSf "$SOURCE_URL" -o "$RAW_FILE"

echo "Normalizing to NDJSON..."
python3 - <<'PY'
import csv, json, pathlib, sys

out_dir = pathlib.Path("research/icd")
raw = max(out_dir.glob("icd10cm_codes_*.txt"))
ndjson = out_dir / "icd10.ndjson"

with raw.open(newline='', encoding='utf-8') as f_in, ndjson.open("w", encoding="utf-8") as f_out:
    reader = csv.reader(f_in, delimiter="\t")
    headers = next(reader, None)
    for row in reader:
        if not row or len(row) < 2:
            continue
        code = row[0].strip()
        title = row[1].strip()
        chap = row[2].strip() if len(row) > 2 else ""
        rec = {
            "id": code,
            "code": code,
            "title": title,
            "chapter": chap,
            "version": "icd10"
        }
        f_out.write(json.dumps(rec, ensure_ascii=False) + "\n")
print(f"Wrote {ndjson}")
PY

echo "ICD-10 NDJSON ready at $NDJSON_FILE"
