const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./projects.db');

db.serialize(() => {
  // ---------- PROJECTS TABLE ----------
  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    shortDescription TEXT,
    longDescription TEXT,
    image TEXT,
    technologies TEXT,
    features TEXT
  )`);

  // Insert sample projects if empty
  db.get('SELECT COUNT(*) AS count FROM projects', (err, row) => {
    if (err) throw err;
    if (row.count === 0) {
      db.run(`INSERT INTO projects 
        (name, shortDescription, longDescription, image, technologies, features)
        VALUES
        (
          'Goal Dash',
          'A fast-paced football game where you try to score goals past a moving wall of defenders.',
          'Goal Dash is a fun and challenging football game where the player scores goals past a moving wall of defenders. Each level increases in difficulty as the wall moves faster and becomes larger, testing your timing and precision. The game was created using HTML, CSS, and JavaScript, and includes collision detection, level progression, and a start screen.',
          'footballgame.jpg',
          'HTML, CSS, JavaScript',
          'Collision detection, level progression, start screen'
        ),
        (
          'Space Explorer',
          'A space-themed simulation game focused on exploring galaxies and collecting resources.',
          'Space Explorer is a simulation game where players navigate through space to discover new galaxies and collect rare resources. It features animated backgrounds, smooth controls, and interactive gameplay built using HTML, CSS, and JavaScript.',
          'spacegame.jpg',
          'HTML, CSS, JavaScript',
          'Animation, user input handling, dynamic backgrounds'
        )`);
      console.log('✅ Sample project data inserted.');
    }
  });

  // ---------- CONTACTS TABLE ----------
  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    message TEXT
  )`);

  // Insert sample contacts if empty
  db.get('SELECT COUNT(*) AS count FROM contacts', (err, row) => {
    if (err) throw err;
    if (row.count === 0) {
      db.run(`INSERT INTO contacts (name, email, message) VALUES
        ('Alice', 'alice@mail.com', 'Great website!'),
        ('Bob', 'bob@mail.com', 'Love your projects.'),
        ('Charlie', 'charlie@mail.com', 'Looking forward to updates.'),
        ('Diana', 'diana@mail.com', 'Keep up the good work!'),
        ('Eve', 'eve@mail.com', 'Can I collaborate with you?')`);
      console.log('✅ Sample contacts inserted.');
    }
  });
});

module.exports = db;
