// server.js

const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
  host: "irc353.encs.concordia.ca", // Hostname from your screenshot
  user: "irc353_4", // MySQL Username
  password: "353getA+", // MySQL Password
  database: "irc353_4", // Default schema (your database name)
  port: 3306, // Default MySQL Port
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err.stack);
    return;
  }
  console.log("Connected to the MySQL database");
});

// CRUD for Locations
// Create a new location
app.post("/locations", (req, res) => {
  const {
    name,
    type,
    address,
    city,
    province,
    postal_code,
    phone_number,
    web_address,
    capacity,
    manager_name,
    manager_id,
    number_members,
  } = req.body;
  const query =
    "INSERT INTO ClubLocation (name, type, address, city, province, postal_code, phone_number, web_address, capacity, manager_name, manager_id, number_members) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(
    query,
    [
      name,
      type,
      address,
      city,
      province,
      postal_code,
      phone_number,
      web_address,
      capacity,
      manager_name,
      manager_id,
      number_members,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Location created successfully!" });
    }
  );
});

// Get all locations
app.get("/locations", (req, res) => {
  const query = "SELECT * FROM ClubLocation";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
});

// Update a location
app.put("/locations/:id", (req, res) => {
  const { id } = req.params;
  const {
    name,
    type,
    address,
    city,
    province,
    postal_code,
    phone_number,
    web_address,
    capacity,
    manager_name,
    manager_id,
    number_members,
  } = req.body;
  const query =
    "UPDATE ClubLocation SET name = ?, type = ?, address = ?, city = ?, province = ?, postal_code = ?, phone_number = ?, web_address = ?, capacity = ?, manager_name = ?, manager_id = ?, number_members = ? WHERE location_id = ?";
  db.query(
    query,
    [
      name,
      type,
      address,
      city,
      province,
      postal_code,
      phone_number,
      web_address,
      capacity,
      manager_name,
      manager_id,
      number_members,
      id,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json({ message: "Location updated successfully!" });
    }
  );
});

// Delete a location
app.delete("/locations/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM ClubLocation WHERE location_id = ?";
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: "Location deleted successfully!" });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
