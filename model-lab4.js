// app.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const exphbs = require('express-handlebars');

const app = express();
const PORT = 3000;

// JSON data (replace with your own data if needed)
const skills = [
  { id: 1, name: "JavaScript", level: "Advanced" },
  { id: 2, name: "HTML", level: "Intermediate" },
  { id: 3, name: "CSS", level: "Intermediate" }
];

const projects = [
  { id: 1, name: "Portfolio Website", description: "A personal portfolio", skill_id: 1 },
  { id: 2, name: "Todo App", description: "A simple todo app", skill_id: 1 }
];

// Setup Handlebars
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

// Create or open SQLite database
const db = new sqlite3.Database('./projects_skills.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      level TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      skill_id INTEGER,
      FOREIGN KEY(skill_id) REFERENCES skills(id)
  )`);

  // Insert skills (ignore duplicates)
  skills.forEach(skill => {
    db.run(`INSERT OR IGNORE INTO skills (id, name, level) VALUES (?, ?, ?)`,
      [skill.id, skill.name, skill.level],
      (err) => { if (err) console.error(err.message); });
  });

  // Insert projects (ignore duplicates)
  projects.forEach(project => {
    db.run(`INSERT OR IGNORE INTO projects (id, name, description, skill_id) VALUES (?, ?, ?, ?)`,
      [project.id, project.name, project.description, project.skill_id],
      (err) => { if (err) console.error(err.message); });
  });
});

// Routes
app.get('/', (req, res) => {
  db.all("SELECT * FROM skills", [], (err, skillsRows) => {
    if (err) throw err;
    db.all("SELECT * FROM projects", [], (err, projectsRows) => {
      if (err) throw err;
      res.render('home', { skills: skillsRows, projects: projectsRows });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
