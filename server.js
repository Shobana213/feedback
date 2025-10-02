const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Initialize SQLite database
const db = new sqlite3.Database('./feedback.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        // Create feedback table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            } else {
                console.log('Feedback table ready');
            }
        });
    }
});

// API Routes

// Submit feedback
app.post('/api/feedback', (req, res) => {
    const { rating, comment } = req.body;
    
    // Validation
    if (!rating || !comment) {
        return res.status(400).json({ 
            error: 'Rating and comment are required' 
        });
    }
    
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ 
            error: 'Rating must be between 1 and 5' 
        });
    }
    
    if (comment.trim().length === 0) {
        return res.status(400).json({ 
            error: 'Comment cannot be empty' 
        });
    }
    
    // Insert feedback into database
    const stmt = db.prepare('INSERT INTO feedback (rating, comment) VALUES (?, ?)');
    stmt.run([rating, comment.trim()], function(err) {
        if (err) {
            console.error('Error inserting feedback:', err.message);
            return res.status(500).json({ 
                error: 'Failed to save feedback' 
            });
        }
        
        res.status(201).json({ 
            message: 'Feedback submitted successfully',
            id: this.lastID 
        });
    });
    stmt.finalize();
});

// Get all feedback
app.get('/api/feedback', (req, res) => {
    db.all('SELECT * FROM feedback ORDER BY timestamp DESC', (err, rows) => {
        if (err) {
            console.error('Error retrieving feedback:', err.message);
            return res.status(500).json({ 
                error: 'Failed to retrieve feedback' 
            });
        }
        
        res.json({
            feedback: rows,
            count: rows.length
        });
    });
});

// Get feedback statistics
app.get('/api/feedback/stats', (req, res) => {
    db.all(`
        SELECT 
            COUNT(*) as total,
            AVG(rating) as average_rating,
            MIN(rating) as min_rating,
            MAX(rating) as max_rating
        FROM feedback
    `, (err, rows) => {
        if (err) {
            console.error('Error retrieving stats:', err.message);
            return res.status(500).json({ 
                error: 'Failed to retrieve statistics' 
            });
        }
        
        const stats = rows[0];
        res.json({
            total: stats.total,
            averageRating: Math.round(stats.average_rating * 100) / 100,
            minRating: stats.min_rating,
            maxRating: stats.max_rating
        });
    });
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Feedback Collector server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});
