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
app.get("/api/club-locations", (req, res) => {
  db.query("SELECT * FROM ClubLocation", (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
    console.log(`Database table ClubLocation querry catched`);
  });
});

app.put("/api/club-locations/:location_id", (req, res) => {
  const location_id = req.params.location_id;
  const updateData = req.body;

  db.query(
    "UPDATE ClubLocation SET ? WHERE location_id = ?",
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
        affectedRows: result.affectedRows,
      });
    }
  );
});

app.delete("/api/club-locations/:location_id", (req, res) => {
  const location_id = req.params.location_id;

  db.query(
    "DELETE FROM ClubLocation WHERE location_id = ?",
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
        affectedRows: result.affectedRows,
      });
    }
  );
});

app.post("/api/club-locations", (req, res) => {
  const newData = req.body;

  db.query("INSERT INTO ClubLocation SET ?", newData, (err, result) => {
    if (err) {
      console.error("Create failed:", err);
      return res.status(500).json({
        error: err.sqlMessage || "Database error",
      });
    }

    res.status(201).json({
      message: "Location created successfully",
      insertId: result.insertId,
    });
  });
});

//------------End of club-locations--------------------------------------------

//----------------------------------------Beginning of club-member---------------------------------------//
// Get all club members
app.get("/api/club-members", (req, res) => {
  db.query("SELECT * FROM ClubMembers", (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
    console.log(`Database table ClubMembers query executed`);
  });
});

// Update a club member
app.put("/api/club-members/:CMN", (req, res) => {
  const CMN = req.params.CMN;
  const updateData = req.body;

  db.query(
    "UPDATE ClubMembers SET ? WHERE CMN = ?",
    [updateData, CMN],
    (err, result) => {
      if (err) {
        console.error("Update failed:", err);
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "No record found" });
      }
      res.json({
        message: "Club Member updated successfully",
        affectedRows: result.affectedRows,
      });
    }
  );
});

// Delete a club member
app.delete("/api/club-members/:CMN", (req, res) => {
  const CMN = req.params.CMN;

  db.query("DELETE FROM ClubMembers WHERE CMN = ?", [CMN], (err, result) => {
    if (err) {
      console.error("Delete failed:", err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "No record found" });
    }
    res.json({
      message: "Club Member deleted successfully",
      affectedRows: result.affectedRows,
    });
  });
});

// Create a new club member
app.post("/api/club-members", (req, res) => {
  const newData = req.body;

  db.query("INSERT INTO ClubMembers SET ?", newData, (err, result) => {
    if (err) {
      console.error("Create failed:", err);
      return res.status(500).json({
        error: err.sqlMessage || "Database error",
      });
    }

    res.status(201).json({
      message: "Club Member created successfully",
      insertId: result.insertId,
    });
  });
});
//----------------------------------------End of club-member---------------------------------------//

//----------------------------------------Beginning of family-member---------------------------------------//
// Get all family members
app.get("/api/family-members", (req, res) => {
  db.query("SELECT * FROM FamilyMember", (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
    console.log(`Database table FamilyMember query executed`);
  });
});

// Update a family member
app.put("/api/family-members/:family_member_id", (req, res) => {
  const family_member_id = req.params.family_member_id;
  const updateData = req.body;

  db.query(
    "UPDATE FamilyMember SET ? WHERE family_member_id = ?",
    [updateData, family_member_id],
    (err, result) => {
      if (err) {
        console.error("Update failed:", err);
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "No record found" });
      }
      res.json({
        message: "Family Member updated successfully",
        affectedRows: result.affectedRows,
      });
    }
  );
});

// Delete a family member
app.delete("/api/family-members/:family_member_id", (req, res) => {
  const family_member_id = req.params.family_member_id;

  db.query(
    "DELETE FROM FamilyMember WHERE family_member_id = ?",
    [family_member_id],
    (err, result) => {
      if (err) {
        console.error("Delete failed:", err);
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "No record found" });
      }
      res.json({
        message: "Family Member deleted successfully",
        affectedRows: result.affectedRows,
      });
    }
  );
});

// Create a new family member
app.post("/api/family-members", (req, res) => {
  const newData = req.body;

  db.query("INSERT INTO FamilyMember SET ?", newData, (err, result) => {
    if (err) {
      console.error("Create failed:", err);
      return res.status(500).json({
        error: err.sqlMessage || "Database error",
      });
    }

    res.status(201).json({
      message: "Family Member created successfully",
      insertId: result.insertId,
    });
  });
});

//----------------------------------------End of family-member---------------------------------------//

//----------------------------------------Beginning of personnel---------------------------------------//
// Get all personnel
app.get("/api/personnel", (req, res) => {
  db.query("SELECT * FROM Personnel", (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
    console.log(`Database table Personnel query executed`);
  });
});

// Update a personnel record
app.put("/api/personnel/:personnel_id", (req, res) => {
  const personnel_id = req.params.personnel_id;
  const updateData = req.body;

  db.query(
    "UPDATE Personnel SET ? WHERE personnel_id = ?",
    [updateData, personnel_id],
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
        affectedRows: result.affectedRows,
      });
    }
  );
});

// Delete a personnel record
app.delete("/api/personnel/:personnel_id", (req, res) => {
  const personnel_id = req.params.personnel_id;

  db.query(
    "DELETE FROM Personnel WHERE personnel_id = ?",
    [personnel_id],
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
        affectedRows: result.affectedRows,
      });
    }
  );
});

// Create new personnel
app.post("/api/personnel", (req, res) => {
  const newData = req.body;

  db.query("INSERT INTO Personnel SET ?", newData, (err, result) => {
    if (err) {
      console.error("Create failed:", err);
      return res.status(500).json({
        error: err.sqlMessage || "Database error",
      });
    }

    res.status(201).json({
      message: "Personnel created successfully",
      insertId: result.insertId,
    });
  });
});
//----------------------------------------End of personnel---------------------------------------//

//----------------------------------------Beginning of Payments---------------------------------------//
// Get all payments
app.get("/api/payments", (req, res) => {
  db.query("SELECT * FROM Payment", (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
    console.log(`Database table Payment query executed`);
  });
});

// Update a payment record
app.put("/api/payments/:payment_id", (req, res) => {
  const payment_id = req.params.payment_id;
  const updateData = req.body;

  db.query(
    "UPDATE Payment SET ? WHERE payment_id = ?",
    [updateData, payment_id],
    (err, result) => {
      if (err) {
        console.error("Update failed:", err);
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "No record found" });
      }
      res.json({
        message: "Payment updated successfully",
        affectedRows: result.affectedRows,
      });
    }
  );
});

// Delete a payment record
app.delete("/api/payments/:payment_id", (req, res) => {
  const payment_id = req.params.payment_id;

  db.query(
    "DELETE FROM Payment WHERE payment_id = ?",
    [payment_id],
    (err, result) => {
      if (err) {
        console.error("Delete failed:", err);
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "No record found" });
      }
      res.json({
        message: "Payment deleted successfully",
        affectedRows: result.affectedRows,
      });
    }
  );
});

// Create a new payment
app.post("/api/payments", (req, res) => {
  const newData = req.body;

  db.query("INSERT INTO Payment SET ?", newData, (err, result) => {
    if (err) {
      console.error("Create failed:", err);
      return res.status(500).json({
        error: err.sqlMessage || "Database error",
      });
    }

    res.status(201).json({
      message: "Payment created successfully",
      insertId: result.insertId,
    });
  });
});
//----------------------------------------End of Payments---------------------------------------//

//----------------------------------------Beginning of team---------------------------------------//
// Get all teams
app.get("/api/teams", (req, res) => {
  db.query("SELECT * FROM TeamFormation", (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
    console.log(`Database table TeamFormation query executed`);
  });
});

// Update a team record
app.put("/api/teams/:teamID", (req, res) => {
  const teamID = req.params.teamID;
  const updateData = req.body;

  db.query(
    "UPDATE TeamFormation SET ? WHERE teamID = ?",
    [updateData, teamID],
    (err, result) => {
      if (err) {
        console.error("Update failed:", err);
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "No record found" });
      }
      res.json({
        message: "Team updated successfully",
        affectedRows: result.affectedRows,
      });
    }
  );
});

// Delete a team record
app.delete("/api/teams/:teamID", (req, res) => {
  const teamID = req.params.teamID;

  db.query(
    "DELETE FROM TeamFormation WHERE teamID = ?",
    [teamID],
    (err, result) => {
      if (err) {
        console.error("Delete failed:", err);
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "No record found" });
      }
      res.json({
        message: "Team deleted successfully",
        affectedRows: result.affectedRows,
      });
    }
  );
});

// Create a new team
app.post("/api/teams", (req, res) => {
  const newData = req.body;

  db.query("INSERT INTO TeamFormation SET ?", newData, (err, result) => {
    if (err) {
      console.error("Create failed:", err);
      return res.status(500).json({
        error: err.sqlMessage || "Database error",
      });
    }

    res.status(201).json({
      message: "Team created successfully",
      insertId: result.insertId,
    });
  });
});

//----------------------------------------End of team---------------------------------------//

//--------------------------------------Beginning of player------------------------------------//
// Get all players
app.get("/api/players", (req, res) => {
  db.query("SELECT * FROM Player", (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
    console.log(`Database table Player query executed`);
  });
});

// Update a player record
app.put("/api/players/:playerID", (req, res) => {
  const playerID = req.params.playerID;
  const updateData = req.body;

  db.query(
    "UPDATE Player SET ? WHERE playerID = ?",
    [updateData, playerID],
    (err, result) => {
      if (err) {
        console.error("Update failed:", err);
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "No record found" });
      }
      res.json({
        message: "Player updated successfully",
        affectedRows: result.affectedRows,
      });
    }
  );
});

// Delete a player record
app.delete("/api/players/:playerID", (req, res) => {
  const playerID = req.params.playerID;

  db.query(
    "DELETE FROM Player WHERE playerID = ?",
    [playerID],
    (err, result) => {
      if (err) {
        console.error("Delete failed:", err);
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "No record found" });
      }
      res.json({
        message: "Player deleted successfully",
        affectedRows: result.affectedRows,
      });
    }
  );
});

// Create a new player
app.post("/api/players", (req, res) => {
  const newData = req.body;

  db.query("INSERT INTO Player SET ?", newData, (err, result) => {
    if (err) {
      console.error("Create failed:", err);
      return res.status(500).json({
        error: err.sqlMessage || "Database error",
      });
    }

    res.status(201).json({
      message: "Player created successfully",
      insertId: result.insertId,
    });
  });
});
//----------------------------------------End of player---------------------------------------//

//----------------------------------------Beginning of email-log---------------------------------//
// Get all email logs
app.get("/api/email-logs", (req, res) => {
  db.query("SELECT * FROM EmailLog", (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
    console.log(`Database table EmailLog query executed`);
  });
});

// Update an email log record
app.put("/api/email-logs/:emailID", (req, res) => {
  const emailID = req.params.emailID;
  const updateData = req.body;

  db.query(
    "UPDATE EmailLog SET ? WHERE emailID = ?",
    [updateData, emailID],
    (err, result) => {
      if (err) {
        console.error("Update failed:", err);
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "No record found" });
      }
      res.json({
        message: "Email Log updated successfully",
        affectedRows: result.affectedRows,
      });
    }
  );
});

// Delete an email log record
app.delete("/api/email-logs/:emailID", (req, res) => {
  const emailID = req.params.emailID;

  db.query(
    "DELETE FROM EmailLog WHERE emailID = ?",
    [emailID],
    (err, result) => {
      if (err) {
        console.error("Delete failed:", err);
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "No record found" });
      }
      res.json({
        message: "Email Log deleted successfully",
        affectedRows: result.affectedRows,
      });
    }
  );
});

// Create a new email log
app.post("/api/email-logs", (req, res) => {
  const newData = req.body;

  db.query("INSERT INTO EmailLog SET ?", newData, (err, result) => {
    if (err) {
      console.error("Create failed:", err);
      return res.status(500).json({
        error: err.sqlMessage || "Database error",
      });
    }

    res.status(201).json({
      message: "Email Log created successfully",
      insertId: result.insertId,
    });
  });
});
//----------------------------------------End of email-log---------------------------------------//
// Route to serve the index page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html")); // Serve the index.html file from the 'public' folder
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
