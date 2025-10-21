// ---------- IMPORT REQUIRED MODULES ----------
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

const app = express();
const PORT = 8080;

// ---------- MIDDLEWARE ----------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // serve /public for css/img/js

// ---------- HANDLEBARS SETUP ----------
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// ---------- SESSION SETUP ----------
app.use(
  session({
    store: new SQLiteStore({ db: 'session-db.db', dir: './' }),
    secret: 'mySuperSecretKey123', // change to a random string
    resave: false,
    saveUninitialized: false,
  })
);

// Make session variables visible in all handlebars templates
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// ---------- ADMIN LOGIN INFO ----------
const adminUsername = 'admin';
const adminHashedPassword =
  '$2b$12$Ke8S0lpH9uQ2UW.kaNaLHeR9QXyRr6dGYKk3DnvVYS681B8alLoGK'; // hash for "1234"

// ---------- PROJECT DATA ----------
let projects = [
  {
    id: 1,
    name: 'Goal Dash',
    shortDescription:
      'A fast-paced football game where you try to score goals past a moving wall of defenders.',
    longDescription: `Goal Dash is a fun and challenging football game where the player scores goals past a moving wall of defenders.
Each level increases in difficulty as the wall moves faster and becomes larger, testing your timing and precision.
The game was created using HTML, CSS, and JavaScript, and includes collision detection, level progression, and a start screen.`,
    image: 'footballgame.jpg',
    technologies: 'HTML, CSS, JavaScript',
    features: 'Collision detection, level progression, start screen',
  },
  {
    id: 2,
    name: 'Space Explorer',
    shortDescription:
      'A space-themed simulation game focused on exploring galaxies and collecting resources.',
    longDescription: `Space Explorer is a simulation game where players navigate through space to discover new galaxies and collect rare resources.
It features animated backgrounds, smooth controls, and interactive gameplay built using HTML, CSS, and JavaScript.`,
    image: 'spacegame.jpg',
    technologies: 'HTML, CSS, JavaScript',
    features: 'Animation, user input handling, dynamic backgrounds',
  },
];

// ---------- ROUTES ----------

// Home
app.get('/', (req, res) => {
  res.render('home', { title: 'Home' });
});

// About (CV)
app.get('/about', (req, res) => {
  res.render('cvjl', { title: 'About Me' });
});

// Contact
app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact' });
});

// ---------- PROJECT ROUTES ----------

// Show all projects
app.get('/projects', (req, res) => {
  res.render('projects', { title: 'Projects', projects });
});

// Show single project details
app.get('/projects/:id', (req, res) => {
  const projectId = parseInt(req.params.id);
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return res.status(404).render('404', { title: 'Project Not Found' });
  }

  res.render('project-details', {
    title: project.name,
    project,
  });
});

// ---------- LOGIN SYSTEM ----------

// Login page
app.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

// Login form submission
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (username !== adminUsername) {
    return res.render('login', { title: 'Login', error: 'Invalid username' });
  }

  const match = await bcrypt.compare(password, adminHashedPassword);
  if (!match) {
    return res.render('login', { title: 'Login', error: 'Incorrect password' });
  }

  // Successful login
  req.session.un = username;
  req.session.isLoggedIn = true;
  req.session.isAdmin = true;

  res.redirect('/');
});

// Logout route
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
