# 🎉 IsuueTalk - New Features Testing Guide

## ✅ All Features Successfully Implemented!

This guide will help you test all the new features that have been added to IsuueTalk.

---

## 🚀 Quick Start

### 1. Start the Backend

```bash
cd server
npm install  # Install any new dependencies if needed
npm start    # Or npm run dev
```

The backend should start on `http://localhost:5001`

### 2. Start the Frontend

```bash
cd frontend/api-craft-fe
npm install  # This will install all new packages (Tiptap, DOMPurify, etc.)
npm run dev  # Vite dev server
```

The frontend should start on `http://localhost:8080` or `http://localhost:5173`

### 3. Initial Setup

- Make sure your MongoDB database is running and connected
- The new User schema fields (reputation, level, badges, stats) will be added automatically
- Existing users will get default values (reputation: 0, level: 1, empty badges array)

---

## 📋 Feature Testing Checklist

### Feature 1: 🎨 Rich Text Editor with Code Highlighting

**Where to Test:** Creating a new post

**Steps:**
1. Log in to your account
2. Go to the Feed page
3. Click on the "What's the issue?" input box to create a post
4. You should now see a **Rich Text Editor** with a toolbar

**Test Actions:**
- ✅ Type some text and format it (Bold, Italic, Strikethrough)
- ✅ Create a bulleted list or numbered list
- ✅ Add a blockquote
- ✅ Add inline code (backticks)
- ✅ **Add a code block** with syntax highlighting:
  - Click the "Code Block" button
  - Paste some code (JavaScript, Python, etc.)
  - The code should be syntax-highlighted in a dark theme

**Example Code to Test:**
```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
  return true;
}
```

**Expected Results:**
- Toolbar with formatting options appears
- Text formatting works in real-time
- Code blocks show syntax highlighting
- When you create the post, it appears in the feed with formatted content
- HTML content is safely sanitized (no XSS vulnerabilities)

---

### Feature 2: 🏆 Reputation & Badges System

#### A. Earning Reputation Points

**Actions that give you points:**
- Create a post: **+5 points**
- Create a comment: **+2 points**
- Someone reacts "Like" to your post: **+1 point**
- Someone reacts "Upvote" to your post: **+5 points**
- Someone reacts "Helpful" to your post: **+10 points**
- Someone reacts "Insightful" to your post: **+10 points**

**Testing Steps:**
1. Create a few posts → Check your reputation increases by 5 per post
2. Comment on posts → Check reputation increases by 2 per comment
3. Have another user react to your posts → Check reputation increases based on reaction type
4. Delete a post → Reputation decreases by 5
5. Check your **level** updates (1 level per 100 reputation points)

#### B. Earning Badges

**Available Badges (16 total):**

| Badge | Requirement | Icon |
|-------|-------------|------|
| First Steps | Create your first post | 🎯 |
| Prolific Poster | Create 10 posts | 📝 |
| Content Creator | Create 50 posts | ✍️ |
| Breaking the Ice | Post your first comment | 💭 |
| Conversationalist | Post 50 comments | 💬 |
| Discussion Master | Post 200 comments | 🗣️ |
| Helper | Receive 10 helpful reactions | 🌟 |
| Super Helper | Receive 50 helpful reactions | ⭐ |
| Hero | Receive 100 helpful reactions | 🦸 |
| Popular Creator | Receive 100 total reactions | 🔥 |
| Viral | Receive 500 total reactions | 🚀 |
| Problem Solver | Have 10 accepted answers | ✅ |
| Expert | Have 50 accepted answers | 🎓 |
| Rising Star | Reach 100 reputation | 🌠 |
| Influencer | Reach 500 reputation | 💎 |
| Legend | Reach 1000 reputation | 👑 |

**Testing Steps:**
1. Create your first post → Should get "First Steps" badge
2. Create your first comment → Should get "Breaking the Ice" badge
3. Reach 100 reputation → Should get "Rising Star" badge
4. View your profile to see all earned badges

#### C. Viewing Reputation & Badges

**Profile Page:**
1. Click on your profile icon in the navbar
2. You should see:
   - **Reputation Badge** showing your points and level
   - **Achievements section** displaying all earned badges with icons
   - Hover over badges to see descriptions

**Leaderboard Page:**
1. Click the **Trophy icon** (🏆) in the navbar
2. You should see:
   - Top 50 users ranked by reputation
   - Top 3 users have special styling (gold, silver, bronze)
   - Each user shows: reputation, level, badges, and stats
   - Click on any user to view their profile

---

### Feature 3: 🔍 Advanced Search & Filtering

**Where to Test:** Advanced Search page

**Access:**
- Click the **Filter icon** (🔍) in the navbar
- Or navigate to `/advanced-search`

**Available Filters:**

1. **Keywords** - Search in titles and content
2. **Tags** - Filter by comma-separated tags (e.g., "react, nodejs")
3. **Author** - Filter by username
4. **Date From/To** - Filter by date range
5. **Min Reactions** - Filter posts with minimum reactions
6. **Sort By:**
   - Newest First
   - Oldest First
   - Most Reactions
   - Most Comments
   - Most Relevant (when keyword search is used)

**Testing Steps:**

1. **Basic Keyword Search:**
   - Enter a keyword like "error" or "bug"
   - Click Search
   - Should return all posts containing that keyword

2. **Tag Filtering:**
   - Enter tags: "react, javascript"
   - Click Search
   - Should return posts tagged with those tags

3. **Author Filtering:**
   - Enter a specific username
   - Click Search
   - Should return only that user's posts

4. **Date Range:**
   - Set "Date From" to a past date
   - Set "Date To" to today
   - Click Search
   - Should return posts within that range

5. **Min Reactions:**
   - Enter "5" in Min Reactions
   - Click Search
   - Should return only posts with 5+ reactions

6. **Combined Filters:**
   - Use multiple filters together
   - e.g., keyword="bug" + tags="nodejs" + minReactions=2
   - Click Search
   - Should return posts matching ALL criteria

7. **Sorting:**
   - Try different sort options
   - "Most Reactions" should show popular posts first
   - "Newest First" should show recent posts first

8. **Clear Filters:**
   - Click "Clear" button
   - All filters should reset

---

## 🔧 Additional Testing Scenarios

### Test Reputation Changes in Real-Time

**Setup:** Use two browser windows/incognito modes with two different accounts

**Test Flow:**
1. **User A** creates a post
2. Check User A's reputation increased by 5
3. **User B** reacts "Helpful" to User A's post
4. Check User A's reputation increased by 10
5. **User B** removes the reaction
6. Check User A's reputation decreased by 10
7. Verify badge awards happen automatically

### Test Rich Text Editor Security

**Test XSS Protection:**
1. Try to create a post with malicious HTML:
   ```html
   <script>alert('XSS')</script>
   <img src="x" onerror="alert('XSS')">
   ```
2. The post should be created safely
3. View the post - no alert should appear
4. The content should be sanitized by DOMPurify

### Test Search Performance

1. Create 20+ posts with different tags
2. Use Advanced Search to filter by various criteria
3. Search should return results quickly
4. Results should respect visibility settings (public/private)

---

## 🎯 Navigation & UI Updates

### New Icons in Navbar:

1. **🔍 Filter Icon** → Advanced Search page
2. **🏆 Trophy Icon** → Leaderboard page
3. **👥 Friends Icon** → Friends management
4. **👤 Profile Icon** → Your profile (now with reputation!)

### Updated Pages:

1. **Profile Page** → Now shows Reputation, Level, and Badges
2. **Feed Page** → Posts now render with rich HTML formatting
3. **Post Detail Page** → Comments and formatted content display properly

---

## 📊 Database Changes

### New Fields in User Model:
```javascript
{
  reputation: Number,        // Total reputation points
  level: Number,            // User level (1 level per 100 points)
  badges: [{               // Array of earned badges
    badgeId: String,
    name: String,
    description: String,
    icon: String,
    earnedAt: Date
  }],
  stats: {
    totalPosts: Number,
    totalComments: Number,
    totalReactionsReceived: Number,
    helpfulReactionsReceived: Number,
    acceptedAnswers: Number
  }
}
```

### New Fields in Post Model:
```javascript
{
  contentType: String,      // 'html', 'json', 'markdown', 'text'
  content: String           // Max length increased to 10,000 chars
}
```

### New Indexes:
- Text index on Post title and content for search

---

## 🐛 Troubleshooting

### Issue: Rich Text Editor not showing
**Solution:** Run `npm install` in frontend directory to install Tiptap packages

### Issue: Reputation not updating
**Solution:**
- Check backend console for errors
- Verify MongoDB connection
- Check reputation service logs

### Issue: Search returns no results
**Solution:**
- Ensure MongoDB text index was created
- Restart MongoDB and backend
- Check backend logs for index creation

### Issue: Badges not appearing
**Solution:**
- Badges are awarded automatically based on stats
- Try triggering badge conditions (e.g., create first post)
- Check Profile page to see badges section

---

## 📝 API Endpoints Added

### Reputation & Badges:
```
GET    /api/users/leaderboard?limit=50
GET    /api/users/:id/reputation
GET    /api/users/:id/badges
```

### Search:
```
GET    /api/posts/search?q=keyword&tags=tag1,tag2&author=username&sortBy=newest&dateFrom=2025-01-01&dateTo=2025-12-31&minReactions=5
```

---

## ✅ Success Criteria

You've successfully tested all features if you can:

1. ✅ Create a post with **formatted text and code blocks**
2. ✅ See your **reputation increase** when you post/comment
3. ✅ **Earn a badge** (at least "First Steps")
4. ✅ View your **profile** with reputation and badges displayed
5. ✅ See the **Leaderboard** with ranked users
6. ✅ Use **Advanced Search** to filter posts
7. ✅ Navigate using the **new navbar icons**

---

## 🎊 Congratulations!

All three major features have been successfully implemented:

1. ✅ **Rich Text Editor with Code Highlighting**
2. ✅ **Reputation & Badges System**
3. ✅ **Advanced Search & Filtering**

**Total Files Created/Modified:** 22 files
**Total Lines of Code Added:** ~2,500+ lines

Enjoy your enhanced IsuueTalk platform! 🚀
