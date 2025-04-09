const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Get all public blogs (for Explore section)
router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find({ status: 'published' })
            .populate('author', 'name') // Populate author information
            .sort({ createdAt: -1 });
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// multer
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/thumbnails/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Get user's published blogs
router.get('/user/published', auth, async (req, res) => {
    try {
        const blogs = await Blog.find({ 
            author: req.user._id, // Use _id from the authenticated user
            status: 'published'
        })
        .populate('author', 'name') // Populate author information
        .sort({ createdAt: -1 });
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user's draft blogs
router.get('/user/drafts', auth, async (req, res) => {
    try {
        const blogs = await Blog.find({ 
            author: req.user._id, // Use _id from the authenticated user
            status: 'draft'
        })
        .populate('author', 'name') // Populate author information
        .sort({ createdAt: -1 });
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new blog (can be draft or published)
// router.post('/', auth, async (req, res) => {
//     const blog = new Blog({
//         title: req.body.title,
//         content: req.body.content,
//         author: req.user._id, // Use _id from the authenticated user
//         status: req.body.status || 'draft'
//     });

//     try {
//         const newBlog = await blog.save();
//         res.status(201).json(newBlog);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// });
router.post('/', auth, upload.single('thumbnail'), async (req, res) => {
    const blog = new Blog({
        title: req.body.title,
        content: req.body.content,
        author: req.user._id,
        status: req.body.status || 'draft',
        thumbnail: req.file ? `/uploads/thumbnails/${req.file.filename}` : ''
    });

    try {
        const newBlog = await blog.save();
        res.status(201).json(newBlog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


//add comments
router.post('/:id/comments', auth, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const comment = {
            user: req.user._id,
            text: req.body.text,
            createdAt: new Date()
        };

        blog.comments.push(comment);
        await blog.save();

        res.status(201).json({ message: 'Comment added', comment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id/comments', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('comments.user', 'name');
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        res.json(blog.comments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});




// Update a blog
router.patch('/:id', auth, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Check if the user owns this blog
        if (blog.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this blog' });
        }

        // Update fields
        if (req.body.title) blog.title = req.body.title;
        if (req.body.content) blog.content = req.body.content;
        if (req.body.status) blog.status = req.body.status;

        const updatedBlog = await blog.save();
        res.json(updatedBlog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a blog
router.delete('/:id', auth, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Check if the user owns this blog
        if (blog.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this blog' });
        }

        await Blog.deleteOne({ _id: blog._id });
        res.json({ message: 'Blog deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific blog by ID
router.get('/:id', auth, async (req, res) => {
    try {
        console.log(`Fetching blog with ID: ${req.params.id}`);
        console.log(`User ID making the request: ${req.user._id}`);
        
        // Check if ID is valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            console.log(`Invalid MongoDB ObjectId: ${req.params.id}`);
            return res.status(400).json({ message: 'Invalid blog ID format' });
        }
        
        // Log raw query to help debug
        console.log(`Running query: Blog.findById('${req.params.id}')`);
        
        // Try direct database query with debug logging
        try {
            // Get all blogs by this user to check if any exist
            const userBlogs = await Blog.find({ author: req.user._id });
            console.log(`Found ${userBlogs.length} blogs for user ${req.user._id}`);
            
            // Check if the requested blog is in the user's blogs
            const matchingBlog = userBlogs.find(blog => blog._id.toString() === req.params.id);
            if (matchingBlog) {
                console.log(`Found matching blog in user's blogs: ${matchingBlog.title}`);
            } else {
                console.log(`Blog with ID ${req.params.id} not found in user's ${userBlogs.length} blogs`);
                if (userBlogs.length > 0) {
                    console.log("User's blog IDs:", userBlogs.map(b => b._id.toString()));
                }
            }
        } catch (dbErr) {
            console.error("Error in debug query:", dbErr);
        }
        
        // Continue with normal query
        const blog = await Blog.findById(req.params.id)
            .populate('author', 'name');
        
        if (!blog) {
            console.log(`Blog not found: ${req.params.id}`);
            
            // Additional error info
            const blogCount = await Blog.countDocuments();
            console.log(`Total blogs in database: ${blogCount}`);
            
            return res.status(404).json({ message: 'Blog not found' });
        }
        
        console.log(`Blog found: ${blog.title} by author ID ${typeof blog.author === 'object' ? blog.author._id : blog.author}`);
        
        // Check author
        const blogAuthorId = typeof blog.author === 'object' ? blog.author._id.toString() : blog.author.toString();
        const requestUserId = req.user._id.toString();
        
        console.log(`Blog author ID: ${blogAuthorId}`);
        console.log(`Request user ID: ${requestUserId}`);
        console.log(`Author match: ${blogAuthorId === requestUserId}`);
        
        // If blog is not published, only allow the author to view it
        if (blog.status !== 'published' && blogAuthorId !== requestUserId) {
            console.log('Permission denied: User is not the author of this draft blog');
            return res.status(403).json({ 
                message: 'You do not have permission to view this blog' 
            });
        }
        
        res.json(blog);
    } catch (error) {
        console.error(`Error fetching blog: ${error.message}`);
        console.error(error.stack);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 