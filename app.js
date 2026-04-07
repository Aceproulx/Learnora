require('dotenv').config();
const express = require('express');
const path = require('path');
// Firebase Configuration
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

// Initialize Firebase
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

// Helper function to fetch courses
async function getCourses() {
    try {
        const snapshot = await get(ref(db, 'courses'));
        if (snapshot.exists()) {
            return snapshot.val();
        }
        return [];
    } catch (error) {
        console.error("Error fetching courses:", error);
        return [];
    }
}

const app = express();

const PORT = process.env.PORT || 3000;

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to pass Firebase Config to all views
app.use((req, res, next) => {
    res.locals.firebaseConfig = firebaseConfig;
    next();
});

// Routes
app.get('/', async (req, res) => {
    const courses = await getCourses();
    res.render('index', { 
        title: 'Home', 
        currentPage: 'home',
        courses: courses.slice(0, 3) // Show first 3 for popular section
    });
});

app.get('/about', (req, res) => {
    res.render('about', { title: 'About Us', currentPage: 'about' });
});
app.get('/terms', async (req, res) => {
    const courses = await getCourses();
    res.render('terms-conditions', { 
        title: 'Terms and Conditions', 
        currentPage: 'terms',
        courses: courses.slice(0, 3) 
    });
});

app.get('/courses', async (req, res) => {
    const courses = await getCourses();
    res.render('courses', { title: 'Our Courses', currentPage: 'courses', courses });
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

app.get('/user-courses', (req, res) => {
    res.render('user-courses', { title: 'My Courses', currentPage: 'user-courses' });
});

app.get('/certifications', (req, res) => {
    res.render('certifications', { title: 'Certifications', currentPage: 'certifications' });
});

app.get('/settings', (req, res) => {
    res.render('settings', { title: 'Settings', currentPage: 'settings' });
});

app.get('/payment-history', (req, res) => {
    res.render('payment-history', { title: 'Payment History', currentPage: 'payments' });
});

app.get('/payment', (req, res) => {
    const { course, price } = req.query;
    res.render('payment', { title: 'Payment', course, price });
});

app.get('/all-courses', async (req, res) => {
    const courses = await getCourses();
    res.render('all-courses', { 
        title: 'All Courses', 
        currentPage: 'courses',
        courses: courses
    });
});

app.get('/team', (req, res) => {
    res.render('team', { title: 'Our Team', currentPage: 'team' });
});

// Dynamic Course Details Route
app.get('/course/:id', async (req, res) => {
    const { id } = req.params;
    const courses = await getCourses();
    const course = Array.isArray(courses) ? courses.find(c => c.id === id) : Object.values(courses).find(c => c.id === id);
    
    if (!course) {
        return res.status(404).render('404', { title: 'Course Not Found', currentPage: '404' });
    }
    
    res.render('course-details', { 
        title: course.name, 
        currentPage: 'courses',
        course 
    });
});

// 404 Route
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found', currentPage: '404' });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
