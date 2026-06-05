#!/usr/bin/env bash
set -e
BASE=${BASE:-http://localhost:8080}
USER=uid_$(date +%s)_smoke

echo "1. bootstrap (new user)"
curl -s -X POST $BASE/api/bootstrap -H 'Content-Type: application/json' \
  -d "{\"userId\":\"$USER\"}" | jq

echo "2. set nickname"
curl -s -X POST $BASE/api/user/profile -H 'Content-Type: application/json' \
  -d "{\"userId\":\"$USER\",\"nickname\":\"小测试\"}" | jq

echo "3. submit exam result (frontend-calculated)"
RESULT=$(curl -s -X POST $BASE/api/exam/submit -H 'Content-Type: application/json' -d "{
  \"userId\":\"$USER\",
  \"assignedDepartmentId\":\"hermit\",
  \"storyId\":1,
  \"amonTriggered\":false,
  \"overwrite\":true
}")
echo "$RESULT" | jq
RID=$(echo "$RESULT" | jq -r '.resultId')

echo "4. fetch result"
curl -s "$BASE/api/exam/result?userId=$USER&resultId=$RID" | jq

echo "5. my department"
curl -s "$BASE/api/department/my?userId=$USER" | jq

echo "6. all departments"
curl -s "$BASE/api/departments" | jq '.departments | length'

echo "7. join department"
curl -s -X POST $BASE/api/department/join -H 'Content-Type: application/json' \
  -d "{\"userId\":\"$USER\",\"targetDepartmentId\":\"justice\"}" | jq

echo "8. forbidden result access"
curl -s "$BASE/api/exam/result?userId=uid_other&resultId=$RID" | jq

echo "✅ all good"
