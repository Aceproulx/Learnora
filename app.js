require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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
app.locals.cookieDomain = process.env.COOKIE_DOMAIN || '.learnoraweb.online';

// Middleware to protect dashboard routes (using our subdomain-shared cookie)
const checkAuth = async (req, res, next) => {
    const token = req.cookies.learnora_token;
    
    if (token) {
        try {
            // Verify ID Token via Firebase Auth REST API (no service account needed)
            const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.FIREBASE_API_KEY}`, {
                method: 'POST',
                body: JSON.stringify({ idToken: token }),
                headers: { 'Content-Type': 'application/json' }
            });
            
            const data = await response.json();
            
            if (data.users && data.users.length > 0) {
                const user = data.users[0];
                
                // Fetch profile and stats from Realtime Database
                const [profileSnap, coursesSnap, certsSnap] = await Promise.all([
                    get(ref(db, `users/${user.localId}/profile`)),
                    get(ref(db, `users/${user.localId}/courses`)),
                    get(ref(db, `users/${user.localId}/certifications`))
                ]);
                
                const stats = { inProgress: 0, completed: 0, certs: 0 };
                if (coursesSnap.exists()) {
                    coursesSnap.forEach(child => {
                        if (child.val().progress === 100) stats.completed++;
                        else stats.inProgress++;
                    });
                }
                if (certsSnap.exists()) stats.certs = certsSnap.numChildren();
                
                res.locals.user = {
                    uid: user.localId,
                    email: user.email,
                    displayName: user.displayName,
                    stats,
                    ...(profileSnap.exists() ? profileSnap.val() : {})
                };
                
                return next();
            }
        } catch (error) {
            console.error("Auth verification failed:", error);
        }
    }

    const authState = req.cookies.learnora_auth_state;
    if (authState === 'in') {
        next();
    } else {
        // Store intended destination in a cookie before redirecting
        res.cookie('redirect_after_auth', req.originalUrl, { 
            domain: app.locals.cookieDomain,
            path: '/'
        });
        res.redirect('/auth');
    }
};

const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 3000;

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());

// Middleware to pass Firebase Config + Stripe key to all views
app.use((req, res, next) => {
    res.locals.firebaseConfig = firebaseConfig;
    res.locals.stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
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

app.get('/dashboard', checkAuth, (req, res) => {
    res.render('dashboard', { title: 'Student Dashboard', currentPage: 'dashboard' });
});

app.get('/user-courses', checkAuth, (req, res) => {
    res.render('user-courses', { title: 'My Courses', currentPage: 'user-courses' });
});

app.get('/certifications', checkAuth, (req, res) => {
    res.render('certifications', { title: 'Certifications', currentPage: 'certifications' });
});

app.get('/settings', checkAuth, (req, res) => {
    res.render('settings', { title: 'Settings', currentPage: 'settings' });
});

app.get('/payment-history', checkAuth, (req, res) => {
    res.render('payment-history', { title: 'Payment History', currentPage: 'payments' });
});

app.get('/cart', checkAuth, (req, res) => {
    res.render('cart', { title: 'Shopping Cart', currentPage: 'cart' });
});

app.get('/payment', (req, res) => {
    const { course, price } = req.query;
    res.render('payment', { title: 'Payment', course, price, stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

// Stripe: Create PaymentIntent
app.post('/create-payment-intent', async (req, res) => {
    const { amount } = req.body;
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(parseFloat(amount) * 100), // Convert to cents
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        console.error('Stripe error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/courses', async (req, res) => {
    const courses = await getCourses();
    res.render('courses', {
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
    const course = Array.isArray(courses) 
        ? courses.find(c => String(c.id).trim() === String(id).trim()) 
        : Object.values(courses).find(c => String(c.id).trim() === String(id).trim());

    if (!course) {
        return res.status(404).render('404', { title: 'Course Not Found', currentPage: '404' });
    }

    res.render('course-details', {
        title: course.name,
        currentPage: 'courses',
        course
    });
});

// Learn Course Route
app.get('/learn/:id', (req, res) => {
    const { id } = req.params;
    const courseContentPath = path.join(__dirname, 'data', 'course-content.json');
    
    fs.readFile(courseContentPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading course content:", err);
            return res.status(500).render('404', { title: 'Error', currentPage: '404' });
        }
        
        try {
            const allCourses = JSON.parse(data);
            const course = allCourses.find(c => String(c.id).trim() === String(id).trim());
            
            if (!course) {
                console.log(`Course ID "${id}" not found in course-content.json`);
                return res.status(404).render('404', { title: 'Course Not Found', currentPage: '404' });
            }
            
            res.render('course-view', {
                title: course.name,
                currentPage: 'courses',
                course
            });
        } catch (parseErr) {
            console.error("Error parsing course content:", parseErr);
            return res.status(500).render('404', { title: 'Data Parse Error', currentPage: '404' });
        }
    });
});

// 404 Route
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found', currentPage: '404' });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
