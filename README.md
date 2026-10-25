# INCREDIBLE_x_TECH

A full-stack social media platform engineered with Reddit UI structure and layout for high-performance computing, distributed systems, and technical discussions.

## Overview

INCREDIBLE_x_TECH is built as a complete mini social media application fulfilling all core platform requirements:
- User Profiles: View profile cards, avatars, bios, post history, followers, and following lists, with full profile editing.
- Posts and Comments: Rich technical posts with text, copyright-free media attachments, and interactive comment threads.
- Like and Follow System: Reddit-style upvote/downvote mechanics with live scores, and user follow/unfollow capability with dynamic follower tallies.
- Reddit UI and Structure: Standard Reddit layout including sticky navigation, Hot/New/Top sorting, subreddit rules sidebar, community statistics, and legal agreements.
- Copyright-Free Media: Bundled with pre-downloaded CC0 public domain technology photographs, plus support for custom image uploads.

## Technology Stack

- Frontend: Semantic HTML5, CSS3 (classic Reddit theme, flat borders, 4px border-radius, zero box-shadows, system typography), Vanilla JavaScript.
- Backend: Node.js with Express.js REST API.
- Database: Embedded SQLite (Node.js built-in DatabaseSync engine) with relational schema: users, sessions, posts, votes, comments, and followers.
- Media Handling: Multer storage engine with local storage in public/uploads and public/media.

## Project Structure

```
CodeAlpha_SocialMediaPlatform/
├── database.js          # SQLite schema, foreign keys, and seed data initialization
├── server.js            # Express API endpoints, static assets, and authentication
├── package.json         # Project metadata and dependencies
├── public/
│   ├── index.html       # Reddit layout markup (navbar, feed, sidebar, modals)
│   ├── style.css        # Authentic Reddit styling rules and responsive layout
│   ├── app.js           # Client-side application controller and API client
│   ├── media/           # Curated copyright-free CC0 technology images and avatars
│   └── uploads/         # User-uploaded image storage directory
└── README.md            # Platform documentation
```

## Getting Started

### 1. Prerequisites
- Node.js v18 or higher (Node.js v24 recommended)
- npm package manager

### 2. Installation
Install the project dependencies:
```bash
npm install
```

### 3. Start the Server
Run the platform server:
```bash
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
