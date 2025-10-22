#!/bin/bash

BASE_URL="http://localhost:5001"

echo "=== Complete IT (Issue Talk) API Test ==="
echo ""

# Login as testuser
echo "1. Login as testuser..."
LOGIN=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@51talk.com","password":"test123"}')
TOKEN=$(echo $LOGIN | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")
USER_ID=$(echo $LOGIN | python3 -c "import sys, json; print(json.load(sys.stdin)['user']['id'])")
echo "✓ Logged in as testuser"
echo ""

# Register second user
echo "2. Register second user..."
USER2=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@51talk.com","password":"test123","fullName":"Alice Johnson"}')
TOKEN2=$(echo $USER2 | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null || echo "")

if [ -z "$TOKEN2" ]; then
  echo "User already exists, logging in..."
  USER2=$(curl -s -X POST $BASE_URL/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"alice@51talk.com","password":"test123"}')
  TOKEN2=$(echo $USER2 | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")
fi

USER2_ID=$(echo $USER2 | python3 -c "import sys, json; print(json.load(sys.stdin)['user']['id'])")
echo "✓ Logged in as alice"
echo ""

# Get existing post ID
echo "3. Getting existing posts..."
FEED=$(curl -s $BASE_URL/api/posts/feed -H "Authorization: Bearer $TOKEN")
POST_ID=$(echo $FEED | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['posts'][0]['_id'] if data['posts'] else '')")

if [ -z "$POST_ID" ]; then
  echo "No posts found, creating one..."
  POST=$(curl -s -X POST $BASE_URL/api/posts \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"title":"Test Post","content":"This is a test post","visibility":"public"}')
  POST_ID=$(echo $POST | python3 -c "import sys, json; print(json.load(sys.stdin)['post']['_id'])")
fi

echo "✓ Post ID: $POST_ID"
echo ""

# Add a comment (as alice)
echo "4. Alice adds a comment..."
curl -s -X POST $BASE_URL/api/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN2" \
  -d "{\"postId\":\"$POST_ID\",\"content\":\"Great question! I can help with that.\"}" | python3 -m json.tool
echo ""

# Add a reaction (as alice)
echo "5. Alice adds a reaction..."
curl -s -X POST $BASE_URL/api/reactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN2" \
  -d "{\"postId\":\"$POST_ID\",\"type\":\"upvote\"}" | python3 -m json.tool
echo ""

# Get comments
echo "6. Get all comments for the post..."
curl -s $BASE_URL/api/comments/$POST_ID \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

# Get reactions
echo "7. Get all reactions for the post..."
curl -s $BASE_URL/api/reactions/$POST_ID \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

# Send friend request
echo "8. Alice sends friend request to testuser..."
curl -s -X POST $BASE_URL/api/users/$USER_ID/friend-request \
  -H "Authorization: Bearer $TOKEN2" | python3 -m json.tool
echo ""

# Get friend requests
echo "9. Testuser checks friend requests..."
curl -s $BASE_URL/api/users/friend-requests \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

# Accept friend request
echo "10. Testuser accepts friend request..."
curl -s -X POST $BASE_URL/api/users/friend-request/$USER2_ID/accept \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

# Create private post
echo "11. Alice creates a private post (only friends can see)..."
curl -s -X POST $BASE_URL/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN2" \
  -d '{"title":"Private Issue","content":"This is visible only to my friends","visibility":"private"}' | python3 -m json.tool
echo ""

# Get feed (should see friend's private post)
echo "12. Testuser gets feed (should see Alice's private post)..."
curl -s $BASE_URL/api/posts/feed \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

# Hide a post
echo "13. Testuser hides a post..."
curl -s -X POST $BASE_URL/api/posts/$POST_ID/hide \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

# Update language preference
echo "14. Testuser changes language to Arabic..."
curl -s -X PUT $BASE_URL/api/auth/language \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"language":"ar"}' | python3 -m json.tool
echo ""

# Search users
echo "15. Search for users..."
curl -s "$BASE_URL/api/users/search?q=alice" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

echo "=== All Tests Complete ✅ ==="
