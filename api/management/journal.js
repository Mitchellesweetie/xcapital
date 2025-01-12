const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

dotenv.config();
const pool = mysql.createPool({
    connectionLimit: 10, // Adjust based on your app's load
    host: process.env.host,
    user: process.env.username,
    password: process.env.password,
    database: process.env.database
  });
  
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection:', err);
    } else {
        console.log('pool connection')
    }
  });


// function to get jornal counts
const getjornalCounts = (callback) => {
    const countsQuery = `
        SELECT 
            (SELECT COUNT(*) FROM e-jornal) AS totaljornals,
            (SELECT COUNT(ID) FROM e_jornal WHERE status='pending') AS pendingjornals,
            (SELECT COUNT(ID) FROM e-jornal WHERE status='approved') AS approvedjornals;
    `;
    db.query(countsQuery, (err, results) => {
        if (err) {
            console.error('Error fetching jornal counts:', err);
            return callback(err, null);
        }
        console.log('jornal counts:', results[0]); 
        return callback(null, results[0]);
    });
};


// Insert new jornal post
router.post('/post', upload.single('file'), (req, res) => {
    const filePath = req.file ? `/uploads/images/${req.file.filename}` : null
    const { title, message } = req.body;
    const data = { file: filePath, title, message }; // Store the correct file path in the database

    getjornalCounts((err, counts) => {
        if (err) {
            return res.render('pendingjornals', { successMessage: null, errorMessage: 'Error fetching jornal counts', jornals: [] });
        }

        db.query('INSERT INTO e-jornal SET ?', data, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.render('e-jornal', { successMessage: null, errorMessage: 'Error occurred during submission.' });
            }

            res.render('index', {
                successMessage: 'e-jornal created successfully!',
                errorMessage: null,
                totaljornals: counts.totaljornals || 0,
                pendingjornals: counts.pendingjornals || 0,
                approvedjornals: counts.approvedjornals || 0,
            });
        });
    });
});

// Get pending jornals
router.get('/pendingjornals', (req, res) => {
    getjornalCounts((err, counts) => {
        if (err) {
            return res.render('pendingjornals', { successMessage: null, errorMessage: 'Error fetching jornal counts', jornals: [] });
        }

        db.query('SELECT * FROM e-jornal ORDER BY create_at DESC', (err, jornals) => {
            if (err) {
                console.error('Error fetching jornals:', err);
                return res.render('pendingjornals', { successMessage: null, errorMessage: 'Error fetching jornals', jornals: [] });
            }

            // Process jornals to add truncated and full content
            const jornalsWithFullContent = jornals.map(jornal => {
                const truncatedContent = jornal.message.slice(0, 500); // Truncate message to 50 characters
                return {
                    ...jornal,
                    isFullContent: false, // Initially show truncated content
                    truncatedContent: truncatedContent, // Truncated message for initial display
                    fullContent: jornal.message, // Full content for later display
                };
            });

            // Render the template with the modified jornal data
            res.render('pendingjornals', {
                jornals: jornalsWithFullContent, // Pass the jornals data with full and truncated content
                totaljornals: counts.totaljornals || 0,
                pendingjornals: counts.pendingjornals || 0,
                approvedjornals: counts.approvedjornals || 0,
                successMessage: null,
                errorMessage: null
            });
        });
    });
});



// Get specific jornal by ID
router.get('/pendingjornals/:id', (req, res) => {
    const jornalId = req.params.id;
    getjornalCounts((err, counts) => {
        if (err) {
            return res.render('pendingjornals', { successMessage: null, errorMessage: 'Error fetching jornal counts', jornals: [] });
        }

        db.query('SELECT * FROM e-jornal WHERE id = ?', [jornalId], (err, jornal) => {
            if (err) {
                console.error('Error fetching jornal:', err);
                return res.render('pendingjornals', { successMessage: null, errorMessage: 'Error fetching jornal', jornals: [] });
            }

            if (jornal.length > 0) {
                return res.render('pendingeditview', {
                    jornal: jornal[0],
                    successMessage: null,
                    errorMessage: null
                });
            }

            res.render('pendingjornals', {
                successMessage: null,
                errorMessage: 'No jornal found',
                jornals: [],
                totalJornals: counts.totaljornals || 0,
                pendingjornals: counts.pendingjornals || 0,
                approvedjornals: counts.approvedjornals || 0,
            });
        });
    });
});

// Update the jornal
router.post('/update/:id', (req, res) => {
    const jornalId = req.params.id
    const data = req.body

   
        getjornalCounts((err, counts) => {
        if (err) {
            return res.render('pendingjornals', { successMessage: null, errorMessage: 'Error fetching jornal counts', jornals: [] });
        }
        db.query('UPDATE e-jornal SET ? WHERE id = ?', [data,jornalId], (err, result) => {
            if (err) {
                console.error('Error approving jornal:', err);
                return res.redirect('/')
            }
     
        
            db.query('SELECT * FROM e-jornal WHERE status = "pending" ORDER BY create_at DESC', (err, jornals) => {
                if (err) {
                    console.error('Error fetching jornals:', err);
                    return res.render('pendingjornals', { successMessage: null, errorMessage: 'Error fetching jornals', jornals: [] });
                }
                
                res.render('index', { 
                    jornals,
                    successMessage: 'jornal Updated Successfully', 
                    errorMessage: null,
                    totaljornals: counts.totaljornals || 0,
                    pendingjornals: counts.pendingjornals || 0,
                    approvedjornals: counts.approvedjornals || 0,
                });
            });
        });
        
    });
});

// Get all approved jornals
router.get('/approvedjornals', (req, res) => {
    getjornalCounts((err, counts) => {
        if (err) {
            return res.render('approvedjornals', { successMessage: null, errorMessage: 'Error fetching jornal counts', jornals: [] });
        }

        db.query('SELECT * FROM e-jornal WHERE status="approved" ORDER BY create_at DESC', (err, jornals) => {
            if (err) {
                console.error('Error fetching approved jornals:', err);
                return res.render('approvedjornals', { successMessage: null, errorMessage: 'Error fetching approved jornals', jornals: [] });
            }
            const jornalsWithFullContent = jornals.map(jornal => {
                const truncatedContent = jornal.message.slice(0, 50); // Truncate message to 10 characters
                return {
                    ...jornal,
                    isFullContent: false, // Initially show truncated content
                    truncatedContent: truncatedContent, // Truncated message for initial display
                    fullContent: jornal.message, // Full content for later display
                };
            });
            res.render('approvedjornals', {
                jornals: jornalsWithFullContent,
                totaljornals: counts.totaljornals || 0,
                pendingjornals: counts.pendingjornals || 0,
                approvedjornals: counts.approvedjornals || 0,
                successMessage: null,
                errorMessage: null
            });
        });
        
    });
});

// Approve jornal
router.post('/approve/:id', (req, res) => {
    const id = req.params.id;

    db.query('UPDATE e-jornal SET status = ? WHERE id = ?', ['approved', id], (err, result) => {
        if (err) {
            console.error('Error approving jornal:', err);
            return res.render('index', { successMessage: null, errorMessage: 'Error approving the jornal', jornals: [] });
        }

        if (result.affectedRows > 0) {
            getjornalCounts((err, counts) => {
                if (err) {
                    return res.render('index', { successMessage: null, errorMessage: 'Error fetching jornal counts', jornals: [] });
                }

                db.query('SELECT * FROM e-jornal WHERE status = "pending"', (err, jornals) => {
                    if (err) {
                        console.error('Error fetching pending jornals:', err);
                        return res.render('pendingjornals', { successMessage: null, errorMessage: 'Error fetching pending jornals', jornals: [] });
                    }

                    res.render('pendingjornals', {
                        successMessage: 'jornal Approved',
                        errorMessage: null,
                        jornals,
                        totaljornals: counts.totaljornals || 0,
                        pendingjornals: counts.pendingjornals || 0,
                        approvedjornals: counts.approvedjornals || 0,
                    });
                });
            });
        } else {
            res.render('pendingjornals', {
                successMessage: null,
                errorMessage: 'Error while approving the jornal',
                jornals: [],
                totaljornals: 0,
                pendingjornals: 0,
                approvedjornals: 0
            });
        }
    });
});

module.exports = router;
