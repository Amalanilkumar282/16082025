// Delete all posts function
function deleteAllPosts() {
    if (confirm('Are you sure you want to delete all posts?')) {
        localStorage.removeItem('posts');
        posts = [];
        displayPosts();
    alert('All posts have been cleared.');
    }
}

// Attach event listener for delete all button
document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('deleteAllBtn');
    if (btn) btn.onclick = deleteAllPosts;
});
// Initialize posts array from localStorage or empty array if none exists
let posts = [];
try {
    const storedPosts = localStorage.getItem('posts');
    posts = storedPosts ? JSON.parse(storedPosts) : [];
} catch (error) {
    console.error('Error loading posts from localStorage:', error);
    posts = [];
}

function addPost(post) {
    // Get URL parameters to check if we're editing
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editId) {
        // Update existing post
        const index = posts.findIndex(p => p.id === editId);
        if (index !== -1) {
            posts[index] = { id: post.id, content: post.content };
            try {
                localStorage.setItem('posts', JSON.stringify(posts));
                alert('Post updated successfully.');
            } catch (error) {
                console.error('Error saving posts to localStorage:', error);
                alert('Failed to save post. Please try again.');
                return false;
            }
            return true;
        }
        return false;
    } else {
        // Add new post (existing logic)
        let idExists = false;
        let contentExists = false;
        posts.forEach(p => {
            if (p.id === post.id) {
                idExists = true;
            }
            if (p.content === post.content) {
                contentExists = true;
            }
        });
        if (idExists) {
            alert('ID already exists!');
            return false;
        }
        if (contentExists) {
            alert('Content already exists!');
            return false;
        }
        posts.push(post);
        try {
            localStorage.setItem('posts', JSON.stringify(posts));
            alert('Post created successfully.');
        } catch (error) {
            console.error('Error saving posts to localStorage:', error);
            alert('Failed to save post. Please try again.');
            return false;
        }
        return true;
    }
}

function displayPosts() {
    const postBody = document.getElementById("postBody");
    if (postBody) {
        let tableRows = '';
        if (posts.length === 0) {
            tableRows = '<tr><td colspan="3" style="text-align:center;">No post</td></tr>';
        } else {
            posts.forEach(post => {
                tableRows += `
                    <tr>
                        <td>${post.id}</td>
                        <td>${post.content}</td>
                        <td>
                            <button onclick="editPost('${post.id}')" title="Edit">✏️</button>
                            <button onclick="deletePost('${post.id}')" title="Delete">🗑️</button>
                        </td>
                    </tr>`;
            });
        }
        postBody.innerHTML = tableRows;
    }
}

function deletePost(postId) {
    if (confirm('Are you sure you want to delete this post?')) {
        posts = posts.filter(post => post.id !== postId);
        try {
            localStorage.setItem('posts', JSON.stringify(posts));
            alert('Post deleted successfully.');
        } catch (error) {
            console.error('Error saving posts to localStorage:', error);
            alert('Failed to delete post. Please try again.');
            return;
        }
        displayPosts();
    }
}

function editPost(postId) {
    // Store the post ID to edit in URL parameter
    window.location.href = `addPost.html?edit=${postId}`;
}

function getPostById(postId) {
    return posts.find(post => post.id === postId);
}

// Wait for the DOM to be fully loaded before executing code
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("addPostForm");
    if (form) {
        // Check if we're in edit mode
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('edit');
        
        if (editId) {
            // Prefill form for editing
            const post = getPostById(editId);
            if (post) {
                document.getElementById("postId").value = post.id;
                document.getElementById("postId").readOnly = true; // Make ID non-editable
                document.getElementById("postContent").value = post.content;
                document.querySelector('button[type="submit"]').textContent = 'Update Post';
                document.querySelector('legend').textContent = 'Edit Post Information';
                document.querySelector('h1').textContent = 'Edit Post';
            }
        }
        
        // Add event listener for form submission
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const id = document.getElementById("postId").value;
            const content = document.getElementById("postContent").value;
            
            const urlParams = new URLSearchParams(window.location.search);
            const editId = urlParams.get('edit');
            
            if (editId) {
                // Show confirmation for update
                if (confirm('Are you sure you want to update this post?')) {
                    if (addPost({ id, content })) {
                        window.location.href = "index.html";
                    }
                }
            } else {
                // Add new post
                if (addPost({ id, content })) {
                    window.location.href = "index.html";
                }
            }
        });
    }
    // Display existing posts when page loads
    displayPosts();
});
