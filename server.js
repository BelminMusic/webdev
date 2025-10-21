/*
--------------------------------------------
TGWK12 Web Development Project - 2025
Student: Belmin Music
Email: mube23je@student.ju.se

Target grade: 3

Administrator login: admin
Administrator password: "wdf#2025"
Hashed password: "$2b$12$HKOr8TOBuDhHlM8KDPX9cOQwaP6byLv1ixXzItpWzKSxGPop72jDq"

--------------------------------------------
*/

// ---------- IMPORT REQUIRED MODULES ----------
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const db = require('./db'); // connects to projects.db

const app = express();
const PORT = 8080;

// ---------- MIDDLEWARE ----------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // serve CSS, JS, images

// ---------- HANDLEBARS SETUP ----------
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// ---------- SESSION SETUP ----------
app.use(
  session({
    store: new SQLiteStore({ db: 'session-db.db', dir: './' }),
    secret: 'mySuperSecretKey123',
    resave: false,
    saveUninitialized: false,
  })
);

// Make session available in templates
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// ---------- ADMIN LOGIN INFO ----------
const adminUsername = 'admin';
const adminHashedPassword =
  '$2b$12$HKOr8TOBuDhHlM8KDPX9cOQwaP6byLv1ixXzItpWzKSxGPop72jDq'; // hash for "wdf#2025"

// ---------- ROUTES ----------

// ---------- HOME ----------
app.get('/', (req, res) => {
  res.render('home', { title: 'Home' });
});

// ---------- ABOUT ----------
app.get('/about', (req, res) => {
  res.render('cvjl', { title: 'About Me' });
});

// ---------- CONTACT FORM ----------
app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact' });
});

// Handle form submission (save to contacts)
app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.render('contact', {
      title: 'Contact',
      error: 'Please fill in all fields',
    });
  }

  db.run(
    'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
    [name, email, message],
    (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send('Database error');
      }
      res.render('contact', {
        title: 'Contact',
        success: '✅ Thank you for your message!',
      });
    }
  );
});

// ---------- ADMIN VIEW: CONTACT MESSAGES ----------
app.get('/contacts/list', (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(403).send('Access denied');
  }

  db.all('SELECT * FROM contacts', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Database error');
    }
    res.render('contacts', { title: 'Contact Messages', contacts: rows });
  });
});

// ---------- PROJECT ROUTES ----------

// Show all projects
app.get('/projects', (req, res) => {
  db.all('SELECT * FROM projects', (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).send('Database error');
    }
    res.render('projects', { title: 'Projects', projects: rows });
  });
});

// ✅ Create new project form (must come before :id route!)
app.get('/projects/new', (req, res) => {
  if (!req.session.isAdmin) return res.redirect('/login');
  res.render('project-new', { title: 'Add New Project' });
});

// Handle new project creation
app.post('/projects/new', (req, res) => {
  if (!req.session.isAdmin) return res.redirect('/login');

  const { name, shortDescription, longDescription, image, technologies, features } = req.body;

  db.run(
    'INSERT INTO projects (name, shortDescription, longDescription, image, technologies, features) VALUES (?, ?, ?, ?, ?, ?)',
    [name, shortDescription, longDescription, image, technologies, features],
    (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send('Database error');
      }
      res.redirect('/projects');
    }
  );
});

// Edit project form
app.get('/projects/edit/:id', (req, res) => {
  if (!req.session.isAdmin) return res.redirect('/login');

  const id = req.params.id;
  db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
    if (err) throw err;
    if (!row) return res.status(404).send('Project not found');
    res.render('project-edit', { title: 'Edit Project', project: row });
  });
});

// Handle edit submission
app.post('/projects/edit/:id', (req, res) => {
  if (!req.session.isAdmin) return res.redirect('/login');

  const id = req.params.id;
  const { name, shortDescription, longDescription, image, technologies, features } = req.body;

  db.run(
    'UPDATE projects SET name=?, shortDescription=?, longDescription=?, image=?, technologies=?, features=? WHERE id=?',
    [name, shortDescription, longDescription, image, technologies, features, id],
    (err) => {
      if (err) throw err;
      res.redirect('/projects');
    }
  );
});

// Delete project
app.get('/projects/delete/:id', (req, res) => {
  if (!req.session.isAdmin) return res.redirect('/login');

  const id = req.params.id;
  db.run('DELETE FROM projects WHERE id = ?', [id], (err) => {
    if (err) throw err;
    res.redirect('/projects');
  });
});

// Show single project (after /projects/new so it doesn’t block)
app.get('/projects/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).send('Database error');
    }
    if (!row) {
      return res.status(404).render('404', { title: 'Project Not Found' });
    }
    res.render('project-details', { title: row.name, project: row });
  });
});

// ---------- LOGIN SYSTEM ----------

// Login page
app.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

// Handle login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (username !== adminUsername) {
    return res.render('login', { title: 'Login', error: 'Invalid username' });
  }

  const match = await bcrypt.compare(password, adminHashedPassword);
  if (!match) {
    return res.render('login', { title: 'Login', error: 'Incorrect password' });
  }

  req.session.un = username;
  req.session.isLoggedIn = true;
  req.session.isAdmin = true;

  res.redirect('/');
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// ---------- 404 PAGE ----------
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// ---------- START SERVER ----------
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
