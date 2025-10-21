// Import required modules
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
app.use(express.static(path.join(__dirname, 'public')));

// ---------- HANDLEBARS SETUP ----------
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// ---------- SESSION SETUP ----------
app.use(
  session({
    store: new SQLiteStore({ db: 'session-db.db', dir: './' }),
    secret: 'mySuperSecretKey123', // change this to any random string
    resave: false,
    saveUninitialized: false,
  })
);

// Make session variables visible in all handlebars views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// ---------- ADMIN LOGIN INFO ----------
const adminUsername = 'admin';
const adminHashedPassword =
  '$2b$12$Ke8S0lpH9uQ2UW.kaNaLHeR9QXyRr6dGYKk3DnvVYS681B8alLoGK'; // hash for password "1234"

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

// ---------- PROTECTED PROJECTS PAGE ----------
const projects = [
  {
    name: 'Goal Dash',
    description: 'A football shooting game where you score goals past a moving wall.',
    image: '/img/goal_dash.png',
  },
  {
    name: 'Space Explorer',
    description: 'A space-themed simulation game about navigating the galaxy.',
    image: '/img/space_explorer.png',
  },
];

app.get('/projects', (req, res) => {
  if (!req.session.isLoggedIn) {
    // Redirect to login page if not logged in
    return res.render('login', {
      title: 'Login',
      error: 'Please log in to view the projects.',
    });
  }

  // Logged in → show projects page
  res.render('projects', { title: 'Projects', projects });
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

// ---------- START SERVER ----------
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
