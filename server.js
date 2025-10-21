const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');

const app = express();
const PORT = 8080;

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Handlebars setup
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Home route
app.get('/', (req, res) => {
  res.render('home', { title: 'Home' });
});

// About route
app.get('/about', (req, res) => {
  res.render('cvjl', { title: 'About Me' });
});

// Contact route
app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact' });
});

// Projects route
const projects = [
  {
    name: 'Goal Dash',
    description: 'A football shooting game where you score goals past a moving wall.',
    image: '/img/goal_dash.png'
  },
  {
    name: 'Space Explorer',
    description: 'A web-based space travel simulation game.',
    image: '/img/space_explorer.png'
  }
];

app.get('/projects', (req, res) => {
  res.render('projects', { title: 'Projects', projects });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
