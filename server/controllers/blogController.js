const Blog = require('../models/Blog');

// Create a new blog post
exports.createBlog = async (req, res) => {
  try {
    // console.log('----------------------------------------');
    // console.log(`Create Blog API called at ${new Date().toISOString()}`);
    // console.log('Request headers:', req.headers);
    // console.log('Request body:', req.body);
    
    // Validate request body
    if (!req.body) {
      console.error('No request body received');
      return res.status(400).json({ message: 'Missing request body' });
    }
    
    const { title, author, content } = req.body;
    
    // Validate required fields
    if (!title) {
      console.error('Missing title in request');
      return res.status(400).json({ message: 'Title is required' });
    }
    
    if (!author) {
      console.error('Missing author in request');
      return res.status(400).json({ message: 'Author is required' });
    }
    
    if (!content) {
      console.error('Missing content in request');
      return res.status(400).json({ message: 'Content is required' });
    }
    
    console.log(`Creating blog with title: "${title}", author: "${author}", content length: ${content.length}`);
    
    // Create blog object
    const newBlog = new Blog({
      title,
      author,
      content
    });
    
    console.log('Blog object created, saving to database...');
    
    // Save to database
    const savedBlog = await newBlog.save();
    console.log('Blog saved successfully with ID:', savedBlog._id);
    console.log('----------------------------------------');
    
    // Return success response
    res.status(201).json(savedBlog);
  } catch (error) {
    console.error('----------------------------------------');
    console.error('Error creating blog:', error);
    console.error('Error stack:', error.stack);
    console.error('----------------------------------------');
    
    res.status(500).json({ 
      message: 'Error creating blog post', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all blog posts
exports.getAllBlogs = async (req, res) => {
  try {
    console.log('----------------------------------------');
    console.log(`Get All Blogs API called at ${new Date().toISOString()}`);
    
    const blogs = await Blog.find().sort({ createdAt: -1 });
    console.log(`Found ${blogs.length} blogs`);
    console.log('----------------------------------------');
    
    res.status(200).json(blogs);
  } catch (error) {
    console.error('----------------------------------------');
    console.error('Error fetching all blogs:', error);
    console.error('Error stack:', error.stack);
    console.error('----------------------------------------');
    
    res.status(500).json({ 
      message: 'Error fetching blog posts', 
      error: error.message 
    });
  }
};

// Get a single blog post by ID
exports.getBlogById = async (req, res) => {
  try {
    console.log('----------------------------------------');
    console.log(`Get Blog By ID API called for ID: ${req.params.id}`);
    
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      console.log(`Blog not found with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    console.log('Blog found:', blog.title);
    console.log('----------------------------------------');
    
    res.status(200).json(blog);
  } catch (error) {
    console.error('----------------------------------------');
    console.error('Error fetching blog by ID:', error);
    console.error('Error stack:', error.stack);
    console.error('----------------------------------------');
    
    res.status(500).json({ 
      message: 'Error fetching blog post', 
      error: error.message 
    });
  }
};

// Update a blog post
exports.updateBlog = async (req, res) => {
  try {
    console.log('----------------------------------------');
    console.log(`Update Blog API called for ID: ${req.params.id}`);
    
    const { title, author, content } = req.body;
    
    // Validate required fields
    if (!title && !author && !content) {
      console.error('No update data provided');
      return res.status(400).json({ message: 'No update data provided' });
    }
    
    // Create update object with only provided fields
    const updateData = {};
    if (title) updateData.title = title;
    if (author) updateData.author = author;
    if (content) updateData.content = content;
    
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedBlog) {
      console.log(`Blog not found for update with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    console.log('Blog updated successfully:', updatedBlog.title);
    console.log('----------------------------------------');
    
    res.status(200).json(updatedBlog);
  } catch (error) {
    console.error('----------------------------------------');
    console.error('Error updating blog:', error);
    console.error('Error stack:', error.stack);
    console.error('----------------------------------------');
    
    res.status(500).json({ 
      message: 'Error updating blog post', 
      error: error.message 
    });
  }
};

// Delete a blog post
exports.deleteBlog = async (req, res) => {
  try {
    console.log('----------------------------------------');
    console.log(`Delete Blog API called for ID: ${req.params.id}`);
    
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    
    if (!deletedBlog) {
      console.log(`Blog not found for deletion with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    console.log('Blog deleted successfully:', deletedBlog.title);
    console.log('----------------------------------------');
    
    res.status(200).json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('----------------------------------------');
    console.error('Error deleting blog:', error);
    console.error('Error stack:', error.stack);
    console.error('----------------------------------------');
    
    res.status(500).json({ 
      message: 'Error deleting blog post', 
      error: error.message 
    });
  }
}; 