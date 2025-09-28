const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Predefined avatar options
const AVATAR_OPTIONS = [
  '👤', '👨', '👩', '🧑', '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓',
  '👨‍🔬', '👩‍🔬', '👨‍💻', '👩‍💻', '👨‍🎨', '👩‍🎨', '👨‍🚀', '👩‍🚀'
];

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// 1. Check if username is available
router.get('/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    
    res.json({ 
      available: !user,
      message: user ? 'Username already taken' : 'Username available'
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. User registration
router.post('/register', async (req, res) => {
  try {
    const { username, password, confirmPassword, realName, dateOfBirth, description, avatar } = req.body;

    // Validate required fields - provide more specific error messages
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
      }
      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }
      if (!realName) {
        return res.status(400).json({ error: 'Real name is required' });
      }
      if (!dateOfBirth) {
        return res.status(400).json({ error: 'Date of birth is required' });
      }

   // Validate username length
   if (username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }
  if (username.length > 20) {
    return res.status(400).json({ error: 'Username must be no more than 20 characters' });
  }

  // Validate real name length
  if (realName.trim().length < 2) {
    return res.status(400).json({ error: 'Real name must be at least 2 characters' });
  }

   // Validate password length
   if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
   }
    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }


   // Validate date of birth
   const birthDate = new Date(dateOfBirth);
   const today = new Date();
   if (birthDate >= today) {
     return res.status(400).json({ error: 'Date of birth must be in the past' });
   }
   if (today.getFullYear() - birthDate.getFullYear() > 120) {
     return res.status(400).json({ error: 'Please enter a valid date of birth' });
   }

   
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Validate avatar selection
    if (avatar && !AVATAR_OPTIONS.includes(avatar)) {
      return res.status(400).json({ error: 'Invalid avatar selection' });
    }

    // Create new user
    const user = new User({
      username,
      password,
      realName,
      dateOfBirth: new Date(dateOfBirth),
      description: description || '',
      avatar: avatar || '👤'
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        realName: user.realName,
        avatar: user.avatar,
        description: user.description
      }
    });
  } catch (error) {
    console.error('Registration error:', error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ error: errors.join(', ') });
      }
      
      // Handle duplicate key error
      if (error.code === 11000) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      
      res.status(500).json({ error: 'Registration failed. Please try again.' });
  


    
  }
});

// 3. User login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        realName: user.realName,
        avatar: user.avatar,
        description: user.description
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// 4. Get current user information
router.get('/me', authenticateToken, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      realName: req.user.realName,
      avatar: req.user.avatar,
      description: req.user.description,
      dateOfBirth: req.user.dateOfBirth
    }
  });
});

// 5. Update user information
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { username, realName, description, avatar, dateOfBirth } = req.body;
    const userId = req.user._id;

    // If updating username, check if it already exists
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Validate avatar selection
    if (avatar && !AVATAR_OPTIONS.includes(avatar)) {
      return res.status(400).json({ error: 'Invalid avatar selection' });
    }

    // Update user information
    const updateData = {};
    if (username) updateData.username = username;
    if (realName) updateData.realName = realName;
    if (description !== undefined) updateData.description = description;
    if (avatar) updateData.avatar = avatar;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: '-password' }
    );

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        username: user.username,
        realName: user.realName,
        avatar: user.avatar,
        description: user.description,
        dateOfBirth: user.dateOfBirth
      }
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Update failed' });
  }
});

// 6. Delete user account
router.delete('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete user (this will trigger cascade deletion of related articles and comments)
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// 7. Get avatar options
router.get('/avatars', (req, res) => {
  res.json({ avatars: AVATAR_OPTIONS });
});


// Add route to get specific user information
router.get('/:id', async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ user });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

module.exports = router;
