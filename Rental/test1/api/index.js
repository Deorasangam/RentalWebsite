const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const Property = require("./property"); // Your property schema
const express = require("express");
const app = express();
const PORT = 5000;
const bodyParser = require("body-parser");

const Review = require("./review");
const MONGO_URI = "mongodb://127.0.0.1:27017/rental";

// Middleware
app.use(express.json());
app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage });

// MongoDB connection
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Server Running"))
  .catch((err) => console.error("MongoDB connection error:", err));

const User = require("./User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const jwtSecret = "afsnbnbafasd5757fasdf";

app.post("/Register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email already registered",
      });
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Create JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      jwtSecret,
      { expiresIn: "24h" }
    );

    // Return success response
    res.status(201).json({
      status: "success",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to register user",
    });
  }
});

// index.js - Updated login route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "User not found",
      });
    }

    // Compare hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid password",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ email: user.email, id: user._id }, jwtSecret, {
      expiresIn: "24h",
    });

    res.status(200).json({
      status: "success",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      status: "error",
      message: "Server error occurred",
    });
  }
});

app.post("/NewProperty", upload.array("images", 5), async (req, res) => {
  const { name, type, price, location, discount, description, email } =
    req.body;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "At least one image is required." });
  }

  if (req.files.length > 5) {
    return res.status(400).json({ error: "Maximum 5 images allowed." });
  }

  try {
    const newProperty = new Property({
      name,
      type,
      price,
      location,
      discount,
      description,
      email,
      images: req.files.map((file) => ({
        data: file.buffer,
        contentType: file.mimetype,
      })),
    });

    await newProperty.save();
    res.status(201).json(newProperty);
  } catch (err) {
    console.error("Error saving property:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/images/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property || !property.images || !property.images.data) {
      return res.status(404).json({ error: "Image not found" });
    }

    const contentType = property.images.contentType;
    if (!contentType || !/^image\/(png|jpeg|jpg|webp)$/.test(contentType)) {
      throw new Error("Invalid media type");
    }

    res.set("Content-Type", contentType);
    res.send(property.images.data);
  } catch (err) {
    console.error("Error fetching image:", err.message);
    res.status(500).json({ error: "Failed to fetch image" });
  }
});

app.get("/property", async (req, res) => {
  const { location } = req.query;

  try {
    let filter = {};
    if (location && location.trim() !== "") {
      filter.location = { $regex: location.trim(), $options: "i" };
    }

    const properties = await Property.find(filter);
    res.status(200).json(properties);
  } catch (err) {
    console.error("Error fetching properties:", err.message);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});

//----------------------------view property work--------------------

//----------------------------Delete--------------------------------
app.delete("/properties/:id", async (req, res) => {
  const { id } = req.params;
  console.log("Deleting property with ID:", id); // Log the ID being deleted
  try {
    const deletedProperty = await Property.findByIdAndDelete(id);
    if (!deletedProperty) {
      return res.status(404).send("Property not found");
    }
    res.status(200).send({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).send("Error deleting property");
  }
});
//----------------------------Delete End----------------------------

//---------------------------Date Time------------------------------
app.get("/system-date", (req, res) => {
  const currentDate = new Date(); // Get current system date
  res.status(200).json({ currentDate });
});
//--------------------------Date Time End---------------------------

//-------------------------------->Finnal update<--------------------------------
app.put("/properties/:id", async (req, res) => {
  try {
    const { id } = req.params; // Property ID from URL
    const updatedData = req.body; // Updated property data from the frontend

    // Make sure the ID is valid (ObjectId type)
    if (!ObjectId.isValid(id)) {
      return res.status(400).send("Invalid property ID");
    }

    // Update the property in the database
    const result = await Property.updateOne(
      { _id: new ObjectId(id) }, // Find property by ID
      { $set: updatedData } // Update with new data
    );

    if (result.modifiedCount === 0) {
      return res.status(404).send("Property not found or no changes made");
    }

    // Return the updated property
    const updatedProperty = await Property.findOne({ _id: new ObjectId(id) });
    res.status(200).json(updatedProperty);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});
//-------------------------------->update end<----------------------------

//--------------------------------Count Query------------------------

app.get("/properties/count", async (req, res) => {
  try {
    const count = await Property.countDocuments(); // Count the total number of properties
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error counting properties:", error);
    res.status(500).json({ message: "Server error" });
  }
});
//--------------------------------Count End------------------------

//-------------------------------UserBooking------------------------

app.post("/reviews", async (req, res) => {
  const { propertyId, reviewerName, rating, comment } = req.body;

  try {
    const newReview = new Review({ propertyId, reviewerName, rating, comment });
    await newReview.save();
    res.status(201).send("Review submitted successfully");
  } catch (error) {
    res.status(400).send("Error submitting review");
  }
});




// Add these routes to index.js

// Get all reviews with populated user and property details
app.get("/admin/reviews", async (req, res) => {
  try {
    const properties = await Property.find()
      .select('name location reviews')
      .populate('reviews.user', 'name email');
    
    // Flatten and format reviews from all properties
    const reviews = properties.flatMap(property => 
      property.reviews.map(review => ({
        ...review.toObject(),
        propertyName: property.name,
        propertyLocation: property.location,
        propertyId: property._id
      }))
    );

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// Delete a review
app.delete("/admin/reviews/:propertyId/:reviewId", async (req, res) => {
  try {
    const { propertyId, reviewId } = req.params;
    
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    property.reviews = property.reviews.filter(
      review => review._id.toString() !== reviewId
    );
    
    await property.save();
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Failed to delete review" });
  }
});


//-------------------------------UserBooking end------------------------

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
