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


app.get("/api/run-query", (req, res) => {
  console.log("Request received on /api/run-query with query ID:", req.query.id);

  const queryId = Number(req.query.id);
  console.log("Converted query ID:", queryId);

   
  if (isNaN(queryId) || queryId <= 0) {
      console.log("Invalid query ID received:", req.query.id);
      return res.status(400).json({ error: "Invalid query ID" });
    }

    const queries = {
      7: {
          name: "Complete Location Details",
          sql: `SELECT 
                  cl.name AS LocationName, 
                  cl.address, 
                  cl.city, 
                  cl.province, 
                  cl.postal_code, 
                  cl.phone_number, 
                  cl.web_address, 
                  cl.type, 
                  cl.capacity,
                  p.first_name AS ManagerFirstName, 
                  p.last_name AS ManagerLastName,
                  COUNT(cm.CMN) AS ClubMembersCount 
                FROM ClubLocation cl
                LEFT JOIN Personnel p ON cl.manager_id = p.personnel_id
                LEFT JOIN ClubMembers cm ON cl.location_id = cm.current_location_id
                GROUP BY cl.location_id, cl.name, cl.address, cl.city, cl.province, cl.postal_code, 
                         cl.phone_number, cl.web_address, cl.type, cl.capacity,
                         p.first_name, p.last_name
                ORDER BY cl.province, cl.city`
      },
      
      8: { 
          name: "Club Members with Family Details", 
          sql: `SELECT 
                  FM.first_name AS FamilyMemberFirstName, 
                  FM.last_name AS FamilyMemberLastName, 
                  FM.phone AS FamilyMemberPhone,
                  CM.first_name AS ClubMemberFirstName, 
                  CM.last_name AS ClubMemberLastName, 
                  CM.dob AS ClubMemberDOB, 
                  CM.ssn AS ClubMemberSSN, 
                  CM.medicare_card AS ClubMemberMedicareCard, 
                  CM.phone_number AS ClubMemberPhone, 
                  CM.address AS ClubMemberAddress, 
                  CM.city AS ClubMemberCity, 
                  CM.province AS ClubMemberProvince, 
                  CM.postal_code AS ClubMemberPostalCode,
                  SFM.first_name AS SecondaryFMFirstName,
                  SFM.last_name AS SecondaryFMLastName,
                  SFM.phone AS SecondaryFMPhone,
                  FMR.relationship AS RelationshipWithSecondaryFM
                FROM 
                  FamilyMember FM
                JOIN ClubMembers CM ON FM.family_member_id = CM.family_member_id
                LEFT JOIN FamilyMemberRelation FMR ON CM.CMN = FMR.CMN
                LEFT JOIN FamilyMember SFM ON FMR.family_member_id = SFM.family_member_id
                AND SFM.family_member_id != FM.family_member_id
                WHERE 
                  FM.family_member_id = 1;`
      },
      
      9: { 
          name: "Team Sessions with Player Details", 
          sql: `SELECT 
                  TF.teamName AS TeamName, 
                  TF.sessionTime AS StartTime, 
                  CL.address AS LocationAddress,
                  TF.sessionType AS SessionType, 
                  NULL AS Score,
                  COALESCE(P.first_name, '') AS CoachFirstName, 
                  COALESCE(P.last_name, '') AS CoachLastName,
                  PL.role AS PlayerRole, 
                  CM.first_name AS PlayerFirstName, 
                  CM.last_name AS PlayerLastName
                FROM 
                  TeamFormation TF
                  JOIN ClubLocation CL ON TF.location_id = CL.location_id
                  JOIN Player PL ON TF.teamID = PL.teamID
                  JOIN ClubMembers CM ON PL.CMN = CM.CMN
                  LEFT JOIN (
                      SELECT P.*, PA.location_id 
                      FROM Personnel P
                      JOIN PersonnelAssignment PA ON P.personnel_id = PA.personnel_id
                      WHERE P.roles = 'Coach'
                      AND (PA.end_date IS NULL OR PA.end_date >= CURDATE())
                  ) P ON TF.location_id = P.location_id
                WHERE 
                  TF.location_id = 1 
                  AND TF.sessionDate BETWEEN '2025-03-01' AND '2025-03-07'
                ORDER BY 
                  TF.sessionDate, 
                  TF.sessionTime;`
      },
      
      10: { 
          name: "Active Members in Multiple Locations", 
          sql: `SELECT CMN, first_name, last_name
                FROM ClubMembers
                WHERE state = 'active'
                GROUP BY CMN
                HAVING COUNT(DISTINCT current_location_id) >= 3
                ORDER BY CMN;`
      },
  
      11: { 
          name: "Locations with Multiple Game Sessions", 
          sql: `SELECT 
                  L.name AS LocationName,
                  COUNT(DISTINCT TF.teamID) AS TotalFormationSessions,
                  COUNT(DISTINCT CASE WHEN TF.sessionType = 'Game' THEN TF.teamID END) AS TotalGameSessions
                FROM 
                  TeamFormation TF
                  JOIN ClubLocation L ON TF.location_id = L.location_id
                WHERE 
                  TF.sessionDate BETWEEN '2025-01-01' AND '2025-03-31'
                GROUP BY 
                  L.name
                HAVING 
                  COUNT(DISTINCT CASE WHEN TF.sessionType = 'Game' THEN TF.teamID END) >= 2
                ORDER BY 
                  TotalGameSessions DESC;`
      },
  
      12: { 
          name: "Members Not on Any Team", 
          sql: `SELECT CM.CMN AS ClubMemberID, 
                  CM.first_name, 
                  CM.last_name, 
                  TIMESTAMPDIFF(YEAR, CM.dob, CURDATE()) AS age,
                  CM.phone_number, 
                  CM.address, 
                  CL.name AS current_location
                FROM ClubMembers CM
                  JOIN ClubLocation CL ON CM.current_location_id = CL.location_id
                  LEFT JOIN Player P ON CM.CMN = P.CMN
                WHERE CM.state = 'active' 
                  AND P.playerID IS NULL
                ORDER BY CL.name, CM.CMN;
                `
      },
  
      13: { 
          name: "Active Outside Hitters", 
          sql: `SELECT
                  CM.CMN AS ClubMemberID,
                  CM.first_name,
                  CM.last_name,
                  TIMESTAMPDIFF(YEAR, CM.dob, CURDATE()) AS age,
                  CM.phone_number,
                  CL.name AS current_location
                FROM ClubMembers CM
                JOIN ClubLocation CL ON CM.current_location_id = CL.location_id
                JOIN Player P ON CM.CMN = P.CMN
                WHERE CM.state = 'active'
                GROUP BY CM.CMN, CM.first_name, CM.last_name, CM.dob, CM.phone_number, CL.name
                HAVING COUNT(DISTINCT P.role) = 1
                   AND MAX(P.role) = 'Outside Hitter'
                ORDER BY CL.name, CM.CMN;`
      },
      
      14: { 
          name: "Players Who Played All Roles", 
          sql: `SELECT
                  CM.CMN AS ClubMemberID,
                  CM.first_name,
                  CM.last_name,
                  TIMESTAMPDIFF(YEAR, CM.dob, CURDATE()) AS age,
                  CM.phone_number,
                  CL.name AS current_location
                FROM ClubMembers CM
                JOIN ClubLocation CL ON CM.current_location_id = CL.location_id
                JOIN Player P ON CM.CMN = P.CMN
                JOIN TeamFormation TF ON P.teamID = TF.teamID
                WHERE CM.state = 'active'
                AND TF.sessionType = 'Game'
                  AND P.role IN (
                      'Outside Hitter', 'Opposite', 'Setter', 'Middle Blocker',
                      'Libero', 'Defensive Specialist', 'Serving Specialist'
                  )
                GROUP BY CM.CMN, CM.first_name, CM.last_name, CM.dob, CM.phone_number, CL.name
                HAVING COUNT(DISTINCT P.role) = 7
                ORDER BY CL.name, CM.CMN;`
      },
      
      15: { 
          name: "Family Members of Team Captains", 
          sql: `SELECT
                  FM.first_name AS FamilyMemberFirstName,
                  FM.last_name AS FamilyMemberLastName,
                  FM.phone AS FamilyMemberPhone
                FROM FamilyMember FM
                JOIN ClubMembers CM ON FM.family_member_id = CM.family_member_id
                JOIN Player P ON CM.CMN = P.CMN
                JOIN TeamFormation TF ON P.teamID = TF.teamID
                WHERE P.role = 'Captain'
                  AND CM.state = 'active'
                  AND TF.location_id = CM.current_location_id
                GROUP BY FM.family_member_id
                HAVING COUNT(DISTINCT TF.location_id) > 0;`
      },
  
      16: { 
          name: "Undefeated Players", 
          sql: `SELECT CM.CMN, CM.first_name, CM.last_name, CM.age, CM.phone_number, CM.email, 
                  CL.name AS current_location
                FROM 
                    ClubMembers CM
                JOIN 
                    ClubLocation CL ON CM.current_location_id = CL.location_id
                JOIN 
                    Player P ON CM.CMN = P.CMN
                JOIN 
                    TeamFormation TF ON P.teamID = TF.teamID
                WHERE 
                    TF.sessionType = 'Game'
                    AND CM.state = 'active'
                    AND NOT EXISTS (
                        SELECT 1 
                        FROM TeamFormation LosingGame
                        JOIN Player LosingPlayer ON LosingGame.teamID = LosingPlayer.teamID
                        WHERE LosingPlayer.CMN = CM.CMN
                        AND LosingGame.sessionType = 'Game'
                        AND EXISTS (
                            SELECT 1 
                            FROM TeamFormation Opponent 
                            WHERE Opponent.sessionDate = LosingGame.sessionDate 
                            AND Opponent.sessionTime = LosingGame.sessionTime
                            AND Opponent.teamID != LosingGame.teamID
                            AND Opponent.score > LosingGame.score
                        )
                    )
                GROUP BY 
                    CM.CMN
                ORDER BY 
                    CL.name, CM.CMN;`
      },
      
      17: { 
          name: "Treasurer Personnel History", 
          sql: `SELECT P.first_name, P.last_name, 
                   PA.start_date AS StartDateAsTreasurer,
                   PA.end_date AS EndDateAsTreasurer
                FROM Personnel P
                JOIN PersonnelAssignment PA ON P.personnel_id = PA.personnel_id
                WHERE P.roles = 'Treasurer'
                ORDER BY P.first_name, P.last_name, PA.start_date;`
      },
  
      18: { 
          name: "Inactive Adult Members", 
          sql: `SELECT
                  CM.first_name,
                  CM.last_name,
                  CM.phone_number,
                  CL.name AS last_location,
                  (
                      SELECT role
                      FROM Player
                      WHERE CMN = CM.CMN
                      ORDER BY playerID DESC
                      LIMIT 1
                  ) AS last_role
                FROM ClubMembers CM
                JOIN ClubLocation CL ON CM.current_location_id = CL.location_id
                WHERE CM.state = 'inactive'
                  AND TIMESTAMPDIFF(YEAR, CM.dob, CURDATE()) > 18
                ORDER BY
                    CL.name,
                    (
                        SELECT role
                        FROM Player
                        WHERE CMN = CM.CMN
                        ORDER BY playerID DESC
                        LIMIT 1
                    ),
                    CM.first_name,
                    CM.last_name;`
      }
  };
  
  
  if (!queries[queryId]) {
    console.log("Error reading the queries");
    return res.status(400).json({   
      error: `Invalid query ID: ${queryId}`,
      availableQueries: Object.keys(queries).map(id => ({ id: Number(id), name: queries[id].name }))
    });
  }
  const query = queries[queryId];
  
  console.log(`[${new Date().toISOString()}] Executing Query ${queryId}: ${query.name}`);

  db.query(query.sql, [], (err, results) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Query Failed:`, err);
      return res.status(500).json({ error: "Database query failed", details: err });
    }

    console.log(`[${new Date().toISOString()}] Query ${queryId} Successful: Returned ${results.length} rows`);
    res.json({ success: true, queryId: queryId, count: results.length, data: results });
  });
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

//------------For Queies res-------------------
app.get("/api/run-query", (req, res) => {
  const queryId = req.query.id;

  // Define your queries
  const queries = {
    1: "SELECT cl.name AS LocationName, cl.address, cl.city, cl.province, cl.postal_code, cl.phone_number, cl.web_address, cl.type, cl.capacity, p.first_name AS ManagerFirstName, p.last_name AS ManagerLastName, COUNT(cm.CMN) AS ClubMembersCount FROM ClubLocation cl LEFT JOIN Personnel p ON cl.manager_id = p.personnel_id LEFT JOIN ClubMembers cm ON cl.location_id = cm.current_location_id GROUP BY cl.location_id, cl.name, cl.address, cl.city, cl.province, cl.postal_code, cl.phone_number, cl.web_address, cl.type, cl.capacity, p.first_name, p.last_name ORDER BY cl.province, cl.city;",
    2: "SELECT * FROM ClubMembers",
    3: "SELECT * FROM Teams",
  };

  const sql = queries[queryId];
  if (!sql) return res.status(400).send("Invalid query ID");

  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err.message);
    res.json(results);
  });
});

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
app.get("/api/run-query", (req, res) => {
  console.log("Request received on /api/run-query with query ID:", req.query.id);

    // 先转换成数字
    const queryId = Number(req.query.id);
    console.log("Converted query ID:", queryId);

    // 确保 queryId 是有效的数字
    if (isNaN(queryId) || queryId <= 0) {
        console.log("Invalid query ID received:", req.query.id);
        return res.status(400).json({ error: "Invalid query ID" });
    }

  const queries = {
    7: {
      name: "Complete Location Details",
      sql: `SELECT 
              cl.name AS LocationName, 
              cl.address, 
              cl.city, 
              cl.province, 
              cl.postal_code, 
              cl.phone_number, 
              cl.web_address, 
              cl.type, 
              cl.capacity,
              p.first_name AS ManagerFirstName, 
              p.last_name AS ManagerLastName,
              COUNT(cm.CMN) AS ClubMembersCount 
            FROM ClubLocation cl
            LEFT JOIN Personnel p ON cl.manager_id = p.personnel_id
            LEFT JOIN ClubMembers cm ON cl.location_id = cm.current_location_id
            GROUP BY cl.location_id, cl.name, cl.address, cl.city, cl.province, cl.postal_code, 
                     cl.phone_number, cl.web_address, cl.type, cl.capacity,
                     p.first_name, p.last_name
            ORDER BY cl.province, cl.city`
    },
    8: { name: "Club Members List", sql: "SELECT * FROM ClubMembers" },
    9: { name: "Teams List", sql: "SELECT * FROM Teams" }
  };

  if (!queries[queryId]) {
    return res.status(400).json({
      error: `Invalid query ID: ${queryId}`,
      availableQueries: Object.keys(queries).map(id => ({ id: Number(id), name: queries[id].name }))
    });
  }

  const query = queries[queryId];
  console.log(`[${new Date().toISOString()}] Executing Query ${queryId}: ${query.name}`);

  db.query(query.sql, [], (err, results) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Query Failed:`, err);
      return res.status(500).json({ error: "Database query failed", details: err });
    }

    console.log(`[${new Date().toISOString()}] Query ${queryId} Successful: Returned ${results.length} rows`);
    res.json({ success: true, queryId: queryId, count: results.length, data: results });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
