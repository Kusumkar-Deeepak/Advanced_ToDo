require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { processWithGemini } = require('./geminiController');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Enhanced middleware setup
app.use(express.json({ limit: '10kb' }));
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Database connection with enhanced settings
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Enhanced Todo Schema with validation
const TodoSchema = new mongoose.Schema({
  task: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    maxlength: [200, 'Task cannot exceed 200 characters']
  },
  email: {
    type: String,
    required: [true, 'User email is required'],
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email address']
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better performance
TodoSchema.index({ email: 1, status: 1 });
TodoSchema.index({ email: 1, priority: 1 });

// Middleware to update timestamps
TodoSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Todo = mongoose.model('Todo', TodoSchema);

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Error:', err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// API Routes
app.post('/api/tasks/ai', async (req, res) => {
  try {
    const { prompt, email } = req.body;
    
    // Validate input
    if (!prompt?.trim() || !email?.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Both prompt and email are required'
      });
    }

    // Process with AI
    const aiResponse = await processWithGemini(prompt, email);
    
    if (!aiResponse) {
      return res.status(500).json({
        status: 'error',
        message: 'AI processing failed'
      });
    }

    // Determine and execute action
    const action = determineAction(aiResponse);
    const result = await executeAction(action, aiResponse, email);
    
    res.status(200).json({
      status: 'success',
      data: result
    });

  } catch (error) {
    console.error('AI endpoint error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Helper functions
function determineAction(aiResponse) {
  const aiText = aiResponse?.text?.toLowerCase() || '';
  
  const actionMap = {
    create: aiText.includes('**action:** create'),
    update: aiText.includes('**action:** update'),
    delete: aiText.includes('**action:** delete'),
    list: aiText.includes('**action:** list'),
    complete: aiText.includes('**action:** mark completion') || 
              aiText.includes('**completion status:**')
  };

  return Object.keys(actionMap).find(key => actionMap[key]) || 'unknown';
}

async function executeAction(action, aiResponse, email) {
  const aiText = aiResponse.text;
  
  switch (action) {
    case 'create':
      return await createTask(aiText, email);
    case 'update':
      return await updateTask(aiText, email);
    case 'delete':
      return await deleteTask(aiText, email);
    case 'list':
      return await listTasks(aiText, email);
    case 'complete':
      return await markTaskCompletion(aiText, email);
    default:
      throw new Error('Unrecognized action from AI');
  }
}

// Task operation implementations
async function createTask(aiText, email) {
  const taskMatch = aiText.match(/\*\*task name:\*\* (.+)/i);
  const priorityMatch = aiText.match(/\*\*priority:\*\* (low|medium|high)/i);
  
  if (!taskMatch) throw new Error('Could not determine task details');

  const task = taskMatch[1].trim();
  const priority = priorityMatch?.[1]?.toLowerCase() || 'medium';

  const newTodo = await Todo.create({ task, priority, email });
  return {
    message: 'Task created successfully',
    task: newTodo
  };
}

async function updateTask(aiText, email) {
  const oldTaskMatch = aiText.match(/\*\*old task name:\*\* (.+)/i);
  const newTaskMatch = aiText.match(/\*\*new task name:\*\* (.+)/i);
  const priorityMatch = aiText.match(/\*\*priority:\*\* (low|medium|high)/i);

  if (!oldTaskMatch) throw new Error('Could not determine task to update');

  const oldTask = oldTaskMatch[1].trim();
  const updateFields = {};

  if (newTaskMatch) updateFields.task = newTaskMatch[1].trim();
  if (priorityMatch) updateFields.priority = priorityMatch[1].toLowerCase();

  const updatedTask = await Todo.findOneAndUpdate(
    { email, task: oldTask },
    { $set: updateFields },
    { new: true }
  );

  if (!updatedTask) throw new Error('Task not found');

  return {
    message: 'Task updated successfully',
    task: updatedTask
  };
}

async function deleteTask(aiText, email) {
  const taskMatch = aiText.match(/\*\*task name:\*\* (.+)/i);
  if (!taskMatch) throw new Error('Could not determine task to delete');

  const task = taskMatch[1].trim();
  const deletedTask = await Todo.findOneAndDelete({ email, task });

  if (!deletedTask) throw new Error('Task not found');

  return {
    message: 'Task deleted successfully',
    task: deletedTask
  };
}

async function listTasks(aiText, email) {
  const filter = { email };
  
  // Determine filter type from AI response
  if (aiText.includes('**filter:** completed')) {
    filter.status = 'completed';
  } else if (aiText.includes('**filter:** pending')) {
    filter.status = 'pending';
  } else if (aiText.includes('**filter:** high priority')) {
    filter.priority = 'high';
  } else if (aiText.includes('**filter:** medium priority')) {
    filter.priority = 'medium';
  } else if (aiText.includes('**filter:** low priority')) {
    filter.priority = 'low';
  }

  const tasks = await Todo.find(filter).sort({ createdAt: -1 });
  return {
    message: tasks.length > 0 ? 'Tasks retrieved successfully' : 'No tasks found',
    tasks
  };
}

async function markTaskCompletion(aiText, email) {
  const taskMatch = aiText.match(/\*\*task name:\*\* (.+)/i);
  const statusMatch = aiText.match(/\*\*completion status:\*\* (completed|pending)/i);

  if (!taskMatch || !statusMatch) throw new Error('Could not determine completion details');

  const task = taskMatch[1].trim();
  const status = statusMatch[1].toLowerCase();

  const updatedTask = await Todo.findOneAndUpdate(
    { email, task },
    { status },
    { new: true }
  );

  if (!updatedTask) throw new Error('Task not found');

  return {
    message: `Task marked as ${status}`,
    task: updatedTask
  };
}

// Start server with enhanced configuration
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection! 💥 Shutting down...');
  console.error(err);
  server.close(() => process.exit(1));
});