const { DatabaseSync } = require('node:sqlite');
const crypto = require('node:crypto');
const path = require('node:path');

const dbPath = path.join(__dirname, 'social_platform.db');
const db = new DatabaseSync(dbPath);

db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '/media/avatar1.jpg',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  vote_type INTEGER NOT NULL,
  UNIQUE(user_id, post_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS followers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id)
);
`);

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, key] = stored.split(':');
  if (!salt || !key) return false;
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(hash, 'hex'));
}

const userCountStmt = db.prepare('SELECT COUNT(*) as count FROM users');
const userCountResult = userCountStmt.get();

if (userCountResult.count === 0) {
  const insertUser = db.prepare(`
    INSERT INTO users (username, password_hash, display_name, bio, avatar_url)
    VALUES (?, ?, ?, ?, ?)
  `);

  const alexId = insertUser.run('alex_tech', hashPassword('password123'), 'Alex Rivera', 'Distributed Systems Architect. High throughput backend engineering.', '/media/avatar1.jpg').lastInsertRowid;
  const sarahId = insertUser.run('sarah_dev', hashPassword('password123'), 'Sarah Chen', 'Full Stack Engineer and Open Source enthusiast.', '/media/avatar2.jpg').lastInsertRowid;
  const marcusId = insertUser.run('marcus_ai', hashPassword('password123'), 'Marcus Vance', 'Machine Learning researcher and Systems Optimization specialist.', '/media/avatar3.jpg').lastInsertRowid;
  const elenaId = insertUser.run('elena_code', hashPassword('password123'), 'Elena Rostova', 'Low level systems programmer. C++, Rust, and Linux Kernel enthusiast.', '/media/avatar4.jpg').lastInsertRowid;

  const insertFollow = db.prepare('INSERT INTO followers (follower_id, following_id) VALUES (?, ?)');
  insertFollow.run(alexId, sarahId);
  insertFollow.run(alexId, marcusId);
  insertFollow.run(sarahId, alexId);
  insertFollow.run(sarahId, elenaId);
  insertFollow.run(marcusId, alexId);
  insertFollow.run(elenaId, sarahId);
  insertFollow.run(elenaId, alexId);

  const insertPost = db.prepare(`
    INSERT INTO posts (user_id, title, content, image_url, created_at)
    VALUES (?, ?, ?, ?, datetime('now', ?))
  `);

  const post1 = insertPost.run(
    alexId,
    'Distributed Caching Architecture: Achieving Sub-Millisecond Reads At Scale',
    'We recently re-architected our secondary cache cluster using an in-memory ring buffer with consistent hashing. Latency spikes during peak write spikes dropped by 84%. The key architectural decision was isolating cache invalidation queues from client read paths.',
    '/media/cloud_servers.jpg',
    '-2 hours'
  ).lastInsertRowid;

  const post2 = insertPost.run(
    sarahId,
    'Why We Decided To Consolidate 14 Microservices Back Into A Clean Modular Monolith',
    'Network serialization overhead and distributed transaction debugging cost our small team more engineering hours than feature development. We structured boundaries as distinct internal modules with strict interfaces. Compile times are under 4 seconds and deployment is atomic.',
    '/media/laptop_workspace.jpg',
    '-5 hours'
  ).lastInsertRowid;

  const post3 = insertPost.run(
    elenaId,
    'Understanding Cache Coherency and False Sharing In Multithreaded C++ Applications',
    'When two threads execute on separate cores modifying independent variables placed on the identical 64-byte cache line, performance degrades drastically due to MESI invalidations. Aligning critical atomics to hardware cache line size resolved our bottleneck.',
    '/media/tech_hardware.jpg',
    '-8 hours'
  ).lastInsertRowid;

  const post4 = insertPost.run(
    marcusId,
    'Optimizing Tensor Runtimes For Edge Hardware Without Sacrificing Precision',
    'Post-training quantization to 8-bit integers combined with structured pruning reduced our inference memory footprint by 68%. Benchmarks across heterogeneous mobile accelerators demonstrated steady 60 FPS throughput.',
    '/media/coding_setup.jpg',
    '-14 hours'
  ).lastInsertRowid;

  const post5 = insertPost.run(
    alexId,
    'Deep Dive: Zero-Copy Networking With io_uring In Modern Linux Kernels',
    'Traditional socket operations incur multiple context switches and buffer copies between kernel and user address space. By mapping fixed memory buffers and utilizing submission and completion rings, IOPS scaled linearly across all CPU cores.',
    '/media/developer_desk.jpg',
    '-1 day'
  ).lastInsertRowid;

  const insertVote = db.prepare('INSERT INTO votes (user_id, post_id, vote_type) VALUES (?, ?, ?)');
  insertVote.run(sarahId, post1, 1);
  insertVote.run(marcusId, post1, 1);
  insertVote.run(elenaId, post1, 1);
  insertVote.run(alexId, post2, 1);
  insertVote.run(marcusId, post2, 1);
  insertVote.run(sarahId, post3, 1);
  insertVote.run(alexId, post3, 1);
  insertVote.run(sarahId, post4, 1);
  insertVote.run(elenaId, post5, 1);
  insertVote.run(sarahId, post5, 1);

  const insertComment = db.prepare(`
    INSERT INTO comments (user_id, post_id, parent_id, content, created_at)
    VALUES (?, ?, ?, ?, datetime('now', ?))
  `);

  const c1 = insertComment.run(sarahId, post1, null, 'How are you handling split-brain scenarios when a partition occurs in the consistent hash ring?', '-90 minutes').lastInsertRowid;
  insertComment.run(alexId, post1, c1, 'We employ a bounded vector clock per node group with quorum reads on volatile segments.', '-45 minutes');
  insertComment.run(elenaId, post1, null, 'Excellent writeup. Ring buffer preallocation avoids OS allocator lock contention completely.', '-30 minutes');

  const c2 = insertComment.run(alexId, post2, null, 'The modular monolith pattern is heavily underappreciated. Boundaries enforced by the compiler beat network boundaries every time.', '-4 hours').lastInsertRowid;
  insertComment.run(sarahId, post2, c2, 'Completely agreed. Our end to end test suite runtime went from 28 minutes to 42 seconds.', '-3 hours');

  insertComment.run(marcusId, post3, null, 'Aligning to 64 bytes is crucial. In GCC we use alignas(hardware_destructive_interference_size).', '-6 hours');
}

module.exports = {
  db,
  hashPassword,
  verifyPassword
};

