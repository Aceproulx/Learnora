const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const courses = [
    {
        id: "graphic-designing",
        name: "Graphic Designing",
        price: 100,
        image: "/img/graphic-des.avif",
        rating: 5,
        reviews: 123,
        instructor: "Maria Rodriguez",
        duration: "1.49 Hrs",
        students: 30,
        category: "Graphic Design",
        delay: "0.1s",
        description: "Master the art of visual communication. Learn to create stunning logos, brochures, and digital assets using industry-standard tools. This course covers color theory, typography, and layout design from scratch.",
        syllabus: [
            "Introduction to Design Principles",
            "Color Theory and Typography",
            "Adobe Illustrator Fundamentals",
            "Creating Brand Identities",
            "Advanced Layout Techniques",
            "Portfolio Development"
        ]
    },
    {
        id: "photography-editing",
        name: "Photography + Photo Editing",
        price: 100,
        image: "/img/photography.webp",
        rating: 5,
        reviews: 123,
        instructor: "Maria Hernandez",
        duration: "1.49 Hrs",
        students: 30,
        category: "Photography",
        delay: "0.3s",
        description: "From snapping the perfect shot to professional retouching. Learn the fundamentals of DSLR photography, lighting techniques, and advanced photo editing in Adobe Lightroom and Photoshop.",
        syllabus: [
            "Camera Basics and Settings",
            "Composition and Lighting",
            "Outdoor vs. Studio Photography",
            "Intro to Adobe Lightroom",
            "Advanced Photoshop Retouching",
            "Color Grading for Photography"
        ]
    },
    {
        id: "video-editing",
        name: "Video Shooting + Video Editing",
        price: 100,
        image: "/img/video-editing.avif",
        rating: 5,
        reviews: 123,
        instructor: "Maria Hernandez",
        duration: "1.49 Hrs",
        students: 30,
        category: "Video Editing",
        delay: "0.5s",
        description: "Tell stories with motion. Learn professional video shooting techniques and master Premiere Pro for cinematic editing. Perfect for aspiring YouTubers and filmmakers.",
        syllabus: [
            "Storyboarding and Scripting",
            "Camera Movement and Angles",
            "Sound Recording Fundamentals",
            "Editing in Adobe Premiere Pro",
            "Color Correction and Grading",
            "Exporting for Professional Work"
        ]
    },
    {
        id: "ethical-hacking",
        name: "web security",
        price: 100,
        image: "/img/course-2.jpg",
        rating: 5,
        reviews: 123,
        instructor: "Evan Marcellus",
        duration: "1.49 Hrs",
        students: 30,
        category: "Cybersecurity",
        delay: "0.7s",
        description: "Protect the web by learning to attack it legally. Understand common vulnerabilities like SQL injection and XSS, and learn how to secure applications against modern cyber threats.",
        syllabus: [
            "Intro to Cybersecurity",
            "OWASP Top 10 Vulnerabilities",
            "Network Scanning and Reconnaissance",
            "Exploiting Web Apps (Lab)",
            "Web Application Firewalls (WAF)",
            "Security Auditing and Reporting"
        ]
    },
    {
        id: "mobile-apps",
        name: "Mobile Apps Development",
        price: 100,
        image: "/img/mobile-app.jpeg",
        rating: 5,
        reviews: 123,
        instructor: "Maria Rodriguez",
        duration: "1.49 Hrs",
        students: 30,
        category: "App Development",
        delay: "0.9s",
        description: "Build powerful mobile applications for iOS and Android. Learn cross-platform development with Flutter and React Native to reach a global audience with a single codebase.",
        syllabus: [
            "Mobile UI/UX Foundations",
            "Intro to React Native / Flutter",
            "State Management",
            "APIs and Backend Integration",
            "Deploying to App Stores",
            "App Performance Optimization"
        ]
    },
    {
        id: "cybersecurity",
        name: "Cybersecurity",
        price: 100,
        image: "/img/cybersec.jpeg",
        rating: 5,
        reviews: 123,
        instructor: "Evan Marcellus",
        duration: "1.49 Hrs",
        students: 30,
        category: "Cybersecurity",
        delay: "1.1s",
        description: "The complete roadmap to becoming a security professional. Covers network security, cryptography, and incident response to prepare you for industry certifications.",
        syllabus: [
            "Network Protocols and Security",
            "Cryptography Fundamentals",
            "Identity and Access Management",
            "Security Operations (SecOps)",
            "Incident Response Planning",
            "Compliance and Risk Management"
        ]
    },
    {
        id: "web-design-beginners",
        name: "Web Design & Development Course for Beginners",
        price: 100,
        image: "/img/course-1.jpg",
        rating: 5,
        reviews: 123,
        instructor: "Maria Rodriguez",
        duration: "1.49 Hrs",
        students: 30,
        category: "Web Design",
        delay: "0.1s",
        description: "Start your journey in tech. Learn HTML, CSS, and basic JavaScript to build responsive websites from scratch. No prior experience required.",
        syllabus: [
            "HTML5 Structure and Tags",
            "CSS3 Styling and Flexbox",
            "Responsive Web Design",
            "JavaScript Basics for Web",
            "Building Projects locally",
            "Deploying your first Website"
        ]
    }
];

async function migrate() {
    console.log("Starting enhanced migration...");
    try {
        await set(ref(db, 'courses'), courses);
        console.log("Successfully uploaded enriched courses to Firebase!");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
