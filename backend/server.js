const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize SQLite Database
const db = new sqlite3.Database('./cricket.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Initialize Tables
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS innings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          teamName TEXT,
          inningsType TEXT,
          opponentTeam TEXT,
          venue TEXT,
          matchDate TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS overs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          inningsId INTEGER,
          overNumber INTEGER,
          runs INTEGER,
          wickets INTEGER,
          cumulativeRuns INTEGER,
          cumulativeWickets INTEGER,
          status TEXT,
          FOREIGN KEY(inningsId) REFERENCES innings(id)
        )
      `);
    });
  }
});

// Root endpoint for deployment verification
app.get('/', (req, res) => {
  res.json({ status: 'success', message: 'Cricket Analytics Backend API is live!' });
});

// Basic route to test backend connectivity
app.get('/api/status', (req, res) => {
  res.json({ status: 'success', message: 'Cricket Analytics backend is running!' });
});

// Save new innings data
app.post('/api/innings', (req, res) => {
  const { matchInfo, oversData } = req.body;
  
  if (!matchInfo || !oversData || !Array.isArray(oversData)) {
    return res.status(400).json({ error: 'Invalid payload format' });
  }

  const { teamName, inningsType, opponentTeam, venue, matchDate } = matchInfo;

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    const stmtInnings = db.prepare(`
      INSERT INTO innings (teamName, inningsType, opponentTeam, venue, matchDate) 
      VALUES (?, ?, ?, ?, ?)
    `);

    stmtInnings.run([teamName, inningsType, opponentTeam, venue, matchDate], function(err) {
      if (err) {
        db.run("ROLLBACK");
        console.error("Error inserting innings", err);
        return res.status(500).json({ error: 'Failed to save innings' });
      }

      const inningsId = this.lastID;
      const stmtOvers = db.prepare(`
        INSERT INTO overs (inningsId, overNumber, runs, wickets, cumulativeRuns, cumulativeWickets, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      let hasError = false;
      for (let i = 0; i < oversData.length; i++) {
        const over = oversData[i];
        
        // If a row is completely empty/unplayed (no runs/wickets), we still save it with null/locked status or what the frontend sent.
        stmtOvers.run([
          inningsId, 
          over.overNumber, 
          over.runs !== "" ? parseInt(over.runs, 10) : null, 
          over.wickets !== "" ? parseInt(over.wickets, 10) : null, 
          over.cumulativeRuns, 
          over.cumulativeWickets, 
          over.status
        ], function(err2) {
          if (err2) {
            hasError = true;
          }
        });
      }

      stmtOvers.finalize((err3) => {
        if (hasError || err3) {
          db.run("ROLLBACK");
          console.error("Error inserting overs", err3);
          return res.status(500).json({ error: 'Failed to save overs' });
        } else {
          db.run("COMMIT");
          return res.json({ success: true, inningsId: inningsId, message: 'Data saved successfully' });
        }
      });
    });

    stmtInnings.finalize();
  });
});

app.get('/api/metadata', (req, res) => {
  db.serialize(() => {
    db.all(`
      SELECT DISTINCT teamName as name FROM innings
      UNION
      SELECT DISTINCT opponentTeam as name FROM innings
    `, (err, teams) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch teams' });
      }
      db.all(`SELECT DISTINCT venue as name FROM innings`, (err2, venues) => {
        if (err2) {
          return res.status(500).json({ error: 'Failed to fetch venues' });
        }
        res.json({
          teams: teams.map(t => t.name).filter(Boolean),
          venues: venues.map(v => v.name).filter(Boolean)
        });
      });
    });
  });
});

app.get('/api/innings-history', (req, res) => {
  db.serialize(() => {
    db.all(`SELECT * FROM innings ORDER BY id DESC`, (err, inningsList) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch innings' });
      }

      if (inningsList.length === 0) {
        return res.json([]);
      }

      // Fetch all overs for these innings
      const inningsIds = inningsList.map(i => i.id);
      const placeholders = inningsIds.map(() => '?').join(',');
      
      db.all(`SELECT * FROM overs WHERE inningsId IN (${placeholders}) ORDER BY inningsId, overNumber ASC`, inningsIds, (err2, oversList) => {
        if (err2) {
          return res.status(500).json({ error: 'Failed to fetch overs' });
        }

        // Group overs by inningsId
        const oversByInnings = {};
        oversList.forEach(o => {
          if (!oversByInnings[o.inningsId]) {
            oversByInnings[o.inningsId] = [];
          }
          oversByInnings[o.inningsId].push(o);
        });

        const fullData = inningsList.map(i => ({
          ...i,
          overs: oversByInnings[i.id] || []
        }));

        res.json(fullData);
      });
    });
  });
});

app.get('/api/innings/:id', (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM innings WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Innings not found' });
    
    db.all("SELECT * FROM overs WHERE inningsId = ? ORDER BY overNumber ASC", [id], (err2, overs) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ ...row, overs });
    });
  });
});

app.put('/api/innings/:id', (req, res) => {
  const id = req.params.id;
  const { matchInfo, oversData } = req.body;
  
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    
    const updateInningsSql = `
      UPDATE innings 
      SET teamName = ?, inningsType = ?, opponentTeam = ?, venue = ?, matchDate = ?
      WHERE id = ?
    `;
    db.run(updateInningsSql, [
      matchInfo.teamName, matchInfo.inningsType, matchInfo.opponentTeam, matchInfo.venue, matchInfo.matchDate, id
    ], function(err) {
      if (err) {
        db.run("ROLLBACK");
        return res.status(500).json({ error: 'Failed to update innings record' });
      }
      
      db.run("DELETE FROM overs WHERE inningsId = ?", [id], function(err2) {
        if (err2) {
          db.run("ROLLBACK");
          return res.status(500).json({ error: 'Failed to delete old overs' });
        }
        
        const stmt = db.prepare(`
          INSERT INTO overs (inningsId, overNumber, runs, wickets, cumulativeRuns, cumulativeWickets, status) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        let hasError = false;
        oversData.forEach(over => {
          stmt.run([
            id,
            over.overNumber,
            over.runs,
            over.wickets,
            over.cumulativeRuns,
            over.cumulativeWickets,
            over.status
          ], (err3) => {
            if (err3) hasError = true;
          });
        });
        
        stmt.finalize((err4) => {
          if (hasError || err4) {
            db.run("ROLLBACK");
            return res.status(500).json({ error: 'Failed to insert updated overs data' });
          }
          db.run("COMMIT");
          res.json({ success: true, message: 'Match data updated successfully' });
        });
      });
    });
  });
});

app.delete('/api/innings/:id', (req, res) => {
  const id = req.params.id;
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    db.run("DELETE FROM overs WHERE inningsId = ?", [id], function(err) {
      if (err) {
        db.run("ROLLBACK");
        return res.status(500).json({ error: 'Failed to delete overs' });
      }
      db.run("DELETE FROM innings WHERE id = ?", [id], function(err2) {
        if (err2) {
          db.run("ROLLBACK");
          return res.status(500).json({ error: 'Failed to delete innings' });
        }
        db.run("COMMIT");
        res.json({ success: true, message: 'Innings deleted successfully' });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
