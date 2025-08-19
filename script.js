// Firebase configuration
const FIREBASE_URL = 'https://post-management-e07c2-default-rtdb.asia-southeast1.firebasedatabase.app';

// Firebase API functions
async function fetchPosts() {
    try {
        showLoading(true);
        const response = await fetch(`${FIREBASE_URL}/posts.json`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data === null) {
            return [];
        }
        
        // Convert Firebase object to array
        const postsArray = Object.keys(data).map(key => ({
            firebaseKey: key,
            id: data[key].id,
            content: data[key].content
        }));
        
        return postsArray;
    } catch (error) {
        console.error('Error fetching posts:', error);
        alert('Failed to load posts. Please check your internet connection.');
        return [];
    } finally {
        showLoading(false);
    }
}

async function savePost(post) {
    try {
        showLoading(true);
        
        const response = await fetch(`${FIREBASE_URL}/posts.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: post.id,
                content: post.content,
                timestamp: Date.now()
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result.name; // Firebase returns the generated key
    } catch (error) {
        console.error('Error saving post:', error);
        throw error;
    } finally {
        showLoading(false);
    }
}

async function updatePost(firebaseKey, post) {
    try {
        showLoading(true);
        
        const response = await fetch(`${FIREBASE_URL}/posts/${firebaseKey}.json`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: post.id,
                content: post.content,
                timestamp: Date.now()
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return true;
    } catch (error) {
        console.error('Error updating post:', error);
        throw error;
    } finally {
        showLoading(false);
    }
}

async function deletePostFromFirebase(firebaseKey) {
    try {
        showLoading(true);
        
        const response = await fetch(`${FIREBASE_URL}/posts/${firebaseKey}.json`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return true;
    } catch (error) {
        console.error('Error deleting post:', error);
        throw error;
    } finally {
        showLoading(false);
    }
}

async function deleteAllPostsFromFirebase() {
    try {
        showLoading(true);
        
        const response = await fetch(`${FIREBASE_URL}/posts.json`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return true;
    } catch (error) {
        console.error('Error deleting all posts:', error);
        throw error;
    } finally {
        showLoading(false);
    }
}

// Utility functions
function showLoading(show) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = show ? 'block' : 'none';
    }
    
    // Disable/enable buttons during loading
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.disabled = show;
    });
}

// Posts management functions
let posts = [];

async function loadPosts() {
    posts = await fetchPosts();
    displayPosts();
}

async function addPost(post) {
    if (isNaN(post.id) || post.id.trim() === "") {
        alert('ID must be a number.');
        return false;
    }
    
    // Get URL parameters to check if we're editing
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editId) {
        // Update existing post
        const existingPost = posts.find(p => p.id === editId);
        if (existingPost) {
            try {
                await updatePost(existingPost.firebaseKey, post);
                alert('Post updated successfully.');
                return true;
            } catch (error) {
                alert('Failed to update post. Please try again.');
                return false;
            }
        }
        return false;
    } else {
        // Check for duplicate ID or content
        const idExists = posts.some(p => p.id === post.id);
        const contentExists = posts.some(p => p.content === post.content);
        
        if (idExists) {
            alert('ID already exists!');
            return false;
        }
        
        if (contentExists) {
            alert('Content already exists!');
            return false;
        }
        
        try {
            await savePost(post);
            alert('Post created successfully.');
            return true;
        } catch (error) {
            alert('Failed to save post. Please try again.');
            return false;
        }
    }
}

function displayPosts() {
    const postBody = document.getElementById("postBody");
    if (postBody) {
        let tableRows = '';
        if (posts.length === 0) {
            tableRows = '<tr><td colspan="3" style="text-align:center;">No posts</td></tr>';
        } else {
            posts.forEach(post => {
                tableRows += `
                    <tr>
                        <td>${post.id}</td>
                        <td>${post.content}</td>
                        <td>
                            <button onclick="editPost('${post.id}')" title="Edit">✏️</button>
                            <button onclick="deletePost('${post.firebaseKey}')" title="Delete">🗑️</button>
                        </td>
                    </tr>`;
            });
        }
        postBody.innerHTML = tableRows;
    }
}

async function deletePost(firebaseKey) {
    if (confirm('Are you sure you want to delete this post?')) {
        try {
            await deletePostFromFirebase(firebaseKey);
            alert('Post deleted successfully.');
            await loadPosts(); // Reload posts
        } catch (error) {
            alert('Failed to delete post. Please try again.');
        }
    }
}

function editPost(postId) {
    // Store the post ID to edit in URL parameter
    window.location.href = `addPost.html?edit=${postId}`;
}

function getPostById(postId) {
    return posts.find(post => post.id === postId);
}

// Delete all posts function
async function deleteAllPosts() {
    if (confirm('Are you sure you want to delete all posts?')) {
        try {
            await deleteAllPostsFromFirebase();
            alert('All posts have been cleared.');
            await loadPosts(); // Reload posts
        } catch (error) {
            alert('Failed to delete all posts. Please try again.');
        }
    }
}

// Refresh posts function
async function refreshPosts() {
    await loadPosts();
}

// Wait for the DOM to be fully loaded before executing code
document.addEventListener("DOMContentLoaded", async () => {
    // Load posts when page loads
    await loadPosts();
    
    // Attach event listeners
    const deleteAllBtn = document.getElementById('deleteAllBtn');
    if (deleteAllBtn) {
        deleteAllBtn.onclick = deleteAllPosts;
    }
    
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.onclick = refreshPosts;
    }
    
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
                document.querySelector('button[type="submit"]').innerHTML = '<strong>🔄 Update Post</strong>';
                document.querySelector('legend').innerHTML = '<strong>✏️ Edit Post Information</strong>';
                document.querySelector('h1').textContent = '✏️ Edit Post';
            }
        }
        
        // Add event listener for form submission
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = document.getElementById("postId").value;
            const content = document.getElementById("postContent").value;
            
            if (isNaN(id) || id.trim() === "") {
                alert("ID must be a number.");
                return;
            }
            
            const urlParams = new URLSearchParams(window.location.search);
            const editId = urlParams.get('edit');
            
            if (editId) {
                // Show confirmation for update
                if (confirm('Are you sure you want to update this post?')) {
                    if (await addPost({ id, content })) {
                        window.location.href = "index.html";
                    }
                }
            } else {
                // Add new post
                if (await addPost({ id, content })) {
                    window.location.href = "index.html";
                }
            }
        });
    }
});