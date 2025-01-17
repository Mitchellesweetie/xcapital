const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const dotenv = require('dotenv');
const puppeteer = require('puppeteer');
const path=require('path')


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


function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return next(); 
    }
    res.redirect('/login_blog'); 
}



//download
async function getPersonal(userId) {
    return new Promise((resolve, reject) => {
        connection.query(
            'SELECT * FROM personal_details WHERE user_id = ? ORDER BY end_date DESC',
            [userId],
            (error, results) => {
                if (error) reject(error);
                resolve(results[0]);            }
        );
    });
}

async function getSkills(userId) {
    return new Promise((resolve, reject) => {
        connection.query(
            'SELECT * FROM skills WHERE user_id = ? ',
            [userId],
            (error, results) => {
                if (error) reject(error);
                resolve(results[0]);            }
        );
    });
}

async function getAwards(userId) {
    return new Promise((resolve, reject) => {
        connection.query(
            'SELECT * FROM awards WHERE user_id = ?',
            [userId],
            (error, results) => {
                if (error) reject(error);
                resolve(results[0]);            }
        );
    });
}
async function getEducation(userId) {
    return new Promise((resolve, reject) => {
        connection.query(
            'SELECT * FROM education WHERE user_id = ? ORDER BY end_date DESC',
            [userId],
            (error, results) => {
                if (error) reject(error);
                resolve(results[0]);            }
        );
    });
}

async function getLanguages(userId) {
    return new Promise((resolve, reject) => {
        connection.query(
            'SELECT * FROM languages WHERE user_id = ?',
            [userId],
            (error, results) => {
                if (error) reject(error);
                resolve(results[0]);            }
        );
    });
}


async function getExperience(userId) {
    return new Promise((resolve, reject) => {
        connection.query(
            'SELECT * FROM experience WHERE user_id = ? ORDER BY end DESC',
            [userId],
            (error, results) => {
                if (error) reject(error);
                resolve(results[0]);            }
        );
    });
}

async function getReferences(userId) {
    return new Promise((resolve, reject) => {
        connection.query(
            'SELECT * FROM references WHERE user_id = ?',
            [userId],
            (error, results) => {
                if (error) reject(error);
                resolve(results[0]);            }
        );
    });
}


router.get('/download-cv', isAuthenticated,async (req, res) => {
    const userId=req.session.userId
    if (!userId) {
        return res.redirect('/login_blog');
      }
    try {
        // Get all user data
        const personal_details = await getPersonal(userId);
        const education = await getEducation(userId);
        const experience = await getExperience(userId);
        const references = await getReferences(userId);
        const skills = await getSkills(userId);
        const awards = await getAwards(userId);
        const languages = await getLanguages(userId);




        // Render EJS template with data
        const template = await ejs.renderFile(
            path.join(__dirname, 'views', 'portfolio','por.ejs'),
            { 
                personal_details,
                education,
                experience,
                references,skills,awards,languages
            }
        );

        // Generate PDF
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        await page.setContent(template);
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });

        await browser.close();

        // Send PDF
        res.contentType('application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=cv.pdf');
        res.send(pdf);

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});



//whole portfolio

router.get('/myportfolio', isAuthenticated, (req, res) => {
    console.log('Logged in user ID:', req.session.userId);
    const userId = req.session.userId;

    const queries = {
        education: 'SELECT * FROM education WHERE user_id = ? ORDER BY education.end DESC',
        experience: 'SELECT * FROM experience WHERE user_id = ?',
        responsibility: 'SELECT * FROM resposiblity WHERE user_id = ?',
        personal: 'SELECT * FROM personal_details WHERE user_id = ?',
        references: 'SELECT * FROM user_references WHERE user_id = ?',
        skills: 'SELECT * FROM skills WHERE user_id = ?',
        awards: 'SELECT * FROM awards WHERE user_id = ?',
        languages: 'SELECT * FROM languages WHERE user_id = ?'
    };

    const query = `
        SELECT experience.*, resposiblity.responsibility, resposiblity.id
        FROM experience
        LEFT JOIN resposiblity ON experience.experienceid = resposiblity.positionId
        WHERE experience.user_id = ?
        ORDER BY experience.end DESC;
    `;

    pool.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('An error occurred while fetching data.');
        }

        // Transform results into grouped format
        const experiences = [];
        const experienceMap = {};

        results.forEach(row => {
            if (!experienceMap[row.experienceid]) {
                // Initialize a new experience with an empty responsibility list
                experienceMap[row.experienceid] = {
                    experienceid: row.experienceid,
                    organisation: row.organisation,
                    position: row.position,
                    start: row.start,
                    end: row.end,
                    responsibilities: [], // Initialize an empty array for responsibilities
                };
                experiences.push(experienceMap[row.experienceid]);
            }

            // Add responsibility if it exists
            if (row.responsibility) {
                experienceMap[row.experienceid].responsibilities.push(row.responsibility);
            }
        });

        const queryPromises = Object.keys(queries).map(key =>
            new Promise((resolve, reject) => {
                pool.query(queries[key], [userId], (err, results) => {
                    if (err) return reject(err);
                    resolve({ [key]: results });
                });
            })
        );

        Promise.all(queryPromises)
            .then(results => {
                const data = results.reduce((acc, item) => ({ ...acc, ...item }), {});
                if (data.personal && data.personal.length > 0) {
                    data.personal = data.personal[0];
                }

                // Render portfolio with all data
                res.render('portfolio/por', { ...data, experiences });
            })
            .catch(err => {
                console.error('Database error:', err);
                res.status(500).send('An error occurred while fetching portfolio data.');
            });
    });
});



//personal details

router.get('/personal_details',isAuthenticated,(req,res)=>{
    const userId = req.session.userId;
    console.log(userId)


    if (!userId) {
        return res.redirect('/login_blog');
    }



    res.render('portfolio/portfolio_form',{successMessage: null,errorMessage:null})
})
router.post('/auth/personal_details', isAuthenticated, (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect('/login_blog');
    }

    const data = req.body;
    const { salutation, fullName,about, gender, gmail, number_,
        dob, ethnicity, religion, nationality} = data;

        const completeData = {
            salutation,
            fullName,
            about,
            gender,
            gmail,
            number_,
            dob,
            ethnicity,
            religion,
            nationality,
            user_id: userId, 
        };

   

        pool.query('INSERT INTO personal_details SET ?', completeData, (err, result) => {
            if (err) {
                console.error('Error inserting personal details:', err);
                return res.redirect('/personal_details?error=profile_details_failed');
            }
            console.log(result);
            pool.query('UPDATE registration SET profile_status = 1 WHERE user_id = ?', [userId], (err) => {
                if (err) {
                    console.error('Error updating profile status:', err);
                }
                res.redirect('/portfolio_view_education?sucess1');
            });

        });
    });

//education
router.get('/portfolio_view_education',isAuthenticated ,(req,res)=>{
    const userId = req.session.userId;
    console.log(userId)


    if (!userId) {
        return res.redirect('/login_blog');
    }

    res.render('portfolio/education')
})

router.get('/try',(req,res)=>{
   

    res.render('portfolio/trying')
})


// Route for handling education details form submission
// Route for handling education details form submission
// Route for handling education details form submission
router.post('/auth/education_detail', async (req, res) => {
    const { degree = [], institution = [], start = [], end = [], current = [] } = req.body;
  
    // Ensure all arrays are the same length
    const maxLength = Math.max(degree.length, institution.length, start.length, end.length, current.length);
    degree.length = institution.length = start.length = end.length = current.length = maxLength;
  
    // Add indexing to the received data for easier allocation
    const indexedData = degree.map((deg, i) => ({
      index: i, // Index for each entry
      degree: deg,
      institution: institution[i],
      start: start[i],
      end: end[i],
      current: current[i]
    }));
  
    // Prepare the entries for saving
    const entries = indexedData.map((data) => {
      const { degree, institution, start, end, current, index } = data;
      const isCurrent = current === 'true';
      let endDate = end;
  
      // If the entry is marked as 'current' and the end date is empty, set it to 'present'
      if (isCurrent && (!endDate || endDate.trim() === '')) {
        endDate = 'present';
      }
  
      return {
        index: index, // Include index in the final entry
        degree: degree,
        institution: institution,
        start: start,
        end: endDate || '', // If endDate is falsy, use an empty string
        current: isCurrent ? 'true' : 'false'
      };
    });
    console.log(req.body)
    console.log(entries)
  
    // Start a transaction to save the entries into the database
    
  });
  
  
// Start the server


  
router.post('/auth/education_details', async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            // return res.status(401).json({ success: false, message: 'User not authenticated' });
            return res.redirect('/login_blog');

        }

        const { degree, institution, startDate, endDate, current } = req.body;
        const endDateValue = current === 'true' ? null : endDate;

        // Insert the education details into the database
        await pool.query('INSERT INTO education SET ?', {
            degree,
            institution,
            start: startDate,
            end: endDateValue,
            user_id: userId,
        });

        // Optionally update profile status
        await pool.query('UPDATE registration SET profile_status = 2 WHERE user_id = ?', [userId]);

        // Return the saved entry as part of the response
        return res.status(200).json({
            success: true,
            message: 'Education details saved successfully',
            data: { degree, institution, startDate, endDate: endDateValue || 'Present' }
        });

    } catch (error) {
        console.error('Error saving education details:', error.message);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});



  



router.get('/portfolio_view_experience',isAuthenticated,(req,res)=>{
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect('/login_blog');
    }
    res.render('portfolio/experience')

})

router.post('/auth/experience_details', async (req, res) => {
    try {
        const userId = req.session.userId; // Assuming session contains userId
        if (!userId) {
            // return res.status(401).json({ success: false, message: 'User not authenticated' });
            return res.redirect('/login_blog');

        }

        const { primaryPosition, company, startDate, endDate, current, roles } = req.body;

        // Validate roles
        if (!roles || !Array.isArray(roles) || roles.length === 0) {
            console.log('Invalid roles data:', roles);
            return res.status(400).json({ success: false, message: 'Roles must be a non-empty array.' });
        }

        const endDateValue = current === 'true' ? 'PRESENT' : endDate;

        const experienceEntry = {
            position: primaryPosition,
            organisation: company,
            start: startDate,
            end: endDateValue,
            user_id: userId,
        };

        // Insert experience into the database
        pool.query('INSERT INTO experience SET ?', [experienceEntry], (error, results) => {
            if (error) {
                console.error('Failed to insert experience entry:', error.message, error.stack);
                return res.status(500).json({ success: false, message: 'Failed to save experience.' });
            }

            const experienceId = results.insertId;
            console.log('Experience saved with ID:', experienceId);

            // Prepare role data
            const roleData = roles.map((role) => [experienceId, userId, role]);

            // Ensure roleData is a non-empty array
            if (roleData.length > 0) {
                // Insert roles into the responsibility table
                pool.query('INSERT INTO resposiblity (positionId, user_id, responsibility) VALUES ?', [roleData], (error, results) => {
                    if (error) {
                        console.error('Failed to insert roles:', error.message, error.stack);
                        return res.status(500).json({ success: false, message: 'Failed to save roles.' });
                    }

                    console.log('Roles saved successfully');
                    res.json({ success: true, message: 'Experience and roles saved successfully', experienceId });
                });
            } else {
                // If no roles, just return the experience data
                res.json({ success: true, message: 'Experience saved successfully, but no roles provided.', experienceId });
            }

        });
        pool.query('UPDATE registration SET profile_status = 3 WHERE user_id = ?', [userId], (err) => {
            if (err) {
                console.error('Error updating profile status:', err);
            }
            // res.redirect('/portfolio_view_education?sucess1');
        });
    } catch (error) {
        console.error('Error saving experience details:', error.message, error.stack);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
});



router.get('/portfolio_view_references',isAuthenticated,(req,res)=>{
    const userId = req.session.userId;
    console.log(userId)


    if (!userId) {
        return res.redirect('/login_blog');
    }

    res.render('portfolio/refrences')
})
router.post('/auth/references',async(req,res)=>{
    try {
        const userId = req.session.userId;
        if (!userId) {
            // return res.status(401).json({ success: false, message: 'User not authenticated' });
            return res.redirect('/login_blog');

        }

        const { name,relationship, organisation, email,phone } = req.body;
        // const endDateValue = current === 'true' ? null : endDate;

        // Insert the education details into the database
        await pool.query('INSERT INTO user_references SET ?', {
            username:name,
            relationship:relationship,
            organisation:organisation,
            email: email,
            phone: phone,

            user_id: userId,
        });
        await pool.query('UPDATE registration SET profile_status = 4 WHERE user_id = ?', [userId]);


                return res.status(200).json({
                    success: true,
                    message: 'Data details saved successfully',
                    data: { name,relationship, organisation, phone, email }
                });

    } catch (error) {
        console.error('Error saving data details:', error.message);
       
}

})


router.get('/portfolio_view_skills',isAuthenticated,(req,res)=>{
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect('/login_blog');
    }
    res.render('portfolio/skills')

})


router.post('/auth/portfolio_view_skills', isAuthenticated, async(req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            // return res.status(401).json({ success: false, message: 'User not authenticated' });
            return res.redirect('/login_blog');

        }

        const { skilltitle } = req.body;
        // const endDateValue = current === 'true' ? null : endDate;

        await pool.query('INSERT INTO skills SET ?', {
            skilltitle:skilltitle,
            

            user_id: userId,
        });
        await pool.query('UPDATE registration SET profile_status = 5 WHERE user_id = ?', [userId]);


                return res.status(200).json({
                    success: true,
                    message: 'Data details saved successfully',
                    entry: { skilletitle: skilltitle }                });

    } catch (error) {
        console.error('Error saving education details:', error.message);
       
}

});



router.get('/portfolio_view_awards',isAuthenticated,(req,res)=>{
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect('/login_blog');
    }
    res.render('portfolio/awards')

})


router.post('/auth/portfolio_view_awards',isAuthenticated,async(req,res)=>{
    try {
        const userId = req.session.userId;
        if (!userId) {
            // return res.status(401).json({ success: false, message: 'User not authenticated' });
            return res.redirect('/login_blog');

        }

        const { award } = req.body;
        // const endDateValue = current === 'true' ? null : endDate;

        // Insert the education details into the database
        await pool.query('INSERT INTO awards SET ?', {
            award:award,
            

            user_id: userId,
        });
        await pool.query('UPDATE registration SET profile_status = 6 WHERE user_id = ?', [userId]);


                return res.status(200).json({
                    success: true,
                    message: 'Data details saved successfully',
                    entry: { award: award }                });

    } catch (error) {
        console.error('Error saving education details:', error.message);
       
}

})



router.get('/portfolio_view_languages',isAuthenticated,(req,res)=>{
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect('/login_blog');
    }
    res.render('portfolio/languages')

})


router.post('/auth/portfolio_view_languages',isAuthenticated,async(req,res)=>{
    try {
        const userId = req.session.userId;
        if (!userId) {
            // return res.status(401).json({ success: false, message: 'User not authenticated' });
            return res.redirect('/login_blog');

        }

        const { language } = req.body;
        // const endDateValue = current === 'true' ? null : endDate;

        // Insert the education details into the database
        await pool.query('INSERT INTO languages SET ?', {
            languages:language,
            

            user_id: userId,
        });
        await pool.query('UPDATE registration SET profile_status = 7 WHERE user_id = ?', [userId]);


                return res.status(200).json({
                    success: true,
                    message: 'Data details saved successfully',
                    entry: { language: language }                });

    } catch (error) {
        console.error('Error saving education details:', error.message);
       
}
   
   })


router.get('/blog/:id', (req, res) => {
    const blogId = req.params.id;

    const query = `
        SELECT 
            SUBSTRING(paragraph, 1, 100) AS truncatedContent,
            paragraph AS fullContent
        FROM blog_posts 
        WHERE id = ?
    `;

    connection.query(query, [blogId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }

        if (result.length === 0) {
            return res.status(404).send('Blog post not found');
        }

        const blogPost = result[0];
        res.render('blog', { blog: blogPost });
    });
});


module.exports = router;
