// Register the image resize module
Quill.register('modules/imageResize', ImageResize);

// Global variables
let quill = null;
let originalBlog = null;
let blogId = null;

// Immediately Invoked Function Expression (IIFE) for initialization
(function() {
    // Get blogId from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    blogId = urlParams.get('id');

    if (!blogId) {
        alert('No blog ID provided');
        window.location.href = 'blogs.html';
        return; // This return is now inside a function
    }
})();

// Get DOM elements
const titleInput = document.getElementById('blogTitle');
const thumbnailInput = document.getElementById('thumbnail');
const thumbnailPreview = document.getElementById('thumbnailPreview');
const saveAsDraftBtn = document.getElementById('saveAsDraft');
const publishBtn = document.getElementById('publishBlog');

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in to edit a blog');
        window.location.href = 'loginsignup.html';
        return;
    }

    // Check if blogId exists
    if (!blogId) {
        alert('No blog ID provided');
        window.location.href = 'blogs.html';
        return;
    }

    // Initialize Quill editor
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
                ['link', 'image'],
                ['clean']
            ]
        },
        placeholder: 'Write your blog post here...'
    });

    // Add custom image resizing functionality
    quill.getModule('toolbar').addHandler('image', function() {
        selectLocalImage();
    });

    // Add tooltip about image resizing when an image is inserted
    quill.on('editor-change', function(eventName, ...args) {
        if (eventName === 'selection-change') {
            const range = args[0];
            if (range) {
                const [leaf] = quill.getLeaf(range.index);
                if (leaf && leaf.domNode && leaf.domNode.tagName === 'IMG') {
                    // This is an image, show tooltip if not shown yet
                    if (!document.querySelector('.image-resize-tooltip')) {
                        const tooltip = document.createElement('div');
                        tooltip.className = 'image-resize-tooltip';
                        tooltip.style.position = 'fixed';
                        tooltip.style.bottom = '20px';
                        tooltip.style.right = '20px';
                        tooltip.style.background = 'rgba(0, 0, 0, 0.7)';
                        tooltip.style.color = 'white';
                        tooltip.style.padding = '10px 15px';
                        tooltip.style.borderRadius = '4px';
                        tooltip.style.zIndex = '1000';
                        tooltip.style.maxWidth = '300px';
                        tooltip.style.fontSize = '14px';
                        tooltip.style.transition = 'opacity 0.3s ease';
                        tooltip.style.opacity = '0.9';
                        tooltip.innerHTML = 'Tip: You can resize this image by dragging the handles at the corners.';
                        
                        document.body.appendChild(tooltip);
                        
                        // Remove tooltip after 5 seconds
                        setTimeout(() => {
                            if (tooltip.parentNode) {
                                tooltip.style.opacity = '0';
                                setTimeout(() => {
                                    if (tooltip.parentNode) {
                                        tooltip.parentNode.removeChild(tooltip);
                                    }
                                }, 300);
                            }
                        }, 5000);
                    }
                }
            }
        }
    });

    // Fetch the blog data
    try {
        await fetchBlogData();
    } catch (error) {
        console.error('Error loading blog data:', error);
        alert('Failed to load blog data. Please try again later.');
        window.location.href = 'blogs.html';
    }

    // Set up event listeners
    saveAsDraftBtn.addEventListener('click', () => updateBlog('draft'));
    publishBtn.addEventListener('click', () => updateBlog('published'));
});

// Custom image selection and insertion
function selectLocalImage() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = () => {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.src = reader.result;
                img.onload = function() {
                    // Set a max width for initial insertion
                    const maxWidth = 600;
                    let width = img.width;
                    let height = img.height;
                    
                    // Resize large images to fit editor better
                    if (width > maxWidth) {
                        const ratio = maxWidth / width;
                        width = maxWidth;
                        height = height * ratio;
                    }
                    
                    // Insert image with custom attributes
                    const range = quill.getSelection(true);
                    quill.insertEmbed(range.index, 'image', reader.result);
                    quill.setSelection(range.index + 1);
                    
                    // Make image resizable after insertion
                    setTimeout(() => {
                        const imgElement = quill.root.querySelector(`img[src="${reader.result}"]`);
                        if (imgElement) {
                            makeImageResizable(imgElement);
                        }
                    }, 10);
                };
            };
            reader.readAsDataURL(file);
        }
    };
}

// Make existing images resizable after loading content
function makeAllImagesResizable() {
    const images = quill.root.querySelectorAll('img');
    images.forEach(img => {
        makeImageResizable(img);
    });
}

// Function to make an image resizable
function makeImageResizable(img) {
    // Don't apply twice
    if (img.getAttribute('data-resizable') === 'true') return;
    img.setAttribute('data-resizable', 'true');
    
    // Create container for the image
    const container = document.createElement('div');
    container.className = 'image-resize-container';
    img.parentNode.insertBefore(container, img);
    container.appendChild(img);
    
    // Create overlay and resize handle
    const overlay = document.createElement('div');
    overlay.className = 'image-resize-overlay';
    container.appendChild(overlay);
    
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'image-resize-handle se';
    container.appendChild(resizeHandle);
    
    // Add size indicator
    const sizeIndicator = document.createElement('div');
    sizeIndicator.className = 'image-resize-indicator';
    sizeIndicator.textContent = `${img.width}×${img.height}`;
    container.appendChild(sizeIndicator);
    
    // Handle resize functionality
    let startX, startY, startWidth, startHeight, isResizing = false;
    
    // Handle mouse events
    resizeHandle.addEventListener('mousedown', startResize);
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
    
    // Handle touch events for mobile
    resizeHandle.addEventListener('touchstart', startResizeTouch);
    document.addEventListener('touchmove', resizeTouch);
    document.addEventListener('touchend', stopResize);
    
    // Show overlay and handle when image is selected
    img.addEventListener('click', function(e) {
        e.stopPropagation();
        hideAllImageControls();
        overlay.style.display = 'block';
        sizeIndicator.style.display = 'block';
        
        // Add toolbar for additional options
        addImageToolbar(container, img);
    });
    
    // Touch support for showing controls
    img.addEventListener('touchstart', function(e) {
        e.stopPropagation();
        hideAllImageControls();
        overlay.style.display = 'block';
        sizeIndicator.style.display = 'block';
        
        // Add toolbar for additional options
        addImageToolbar(container, img);
    });
    
    // Hide controls when clicking elsewhere
    document.addEventListener('click', function(e) {
        if (!container.contains(e.target)) {
            overlay.style.display = 'none';
            sizeIndicator.style.display = 'none';
            const toolbar = container.querySelector('.image-toolbar');
            if (toolbar) {
                toolbar.remove();
            }
        }
    });
    
    function startResize(e) {
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = img.width;
        startHeight = img.height;
        document.documentElement.style.cursor = 'se-resize';
        overlay.style.display = 'block';
        sizeIndicator.style.display = 'block';
    }
    
    function startResizeTouch(e) {
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startWidth = img.width;
        startHeight = img.height;
        overlay.style.display = 'block';
        sizeIndicator.style.display = 'block';
    }
    
    function resize(e) {
        if (!isResizing) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        // Maintain aspect ratio when resizing
        const aspectRatio = startWidth / startHeight;
        const newWidth = startWidth + deltaX;
        const newHeight = newWidth / aspectRatio;
        
        // Set minimum size
        const minSize = 50;
        if (newWidth > minSize && newHeight > minSize) {
            img.width = newWidth;
            img.height = newHeight;
            sizeIndicator.textContent = `${Math.round(newWidth)}×${Math.round(newHeight)}`;
        }
    }
    
    function resizeTouch(e) {
        if (!isResizing) return;
        
        e.preventDefault();
        
        const deltaX = e.touches[0].clientX - startX;
        const deltaY = e.touches[0].clientY - startY;
        
        // Maintain aspect ratio when resizing
        const aspectRatio = startWidth / startHeight;
        const newWidth = startWidth + deltaX;
        const newHeight = newWidth / aspectRatio;
        
        // Set minimum size
        const minSize = 50;
        if (newWidth > minSize && newHeight > minSize) {
            img.width = newWidth;
            img.height = newHeight;
            sizeIndicator.textContent = `${Math.round(newWidth)}×${Math.round(newHeight)}`;
        }
    }
    
    function stopResize() {
        isResizing = false;
        document.documentElement.style.cursor = '';
    }
    
    function hideAllImageControls() {
        document.querySelectorAll('.image-resize-overlay, .image-resize-indicator, .image-toolbar').forEach(el => {
            el.style.display = 'none';
        });
    }
    
    // Function to add toolbar with image options
    function addImageToolbar(container, img) {
        // Remove existing toolbar if any
        const existingToolbar = container.querySelector('.image-toolbar');
        if (existingToolbar) {
            existingToolbar.remove();
        }
        
        // Create toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'image-toolbar';
        
        // Size options
        const smallBtn = document.createElement('button');
        smallBtn.textContent = 'Small';
        smallBtn.addEventListener('click', () => resizeByPreset(img, 'small', sizeIndicator));
        
        const mediumBtn = document.createElement('button');
        mediumBtn.textContent = 'Medium';
        mediumBtn.addEventListener('click', () => resizeByPreset(img, 'medium', sizeIndicator));
        
        const largeBtn = document.createElement('button');
        largeBtn.textContent = 'Large';
        largeBtn.addEventListener('click', () => resizeByPreset(img, 'large', sizeIndicator));
        
        const fullBtn = document.createElement('button');
        fullBtn.textContent = 'Full';
        fullBtn.addEventListener('click', () => resizeByPreset(img, 'full', sizeIndicator));
        
        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.style.color = '#dc3545';
        removeBtn.addEventListener('click', () => {
            if (confirm('Remove this image?')) {
                container.remove();
            }
        });
        
        // Add buttons to toolbar
        toolbar.appendChild(smallBtn);
        toolbar.appendChild(mediumBtn);
        toolbar.appendChild(largeBtn);
        toolbar.appendChild(fullBtn);
        toolbar.appendChild(removeBtn);
        
        // Add toolbar to container
        container.appendChild(toolbar);
    }
    
    // Function to resize image to preset sizes
    function resizeByPreset(img, preset, indicator) {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        let newWidth;
        
        // Define presets
        switch(preset) {
            case 'small':
                newWidth = 250;
                break;
            case 'medium':
                newWidth = 400;
                break;
            case 'large':
                newWidth = 600;
                break;
            case 'full':
                newWidth = quill.root.clientWidth - 40; // Accounting for padding
                break;
            default:
                newWidth = 400;
        }
        
        // Apply new size
        img.width = newWidth;
        img.height = newWidth / aspectRatio;
        
        // Update indicator
        indicator.textContent = `${Math.round(img.width)}×${Math.round(img.height)}`;
    }
}

// Function to fetch blog data
async function fetchBlogData() {
    try {
        console.log(`Fetching blog with ID: ${blogId}`);
        console.log(`Current user ID: ${localStorage.getItem('userId')}`);
        
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            alert('You must be logged in to edit a blog');
            window.location.href = 'loginsignup.html';
            return;
        }
        
        // Validate blogId
        if (!blogId || blogId === 'undefined' || blogId === 'null') {
            console.error('Invalid blogId:', blogId);
            alert('Invalid blog ID');
            window.location.href = 'blogs.html';
            return;
        }

        // First try to get the specific blog
        const apiUrl = `http://localhost:5000/api/blogs/${blogId}`;
        console.log(`Calling API: ${apiUrl}`);
        
        try {
            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log(`Response status: ${response.status}`);
            
            // Handle authentication errors
            if (response.status === 401) {
                alert('Your session has expired. Please log in again.');
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                window.location.href = 'loginsignup.html';
                return;
            }
            
            // If blog not found, try to get all user's blogs and find the matching one
            if (response.status === 404) {
                console.log('Blog not found directly, trying to fetch user blogs...');
                
                // Try drafts first
                const draftsResponse = await fetch('http://localhost:5000/api/blogs/user/drafts', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (draftsResponse.ok) {
                    const drafts = await draftsResponse.json();
                    console.log(`Found ${drafts.length} draft blogs`);
                    const matchingDraft = drafts.find(blog => blog._id === blogId);
                    
                    if (matchingDraft) {
                        console.log('Found blog in user drafts:', matchingDraft);
                        originalBlog = matchingDraft;
                        loadBlogContent();
                        return;
                    }
                }

                // Then try published blogs
                const publishedResponse = await fetch('http://localhost:5000/api/blogs/user/published', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (publishedResponse.ok) {
                    const published = await publishedResponse.json();
                    console.log(`Found ${published.length} published blogs`);
                    const matchingPublished = published.find(blog => blog._id === blogId);
                    
                    if (matchingPublished) {
                        console.log('Found blog in user published blogs:', matchingPublished);
                        originalBlog = matchingPublished;
                        loadBlogContent();
                        return;
                    }
                }

                // If still not found, show error
                console.error('Blog not found in any user collection');
                alert('Blog not found. It may have been deleted or you may not have permission to access it.');
                window.location.href = 'blogs.html';
                return;
            }
            
            // Handle other errors
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error fetching blog:', errorText);
                throw new Error(`Failed to fetch blog data: ${errorText}`);
            }
            
            // Parse the response
            originalBlog = await response.json();
            console.log('Blog data loaded successfully:', originalBlog);
            
            loadBlogContent();
        } catch (error) {
            console.error('Network error:', error);
            alert('Failed to connect to server. Please check your internet connection and try again.');
            window.location.href = 'blogs.html';
        }
    } catch (error) {
        console.error('Error in fetchBlogData:', error);
        alert('Failed to load blog data. Please try again later.');
        window.location.href = 'blogs.html';
    }
}

// Handle thumbnail preview
thumbnailInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            thumbnailPreview.innerHTML = `<img src="${e.target.result}" alt="Thumbnail preview">`;
        };
        reader.readAsDataURL(file);
    }
});

// Load the blog content into the editor
function loadBlogContent() {
    // Check if the user owns this blog
    const userId = localStorage.getItem('userId');
    const blogAuthorId = typeof originalBlog.author === 'object' ? 
                      originalBlog.author._id : originalBlog.author;
                      
    if (userId !== blogAuthorId) {
        alert('You do not have permission to edit this blog');
        window.location.href = 'blogs.html';
        return;
    }

    // Populate the form with blog data
    titleInput.value = originalBlog.title || '';
    
    // Load thumbnail if it exists
    if (originalBlog.thumbnail) {
        thumbnailPreview.innerHTML = `<img src="${originalBlog.thumbnail}" alt="Thumbnail preview">`;
    }
    
    if (originalBlog.content) {
        quill.root.innerHTML = originalBlog.content;
        console.log('Content loaded into editor.');
    } else {
        console.log('No content to load.');
    }
    
    // Update button text based on current status
    if (originalBlog.status === 'draft') {
        publishBtn.innerHTML = '<i class="fas fa-check"></i> Publish';
        publishBtn.title = 'Publish this draft';
    } else {
        publishBtn.innerHTML = '<i class="fas fa-check"></i> Update Published Blog';
        publishBtn.title = 'Update this published blog';
    }

    // Make all images in the loaded content resizable
    setTimeout(() => {
        makeAllImagesResizable();
    }, 100);
}

// Function to simulate local blog data for testing when server is unavailable
function simulateLocalData() {
    console.warn('Using simulated local data for testing');
    
    originalBlog = {
        _id: blogId,
        title: "My Blog Post",
        content: "<p>This is a test blog post. The server connection failed, so we're showing this local content for testing.</p>",
        status: "draft",
        author: localStorage.getItem('userId'),
        createdAt: new Date().toISOString()
    };
    
    loadBlogContent();
}

// Function to create a new blog
async function createNewBlog() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/blogs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: 'New Blog Post',
                content: '<p>Start writing your blog here...</p>',
                status: 'draft'
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create blog: ${errorText}`);
        }

        const newBlog = await response.json();
        console.log('New blog created:', newBlog);
        
        // Redirect to edit the new blog
        window.location.href = `edit.html?id=${newBlog._id}`;
    } catch (error) {
        console.error('Error creating new blog:', error);
        alert(`Failed to create new blog: ${error.message}`);
    }
}

// Function to update blog
async function updateBlog(status) {
    try {
        const title = titleInput.value.trim();
        const content = quill.root.innerHTML;
        const thumbnailFile = thumbnailInput.files[0];

        if (!title) {
            alert('Please enter a title');
            return;
        }

        if (content.length < 10) {
            alert('Blog content is too short');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('status', status);
        if (thumbnailFile) {
            formData.append('thumbnail', thumbnailFile);
        }

        const response = await fetch(`http://localhost:5000/api/blogs/${blogId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        if (response.status === 401) {
            alert('Session expired. Please login again.');
            window.location.href = 'loginsignup.html';
            return;
        }

        if (!response.ok) {
            throw new Error('Failed to update blog');
        }

        const result = await response.json();
        alert(status === 'published' ? 'Blog published successfully!' : 'Draft saved successfully!');
        window.location.href = 'blogs.html';
    } catch (error) {
        console.error('Error updating blog:', error);
        alert('Failed to update blog');
    }
} 