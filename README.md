# INCREDIBLE_x_TECH

A full-stack social media platform engineered with Reddit UI structure and layout for high-performance computing, distributed systems, and technical discussions.

## Project Architecture

The codebase is organized into two major dedicated folders:

```
CodeAlpha_SocialMediaPlatform/
├── backend/
│   ├── database.js          # SQLite relational schema, seed data, and query engine
│   ├── server.js            # Express REST API, CORS middleware, file uploads
│   ├── package.json         # Backend package configuration
│   ├── social_platform.db   # Persistent SQLite database
│   ├── media/               # Copyright-free CC0 technology images and avatars
│   └── uploads/             # User-uploaded post attachments
│
├── frontend/
│   ├── index.html           # Reddit UI layout (navigation, feed, sidebar, modals)
│   ├── style.css            # Authentic Reddit styling rules, zero drop-shadows
│   ├── app.js               # Client controller, API client, and state management
│   └── media/               # Local copyright-free image assets
│
├── package.json             # Root runner script configuration
└── README.md                # Platform documentation
```

## Features Implemented

- User Profiles: View profile details, avatars, bios, post history, followers, and following lists, with full profile editing.
- Posts and Comments: Rich technical posts with text, copyright-free media attachments, and interactive comment threads.
- Like and Follow System: Reddit-style upvote/downvote mechanics with live scores, and user follow/unfollow capability with dynamic follower tallies.
- Reddit UI and Structure: Standard Reddit layout including sticky navigation, Hot/New/Top sorting, subreddit rules sidebar, community statistics, and legal agreements.
- Copyright-Free Media: Bundled with pre-downloaded CC0 public domain technology photographs, plus support for custom image uploads.

## Getting Started

### 1. Prerequisites
- Node.js v18 or higher (Node.js v24 recommended)
- npm package manager

### 2. Installation
Install dependencies in the backend:
```bash
cd backend
npm install
cd ..
```

### 3. Start the Server
From the project root:
```bash
npm start
```
Or directly from the backend directory:
```bash
cd backend
npm start
```

The server will start listening at:
`http://localhost:3000`

Open your web browser and navigate to `http://localhost:3000`.

## Pre-Seeded Demo Accounts

For immediate evaluation, the platform comes pre-seeded with 4 technical profiles. You can switch between them instantly using the demo switcher in the navigation bar, or log in with password `password123`:

- Username: `alex_tech` (Alex Rivera: Distributed Systems Architect)
- Username: `sarah_dev` (Sarah Chen: Full Stack Engineer)
- Username: `marcus_ai` (Marcus Vance: Machine Learning Specialist)
- Username: `elena_code` (Elena Rostova: Systems Programmer)

## Database Schema

- `users`: id, username, password_hash, display_name, bio, avatar_url, created_at
- `sessions`: token, user_id, created_at
- `posts`: id, user_id, title, content, image_url, created_at
- `votes`: id, user_id, post_id, vote_type (-1 or 1), UNIQUE(user_id, post_id)
- `comments`: id, user_id, post_id, parent_id, content, created_at
- `followers`: id, follower_id, following_id, created_at, UNIQUE(follower_id, following_id)

## REST API Summary

### Authentication
- `POST /api/auth/register`: Create user account
- `POST /api/auth/login`: Authenticate existing user
- `POST /api/auth/demo-login`: 1-click authentication as test user
- `GET /api/auth/demo-users`: Retrieve list of test users
- `GET /api/auth/me`: Retrieve currently authenticated user profile
- `POST /api/auth/logout`: Invalidate user session token

### Posts and Voting
- `GET /api/posts`: Retrieve feed with sort (hot, new, top), search, or author filters
- `GET /api/posts/:id`: Retrieve single post details
- `POST /api/posts`: Create a technical post with optional image
- `DELETE /api/posts/:id`: Delete authored post
- `POST /api/posts/:id/vote`: Submit upvote (+1), downvote (-1), or clear (0)

### Comments
- `GET /api/posts/:id/comments`: Retrieve post comments thread
- `POST /api/posts/:id/comments`: Add comment to a post
- `DELETE /api/comments/:id`: Delete authored comment

### User Profiles and Follow System
- `GET /api/users/:username`: Retrieve user profile details and statistics
- `PUT /api/users/profile`: Update display name, bio, and avatar
- `GET /api/users/:username/followers`: List followers of a user
- `GET /api/users/:username/following`: List users followed by a user
- `POST /api/users/:id/follow`: Toggle follow or unfollow status

### Media and Platform
- `POST /api/upload`: Upload image file
- `GET /api/free-media`: Retrieve copyright-free media gallery
- `GET /api/community/stats`: Retrieve member count and active user metrics
