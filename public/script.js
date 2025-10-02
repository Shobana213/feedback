// Global variables
let currentRating = 0;

// DOM elements
const starRating = document.getElementById('starRating');
const ratingText = document.getElementById('ratingText');
const ratingInput = document.getElementById('rating');
const feedbackForm = document.getElementById('feedbackForm');
const submitMessage = document.getElementById('submitMessage');
const refreshBtn = document.getElementById('refreshBtn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeStarRating();
    initializeForm();
    initializeDashboard();
    loadFeedback();
});

// Tab functionality
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load feedback when dashboard tab is opened
    if (tabName === 'dashboard') {
        loadFeedback();
    }
}

// Star rating functionality
function initializeStarRating() {
    const stars = document.querySelectorAll('.star');
    
    stars.forEach((star, index) => {
        star.addEventListener('click', function() {
            currentRating = parseInt(this.dataset.rating);
            updateStarDisplay();
            ratingInput.value = currentRating;
        });
        
        star.addEventListener('mouseenter', function() {
            const hoverRating = parseInt(this.dataset.rating);
            highlightStars(hoverRating);
        });
    });
    
    starRating.addEventListener('mouseleave', function() {
        updateStarDisplay();
    });
}

function highlightStars(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
    
    const ratingTexts = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    ratingText.textContent = ratingTexts[rating] || 'Click to rate';
}

function updateStarDisplay() {
    highlightStars(currentRating);
}

// Form functionality
function initializeForm() {
    feedbackForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitFeedback();
    });
}

async function submitFeedback() {
    const rating = parseInt(ratingInput.value);
    const comment = document.getElementById('comment').value.trim();
    
    // Validation
    if (!rating || rating < 1 || rating > 5) {
        showMessage('Please select a rating between 1 and 5 stars.', 'error');
        return;
    }
    
    if (!comment) {
        showMessage('Please enter a comment.', 'error');
        return;
    }
    
    // Disable submit button
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
        const response = await fetch('/api/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                rating: rating,
                comment: comment
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('Thank you! Your feedback has been submitted successfully.', 'success');
            resetForm();
        } else {
            showMessage(result.error || 'Failed to submit feedback. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error submitting feedback:', error);
        showMessage('Network error. Please check your connection and try again.', 'error');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Feedback';
    }
}

function resetForm() {
    feedbackForm.reset();
    currentRating = 0;
    ratingInput.value = '';
    updateStarDisplay();
    ratingText.textContent = 'Click to rate';
}

function showMessage(text, type) {
    submitMessage.textContent = text;
    submitMessage.className = `message ${type}`;
    submitMessage.style.display = 'block';
    
    // Hide message after 5 seconds
    setTimeout(() => {
        submitMessage.style.display = 'none';
    }, 5000);
}

// Dashboard functionality
function initializeDashboard() {
    refreshBtn.addEventListener('click', loadFeedback);
}

async function loadFeedback() {
    try {
        // Load feedback entries and statistics in parallel
        const [feedbackResponse, statsResponse] = await Promise.all([
            fetch('/api/feedback'),
            fetch('/api/feedback/stats')
        ]);
        
        if (feedbackResponse.ok && statsResponse.ok) {
            const feedbackData = await feedbackResponse.json();
            const statsData = await statsResponse.json();
            
            displayFeedback(feedbackData.feedback);
            displayStats(statsData);
        } else {
            throw new Error('Failed to load data');
        }
    } catch (error) {
        console.error('Error loading feedback:', error);
        document.getElementById('feedbackEntries').innerHTML = 
            '<p class="loading">Error loading feedback. Please try again.</p>';
    }
}

function displayStats(stats) {
    document.getElementById('totalCount').textContent = stats.total || 0;
    document.getElementById('averageRating').textContent = 
        stats.averageRating ? stats.averageRating.toFixed(1) : '0.0';
}

function displayFeedback(feedbackList) {
    const container = document.getElementById('feedbackEntries');
    
    if (!feedbackList || feedbackList.length === 0) {
        container.innerHTML = '<div class="no-feedback">No feedback entries yet. Be the first to share your thoughts!</div>';
        return;
    }
    
    const feedbackHTML = feedbackList.map(feedback => {
        const date = new Date(feedback.timestamp).toLocaleString();
        const stars = '⭐'.repeat(feedback.rating);
        
        return `
            <div class="feedback-entry">
                <div class="feedback-header">
                    <div class="feedback-rating">${stars} (${feedback.rating}/5)</div>
                    <div class="feedback-date">${date}</div>
                </div>
                <div class="feedback-comment">${escapeHtml(feedback.comment)}</div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = feedbackHTML;
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Auto-refresh dashboard every 30 seconds when visible
setInterval(() => {
    const dashboardTab = document.getElementById('dashboard-tab');
    if (dashboardTab.classList.contains('active')) {
        loadFeedback();
    }
}, 30000);
