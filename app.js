// app.js
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// MySQL Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Your DB username
  password: "", // Your DB password
  database: "club_db", // Your database name
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to the database");
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes

// Get all ClubMembers
app.get("/members", (req, res) => {
  db.query("SELECT * FROM ClubMembers", (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Create a new ClubMember
app.post("/members", (req, res) => {
  const { first_name, last_name, dob, family_member_id, current_location_id } =
    req.body;
  const query =
    "INSERT INTO ClubMembers (first_name, last_name, dob, family_member_id, current_location_id) VALUES (?, ?, ?, ?, ?)";
  db.query(
    query,
    [first_name, last_name, dob, family_member_id, current_location_id],
    (err, result) => {
      if (err) throw err;
      res.json({ message: "New ClubMember added", id: result.insertId });
    }
  );
});

// Update a ClubMember's details
app.put("/members/:id", (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, dob } = req.body;
  const query =
    "UPDATE ClubMembers SET first_name = ?, last_name = ?, dob = ? WHERE CMN = ?";
  db.query(query, [first_name, last_name, dob, id], (err, result) => {
    if (err) throw err;
    res.json({ message: "ClubMember updated", id });
  });
});

// Delete a ClubMember
app.delete("/members/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM ClubMembers WHERE CMN = ?";
  db.query(query, [id], (err, result) => {
    if (err) throw err;
    res.json({ message: "ClubMember deleted", id });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
