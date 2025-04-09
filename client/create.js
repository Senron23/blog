// // Get DOM elements
// const titleInput = document.getElementById('blogTitle');
// const thumbnailInput = document.getElementById('thumbnail');
// const thumbnailPreview = document.getElementById('thumbnailPreview');
// const saveAsDraftBtn = document.querySelector('.save-draft-button');
// const publishBtn = document.querySelector('.publish-button');

// // Handle thumbnail preview
// thumbnailInput.addEventListener('change', function(e) {
//     const file = e.target.files[0];
//     if (file) {
//         const reader = new FileReader();
//         reader.onload = function(e) {
//             thumbnailPreview.innerHTML = `<img src="${e.target.result}" alt="Thumbnail preview">`;
//         };
//         reader.readAsDataURL(file);
//     }
// });

// // Function to create a new blog
// async function createNewBlog(status) {
//     try {
//         const title = titleInput.value.trim();
//         const content = quill.root.innerHTML;
//         const thumbnailFile = thumbnailInput.files[0];

//         if (!title) {
//             alert('Please enter a title');
//             return;
//         }

//         if (content.length < 10) {
//             alert('Blog content is too short');
//             return;
//         }

//         const formData = new FormData();
//         formData.append('title', title);
//         formData.append('content', content);
//         formData.append('status', status);
//         if (thumbnailFile) {
//             formData.append('thumbnail', thumbnailFile);
//         }

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
//             throw new Error('Failed to create blog');
//         }

//         const result = await response.json();
//         alert(status === 'published' ? 'Blog published successfully!' : 'Draft saved successfully!');
//         window.location.href = 'blogs.html';
//     } catch (error) {
//         console.error('Error creating blog:', error);
//         alert('Failed to create blog');
//     }
// } 