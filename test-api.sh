#!/bin/bash

BASE_URL="http://localhost:5001"

echo "=== Testing IT (Issue Talk) API ==="
echo ""

# Test 1: Root endpoint
echo "1. Testing root endpoint..."
curl -s $BASE_URL/ | python3 -m json.tool
echo ""

# Test 2: Login
echo "2. Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@51talk.com","password":"test123"}')

echo $LOGIN_RESPONSE | python3 -m json.tool

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")
echo ""
echo "Token: $TOKEN"
echo ""

# Test 3: Get current user
echo "3. Testing /api/auth/me..."
curl -s $BASE_URL/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

# Test 4: Create a post
echo "4. Testing create post..."
curl -s -X POST $BASE_URL/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title":"How to use React hooks?",
    "content":"I need help understanding useEffect and useState. Can someone explain?",
    "visibility":"public",
    "tags":["react","javascript","hooks"]
  }' | python3 -m json.tool
echo ""

# Test 5: Get feed
echo "5. Testing get feed..."
curl -s $BASE_URL/api/posts/feed \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

echo "=== Tests Complete ==="
