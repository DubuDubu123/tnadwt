const db = require('../db'); // Make sure the path to the database file is correct

// Get User Details
exports.getUserDetails = (req, res) => {
  const userId = req.body.userId;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const query = 'SELECT * FROM users WHERE id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch user data', error: err });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(results[0]);
  });
};

// Get Police Division Details
exports.getPoliceDivisionDetails = (req, res) => {
  const district = req.query.district;
  if (!district) {
    return res.status(400).json({ message: 'District is required' });
  }

  const query = 'SELECT * FROM police_division WHERE district_division_name = ?';
  db.query(query, [district], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch police division data', error: err });
    }
    res.json(results);
  });
};

// Save a new FIR (Draft or Full Submission)
exports.saveFir = (req, res) => {
  const firData = req.body;
  const {
    policeCity,
    policeZone,
    policeRange,
    revenueDistrict,
    alphabetSelection,
    stationNumber,
    stationName,
    status, // 0 for draft, 1 for full submission
    investigatingOfficers
  } = firData;

  const policeStation = `${alphabetSelection}-${stationNumber}-${stationName}`;

  const query = `
    INSERT INTO fir 
    (police_city, police_zone, police_range, revenue_district, police_station, status, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, NOW())`;

  const values = [policeCity, policeZone, policeRange, revenueDistrict, policeStation, status];

  db.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to save FIR', error: err });
    }

    const fir_id = result.insertId; // Get the generated FIR ID

    // If there are investigating officers, save them
    if (investigatingOfficers && investigatingOfficers.length > 0) {
      const officerQueries = investigatingOfficers.map((officer) => {
        return new Promise((resolve, reject) => {
          const officerQuery = `
            INSERT INTO investigating_officers (fir_id, officer_name, designation, phone_number) 
            VALUES (?, ?, ?, ?)`;
          const officerValues = [fir_id, officer.name, officer.designation, officer.phone];

          db.query(officerQuery, officerValues, (officerErr) => {
            if (officerErr) {
              return reject(officerErr);
            }
            resolve();
          });
        });
      });

      // Wait for all officers to be saved
      Promise.all(officerQueries)
        .then(() => {
          res.status(200).json({ message: 'FIR and Officers saved successfully', fir_id });
        })
        .catch((officerErr) => {
          return res.status(500).json({ message: 'Failed to save one or more officers', error: officerErr });
        });
    } else {
      // No officers to save
      res.status(200).json({ message: 'FIR saved successfully without officers', fir_id });
    }
  });
};






// Get FIR by ID
exports.getFirById = (req, res) => {
  const firId = req.params.id;

  const query = 'SELECT * FROM fir WHERE fir_id = ?';

  db.query(query, [firId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch FIR data', error: err });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'FIR not found' });
    }
    res.json(results[0]);
  });
};




// Fetch all Offence Names
exports.getAllOffences = (req, res) => {
  const query = 'SELECT offence_name FROM offence';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch offences', error: err });
    }
    res.json(results);
  });
};

// Fetch all Offence Act Names
exports.getAllOffenceActs = (req, res) => {
  const query = 'SELECT offence_act_name FROM offence_acts';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch offence acts', error: err });
    }
    res.json(results);
  });
};

// Fetch all Caste Names (SC/ST Sections)
exports.getAllCastes = (req, res) => {
  const query = 'SELECT caste_name FROM caste_community';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch caste names', error: err });
    }
    res.json(results);
  });
};

exports.getAllRevenues = (req, res) => {
  const query = 'SELECT revenue_district_name FROM district_revenue';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch revenue districts', error: err });
    }
    res.json(results);
  });
};

