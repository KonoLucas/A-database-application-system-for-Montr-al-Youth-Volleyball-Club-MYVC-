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


// For club-locations-------------------------------------------- 
app.get('/api/club-locations', (req, res) => {
  db.query('SELECT * FROM ClubLocation', (err, results) => {
      if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Database query failed" });
      }
      res.json(results);
      console.log(`Database table ClubLocation querry catched`);
  });
});


app.put('/api/club-locations/:location_id', (req, res) => {
  const location_id = req.params.location_id;
  const updateData = req.body;
  
  db.query('UPDATE ClubLocation SET ? WHERE location_id = ?', 
    [updateData, location_id], 
    (err, result) => {  
      if (err) {
        console.error("Update failed:", err);
        return res.status(500).json({ error: err.message }); 
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "No record found" });
      }
      res.json({ 
        message: "Update successful",
        affectedRows: result.affectedRows 
      });
    }
  );
});

app.delete('/api/club-locations/:location_id', (req, res) => {
  const location_id = req.params.location_id;
  
  db.query('DELETE FROM ClubLocation WHERE location_id = ?', 
    [location_id], 
    (err, result) => {  
      if (err) {
        console.error("Delete failed:", err);
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "No record found" });
      }
      res.json({ 
        message: "Delete successful",
        affectedRows: result.affectedRows 
      });
    }
  );
});

app.post('/api/club-locations', (req, res) => {
  const newData = req.body;
  
  db.query('INSERT INTO ClubLocation SET ?', newData, (err, result) => {
    if (err) {
      console.error("Create failed:", err);
      return res.status(500).json({ 
        error: err.sqlMessage || "Database error" 
      });
    }
    
    res.status(201).json({
      message: "Location created successfully",
      insertId: result.insertId 
    });
  });
});

//------------End of club-locations--------------------------------------------

app.get('/api/club-Member', (req, res) => {
  db.query('SELECT * FROM ClubMembers', (err, results) => {
      if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Database query failed" });
      }
      res.json(results);
      console.log(`Database table ClubMember querry catched`);
  });
});

app.get('/api/Family_Member_Relation', (req, res)=> {
  db.query('SELECT * FROM Family_Member_Relation', (err, results) => {
    if(err){
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
    console.log(`Database table Family_Member_Relation querry catched`);
    });
  });

  app.get('/api/FamilyMember', (req, res)=> {
    db.query('SELECT * FROM FamilyMember', (err, results) => {
      if(err){
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database query failed" });
      }
      res.json(results);
      console.log(`Database table Family_Member_Relation querry catched`);
      });
    });


// Route to serve the index page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html")); // Serve the index.html file from the 'public' folder
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
