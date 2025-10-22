# IT (Issue Talk) - Issue Sharing Platform

> A web platform by 51talk AI Team for sharing and discussing issues, similar to Stack Overflow

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing

### Frontend
- **React.js**
- **Tailwind CSS** (Yellow & White - 51talk branding)
- **Axios** for API calls
- **React Router** for navigation
- **i18next** for multi-language support (English/Arabic)

## Features

✅ **User Authentication**
- Register & Login with JWT
- Password hashing with bcrypt
- Protected routes

✅ **Post Management**
- Create posts with title, content, images, and attachments
- Public/Private visibility control
- Update and delete posts
- Hide/unhide posts from feed
- File upload support (images & documents, max 5MB)

✅ **Engagement System**
- Comments on posts
- Multiple reaction types (like, upvote, helpful, insightful)
- Real-time reaction counts
- Comment counts

✅ **Timeline/Feed**
- Engagement-based sorting (reactions > comments > date)
- Shows public posts + friends' private posts
- Respects hidden posts

✅ **Friend System**
- Send/accept/reject friend requests
- Remove friends
- View friend lists
- User search functionality

✅ **User Profiles**
- View user information
- See user's posts (respecting privacy rules)
- Total reactions and comments stats

✅ **Multi-language Support**
- English and Arabic
- User language preference
- Easy language switching

## Project Structure

```
IsuueTalk/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                 # Node.js backend
│   ├── config/
│   │   └── db.js          # MongoDB connection
│   ├── controllers/       # Business logic
│   │   ├── authController.js
│   │   ├── postController.js
│   │   ├── commentController.js
│   │   ├── reactionController.js
│   │   └── userController.js
│   ├── models/            # Mongoose schemas
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Comment.js
│   │   └── Reaction.js
│   ├── routes/            # API routes
│   │   ├── auth.js
│   │   ├── posts.js
│   │   ├── comments.js
│   │   ├── reactions.js
│   │   └── users.js
│   ├── middleware/        # Custom middleware
│   │   ├── auth.js        # JWT verification
│   │   └── upload.js      # File upload
│   ├── uploads/           # Uploaded files
│   ├── .env               # Environment variables
│   ├── server.js          # Main server file
│   └── package.json
│
└── README.md

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/language` - Update language preference (Protected)

### Posts
- `POST /api/posts` - Create post (Protected)
- `GET /api/posts/feed` - Get timeline feed (Protected)
- `GET /api/posts/:id` - Get single post (Protected)
- `PUT /api/posts/:id` - Update post (Protected)
- `DELETE /api/posts/:id` - Delete post (Protected)
- `POST /api/posts/:id/hide` - Hide post (Protected)
- `POST /api/posts/:id/unhide` - Unhide post (Protected)
- `GET /api/posts/user/:userId` - Get user's posts (Protected)

### Comments
- `POST /api/comments` - Create comment (Protected)
- `GET /api/comments/:postId` - Get post comments (Protected)
- `DELETE /api/comments/:id` - Delete comment (Protected)

### Reactions
- `POST /api/reactions` - Toggle reaction (Protected)
- `GET /api/reactions/:postId` - Get post reactions (Protected)
- `GET /api/reactions/:postId/check` - Check user's reaction (Protected)

### Users & Friends
- `GET /api/users/search?q=query` - Search users (Protected)
- `GET /api/users/:id` - Get user profile (Protected)
- `POST /api/users/:id/friend-request` - Send friend request (Protected)
- `GET /api/users/friend-requests` - Get friend requests (Protected)
- `POST /api/users/friend-request/:id/accept` - Accept friend request (Protected)
- `POST /api/users/friend-request/:id/reject` - Reject friend request (Protected)
- `DELETE /api/users/:id/friend` - Remove friend (Protected)

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/issuetalk
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

4. Start the server:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Start the development server:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## Database Models

### User
- username, email, password
- fullName, avatar, bio
- friends (array of user IDs)
- friendRequests
- hiddenPosts
- language preference (en/ar)

### Post
- author (User reference)
- title, content
- images, attachments
- visibility (public/private)
- tags
- reactionsCount, commentsCount
- timestamps

### Comment
- post (Post reference)
- author (User reference)
- content
- timestamp

### Reaction
- post (Post reference)
- user (User reference)
- type (like/upvote/helpful/insightful)
- timestamp

## Security Features
- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- File upload validation
- Input validation with express-validator
- CORS enabled for frontend-backend communication

## Next Steps
- Complete React frontend UI
- Implement i18next translations
- Add real-time notifications (Socket.io)
- Deploy to production

## Company
**51talk - AI Team**

## License
Private - Internal Project
