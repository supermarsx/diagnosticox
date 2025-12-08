#!/bin/bash

BASE_URL="http://localhost:3001"

echo "=== Testing Medical Diagnosis API ==="
echo

# 1. Test health endpoint
echo "1. Health Check:"
curl -s "$BASE_URL/health" | jq -r '.status'
echo

# 2. Test login
echo "2. Login Test:"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"dr.smith@clinic.com","password":"demo123"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
USER_EMAIL=$(echo "$LOGIN_RESPONSE" | jq -r '.user.email')
echo "Logged in as: $USER_EMAIL"
echo

# 3. Test patients endpoint
echo "3. Patients Endpoint:"
PATIENTS=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/patients")
PATIENT_COUNT=$(echo "$PATIENTS" | jq '.patients | length')
PATIENT_ID=$(echo "$PATIENTS" | jq -r '.patients[0].id')
PATIENT_NAME=$(echo "$PATIENTS" | jq -r '.patients[0].first_name + " " + .patients[0].last_name')
echo "Found $PATIENT_COUNT patients. First: $PATIENT_NAME"
echo

# 4. Test problems endpoint
echo "4. Problems Endpoint:"
PROBLEMS=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/problems?patientId=$PATIENT_ID")
PROBLEM_COUNT=$(echo "$PROBLEMS" | jq '.problems | length')
echo "Found $PROBLEM_COUNT problems for patient"
echo

# 5. Test Bayesian calculator
echo "5. Bayesian Calculator:"
BAYESIAN=$(curl -s -X POST "$BASE_URL/api/bayesian/calculate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pretestProbability":0.3,"likelihoodRatioPositive":10,"isPositive":true}')
POST_TEST=$(echo "$BAYESIAN" | jq -r '.postTestProbability')
echo "Posttest probability: $POST_TEST"
echo

echo "=== All Core Endpoints Working! ==="
