const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./persons.db");

// Create table and insert sample data (only if table doesn't exist)
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS persons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    age INTEGER,
    city TEXT
  )`);

  // Insert sample data if table is empty
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

module.exports = db;
