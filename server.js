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
    secret: 'mySuperSecretKey123', // change to a random string
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
  '$2b$12$Ke8S0lpH9uQ2UW.kaNaLHeR9QXyRr6dGYKk3DnvVYS681B8alLoGK'; // password "1234"

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

// ---------- PROJECTS (CRUD) ----------
let projects = [
  {
    id: 1,
    name: 'Goal Dash',
    description: 'A football shooting game where you score goals past a moving wall.',
    image: '/img/goal_dash.png',
  },
  {
    id: 2,
    name: 'Space Explorer',
    description: 'A space-themed simulation game about navigating the galaxy.',
    image: '/img/space_explorer.png',
  },
];

// ----- READ: Show all projects (protected) -----
app.get('/projects', (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.render('login', {
      title: 'Login',
      error: 'Please log in to view the projects.',
    });
  }
  res.render('projects', { title: 'Projects', projects });
});

// ----- CREATE: Show form -----
app.get('/projects/new', (req, res) => {
  if (!req.session.isAdmin) return res.redirect('/login');
  res.render('project-form', { title: 'New Project' });
});

// ----- CREATE: Handle form submission -----
app.post('/projects/new', (req, res) => {
  if (!req.session.isAdmin) return res.redirect('/login');

  const { name, description, image } = req.body;
  const newProject = {
    id: projects.length + 1,
    name,
    description,
    image,
  };

  projects.push(newProject);
  res.redirect('/projects');
});

// ----- UPDATE: Show edit form -----
app.get('/projects/edit/:id', (req, res) => {
  if (!req.session.isAdmin) return res.redirect('/login');

  const id = parseInt(req.params.id);
  const project = projects.find(p => p.id === id);
  if (!project) return res.redirect('/projects');

  res.render('project-form', { title: 'Edit Project', project });
});

// ----- UPDATE: Handle form submission -----
app.post('/projects/edit/:id', (req, res) => {
  if (!req.session.isAdmin) return res.redirect('/login');

  const id = parseInt(req.params.id);
  const project = projects.find(p => p.id === id);
  if (project) {
    project.name = req.body.name;
    project.description = req.body.description;
    project.image = req.body.image;
  }

  res.redirect('/projects');
});

// ----- DELETE: Remove project -----
app.get('/projects/delete/:id', (req, res) => {
  if (!req.session.isAdmin) return res.redirect('/login');

  const id = parseInt(req.params.id);
  projects = projects.filter(p => p.id !== id);

  res.redirect('/projects');
});

// ---------- LOGIN SYSTEM ----------

// Login page
app.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

// Handle login form
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

// ---------- ERROR HANDLING ----------

// 404 Not Found
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// 500 Internal Server Error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { title: 'Server Error' });
});

// ---------- START SERVER ----------
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
