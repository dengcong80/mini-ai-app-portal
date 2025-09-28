require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const requirementRoutes = require('./routes/requirements');
const userRoutes = require('./routes/users'); 

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'https://mini-ai-frontend.onrender.com',
    'http://localhost:3000',  // local frontend
    'http://localhost:3001'   // another local frontend
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
   // console.log('MongoDB connected');
    
    // Clean up conflicting indexes
    try {
      const db = mongoose.connection.db;
      const usersCollection = db.collection('users');
      
      // Check and delete email index
      const indexes = await usersCollection.indexes();
      const emailIndex = indexes.find(index => 
        index.key && index.key.email === 1
      );
      
      if (emailIndex) {
       // console.log('Removing conflicting email index...');
        await usersCollection.dropIndex('email_1');
       // console.log('Email index removed successfully');
      }
    } catch (error) {
     // console.log('No conflicting indexes found or error removing index:', error.message);
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/requirements', requirementRoutes); 
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK' }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
