const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE,
    username TEXT UNIQUE,
    nickname TEXT,
    password TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`ALTER TABLE users ADD COLUMN username TEXT UNIQUE`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.log('Error adding username column:', err.message);
    }
  });

  db.run(`CREATE TABLE IF NOT EXISTS question_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version_name TEXT UNIQUE,
    description TEXT,
    is_active INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dimension TEXT,
    text TEXT,
    reverse INTEGER DEFAULT 0,
    major_category TEXT,
    direction TEXT,
    version_id INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active',
    difficulty INTEGER DEFAULT 3,
    usage_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (version_id) REFERENCES question_versions(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS test_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    major_name TEXT,
    grade TEXT,
    directions TEXT,
    scores TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS test_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id INTEGER,
    question_id INTEGER,
    answer_value INTEGER,
    FOREIGN KEY (record_id) REFERENCES test_records(id),
    FOREIGN KEY (question_id) REFERENCES questions(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS ability_benchmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    major_name TEXT,
    direction TEXT,
    grade TEXT,
    ability_name TEXT,
    min_level INTEGER,
    avg_level INTEGER,
    priority TEXT,
    description TEXT,
    learning_resources TEXT,
    UNIQUE(major_name, direction, grade, ability_name)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS ability_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id INTEGER,
    ability_name TEXT,
    current_level INTEGER,
    target_level INTEGER,
    gap_score INTEGER,
    suggested_actions TEXT,
    FOREIGN KEY (record_id) REFERENCES test_records(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    scores TEXT,
    major TEXT,
    directions TEXT,
    grade TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS majors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    category TEXT,
    description TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    major_id INTEGER,
    direction TEXT,
    title TEXT,
    detail TEXT,
    requirement TEXT,
    salary TEXT,
    promotion TEXT,
    FOREIGN KEY (major_id) REFERENCES majors(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS major_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    major_name TEXT,
    category TEXT,
    UNIQUE(major_name)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS direction_weights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    direction TEXT UNIQUE,
    R REAL DEFAULT 1.0,
    I REAL DEFAULT 1.0,
    A REAL DEFAULT 1.0,
    S REAL DEFAULT 1.0,
    E REAL DEFAULT 1.0,
    C REAL DEFAULT 1.0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS learning_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    direction TEXT,
    grade TEXT,
    current_status TEXT,
    abilities TEXT,
    phases TEXT,
    major TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS major_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    major_name TEXT UNIQUE,
    category TEXT,
    core_courses TEXT,
    core_skills TEXT,
    certificates TEXT,
    tech_stack TEXT,
    description TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS major_skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    major_name TEXT,
    direction TEXT,
    skills TEXT,
    UNIQUE(major_name, direction)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS user_feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    content TEXT,
    rating INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS captchas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    code TEXT,
    timestamp INTEGER,
    attempts INTEGER DEFAULT 0
  )`);
});

module.exports = db;