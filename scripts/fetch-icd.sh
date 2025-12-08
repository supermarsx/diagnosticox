#!/usr/bin/env bash
set -euo pipefail

# Fetch ICD-11 entities via WHO ICD API and save as NDJSON for local search
# Requirements: curl, jq, env vars VITE_ICD_CLIENT_ID, VITE_ICD_CLIENT_SECRET

API_BASE="https://id.who.int/icd/entity/search"
TOKEN_URL="https://icdaccessmanagement.who.int/connect/token"
OUT_DIR="research/icd"
OUT_FILE="$OUT_DIR/icd11.ndjson"
QUERY_FILE="$OUT_DIR/icd11_queries.txt"

mkdir -p "$OUT_DIR"

if [[ -z "${VITE_ICD_CLIENT_ID:-}" || -z "${VITE_ICD_CLIENT_SECRET:-}" ]]; then
  echo "Missing VITE_ICD_CLIENT_ID or VITE_ICD_CLIENT_SECRET env vars." >&2
  exit 1
fi

echo "Requesting ICD token..."
TOKEN=$(curl -s -X POST "$TOKEN_URL" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&scope=icdapi_access&client_id=${VITE_ICD_CLIENT_ID}&client_secret=${VITE_ICD_CLIENT_SECRET}" \
  | jq -r '.access_token')

if [[ -z "$TOKEN" || "$TOKEN" == "null" ]]; then
  echo "Failed to fetch token" >&2
  exit 1
fi

echo "Seeding query list..."
cat > "$QUERY_FILE" <<'EOF'
respiratory
cardiac
endocrine
neurological
gastrointestinal
infectious
pediatric
oncology
psychiatric
hematology
dermatology
musculoskeletal
obstetric
injury
derm
genitourinary
EOF

echo "Fetching ICD-11 search results..."
> "$OUT_FILE"
while IFS= read -r term; do
  echo " - $term"
  curl -s "$API_BASE?q=$term&flatResults=true&useFlexisearch=true" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Accept: application/json" \
    -H "API-Version: v2" \
    | jq -c '.destinationEntities[]' >> "$OUT_FILE"
done < "$QUERY_FILE"

echo "Fetched ICD-11 entities to $OUT_FILE"
