// server/controllers/adminSkillController.js
const Skill = require('../models/Skill');

// Get all skills with filtering and pagination
const getSkills = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      category = '',
      level = '',
      isActive = '',
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (level) {
      filter.level = level;
    }
    
    if (isActive !== '') {
      filter.isActive = isActive === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [skills, total] = await Promise.all([
      Skill.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Skill.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: skills,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get skills'
    });
  }
};

// Get single skill by ID
const getSkill = async (req, res) => {
  try {
    const { id } = req.params;
    
    const skill = await Skill.findById(id);
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    res.json({
      success: true,
      data: skill
    });
  } catch (error) {
    console.error('Get skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get skill'
    });
  }
};

// Create new skill
const createSkill = async (req, res) => {
  try {
    const { name, description, category, level, isActive } = req.body;

    // Validate required fields
    if (!name || !category || !level) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, and level are required'
      });
    }

    // Check if skill with same name already exists
    const existingSkill = await Skill.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: 'A skill with this name already exists'
      });
    }

    // Create new skill
    const skill = new Skill({
      name: name.trim(),
      description: description?.trim() || '',
      category,
      level,
      isActive: isActive !== undefined ? isActive : true
    });

    await skill.save();

    res.status(201).json({
      success: true,
      data: skill,
      message: 'Skill created successfully'
    });
  } catch (error) {
    console.error('Create skill error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A skill with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create skill'
    });
  }
};

// Update skill
const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, level, isActive } = req.body;

    // Validate required fields
    if (!name || !category || !level) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, and level are required'
      });
    }

    // Check if skill exists
    const skill = await Skill.findById(id);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Check if another skill with same name exists (excluding current skill)
    const existingSkill = await Skill.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: id }
    });
    
    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: 'A skill with this name already exists'
      });
    }

    // Update skill
    const updatedSkill = await Skill.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        description: description?.trim() || '',
        category,
        level,
        isActive: isActive !== undefined ? isActive : skill.isActive
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedSkill,
      message: 'Skill updated successfully'
    });
  } catch (error) {
    console.error('Update skill error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A skill with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update skill'
    });
  }
};

// Delete skill
const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if skill exists
    const skill = await Skill.findById(id);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Check if skill is being used by any instructors
    const Instructor = require('../models/Instructor');
    const instructorsUsingSkill = await Instructor.countDocuments({
      skills: id
    });

    if (instructorsUsingSkill > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete skill. It is currently assigned to ${instructorsUsingSkill} instructor(s). Please remove it from instructor profiles first.`
      });
    }

    // Delete skill
    await Skill.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete skill'
    });
  }
};

// Get skill statistics
const getSkillStats = async (req, res) => {
  try {
    const [
      totalSkills,
      activeSkills,
      inactiveSkills,
      categoryStats,
      levelStats,
      recentSkills
    ] = await Promise.all([
      Skill.countDocuments(),
      Skill.countDocuments({ isActive: true }),
      Skill.countDocuments({ isActive: false }),
      Skill.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            activeCount: {
              $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
            }
          }
        },
        { $sort: { count: -1 } }
      ]),
      Skill.aggregate([
        {
          $group: {
            _id: '$level',
            count: { $sum: 1 },
            activeCount: {
              $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
            }
          }
        },
        { $sort: { count: -1 } }
      ]),
      Skill.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name category level isActive createdAt')
    ]);

    // Get instructor usage statistics
    const Instructor = require('../models/Instructor');
    const skillUsage = await Instructor.aggregate([
      { $unwind: '$skills' },
      {
        $group: {
          _id: '$skills',
          instructorCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'skills',
          localField: '_id',
          foreignField: '_id',
          as: 'skillInfo'
        }
      },
      { $unwind: '$skillInfo' },
      {
        $project: {
          skillName: '$skillInfo.name',
          category: '$skillInfo.category',
          instructorCount: 1
        }
      },
      { $sort: { instructorCount: -1 } },
      { $limit: 10 }
    ]);

    const stats = {
      overview: {
        totalSkills,
        activeSkills,
        inactiveSkills,
        utilizationRate: totalSkills > 0 ? Math.round((skillUsage.length / totalSkills) * 100) : 0
      },
      categoryBreakdown: categoryStats.map(cat => ({
        category: cat._id,
        total: cat.count,
        active: cat.activeCount,
        inactive: cat.count - cat.activeCount
      })),
      levelBreakdown: levelStats.map(level => ({
        level: level._id,
        total: level.count,
        active: level.activeCount,
        inactive: level.count - level.activeCount
      })),
      mostUsedSkills: skillUsage,
      recentSkills: recentSkills.map(skill => ({
        id: skill._id,
        name: skill.name,
        category: skill.category,
        level: skill.level,
        isActive: skill.isActive,
        createdAt: skill.createdAt
      }))
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get skill stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get skill statistics'
    });
  }
};

module.exports = {
  getSkills,
  getSkill,
  createSkill,
  updateSkill,
  deleteSkill,
  getSkillStats
};