const express = require('express');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const multer = require('multer');
const { db, hashPassword, verifyPassword } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = allowed.test(file.mimetype);
    const extValid = allowed.test(ext.replace('.', ''));
    if (mime && extValid) {
      return cb(null, true);
    }
    cb(new Error('Only image files are permitted.'));
  }
});

app.use(express.static(path.join(__dirname, 'public')));

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    req.user = null;
    return next();
  }
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    req.user = null;
    return next();
  }
  const token = parts[1];
  const stmt = db.prepare(`
    SELECT users.id, users.username, users.display_name, users.avatar_url, users.bio, users.created_at
    FROM sessions
    JOIN users ON sessions.user_id = users.id
    WHERE sessions.token = ?
  `);
  const user = stmt.get(token);
  req.user = user || null;
  req.token = token;
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

app.use(authenticateToken);

app.post('/api/auth/register', (req, res) => {
  const { username, password, display_name, bio } = req.body;
  if (!username || !password || !display_name) {
    return res.status(400).json({ error: 'Username, password, and display name are required' });
  }
  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (cleanUsername.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters and alphanumeric' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  try {
    const checkStmt = db.prepare('SELECT id FROM users WHERE username = ?');
    if (checkStmt.get(cleanUsername)) {
      return res.status(409).json({ error: 'Username is already taken' });
    }
    const hash = hashPassword(password);
    const insertStmt = db.prepare(`
      INSERT INTO users (username, password_hash, display_name, bio, avatar_url)
      VALUES (?, ?, ?, ?, '/media/avatar1.jpg')
    `);
    const result = insertStmt.run(cleanUsername, hash, display_name.trim(), (bio || '').trim());
    const userId = result.lastInsertRowid;
    const token = crypto.randomBytes(32).toString('hex');
    db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, userId);
    return res.status(201).json({
      token,
      user: {
        id: userId,
        username: cleanUsername,
        display_name: display_name.trim(),
        avatar_url: '/media/avatar1.jpg',
        bio: (bio || '').trim()
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  const cleanUsername = username.trim().toLowerCase();
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  const user = stmt.get(cleanUsername);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, user.id);
  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      bio: user.bio,
      created_at: user.created_at
    }
  });
});

app.get('/api/auth/demo-users', (req, res) => {
  const users = db.prepare('SELECT id, username, display_name, avatar_url, bio FROM users LIMIT 10').all();
  res.json({ users });
});

app.post('/api/auth/demo-login', (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    return res.status(404).json({ error: 'Demo user not found' });
  }
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, user.id);
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      bio: user.bio,
      created_at: user.created_at
    }
  });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const followersCount = db.prepare('SELECT COUNT(*) as count FROM followers WHERE following_id = ?').get(req.user.id).count;
  const followingCount = db.prepare('SELECT COUNT(*) as count FROM followers WHERE follower_id = ?').get(req.user.id).count;
  const postsCount = db.prepare('SELECT COUNT(*) as count FROM posts WHERE user_id = ?').get(req.user.id).count;
  res.json({
    user: {
      ...req.user,
      followers_count: followersCount,
      following_count: followingCount,
      posts_count: postsCount
    }
  });
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
  if (req.token) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(req.token);
  }
  res.json({ success: true });
});

app.get('/api/users/:username', (req, res) => {
  const user = db.prepare(`
    SELECT id, username, display_name, bio, avatar_url, created_at
    FROM users WHERE username = ?
  `).get(req.params.username);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const followersCount = db.prepare('SELECT COUNT(*) as count FROM followers WHERE following_id = ?').get(user.id).count;
  const followingCount = db.prepare('SELECT COUNT(*) as count FROM followers WHERE follower_id = ?').get(user.id).count;
  const postsCount = db.prepare('SELECT COUNT(*) as count FROM posts WHERE user_id = ?').get(user.id).count;
  let isFollowing = false;
  if (req.user && req.user.id !== user.id) {
    const f = db.prepare('SELECT 1 FROM followers WHERE follower_id = ? AND following_id = ?').get(req.user.id, user.id);
    isFollowing = Boolean(f);
  }
  const karma = db.prepare(`
    SELECT COALESCE(SUM(votes.vote_type), 0) as score
    FROM posts
    LEFT JOIN votes ON posts.id = votes.post_id
    WHERE posts.user_id = ?
  `).get(user.id).score;

  res.json({
    user: {
      ...user,
      followers_count: followersCount,
      following_count: followingCount,
      posts_count: postsCount,
      karma: karma,
      is_following: isFollowing
    }
  });
});

app.put('/api/users/profile', requireAuth, (req, res) => {
  const { display_name, bio, avatar_url } = req.body;
  const name = (display_name || req.user.display_name).trim();
  const userBio = bio !== undefined ? bio.trim() : req.user.bio;
  const avatar = avatar_url || req.user.avatar_url;
  db.prepare(`
    UPDATE users
    SET display_name = ?, bio = ?, avatar_url = ?
    WHERE id = ?
  `).run(name, userBio, avatar, req.user.id);

  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      display_name: name,
      bio: userBio,
      avatar_url: avatar
    }
  });
});

app.get('/api/users/:username/followers', (req, res) => {
  const targetUser = db.prepare('SELECT id FROM users WHERE username = ?').get(req.params.username);
  if (!targetUser) {
    return res.status(404).json({ error: 'User not found' });
  }
  const followers = db.prepare(`
    SELECT u.id, u.username, u.display_name, u.avatar_url, u.bio
    FROM followers f
    JOIN users u ON f.follower_id = u.id
    WHERE f.following_id = ?
    ORDER BY f.created_at DESC
  `).all(targetUser.id);

  const formatted = followers.map(u => {
    let isFollowing = false;
    if (req.user && req.user.id !== u.id) {
      const f = db.prepare('SELECT 1 FROM followers WHERE follower_id = ? AND following_id = ?').get(req.user.id, u.id);
      isFollowing = Boolean(f);
    }
    return { ...u, is_following: isFollowing };
  });

  res.json({ followers: formatted });
});

app.get('/api/users/:username/following', (req, res) => {
  const targetUser = db.prepare('SELECT id FROM users WHERE username = ?').get(req.params.username);
  if (!targetUser) {
    return res.status(404).json({ error: 'User not found' });
  }
  const following = db.prepare(`
    SELECT u.id, u.username, u.display_name, u.avatar_url, u.bio
    FROM followers f
    JOIN users u ON f.following_id = u.id
    WHERE f.follower_id = ?
    ORDER BY f.created_at DESC
  `).all(targetUser.id);

  const formatted = following.map(u => {
    let isFollowing = false;
    if (req.user && req.user.id !== u.id) {
      const f = db.prepare('SELECT 1 FROM followers WHERE follower_id = ? AND following_id = ?').get(req.user.id, u.id);
      isFollowing = Boolean(f);
    }
    return { ...u, is_following: isFollowing };
  });

  res.json({ following: formatted });
});

app.post('/api/users/:id/follow', requireAuth, (req, res) => {
  const targetId = parseInt(req.params.id, 10);
  if (isNaN(targetId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  if (targetId === req.user.id) {
    return res.status(400).json({ error: 'Cannot follow yourself' });
  }
  const exists = db.prepare('SELECT id FROM users WHERE id = ?').get(targetId);
  if (!exists) {
    return res.status(404).json({ error: 'User not found' });
  }
  const current = db.prepare('SELECT id FROM followers WHERE follower_id = ? AND following_id = ?').get(req.user.id, targetId);
  let isFollowing = false;
  if (current) {
    db.prepare('DELETE FROM followers WHERE id = ?').run(current.id);
    isFollowing = false;
  } else {
    db.prepare('INSERT INTO followers (follower_id, following_id) VALUES (?, ?)').run(req.user.id, targetId);
    isFollowing = true;
  }
  const followersCount = db.prepare('SELECT COUNT(*) as count FROM followers WHERE following_id = ?').get(targetId).count;
  res.json({ is_following: isFollowing, followers_count: followersCount });
});

app.get('/api/posts', (req, res) => {
  const { sort = 'hot', search = '', author = '' } = req.query;
  let query = `
    SELECT
      p.id,
      p.user_id,
      p.title,
      p.content,
      p.image_url,
      p.created_at,
      u.username,
      u.display_name,
      u.avatar_url,
      COALESCE(SUM(v.vote_type), 0) AS score,
      (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN votes v ON p.id = v.post_id
  `;

  const whereClauses = [];
  const params = [];

  if (author) {
    whereClauses.push('u.username = ?');
    params.push(author);
  }

  if (search) {
    whereClauses.push('(p.title LIKE ? OR p.content LIKE ? OR u.username LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (whereClauses.length > 0) {
    query += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  query += ' GROUP BY p.id';

  if (sort === 'new') {
    query += ' ORDER BY p.created_at DESC';
  } else if (sort === 'top') {
    query += ' ORDER BY score DESC, p.created_at DESC';
  } else {
    query += " ORDER BY (score * 2 + (strftime('%s', p.created_at) / 3600)) DESC, p.created_at DESC";
  }

  const posts = db.prepare(query).all(...params);

  const enriched = posts.map(post => {
    let userVote = 0;
    let isFollowing = false;
    if (req.user) {
      const v = db.prepare('SELECT vote_type FROM votes WHERE user_id = ? AND post_id = ?').get(req.user.id, post.id);
      if (v) userVote = v.vote_type;
      if (req.user.id !== post.user_id) {
        const f = db.prepare('SELECT 1 FROM followers WHERE follower_id = ? AND following_id = ?').get(req.user.id, post.user_id);
        isFollowing = Boolean(f);
      }
    }
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      image_url: post.image_url,
      created_at: post.created_at,
      score: post.score,
      comments_count: post.comments_count,
      user_vote: userVote,
      author: {
        id: post.user_id,
        username: post.username,
        display_name: post.display_name,
        avatar_url: post.avatar_url,
        is_following: isFollowing
      }
    };
  });

  res.json({ posts: enriched });
});

app.get('/api/posts/:id', (req, res) => {
  const postId = parseInt(req.params.id, 10);
  if (isNaN(postId)) {
    return res.status(400).json({ error: 'Invalid post ID' });
  }
  const post = db.prepare(`
    SELECT
      p.id,
      p.user_id,
      p.title,
      p.content,
      p.image_url,
      p.created_at,
      u.username,
      u.display_name,
      u.avatar_url,
      COALESCE(SUM(v.vote_type), 0) AS score,
      (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN votes v ON p.id = v.post_id
    WHERE p.id = ?
    GROUP BY p.id
  `).get(postId);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  let userVote = 0;
  let isFollowing = false;
  if (req.user) {
    const v = db.prepare('SELECT vote_type FROM votes WHERE user_id = ? AND post_id = ?').get(req.user.id, post.id);
    if (v) userVote = v.vote_type;
    if (req.user.id !== post.user_id) {
      const f = db.prepare('SELECT 1 FROM followers WHERE follower_id = ? AND following_id = ?').get(req.user.id, post.user_id);
      isFollowing = Boolean(f);
    }
  }

  res.json({
    post: {
      id: post.id,
      title: post.title,
      content: post.content,
      image_url: post.image_url,
      created_at: post.created_at,
      score: post.score,
      comments_count: post.comments_count,
      user_vote: userVote,
      author: {
        id: post.user_id,
        username: post.username,
        display_name: post.display_name,
        avatar_url: post.avatar_url,
        is_following: isFollowing
      }
    }
  });
});

app.post('/api/posts', requireAuth, (req, res) => {
  const { title, content, image_url } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Post title is required' });
  }
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Post content is required' });
  }
  const cleanTitle = title.trim();
  const cleanContent = content.trim();
  const cleanImage = (image_url || '').trim();

  const result = db.prepare(`
    INSERT INTO posts (user_id, title, content, image_url)
    VALUES (?, ?, ?, ?)
  `).run(req.user.id, cleanTitle, cleanContent, cleanImage);

  const postId = result.lastInsertRowid;
  db.prepare('INSERT INTO votes (user_id, post_id, vote_type) VALUES (?, ?, 1)').run(req.user.id, postId);

  res.status(201).json({
    post: {
      id: postId,
      title: cleanTitle,
      content: cleanContent,
      image_url: cleanImage,
      created_at: new Date().toISOString(),
      score: 1,
      comments_count: 0,
      user_vote: 1,
      author: {
        id: req.user.id,
        username: req.user.username,
        display_name: req.user.display_name,
        avatar_url: req.user.avatar_url,
        is_following: false
      }
    }
  });
});

app.delete('/api/posts/:id', requireAuth, (req, res) => {
  const postId = parseInt(req.params.id, 10);
  if (isNaN(postId)) {
    return res.status(400).json({ error: 'Invalid post ID' });
  }
  const post = db.prepare('SELECT user_id FROM posts WHERE id = ?').get(postId);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  if (post.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized to delete this post' });
  }
  db.prepare('DELETE FROM posts WHERE id = ?').run(postId);
  res.json({ success: true, message: 'Post deleted' });
});

app.post('/api/posts/:id/vote', requireAuth, (req, res) => {
  const postId = parseInt(req.params.id, 10);
  const voteType = parseInt(req.body.vote_type, 10);
  if (isNaN(postId) || ![-1, 0, 1].includes(voteType)) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }
  const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  const existing = db.prepare('SELECT id, vote_type FROM votes WHERE user_id = ? AND post_id = ?').get(req.user.id, postId);
  let nextUserVote = voteType;
  if (existing) {
    if (voteType === 0 || existing.vote_type === voteType) {
      db.prepare('DELETE FROM votes WHERE id = ?').run(existing.id);
      nextUserVote = 0;
    } else {
      db.prepare('UPDATE votes SET vote_type = ? WHERE id = ?').run(voteType, existing.id);
      nextUserVote = voteType;
    }
  } else if (voteType !== 0) {
    db.prepare('INSERT INTO votes (user_id, post_id, vote_type) VALUES (?, ?, ?)').run(req.user.id, postId, voteType);
    nextUserVote = voteType;
  }
  const scoreResult = db.prepare('SELECT COALESCE(SUM(vote_type), 0) as score FROM votes WHERE post_id = ?').get(postId);
  res.json({ score: scoreResult.score, user_vote: nextUserVote });
});

app.get('/api/posts/:id/comments', (req, res) => {
  const postId = parseInt(req.params.id, 10);
  if (isNaN(postId)) {
    return res.status(400).json({ error: 'Invalid post ID' });
  }
  const comments = db.prepare(`
    SELECT
      c.id,
      c.parent_id,
      c.content,
      c.created_at,
      c.user_id,
      u.username,
      u.display_name,
      u.avatar_url
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC
  `).all(postId);

  const enriched = comments.map(c => ({
    id: c.id,
    parent_id: c.parent_id,
    content: c.content,
    created_at: c.created_at,
    author: {
      id: c.user_id,
      username: c.username,
      display_name: c.display_name,
      avatar_url: c.avatar_url
    },
    can_delete: req.user ? req.user.id === c.user_id : false
  }));

  res.json({ comments: enriched });
});

app.post('/api/posts/:id/comments', requireAuth, (req, res) => {
  const postId = parseInt(req.params.id, 10);
  const { content, parent_id } = req.body;
  if (isNaN(postId)) {
    return res.status(400).json({ error: 'Invalid post ID' });
  }
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Comment content cannot be empty' });
  }
  const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  let validParent = null;
  if (parent_id) {
    const parent = db.prepare('SELECT id FROM comments WHERE id = ? AND post_id = ?').get(parent_id, postId);
    if (parent) {
      validParent = parent.id;
    }
  }
  const result = db.prepare(`
    INSERT INTO comments (user_id, post_id, parent_id, content)
    VALUES (?, ?, ?, ?)
  `).run(req.user.id, postId, validParent, content.trim());

  const newComment = {
    id: result.lastInsertRowid,
    parent_id: validParent,
    content: content.trim(),
    created_at: new Date().toISOString(),
    author: {
      id: req.user.id,
      username: req.user.username,
      display_name: req.user.display_name,
      avatar_url: req.user.avatar_url
    },
    can_delete: true
  };

  const count = db.prepare('SELECT COUNT(*) as c FROM comments WHERE post_id = ?').get(postId).c;
  res.status(201).json({ comment: newComment, comments_count: count });
});

app.delete('/api/comments/:id', requireAuth, (req, res) => {
  const commentId = parseInt(req.params.id, 10);
  if (isNaN(commentId)) {
    return res.status(400).json({ error: 'Invalid comment ID' });
  }
  const comment = db.prepare('SELECT user_id, post_id FROM comments WHERE id = ?').get(commentId);
  if (!comment) {
    return res.status(404).json({ error: 'Comment not found' });
  }
  if (comment.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized to delete this comment' });
  }
  db.prepare('DELETE FROM comments WHERE id = ?').run(commentId);
  const count = db.prepare('SELECT COUNT(*) as c FROM comments WHERE post_id = ?').get(comment.post_id).c;
  res.json({ success: true, comments_count: count });
});

app.post('/api/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

app.get('/api/community/stats', (req, res) => {
  const members = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const posts = db.prepare('SELECT COUNT(*) as count FROM posts').get().count;
  res.json({
    name: 'INCREDIBLE_x_TECH',
    tagline: 'The developer community for high performance architecture and engineering',
    members_count: members,
    posts_count: posts,
    online_count: Math.max(members * 3, 14)
  });
});

app.get('/api/free-media', (req, res) => {
  const mediaFiles = [
    { label: 'Cloud Infrastructure Rack', url: '/media/cloud_servers.jpg' },
    { label: 'Distributed Systems Terminal', url: '/media/developer_desk.jpg' },
    { label: 'Engineering Architecture Workspace', url: '/media/laptop_workspace.jpg' },
    { label: 'Hardware Microarchitecture', url: '/media/tech_hardware.jpg' },
    { label: 'High Performance Coding Station', url: '/media/coding_setup.jpg' },
    { label: 'Mobile Edge Systems', url: '/media/mobile_app.jpg' }
  ];
  res.json({ media: mediaFiles });
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  process.stdout.write(`INCREDIBLE_x_TECH running at http://localhost:${PORT}\n`);
});
