const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const db = new sqlite3.Database(path.join(__dirname, 'data.db'));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    quantity INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS allocations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    asset_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(asset_id) REFERENCES assets(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS requisitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    asset_id INTEGER,
    quantity INTEGER,
    approval_level INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(asset_id) REFERENCES assets(id)
  )`);

  // Seed users
  db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (row && row.count === 0) {
      const hash = bcrypt.hashSync('password', 10);
      const stmt = db.prepare('INSERT INTO users(username, password, role) VALUES (?,?,?)');
      stmt.run('admin', hash, 'admin');
      stmt.run('manager', hash, 'manager');
      stmt.run('employee', hash, 'employee');
      stmt.finalize();
    }
  });

  // Seed assets
  db.get('SELECT COUNT(*) as count FROM assets', (err, row) => {
    if (row && row.count === 0) {
      const stmt = db.prepare('INSERT INTO assets(name, quantity) VALUES (?,?)');
      stmt.run('Laptop', 10);
      stmt.run('Monitor', 5);
      stmt.finalize();
    }
  });
});

module.exports = db;

