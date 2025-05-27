const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const {User,Accident} = require("./Schema");
// const Accident = require("./Schema");
dotenv.config();
const app = express();
app.use(express.json());

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/accident", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("MongoDB connected successfully");
}).catch((err) => {
  console.log(err);
});

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) return res.status(401).json({ message: "Access Denied" });
  const token = authHeader.split(" ")[1];

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Invalid Token" });
  }
};

//get driver details
app.get("/profile", verifyToken, async (req, res) => {
  try {
    // Extract user ID from the verified JWT
    const driverId = req.user.id;

    // Fetch driver details from the database
    const driver = await User.findById(driverId).select("-password"); // Exclude password for security

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.json(driver);
  } catch (error) {
    console.error("Error fetching driver profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all accidents
app.get('/accidents', verifyToken, async (req, res) => {
  try {
    const accidents = await Accident.find({ assignedTo: null });
    res.status(200).json(accidents);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving accidents', error });
  }
});

//assign accidents for users

app.post('/assign-accident', verifyToken, async (req, res) => {
  try {
    
    const { accidentId } = req.body;
    
    if (!accidentId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if the accident is already assigned
    const existingAccident = await Accident.findById(accidentId);
    if (!existingAccident) {
      return res.status(404).json({ message: "Accident not found" });
    }
    if (existingAccident.assignedTo) {
      return res.status(400).json({ message: "Accident already assigned" });
    }

    // Assign accident to the user
    const updatedAccident = await Accident.findByIdAndUpdate(
      accidentId,
      { assignedTo: req.user.id },
      { new: true }
    );

    // Update the user to include the assigned accident
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { accidents: { accident: accidentId, status: "completed" } } },
      { new: true }
    ).populate("accidents.accident");

    res.status(200).json({ message: "Accident assigned successfully", user: updatedUser, accident: updatedAccident });
  } catch (error) {
    console.error("Error assigning accident:", error);
    res.status(500).json({ message: "Error assigning accident", error });
  }
});


// Get all users
app.get('/users', verifyToken, async (req, res) => {
  try {
    const users = await User.find({ role: "user" });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
});

// Get user's completed accidents
app.get('/user/completed-accidents', verifyToken, async (req, res) => {
  try {
    // Find user and populate accidents with accident details
    const user = await User.findById(req.user.id).populate("accidents.accident");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Filter completed accidents and return full accident details
    const completedAccidents = user.accidents
      .filter(a => a.status === "completed")
      .map(a => a.accident); // Extract full accident details
    console.log(completedAccidents);

    res.status(200).json(completedAccidents);
  } catch (error) {
    console.error("Error fetching completed accidents:", error);
    res.status(500).json({ message: "Error fetching completed accidents", error: error.message });
  }
});


// Delete accident when accepted by driver
// app.delete('/accidents/:id', verifyToken, async (req, res) => {
//   try {
//     const deletedAccident = await Accident.findByIdAndDelete(req.params.id);
//     if (!deletedAccident) return res.status(404).json({ message: "Accident not found" });
//     res.status(200).json({ message: "Accident deleted successfully", deletedAccident });
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting accident", error });
//   }
// });

// Adding new accidents
app.post('/accidents', async (req, res) => {
  try {
    const { location, lat, lng, maps_link, datetime, severity_label } = req.body;
    if (!location || !lat || !lng || !datetime || !maps_link|| !severity_label) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    console.log(req.body);
    const newAccident = new Accident({
      location,
      lat,
      lng,
      maps_link,
      datetime,
      severity_label,
      // reported_by: req.user.id Save accident with user ID
    });

    await newAccident.save();
    res.status(201).json({ message: "Accident added successfully", accident: newAccident });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error adding accident", error });
  }
});

// Admin Login
app.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;
  const admin = await User.findOne({ username, role: "admin" });
  if (!admin) return res.status(400).json({ message: "Admin not found" });
  if (admin.password !== password) return res.status(400).json({ message: "Invalid password" });

  const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// User Login
app.post("/user/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, role: "user" });
  if (!user) return res.status(400).json({ message: "User not found" });
  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return res.status(400).json({ message: "Invalid password" });

  const token = jwt.sign({ id: user._id, role: "user" }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// Admin adds a user
app.post("/admin/adduser", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Unauthorized" });

  const { username, password,name,phoneNumber,licenseNumber,vehicleNumber } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const oldUser = await User.findOne({ username });
  if (oldUser) return res.json({ message: "User already exists" });

  const newUser = new User({ username, password: hashedPassword, role: "user",
    vehicleNumber,
    licenseNumber,
    phoneNumber,
    name    
   });
  await newUser.save();
  res.json({ message: "User added successfully" });
});

app.post('/', (req, res) => {
  console.log(req.body);
  res.json(req.body);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));