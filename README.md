# Slackr - A Real-time Messaging Platform

[English](README.md) | [中文](README.zh.md)

## Overview

Slackr is a real-time messaging platform inspired by Slack, built using vanilla JavaScript. This project demonstrates my ability to build complex web applications using modern web technologies without relying on frameworks.

## Features Implemented

### 1. User Authentication & Management
- User registration and login system
- Profile management with photo upload
- Password management with secure validation
- Error handling with user-friendly notifications

### 2. Channel Management
- Create and join public/private channels
- View channel details and member list
- Edit channel information (name, description)
- Leave channels

### 3. Real-time Messaging
- Send and receive messages in channels
- Edit and delete own messages
- Message reactions with emojis
- Message pinning functionality
- Message pagination

### 4. Multi-user Features
- User profiles with photos and bios
- Invite users to channels
- View other users' profiles
- Real-time updates for new messages

### 5. Media Support
- Photo upload and sharing in messages
- Image preview with modal view
- Thumbnail generation

## Technical Implementation

### Frontend Technologies
- Vanilla JavaScript (ES6+)
- HTML5 & CSS3
- Fetch API for HTTP requests
- Local Storage for data persistence
- DOM manipulation
- Event handling
- Promise-based asynchronous operations

### Backend Integration
- RESTful API integration
- JWT authentication
- File upload handling
- Real-time data synchronization

### Key Technical Challenges Solved
1. Building a single-page application without frameworks
2. Implementing real-time updates using polling
3. Managing complex state without a state management library
4. Handling file uploads and image processing
5. Creating a responsive and accessible UI

## Tech Stack

### Languages
- JavaScript (ES6+)
- HTML5
- CSS3

### Frontend
- Vanilla JavaScript (No frameworks)
- Fetch API
- Local Storage API
- DOM API
- File API
- Canvas API (for image processing)

### Backend
- Node.js
- Express.js
- JSON Web Tokens (JWT)
- File System (fs) module
- HTTP/HTTPS modules

### Development Tools
- npm (Node Package Manager)
- http-server (for local development)
- Git (version control)

### APIs & Services
- RESTful API endpoints
- File upload endpoints
- Authentication endpoints
- Real-time data polling

### Data Storage
- JSON file-based storage
- Local Storage for client-side caching
- Session Storage for temporary data

### Security
- JWT-based authentication
- Password hashing
- Input validation
- XSS prevention
- CORS implementation

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone git@github.com:AnnaWu23/Slackr.git
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Start the backend server:
```bash
npm start
```

4. In a new terminal, start the frontend server:
```bash
cd frontend
npx http-server -p 8080
```

5. Open your browser and navigate to:
```
http://localhost:8080
```

## Project Structure
```
slackr/
├── frontend/           # Frontend application
│   ├── src/           # Source code
│   ├── styles/        # CSS files
│   └── index.html     # Main HTML file
├── backend/           # Backend server
│   ├── src/          # Server source code
│   └── database.json # Database file
└── README.md         # Project documentation
```

## Learning Outcomes

Through building this project, I gained:
1. Deep understanding of vanilla JavaScript and DOM manipulation
2. Experience with building complex single-page applications
3. Knowledge of RESTful API integration
4. Understanding of real-time web application concepts
5. Skills in handling file uploads and media processing
6. Experience with responsive design and accessibility

## Future Improvements

1. Implement WebSocket for real-time updates
2. Add end-to-end encryption for messages
3. Implement message search functionality
4. Add support for more media types
5. Implement user presence indicators

## License

This project is for demonstration purposes only.
