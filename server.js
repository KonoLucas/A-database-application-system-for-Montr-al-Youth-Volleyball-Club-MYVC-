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



//------------For Queies res-------------------
app.get('/api/run-query', (req, res) => {
  const queryId = req.query.id;
  
  // Define your queries
  const queries = {
      1: "SELECT cl.name AS LocationName, cl.address, cl.city, cl.province, cl.postal_code, cl.phone_number, cl.web_address, cl.type, cl.capacity, p.first_name AS ManagerFirstName, p.last_name AS ManagerLastName, COUNT(cm.CMN) AS ClubMembersCount FROM ClubLocation cl LEFT JOIN Personnel p ON cl.manager_id = p.personnel_id LEFT JOIN ClubMembers cm ON cl.location_id = cm.current_location_id GROUP BY cl.location_id, cl.name, cl.address, cl.city, cl.province, cl.postal_code, cl.phone_number, cl.web_address, cl.type, cl.capacity, p.first_name, p.last_name ORDER BY cl.province, cl.city;",
      2: "SELECT * FROM ClubMembers",
      3: "SELECT * FROM Teams"
  };
  
  const sql = queries[queryId];
  if (!sql) return res.status(400).send("Invalid query ID");
  
  db.query(sql, (err, results) => {
      if (err) return res.status(500).send(err.message);
      res.json(results);
  });
});




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
