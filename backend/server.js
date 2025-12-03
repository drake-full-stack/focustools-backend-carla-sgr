require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const cors = require('cors');
app.use(cors());
app.use(express.json());



// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) => console.error("❌ Error:", error));

// Import models
const Task = require("./models/Task");
const Session = require("./models/Session");

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "FocusTools API",
    status: "Running",
    endpoints: {
      tasks: "/api/tasks",
      sessions: "/api/sessions",
    },
  });

});

// CREATE -a new task
app.post('/api/tasks', async (req, res) => {
  try {
    const newTask = new Task(req.body); // Create a new Task from request body
    const savedTask = await newTask.save(); // Save() writes to DB
    res.status(201).json(savedTask); // send back to DB
  } catch (error) {
    res.status(400).json({ message: error.message });
  } // try/catch handles errors
});

// READ all - get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//READ ONE - Get a specific task
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE - Modify a task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id, // Which task to update
      req.body, // New data
      {
        new: true, // Return updated version
        runValidators: true // Check schema rules
      }
    );
    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found"
      });
    }
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//DELETE - Remove a task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(
      req.params.id
    );
    if (!deletedTask) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }
    res.json({
      message: 'Task deleted successfully',
      task: deletedTask
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE - log a Pomodoro session
app.post('/api/sessions', async (req, res) => {
  try {
    const newSession = new Session(req.body);
    const savedSession = await newSession.save();
    res.status(201).json(savedSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// READ all - get all sessions
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await Session.find().populate("taskId"); // Populate task details
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 

