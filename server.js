const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// Open or create SQLite database
const db = new sqlite3.Database("./persons.db");

const app = express();
const PORT = 8080;

// Create table and insert sample data if table is empty
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS persons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    age INTEGER,
    city TEXT
  )`);

  db.get("SELECT COUNT(*) AS count FROM persons", (err, row) => {
    if (err) throw err;
    if (row.count === 0) {
      db.run(`INSERT INTO persons (name, age, city) VALUES 
        ('Alice', 30, 'Paris'),
        ('Bob', 25, 'London'),
        ('Charlie', 35, 'New York')`);
    }
  });
});

// Serve static files (CSS, images, etc.)
app.use(express.static(__dirname));

// Routes
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Serve CV HTML page
app.get("/cv", (req, res) => {
  res.sendFile(path.join(__dirname, "cv-jl.html"));
});

// Return raw data from SQLite
app.get("/rawpersons", (req, res) => {
  db.all("SELECT * FROM persons", (err, rows) => {
    if (err) return res.status(500).send("Database error");
    res.json(rows);
  });
});

// Return HTML list from SQLite data
app.get("/listpersons", (req, res) => {
  db.all("SELECT * FROM persons", (err, rows) => {
    if (err) return res.status(500).send("Database error");

    let html = "<h1>Persons List</h1><ul>";
    rows.forEach(person => {
      html += `<li>${person.name}, Age: ${person.age}, City: ${person.city}</li>`;
    });
    html += "</ul>";

    res.send(html);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
