require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to pass Firebase Config to all views
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

app.use((req, res, next) => {
    res.locals.firebaseConfig = firebaseConfig;
    next();
});

// Routes
app.get('/', (req, res) => {
    res.render('index', { title: 'Home', currentPage: 'home' });
});

app.get('/about', (req, res) => {
    res.render('about', { title: 'About Us', currentPage: 'about' });
});

app.get('/courses', (req, res) => {
    res.render('courses', { title: 'Our Courses', currentPage: 'courses' });
});

app.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact Us', currentPage: 'contact' });
});

app.get('/auth', (req, res) => {
    res.render('auth', { title: 'Login / Sign Up', currentPage: 'auth' });
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard', { title: 'Student Dashboard', currentPage: 'dashboard' });
});

app.get('/all-courses', (req, res) => {
    res.render('all-courses', { title: 'All Courses', currentPage: 'courses' });
});

app.get('/team', (req, res) => {
    res.render('team', { title: 'Our Team', currentPage: 'team' });
});

// 404 Route
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found', currentPage: '404' });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
