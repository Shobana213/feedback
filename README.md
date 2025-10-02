# Feedback Collector

A simple, anonymous feedback collection platform with a clean web interface and RESTful API.

## Features

- **Anonymous Feedback Submission**: Users can submit feedback with ratings (1-5 stars) and comments
- **Real-time Dashboard**: View all feedback entries with statistics
- **RESTful API**: Clean API endpoints for feedback operations
- **Secure Storage**: SQLite database with proper validation
- **Responsive Design**: Works on desktop and mobile devices
- **Auto-refresh**: Dashboard updates automatically every 30 seconds

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Styling**: Modern CSS with gradients and animations

## Installation

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

## API Endpoints

### Submit Feedback
- **POST** `/api/feedback`
- **Body**: 
  ```json
  {
    "rating": 5,
    "comment": "Great service!"
  }
  ```
- **Response**: 
  ```json
  {
    "message": "Feedback submitted successfully",
    "id": 1
  }
  ```

### Get All Feedback
- **GET** `/api/feedback`
- **Response**: 
  ```json
  {
    "feedback": [
      {
        "id": 1,
        "rating": 5,
        "comment": "Great service!",
        "timestamp": "2023-10-02T10:30:00.000Z"
      }
    ],
    "count": 1
  }
  ```

### Get Statistics
- **GET** `/api/feedback/stats`
- **Response**: 
  ```json
  {
    "total": 10,
    "averageRating": 4.2,
    "minRating": 2,
    "maxRating": 5
  }
  ```

## Database Schema

The SQLite database contains a single `feedback` table:

```sql
CREATE TABLE feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Usage

1. **Submit Feedback**: 
   - Click on stars to rate (1-5)
   - Enter your comment
   - Click "Submit Feedback"

2. **View Dashboard**:
   - Click "View Dashboard" tab
   - See statistics and all feedback entries
   - Use refresh button to update manually

## File Structure

```
feedback-collector/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── feedback.db        # SQLite database (created automatically)
├── README.md          # This file
└── public/
    ├── index.html     # Main web page
    ├── styles.css     # Styling
    └── script.js      # Frontend JavaScript
```

## Security Features

- Input validation on both client and server
- SQL injection prevention using prepared statements
- XSS protection with HTML escaping
- Rating constraints (1-5 only)
- Comment length validation

## Customization

- **Port**: Change `PORT` environment variable or modify `server.js`
- **Database**: The SQLite file `feedback.db` is created automatically
- **Styling**: Modify `public/styles.css` for custom appearance
- **Validation**: Adjust validation rules in `server.js`

## License

MIT License - feel free to use and modify as needed.
