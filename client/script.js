
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
        if (!card.classList.contains('active')) {
            document.querySelector('.card.active').classList.remove('active');
            card.classList.add('active');
        }
    });
});

// Card Slider Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Create the slider structure if it doesn't exist

    if (!document.querySelector('.card-slider-wrapper')) {
        const cards = document.querySelectorAll('.card');
        const cardSlider = document.querySelector('.card-slider');
        
        if (cardSlider && cards.length > 0) {

            // Create wrapper
            const wrapper = document.createElement('div');
            wrapper.className = 'card-slider-wrapper';
            
            // Move cards into wrapper
            cards.forEach(card => {
                wrapper.appendChild(card.cloneNode(true));
                card.remove();
            });
            
            // Add wrapper to slider
            cardSlider.appendChild(wrapper);
            
            // Add navigation buttons
            const prevBtn = document.createElement('div');
            prevBtn.className = 'slider-nav prev';
            prevBtn.innerHTML = '&lt;';
            cardSlider.appendChild(prevBtn);
            
            const nextBtn = document.createElement('div');
            nextBtn.className = 'slider-nav next';
            nextBtn.innerHTML = '&gt;';
            cardSlider.appendChild(nextBtn);
        }
    }
    
    // Get elements
    const cardSlider = document.querySelector('.card-slider');
    const wrapper = document.querySelector('.card-slider-wrapper');
    const cards = document.querySelectorAll('.card');
    const prevBtn = document.querySelector('.slider-nav.prev');
    const nextBtn = document.querySelector('.slider-nav.next');
    
    if (!cardSlider || !wrapper || cards.length === 0) return;
    
    // Set initial state
    let activeIndex = Math.floor(cards.length / 2);
    let cardWidth = cards[0].offsetWidth + parseInt(getComputedStyle(cards[0]).marginLeft) + 
                   parseInt(getComputedStyle(cards[0]).marginRight);
    
    // Initialize
    updateCarousel(false);
    
    // Add event listeners
    cards.forEach((card, index) => {
        card.addEventListener('click', () => {
            if (index !== activeIndex) {
                activeIndex = index;
                updateCarousel(true);
            }
        });
    });
    
    prevBtn.addEventListener('click', () => {
        activeIndex = (activeIndex > 0) ? activeIndex - 1 : cards.length - 1;
        updateCarousel(true);
    });
    
    nextBtn.addEventListener('click', () => {
        activeIndex = (activeIndex < cards.length - 1) ? activeIndex + 1 : 0;
        updateCarousel(true);
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        cardWidth = cards[0].offsetWidth + parseInt(getComputedStyle(cards[0]).marginLeft) + 
                   parseInt(getComputedStyle(cards[0]).marginRight);
        updateCarousel(false);
    });
    
    // Update carousel function
    function updateCarousel(animate) {
        // Remove active class from all cards
        cards.forEach(card => card.classList.remove('active'));
        
        // Add active class to current card
        cards[activeIndex].classList.add('active');
        
        // Calculate the transform to center the active card
        const sliderCenter = cardSlider.offsetWidth / 2;
        const cardCenter = cardWidth / 2;
        const offset = -activeIndex * cardWidth + sliderCenter - cardCenter;
        
        // Apply transform with or without animation
        if (!animate) {
            wrapper.style.transition = 'none';
            requestAnimationFrame(() => {
                wrapper.style.transform = `translateX(${offset}px)`;
                requestAnimationFrame(() => {
                    wrapper.style.transition = 'transform 0.5s ease-in-out';
                });
            });
        } else {
            wrapper.style.transform = `translateX(${offset}px)`;
        }
        
        // Update z-index for stacking effect
        cards.forEach((card, index) => {
            const distance = Math.abs(index - activeIndex);
            card.style.zIndex = cards.length - distance;
        });
    }
    
    // Add touch/swipe support
    let startX, moveX, initialOffset;
    let isDragging = false;
    
    wrapper.addEventListener('touchstart', startDrag);
    wrapper.addEventListener('mousedown', startDrag);
    
    wrapper.addEventListener('touchmove', drag);
    wrapper.addEventListener('mousemove', drag);
    
    wrapper.addEventListener('touchend', endDrag);
    wrapper.addEventListener('mouseup', endDrag);
    wrapper.addEventListener('mouseleave', endDrag);
    
    function startDrag(e) {
        isDragging = true;
        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        initialOffset = parseFloat(getComputedStyle(wrapper).transform.split(',')[4]) || 0;
        wrapper.style.transition = 'none';
    }
    
    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();
        moveX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const diff = moveX - startX;
        wrapper.style.transform = `translateX(${initialOffset + diff}px)`;
    }
    
    function endDrag(e) {
        if (!isDragging) return;
        isDragging = false;
        wrapper.style.transition = 'transform 0.5s ease-in-out';
        
        if (e.type !== 'mouseleave') {
            moveX = e.type.includes('mouse') ? e.clientX : (e.changedTouches ? e.changedTouches[0].clientX : startX);
            const diff = moveX - startX;
            
            // Determine if we should change the active card
            if (Math.abs(diff) > cardWidth / 3) {
                if (diff > 0 && activeIndex > 0) {
                    activeIndex--;
                } else if (diff < 0 && activeIndex < cards.length - 1) {
                    activeIndex++;
                }
            }
        }
        
        updateCarousel(true);
    }
});
// Check if we're on the create page
if (document.getElementById('editor')) {
    // Initialize Quill editor
    var quill = new Quill('#editor', {
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
    
    // Get publish button
    const publishButton = document.querySelector('.publish-button');
    
    // Add click event to publish button
    if (publishButton) {
        publishButton.addEventListener('click', async function() {
            try {
                // Get blog content from Quill editor
                const content = quill.root.innerHTML;
                
                // Get blog title
                const titleInput = document.querySelector('#blogTitle');
                if (!titleInput) {
                    alert('Error: Could not find title input');
                    return;
                }
                const title = titleInput.value.trim();
                
                // Validate inputs
                if (!title) {
                    alert('Please enter a blog title');
                    return;
                }
                
                if (quill.getText().trim().length < 10) {
                    alert('Blog content is too short');
                    return;
                }
                
                // Get token and user ID
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('userId');
                if (!token || !userId) {
                    alert('You must be logged in to publish a blog');
                    window.location.href = 'loginsignup.html';
                    return;
                }
                
                // Prepare blog data
                const blogData = {
                    title: title,
                    content: content,
                    status: 'published',
                    author: userId
                };
                
                // Send blog data to backend
                const response = await fetch('http://localhost:5000/api/blogs', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(blogData)
                });
                
                if (!response.ok) {
                    if (response.status === 401) {
                        alert('Your session has expired. Please log in again.');
                        localStorage.removeItem('token');
                        localStorage.removeItem('userId');
                        window.location.href = 'loginsignup.html';
                        return;
                    }
                    
                    const errorText = await response.text();
                    console.error('Server error response:', errorText);
                    
                    try {
                        const errorData = JSON.parse(errorText);
                        alert('Failed to publish blog: ' + (errorData.message || 'Unknown error'));
                    } catch (e) {
                        alert(`Failed to publish blog: Server returned status ${response.status}`);
                    }
                    return;
                }
                
                // Parse successful response
                const data = await response.json();
                console.log('Blog published successfully:', data);
                
                alert('Blog published successfully!');
                window.location.href = 'blogs.html';
                
            } catch (error) {
                console.error('Error publishing blog:', error);
                alert('An error occurred while publishing your blog: ' + error.message);
            }
        });
    }
}

// Handle create button click 
document.addEventListener('DOMContentLoaded', function() {
    const createBtn = document.querySelector('.createBtn');
    if (createBtn) {
        createBtn.addEventListener('click', function() {
            window.location.href = 'create.html';
        });
    }
});

// Tab switching functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing blog tabs');

    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabButtons.length === 0) {
        console.error('No tab buttons found on the page');
        return;
    }

    if (tabContents.length === 0) {
        console.error('No tab content sections found on the page');
        return;
    }

    console.log(`Found ${tabButtons.length} tab buttons and ${tabContents.length} tab content sections`);

    // Set up click handlers for tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log(`Tab button clicked: ${button.getAttribute('data-tab')}`);
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            
            const tabContent = document.getElementById(tabId);
            if (tabContent) {
                tabContent.classList.add('active');
                
                // Load blogs for the selected tab
                try {
                    loadBlogsForTab(tabId);
                } catch (error) {
                    console.error('Error in tab click handler:', error);
                }
            } else {
                console.error(`Tab content not found for id: ${tabId}`);
            }
        });
    });

    // Load initial blogs for the active tab
    try {
        const activeTab = document.querySelector('.tab-button.active');
        if (activeTab) {
            const tabId = activeTab.getAttribute('data-tab');
            console.log(`Loading initial blogs for tab: ${tabId}`);
            loadBlogsForTab(tabId);
        } else {
            console.log('No active tab found, trying to load explore tab');
            loadBlogsForTab('explore');
        }
    } catch (error) {
        console.error('Error loading initial blogs:', error);
    }
});

// Function to load blogs based on the selected tab
async function loadBlogsForTab(tabId) {
    console.log(`Loading blogs for tab: ${tabId}`);
    
    // Map tab IDs to container IDs correctly
    const containerIdMap = {
        'explore': 'explore-blogs',
        'published': 'published-blogs',
        'drafts': 'draft-blogs' // Changed from drafts-blogs to draft-blogs
    };

    const containerId = containerIdMap[tabId] || `${tabId}-blogs`;
    
    // First check if the container element exists
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container for ${containerId} not found in the DOM`);
        return;
    }
    
    console.log(`Found container: ${containerId}`);
    container.innerHTML = ''; // Clear existing content

    try {
        let blogs;
        switch(tabId) {
            case 'explore':
                blogs = await fetchPublicBlogs();
                break;
            case 'published':
                try {
                    blogs = await fetchUserPublishedBlogs();
                } catch (error) {
                    if (error.message.includes('not authenticated') || error.message.includes('Session expired')) {
                        showError(container, 'Please log in to view your published blogs.');
                        return;
                    }
                    throw error;
                }
                break;
            case 'drafts':
                try {
                    blogs = await fetchUserDrafts();
                } catch (error) {
                    if (error.message.includes('not authenticated') || error.message.includes('Session expired')) {
                        showError(container, 'Please log in to view your drafts.');
                        return;
                    }
                    throw error;
                }
                break;
            default:
                console.error(`Unknown tab: ${tabId}`);
                showError(container, 'Invalid tab selected.');
                return;
        }

        if (!blogs || blogs.length === 0) {
            showEmptyState(container, tabId);
            return;
        }

        console.log(`Loaded ${blogs.length} blogs for ${tabId} tab`);
        blogs.forEach(blog => {
            try {
                const blogCard = createBlogCard(blog);
                if (blogCard) {
                    container.appendChild(blogCard);
                }
            } catch (error) {
                console.error('Error creating blog card:', error, blog);
            }
        });
    } catch (error) {
        console.error('Error loading blogs:', error);
        if (container) {
            showError(container, 'Failed to load blogs. Please try again later.');
        }
    }
}

// Function to fetch public blogs
async function fetchPublicBlogs() {
    const response = await fetch('http://localhost:5000/api/blogs');
    if (!response.ok) throw new Error('Failed to fetch public blogs');
    return await response.json();
}

// Function to fetch user's published blogs
async function fetchUserPublishedBlogs() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'loginsignup.html';
        throw new Error('User not authenticated');
    }

    const response = await fetch('http://localhost:5000/api/blogs/user/published', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        window.location.href = 'loginsignup.html';
        throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error('Failed to fetch published blogs');
    }

    return await response.json();
}

// Function to fetch user's draft blogs
async function fetchUserDrafts() {
    console.log('Fetching user drafts...');
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('No token found, redirecting to login');
        window.location.href = 'loginsignup.html';
        throw new Error('User not authenticated');
    }

    console.log('Making API request to fetch drafts...');
    const response = await fetch('http://localhost:5000/api/blogs/user/drafts', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    console.log('Drafts API response status:', response.status);
    
    if (response.status === 401) {
        console.log('Unauthorized - clearing token and redirecting');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        window.location.href = 'loginsignup.html';
        throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response for drafts:', errorText);
        throw new Error('Failed to fetch draft blogs');
    }

    const data = await response.json();
    console.log(`Received ${data.length} drafts`);
    return data;
}

// Function to show empty state message
function showEmptyState(container, tabId) {
    if (!container) {
        console.error('Container is null in showEmptyState');
        return;
    }
    
    const messages = {
        explore: {
            icon: 'compass',
            title: 'No Blogs Found',
            message: 'There are no public blogs available at the moment.'
        },
        published: {
            icon: 'check-circle',
            title: 'No Published Blogs',
            message: 'You haven\'t published any blogs yet.'
        },
        drafts: {
            icon: 'edit',
            title: 'No Drafts',
            message: 'You don\'t have any draft blogs.'
        }
    };

    const { icon, title, message } = messages[tabId] || {
        icon: 'question-circle',
        title: 'No Content',
        message: 'There is no content available for this section.'
    };
    
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-${icon}"></i>
            <h3>${title}</h3>
            <p>${message}</p>
        </div>
    `;
}

// Function to show error message
function showError(container, message) {
    if (!container) {
        console.error('Container is null in showError');
        return;
    }
    
    container.innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message || 'An unknown error occurred.'}</p>
        </div>
    `;
}

// Add save draft button functionality
document.addEventListener('DOMContentLoaded', function() {
    const saveDraftButton = document.querySelector('.save-draft-button');
    const publishButton = document.querySelector('.publish-button');
    
    if (saveDraftButton) {
        saveDraftButton.addEventListener('click', async function() {
            try {
                // Get blog content from Quill editor
                const content = quill.root.innerHTML;
                
                // Get blog title
                const title = document.querySelector('.title-box').value;
                
                // Validate inputs
                if (!title.trim()) {
                    alert('Please enter a blog title');
                    return;
                }
                
                if (quill.getText().trim().length < 10) {
                    alert('Blog content is too short');
                    return;
                }
                
                // Get token and user ID
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('userId');
                if (!token || !userId) {
                    alert('You must be logged in to save a draft');
                    window.location.href = 'loginsignup.html';
                    return;
                }
                
                // Prepare blog data
                const blogData = {
                    title: title.trim(),
                    content: content,
                    status: 'draft',
                    author: userId // Add the user ID as the author
                };
                
                // Send blog data to backend
                const response = await fetch('http://localhost:5000/api/blogs', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(blogData)
                });
                
                if (!response.ok) {
                    if (response.status === 401) {
                        alert('Your session has expired. Please log in again.');
                        localStorage.removeItem('token');
                        localStorage.removeItem('userId');
                        window.location.href = 'loginsignup.html';
                        return;
                    }
                    
                    const errorText = await response.text();
                    console.error('Server error response:', errorText);
                    
                    try {
                        const errorData = JSON.parse(errorText);
                        alert('Failed to save draft: ' + (errorData.message || 'Unknown error'));
                    } catch (e) {
                        alert(`Failed to save draft: Server returned status ${response.status}`);
                    }
                    return;
                }
                
                // Parse successful response
                const data = await response.json();
                console.log('Draft saved successfully:', data);
                
                alert('Draft saved successfully!');
                window.location.href = 'blogs.html';
                
            } catch (error) {
                console.error('Error saving draft:', error);
                alert('An error occurred while saving your draft: ' + error.message);
            }
        });
    }
});

// Function to create a blog card element
function createBlogCard(blog) {
    // Create the main article element
    const article = document.createElement('article');
    article.className = 'blog-card';
    article.dataset.blogId = blog._id;
    
    // Extract the first image from the blog content
    const imageResult = extractFirstImage(blog.content);
    
    // Create the blog image section
    const imageDiv = document.createElement('div');
    imageDiv.className = 'blog-image';
    if (!imageResult.found) {
        imageDiv.classList.add('no-image');
        imageDiv.innerHTML = '<span>No image available</span>';
    } else {
        const img = document.createElement('img');
        img.src = imageResult.src;
        img.alt = blog.title;
        imageDiv.appendChild(img);
    }
    
    // Create the blog content section
    const contentDiv = document.createElement('div');
    contentDiv.className = 'blog-content';
    
    // Add title
    const title = document.createElement('h3');
    title.textContent = blog.title;
    contentDiv.appendChild(title);
    
    // Add excerpt (first 150 characters of content)
    const excerpt = document.createElement('p');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = blog.content;
    excerpt.textContent = tempDiv.textContent.substring(0, 150) + '...';
    contentDiv.appendChild(excerpt);
    
    // Add meta information
    const metaDiv = document.createElement('div');
    metaDiv.className = 'blog-meta';
    
    // Add author - handle different author data structures
    const author = document.createElement('span');
    author.className = 'author';
    
    // Determine author display name with fallbacks
    let authorName = 'Anonymous';
    if (blog.author) {
        if (typeof blog.author === 'object') {
            // Try to get author name with fallbacks
            authorName = blog.author.name || blog.author.username || 'User';
        } else if (typeof blog.author === 'string') {
            authorName = 'User';
        }
    }
    
    // Set the author text with the determined name
    author.textContent = `By ${authorName}`;
    metaDiv.appendChild(author);
    
    // Add date
    const date = document.createElement('span');
    date.className = 'date';
    date.textContent = new Date(blog.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    metaDiv.appendChild(date);
    
    // Add status badge for drafts
    if (blog.status === 'draft') {
        const status = document.createElement('span');
        status.className = 'status-badge draft';
        status.textContent = 'Draft';
        metaDiv.appendChild(status);
    }
    
    contentDiv.appendChild(metaDiv);
    
    // Check if this blog belongs to the current user
    const userId = localStorage.getItem('userId');
    const isUserBlog = userId && blog.author && 
                     ((typeof blog.author === 'object' && blog.author._id === userId) || 
                      (typeof blog.author === 'string' && blog.author === userId));
    
    // Add blog actions (edit/delete) for user's own blogs
    if (isUserBlog) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'blog-actions';
        
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'blog-action-btn edit';
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card click event
            window.location.href = `edit.html?id=${blog._id}`;
        });
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'blog-action-btn delete';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Delete';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card click event
            if (confirm(`Are you sure you want to delete "${blog.title}"?`)) {
                deleteBlog(blog._id);
            }
        });
        
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        contentDiv.appendChild(actionsDiv);
    }
    
    // Assemble the blog card
    article.appendChild(imageDiv);
    article.appendChild(contentDiv);
    
    // Add click event to view the full blog
    article.addEventListener('click', () => {
        window.location.href = `blog.html?id=${blog._id}`;
    });
    
    return article;
}

// Function to delete a blog
async function deleteBlog(blogId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be logged in to delete a blog');
            return;
        }
        
        // Find the delete button and show loading state
        const deleteBtn = document.querySelector(`.blog-card[data-blog-id="${blogId}"] .blog-action-btn.delete`);
        if (deleteBtn) {
            const originalText = deleteBtn.innerHTML;
            deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
            deleteBtn.disabled = true;
        }
        
        const response = await fetch(`http://localhost:5000/api/blogs/${blogId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 401) {
            alert('Your session has expired. Please log in again.');
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            window.location.href = 'loginsignup.html';
            return;
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error deleting blog:', errorText);
            alert('Failed to delete blog');
            
            // Reset button state if it exists
            if (deleteBtn) {
                deleteBtn.innerHTML = originalText;
                deleteBtn.disabled = false;
            }
            
            return;
        }
        
        // Remove the blog card from display with animation
        const blogCard = document.querySelector(`.blog-card[data-blog-id="${blogId}"]`);
        if (blogCard) {
            blogCard.style.transition = 'all 0.3s ease';
            blogCard.style.opacity = '0';
            blogCard.style.transform = 'scale(0.9)';
            
            // Remove element after animation completes
            setTimeout(() => {
                blogCard.remove();
                
                // Check if container is empty and show empty state if needed
                const activeTab = document.querySelector('.tab-button.active');
                if (activeTab) {
                    const tabId = activeTab.getAttribute('data-tab');
                    const container = document.getElementById(tabId === 'drafts' ? 'draft-blogs' : 
                                                    tabId === 'published' ? 'published-blogs' : 'explore-blogs');
                    
                    if (container && container.children.length === 0) {
                        showEmptyState(container, tabId);
                    }
                }
            }, 300);
        }
        
        alert('Blog deleted successfully');
    } catch (error) {
        console.error('Error deleting blog:', error);
        alert('An error occurred while deleting your blog');
        
        // Reset button state if possible
        const deleteBtn = document.querySelector(`.blog-card[data-blog-id="${blogId}"] .blog-action-btn.delete`);
        if (deleteBtn) {
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Delete';
            deleteBtn.disabled = false;
        }
    }
}

// Function to extract the first image from HTML content
function extractFirstImage(htmlContent) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // First try to find an img tag
    const imgTag = tempDiv.querySelector('img');
    if (imgTag && imgTag.src) {
        return {
            found: true,
            src: imgTag.src
        };
    }
    
    // Then try to find a background image in style attributes
    const elementsWithStyle = tempDiv.querySelectorAll('[style*="background-image"]');
    for (const element of elementsWithStyle) {
        const style = element.getAttribute('style');
        const match = style.match(/url\(['"]?(.*?)['"]?\)/);
        if (match && match[1]) {
            return {
                found: true,
                src: match[1]
            };
        }
    }
    
    // If no image found, return default
    return {
        found: false,
        src: 'assets/default-blog.jpg'
    };
}


//comments
// let comments = {}; // In-memory comments store: { blogId: ["comment1", "comment2"] }

// function openModal(card) {
//   const modal = document.getElementById('blog-modal');
//   const title = card.dataset.title;
//   const content = card.dataset.content;
//   const blogId = card.dataset.id;

//   document.getElementById('modal-blog-title').innerText = title;
//   document.getElementById('modal-blog-content').innerHTML = content;
//   modal.dataset.blogId = blogId;

//   renderComments(blogId);
//   modal.classList.remove('hidden');
// }

function closeModal() {
  document.getElementById('blog-modal').classList.add('hidden');
}

function renderComments(blogId) {
  const list = document.getElementById('comment-list');
  list.innerHTML = '';

  const blogComments = comments[blogId] || [];
  blogComments.forEach(comment => {
    const div = document.createElement('div');
    div.className = 'comment';
    div.textContent = comment;
    list.appendChild(div);
  });
}

function postComment() {
  const input = document.getElementById('comment-input');
  const blogId = document.getElementById('blog-modal').dataset.blogId;
  const comment = input.value.trim();

  if (!comment) return;

  if (!comments[blogId]) comments[blogId] = [];
  comments[blogId].push(comment);

  input.value = '';
  renderComments(blogId);
}




// Add user dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
    const userIcon = document.querySelector('.user-icon');
    const userDropdown = document.getElementById('userDropdown');

    if (userIcon && userDropdown) {
        userIcon.addEventListener('click', function(event) {
            event.stopPropagation();
            userDropdown.classList.toggle('active');
        });
        
        document.addEventListener('click', function(event) {
            if (!userDropdown.contains(event.target) && !userIcon.contains(event.target)) {
                userDropdown.classList.remove('active');
            }
        });
    }
});

// Function to create a new blog
// let quill;

// v1 st
document.addEventListener('DOMContentLoaded', function () {
    // Initialize Quill only if editor exists
    const editorElement = document.getElementById('editor');
    if (editorElement) {
        quill = new Quill('#editor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                ]
            },
            placeholder: 'Write your blog post here...'
        });

        // Buttons
        const saveAsDraftBtn = document.querySelector('.save-draft-button');
        const publishBtn = document.querySelector('.publish-button');

        if (saveAsDraftBtn) {
            saveAsDraftBtn.addEventListener('click', () => createNewBlog('draft'));
        }

        if (publishBtn) {
            publishBtn.addEventListener('click', () => createNewBlog('published'));
        }
    }
});

async function createNewBlog(status) {
    try {
        const titleInput = document.querySelector('#blogTitle');
        const thumbnailInput = document.getElementById('thumbnail');

        if (!titleInput) {
            console.error('Title input not found');
            alert('Error: Title input not found');
            return;
        }

        const title = titleInput.value.trim();
        const content = quill?.root?.innerHTML?.trim(); // safely access quill

        console.log("title:", title);
        console.log("content:", content);

        if (!title) {
            alert('Please enter a title');
            return;
        }

        if (!content || content.length < 10 || content === '<p><br></p>') {
            alert('Blog content is too short');
            return;
        }

        const thumbnailFile = thumbnailInput?.files?.[0];

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('status', status);
        if (thumbnailFile) {
            formData.append('thumbnail', thumbnailFile);
        }

        const response = await fetch('http://localhost:5000/api/blogs', {
            method: 'POST',
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
            const errorText = await response.text();
            throw new Error(`Failed to create blog: ${errorText}`);
        }

        const result = await response.json();
        alert(status === 'published' ? 'Blog published!' : 'Draft saved!');
        window.location.href = 'blogs.html';

    } catch (error) {
        console.log("Title input:", titleInput);
        console.log("Quill initialized:", quill);


        console.error('Error creating blog:', error);
        alert('Failed to create blog: ' + error.message);
    }
};


// v1 end

// v0 st
// async function createNewBlog(status) {
//     try {
//         // Get the title input element
//         const titleInput = document.querySelector('#blogTitle');
//         if (!titleInput) {
//             console.error('Title input element not found');
//             alert('Error: Title input not found');
//             return;
//         }
//         const thumbnailInput = document.getElementById('thumbnail');
        
//         if (!titleInput) {
//             console.error('Title input element not found');
//             alert('Error: Title input not found');
//             return;
//         }

//         // Get the title value and trim it
//         const title = titleInput.value.trim();
//         const content = quill.root.innerHTML.trim();
//         const thumbnailFile = thumbnailInput.files[0];

//         // Validate title
//         if (!title) {
//             alert('Please enter a title');
//             return;
//         }

//         // Validate content
//         if (!content || content.length < 10) {
//             alert('Blog content is too short');
//             return;
//         }

//         // Create FormData object
//         const formData = new FormData();
//         formData.append('title', title);
//         formData.append('content', content);
//         formData.append('status', status);
//         if (thumbnailFile) {
//             formData.append('thumbnail', thumbnailFile);
//         }

//         // Send the request
//         const response = await fetch('http://localhost:5000/api/blogs', {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('token')}`
//             },
//             body: formData
//         });

//         if (response.status === 401) {
//             alert('Session expired. Please login again.');
//             window.location.href = 'loginsignup.html';
//             return;
//         }

//         if (!response.ok) {
//             const errorText = await response.text();
//             throw new Error(`Failed to create blog: ${errorText}`);
//         }

//         const result = await response.json();
//         alert(status === 'published' ? 'Blog published successfully!' : 'Draft saved successfully!');
//         window.location.href = 'blogs.html';
//     } catch (error) {
//         console.error('Error creating blog:', error);
//         alert('Failed to create blog: ' + error.message);
//     }
// }

// // Initialize Quill editor and set up event listeners
// document.addEventListener('DOMContentLoaded', function() {
//     // Check if we're on the create page
//     if (document.getElementById('editor')) {
//         // Initialize Quill editor
//         quill = new Quill('#editor', {
//             theme: 'snow',
//             modules: {
//                 toolbar: [
//                     [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
//                     ['bold', 'italic', 'underline', 'strike'],
//                     [{ 'color': [] }, { 'background': [] }],
//                     [{ 'align': [] }],
//                     ['link', 'image'],
//                     ['clean']
//                 ]
//             },
//             placeholder: 'Write your blog post here...'
//         });

//         // Set up event listeners for save and publish buttons
//         const saveAsDraftBtn = document.querySelector('.save-draft-button');
//         const publishBtn = document.querySelector('.publish-button');

//         if (saveAsDraftBtn) {
//             saveAsDraftBtn.addEventListener('click', () => createNewBlog('draft'));
//         }

//         if (publishBtn) {
//             publishBtn.addEventListener('click', () => createNewBlog('published'));
//         }
//     }
// });

// v0 end
