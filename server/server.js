const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');

const app = express();

// Middleware
app.use(cors());
// Increase JSON payload limit for large content with images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});



app.use('/uploads', express.static('uploads'));


// Debug endpoint to test API access
app.get('/api/test', (req, res) => {
    console.log('Test endpoint hit');
    res.json({ message: 'API is working' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

// Handle 404s
app.use((req, res) => {
    console.log(`404 Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ message: 'Route not found' });
});

// Connect to MongoDB with error handling
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        // Stop the server if can't connect to database
        process.exit(1);
    });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});







// const authRoutes = require('./routes/authRoutes');
// const blogRoutes = require('./routes/blogRoutes');

// const app = express();

// Middleware
// app.use(cors());
// app.use(express.json());

// Request logging middleware

// Routes
// app.use('/api/auth', authRoutes);

// Connect to MongoDB with error handling
// mongoose.connect(process.env.MONGODB_URI)
//     .then(() => {
//         console.log('Connected to MongoDB');
//     })
//     .catch((err) => {
//         console.error('MongoDB connection error:', err);
//         // Stop the server if can't connect to database
//         process.exit(1);
//     });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// }); 
