// Initialize posts array from localStorage or empty array if none exists
let posts = JSON.parse(localStorage.getItem('posts')) || [];

function addPost(post) {
    // Initialize flags to track if duplicates exist
    let idExists = false;
    let contentExists = false;
    
    // Use forEach to iterate through all existing posts
    // forEach executes the callback function for each element in the array
    posts.forEach(p => {
        // Check if current post ID matches the new post ID
        if (p.id === post.id) {
            idExists = true;
        }
        // Check if current post content matches the new post content
        if (p.content === post.content) {
            contentExists = true;
        }
    });
    
    // Check the flags and show appropriate alerts
    if (idExists) {
        alert('ID already exists!');
        return false;
    }
    if (contentExists) {
        alert('Content already exists!');
        return false;
    }
    // If no duplicates found, add the post and save to localStorage
    posts.push(post);
    localStorage.setItem('posts', JSON.stringify(posts));
    return true;
}

function displayPosts() {
    const postBody = document.getElementById("postBody");
    if (postBody) {
        // Initialize empty string to accumulate table rows
        let tableRows = '';
        // Use forEach to iterate through all posts and build HTML
        // forEach is used instead of map() to demonstrate the requested approach
        posts.forEach(post => {
            // Concatenate each post as a table row to the tableRows string
            tableRows += `<tr><td>${post.id}</td><td>${post.content}</td></tr>`;
        });
        // Set the accumulated HTML string to the table body
        postBody.innerHTML = tableRows;
    }
}

// Wait for the DOM to be fully loaded before executing code
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("addPostForm");
    if (form) {
        // Add event listener for form submission
        form.addEventListener("submit", (e) => {
            e.preventDefault(); // Prevent default form submission
            // Get values from form inputs
            const id = document.getElementById("postId").value;
            const content = document.getElementById("postContent").value;
            // Try to add the post and redirect if successful
            if (addPost({ id, content })) {
                window.location.href = "index.html";
            }
        });
    }
    // Display existing posts when page loads
    displayPosts();
});
