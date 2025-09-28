const express = require('express');
const Requirement = require('../models/Requirement');
const aiService = require('../utils/aiService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
// Add request limiting
const requestQueue = [];
const MAX_CONCURRENT_REQUESTS = 5;
let activeRequests = 0;
const processQueue = async () => {
    if (activeRequests >= MAX_CONCURRENT_REQUESTS || requestQueue.length === 0) {
      return;
    }
  
    const { req, res, next } = requestQueue.shift();
    activeRequests++;
  
    try {
      await next();
    } finally {
      activeRequests--;
      processQueue();
    }
  };
  
  // Middleware: Limit concurrent requests
  const limitConcurrentRequests = (req, res, next) => {
    if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
      requestQueue.push({ req, res, next });
    } else {
      next();
    }
  };
// ✅ 1. Extract RAOS only → POST / (no HTML generation)
router.post('/', authenticateToken, limitConcurrentRequests, async (req, res) => {
    try {
      const { description } = req.body;
      if (!description) return res.status(400).json({ error: 'Description is required' });
  
      // Only call extractRAOS, do not call generateMockHTML
      const raosData = await aiService.extractRAOS(description);
  
      const requirement = new Requirement({
        userDescription: description,
        appDescription: description,
        ...raosData,
        mockHtml: null, // No HTML generation initially
        createdBy: req.user._id // Add creator association
      });
      await requirement.save();
  
      res.status(201).json({
        id: requirement._id,
        ...raosData,
        mockHtml: null
      });
    } catch (error) {
      console.error('RAOS extraction error:', error);
      res.status(500).json({ error: 'RAOS extraction failed: ' + error.message });
    }
  });
  
  // ✅ 2. Generate Mock HTML → POST /:id/generate-ui
  router.post('/:id/generate-ui', limitConcurrentRequests, async (req, res) => {
    try {
      const requirement = await Requirement.findById(req.params.id);
      if (!requirement) {
        return res.status(404).json({ error: 'Prototype not found' });
      }

      if (requirement.mockHtml) {
        return res.json({
          id: requirement._id,
          mockHtml: requirement.mockHtml
        });
      }
  
      let mockHtml;
      let attempts = 0;
      const maxAttempts = 3;
  
      // Retry mechanism
      while (attempts < maxAttempts) {
        try {
          mockHtml = await aiService.generateMockHTML(requirement.appName, requirement.raos);
          
          // Validate HTML completeness
          if (isValidHTML(mockHtml)) {
            break;
          }
          
          attempts++;
         // console.log(`HTML generation attempt ${attempts} failed, retrying...`);
          
          if (attempts >= maxAttempts) {
            throw new Error('Failed to generate complete HTML after multiple attempts');
          }
        } catch (error) {
          attempts++;
          if (attempts >= maxAttempts) {
            throw error;
          }
         // console.log(`Attempt ${attempts} failed:`, error.message);
        }
      }
      
      
      // Update mockHtml in database
      requirement.mockHtml = mockHtml;
      await requirement.save();
  
      res.json({
        id: requirement._id,
        mockHtml: mockHtml
      });
    } catch (error) {
      console.error('Mock HTML generation error:', error);
      res.status(500).json({ error: 'Mock HTML generation failed: ' + error.message });
    }
  });

  // Helper function to validate HTML completeness
function isValidHTML(html) {
    if (!html || html.length < 100) return false;
    
    // Check for start and end tags
    const hasDoctype = html.includes('<!DOCTYPE');
    const hasHtmlTag = html.includes('<html') && html.includes('</html>');
    const hasBodyTag = html.includes('<body') && html.includes('</body>');
    
    return hasDoctype && hasHtmlTag && hasBodyTag;
  }

// ✅ 3. Get history list → GET /
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [requirements, total] = await Promise.all([
      Requirement.find()
      .populate('createdBy', 'username realName avatar') // Add creator information
      .sort({ createdAt: -1 })
      .select('appName appDescription createdAt mockHtml createdBy')
      .skip(skip)
      .limit(limit),
      Requirement.countDocuments()]);
      res.json({
        requirements,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});


// Add route to get current user requirements
router.get('/my', authenticateToken, async (req, res) => {
    try {
    //  console.log('User ID:', req.user._id); // Add debug log
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const [requirements, total] = await Promise.all([
         Requirement.find({ createdBy: req.user._id })
        .populate('createdBy', 'username realName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Requirement.countDocuments({ createdBy: req.user._id })
    ]);
      
    //  console.log('Found requirements:', requirements.length); // Add debug log
    res.json({
      requirements,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
    } catch (error) {
      console.error('Error fetching user requirements:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      res.status(500).json({ error: 'Failed to fetch requirements: ' + error.message });
    }
  });

 // Temporary debug route - check all requirements
 router.get('/debug', async (req, res) => {
    try {
      const allRequirements = await Requirement.find({});
    //  console.log('All requirements:', allRequirements);
      res.json({ 
        count: allRequirements.length, 
        requirements: allRequirements.map(r => ({
          id: r._id,
          appName: r.appName,
          createdBy: r.createdBy,
          hasCreatedBy: !!r.createdBy
        }))
      });
    } catch (error) {
      console.error('Debug error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Add debug route to check actual data in database
router.get('/debug/:id', async (req, res) => {
    try {
      const requirement = await Requirement.findById(req.params.id);
     // console.log('Raw requirement from DB:');
    //  console.log('- createdBy:', requirement.createdBy);
    //  console.log('- createdBy type:', typeof requirement.createdBy);
    //  console.log('- createdBy is ObjectId:', mongoose.Types.ObjectId.isValid(requirement.createdBy));
      
      const populated = await Requirement.findById(req.params.id)
        .populate('createdBy', 'username realName avatar');
     // console.log('Populated requirement:');
    //  console.log('- createdBy:', populated.createdBy);
    //  console.log('- createdBy type:', typeof populated.createdBy);
      
      res.json({
        raw: {
          createdBy: requirement.createdBy,
          createdByType: typeof requirement.createdBy,
          isObjectId: mongoose.Types.ObjectId.isValid(requirement.createdBy)
        },
        populated: {
          createdBy: populated.createdBy,
          createdByType: typeof populated.createdBy
        }
      });
    } catch (error) {
      console.error('Debug error:', error);
      res.status(500).json({ error: error.message });
    }
  });

// ✅ 4. Get single prototype → GET /:id
router.get('/:id', async (req, res) => {
    try {
      //  console.log('Fetching prototype with ID:', req.params.id);
        const requirement = await Requirement.findById(req.params.id)
        .populate('createdBy', 'username realName avatar'); // Ensure populate is correctly configured;
        if (!requirement) {
      //    console.log('Prototype not found for ID:', req.params.id);
          return res.status(404).json({ error: 'Prototype not found' });
        }
      //  console.log('Found prototype:', requirement.appName);
      //  console.log('Created by (populated):', requirement.createdBy); // Add debug log
      //  console.log('Created by type:', typeof requirement.createdBy);
        res.json(requirement);
      } catch (error) {
        console.error('Error fetching prototype:', error);
        console.error('Error details:', error.message);
        res.status(500).json({ error: 'Failed to fetch prototype' });
      }
});

// ✅ 4. Delete prototype → DELETE /:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Requirement.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Prototype not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});


// ✅ 5. Update prototype information → PUT /:id
router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const { appName, roles, entities, raos } = req.body;
      
      // Check if project exists and user is creator
      const requirement = await Requirement.findById(req.params.id);
      if (!requirement) {
        return res.status(404).json({ error: 'Prototype not found' });
      }
      
      // Check if user is creator
      if (requirement.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Only creator can edit this prototype' });
      }
      
      // Update fields
      const updateData = {};
      if (appName) updateData.appName = appName;
      if (roles) updateData.roles = roles;
      if (entities) updateData.entities = entities;
      if (raos) updateData.raos = raos;
      
      const updatedRequirement = await Requirement.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      ).populate('createdBy', 'username realName avatar');
      
      res.json(updatedRequirement);
    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({ error: 'Failed to update prototype' });
    }
  });
  
  // Add export statement
  module.exports = router;
  

 

