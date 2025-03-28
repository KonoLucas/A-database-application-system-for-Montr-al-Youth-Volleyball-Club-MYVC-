// server.js

const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path"); // Import the path module

const app = express();
const port = 3000;

// Middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files (like index.html, CSS, etc.)
app.use(express.static(path.join(__dirname, "public"))); // Make the 'public' folder public

// MySQL Database Connection
const db = mysql.createConnection({
  host: "irc353.encs.concordia.ca",
  user: "irc353_4",
  password: "353getA+",
  database: "irc353_4",
  port: 3306,
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err.stack);
    return;
  }
  console.log("Connected to the MySQL database");
});

// Route to serve the index page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html")); // Serve the index.html file from the 'public' folder
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
