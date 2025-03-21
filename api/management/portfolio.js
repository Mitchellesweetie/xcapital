
const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const dotenv = require('dotenv');
const puppeteer = require('puppeteer');
const path=require('path')
const ejs=require('ejs')
const fs = require('fs').promises;


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
        pool.query(
            'SELECT * FROM personal_details WHERE user_id = ?',
            [userId],
            (error, results) => {
                if (error) reject(error);
                resolve(results[0]);  // Assuming the first result is the user's personal data
            }
        );
    });
}

// Fetch Education
async function getEducation(userId) {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT * FROM education WHERE user_id = ?',
            [userId],
            (error, results) => {
                if (error) reject(error);
                resolve(results || []);
            }
        );
    });
}

// Fetch References
async function getReferences(userId) {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT * FROM user_references WHERE user_id = ?',
            [userId],
            (error, results) => {
                if (error) reject(error);
                resolve(results || []);
            }
        );
    });
}

// Fetch Skills
async function getSkills(userId) {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT * FROM skills WHERE user_id = ?',
            [userId],
            (error, results) => {
                if (error) reject(error);
                resolve(results || []);
            }
        );
    });
}

// Fetch Awards
async function getAwards(userId) {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT * FROM awards WHERE user_id = ?',
            [userId],
            (error, results) => {
                if (error) reject(error);
                resolve(results || []);
            }
        );
    });
}

// Fetch Languages
async function getLanguages(userId) {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT * FROM languages WHERE user_id = ?',
            [userId],
            (error, results) => {
                if (error) reject(error);
                resolve(results || []);
            }
        );
    });
}

// Fetch Experience and Responsibilities
async function getExperience(userId) {
    const query = `
        SELECT experience.*, resposiblity.responsibility, resposiblity.id
        FROM experience
        LEFT JOIN resposiblity ON experience.experienceid = resposiblity.positionId
        WHERE experience.user_id = ?
        ORDER BY experience.end DESC;
    `;
    
    return new Promise((resolve, reject) => {
        pool.query(query, [userId], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return reject(err);
            }

            // Transform results into grouped format
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
                }

                // Add responsibility if it exists
                if (row.responsibility) {
                    experienceMap[row.experienceid].responsibilities.push(row.responsibility);
                }
            });

            resolve(Object.values(experienceMap)); // Return grouped experiences
        });
    });
}

// Route to download CV as PDF
router.get('/download-cv', isAuthenticated, async (req, res) => {
    let browser = null;
    let page = null;

    try {
        const userId = req.session.userId;
        if (!userId) return res.redirect('/login_blog');

        const data = {
            personal: await getPersonal(userId),
            education: await getEducation(userId),
            references: await getReferences(userId),
            skills: await getSkills(userId),
            awards: await getAwards(userId),
            languages: await getLanguages(userId),
            experiences: await getExperience(userId)
        };

        const templatePath = path.join(__dirname, '..', '..', 'views', 'portfolio', 'download.ejs');
        const html = await ejs.renderFile(templatePath, data);

        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox'],
            defaultViewport: {
                width: 1200,
                height: 1600,
                deviceScaleFactor: 1.5
            }
        });

        page = await browser.newPage();
        await page.evaluateHandle('document.fonts.ready');
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        // Add print-specific styles
        await page.addStyleTag({
            content: `
                @page { size: A4; margin: 0; }
                body { margin: 0; padding: 0; }
                .cv-container {
                    max-width: 100% !important;
                    margin: 0 !important;
                    padding: 40px !important;
                    display: grid !important;
                    grid-template-columns: 65% 35% !important;
                }
                .experience-item, .skill-category {
                    page-break-inside: avoid;
                }
            `
        });

        const buffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '10px', right: '10px', bottom: '10px', left: '10px' },
            scale: 0.8
        });

        await browser.close();

        res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Length': buffer.length,
            'Content-Disposition': 'attachment; filename=cv.pdf'
        });
        res.end(buffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('PDF Generation Error:', error);
        res.status(500).send(error.message);
    }
});


//whole portfolio

router.get('/myportfolio', isAuthenticated, (req, res) => {
    // console.log('Logged in user ID:', req.session.userId);
    const userId = req.session.userId;
    if(!userId){
        res.redirect('/login_blog')
    }

    const queries = {
        education: 'SELECT * FROM education WHERE user_id = ? ORDER BY end DESC',
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
  
  


  
router.post('/auth/education_details', async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            // return res.status(401).json({ success: false, message: 'User not authenticated' });
            return res.redirect('/login_blog');

        }

        const { degree, institution, startDate, endDate, current } = req.body;
        const endDateValue = current === 'true' ? null : endDate;

        await pool.query('INSERT INTO education SET ?', {
            degree,
            institution,
            start: startDate,
            end: endDateValue,
            user_id: userId,
        });

        await pool.query('UPDATE registration SET profile_status = 2 WHERE user_id = ?', [userId]);

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
router.post('/auth/references',isAuthenticated,async(req,res)=>{
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


router.get('/blog/:id', isAuthenticated,(req, res) => {
    const blogId = req.params.id;

    const query = `
        SELECT 
            SUBSTRING(paragraph, 1, 100) AS truncatedContent,
            paragraph AS fullContent
        FROM blog_posts 
        WHERE id = ?
    `;

    pool.query(query, [blogId], (err, result) => {
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










//UPDATES
//personal_details
router.get('/edit_details/:id',isAuthenticated,(req,res)=>{
    const userId = req.session.userId;
    const user_id=req.params.id
    console.log(userId)


    if (!userId) {
        return res.redirect('/login_blog');
    }
    pool.query('select * from personal_details where user_id=?',[userId],(err,results)=>{

        if(err)
            return res.status(404).send('Error occured')

        if (results.length === 0) {
            return res.redirect('/personal_details'); 
        }
  
        const personal = results[0]; 
  


        res.render('portfolio/portfolio_edit',{successMessage: null,errorMessage:null,personal:personal})      

    })



})


router.post('/edit_details/:id', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const user_id = req.params.id;

    if (!userId) {
        return res.redirect('/login_blog');
    }

    const data = req.body;
    const {
        salutation, fullName, about, gender, gmail, number_,
        dob, ethnicity, religion, nationality
    } = data;

    const sqlQuery = `
        UPDATE personal_details
        SET salutation = ?, fullName = ?, about = ?, gender = ?, gmail = ?, 
            number_ = ?, dob = ?, ethnicity = ?, religion = ?, nationality = ?
        WHERE user_id = ?
    `;
    const values = [
        salutation, fullName, about, gender, gmail, 
        number_, dob, ethnicity, religion, nationality, user_id
    ];

    pool.query(sqlQuery, values, (err, result) => {
        if (err) {
            console.error('Error updating personal details:', err);
            return res.redirect(`/edit_details/${user_id}?error=profile_update_failed`);
        }

        res.redirect('/myportfolio');
    });
});
//education
router.get('/edit_education', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const user_id=req.params.id
    console.log('session id is',userId)
    if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    pool.query('SELECT * FROM education WHERE user_id = ? ', [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error occurred,kindly login' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'No education records found' });
        }
        // res.json({edu: results});
        res.render('portfolio/education_edit',{edu:results})
    });
});
router.get('/edit_education/:id', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const educationid=req.params.id
    console.log('session id is',userId)
    if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    pool.query('SELECT * FROM education WHERE  educationid = ? ', [educationid], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error occurred,kindly login' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'No education records found' });
        }
        // res.json({education: results});
        res.render('portfolio/edit_view_education',{education:results[0]})
        console.log(results)
    });
});
router.post('/update_education/:id', async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            // return res.status(401).json({ success: false, message: 'User not authenticated' });
            return res.redirect('/login_blog');

        }

        const { degree, institution, start, end, current } = req.body;
        const endDateValue = current === 'true' ? null : end;

        await pool.query('UPDATE  education SET degree=?, institution=?, start=?, end=? WHERE user_id=? AND educationid=?', 
                [degree, institution, start, endDateValue, userId, educationId])


        // return res.status(200).json({
        //     success: true,
        //     message: 'Education details saved successfully',
        //     data: { degree, institution, start, end: endDateValue || 'PRESENT' }
        // });
        // res.status(200).render('portfolio/education_edit')
        res.redirect('/edit_education')

    } catch (error) {
        console.error('Error saving education details:', error.message);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

//awards
router.get('/edit_view_awards',isAuthenticated,(req,res)=>{
   const userId = req.session.userId;
    const user_id=req.params.id
    console.log('session id is',userId)
    if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    pool.query('SELECT * FROM awards WHERE user_id = ? ', [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error occurred,kindly login' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'No education records found' });
        }
    res.render('portfolio/award_update',{edu:results})

})
})
router.get('/edit_award/:id',isAuthenticated,(req,res)=>{
    const awardid=req.params.id
    const userId = req.session.userId;
    console.log('session id is',userId)
    if (!userId) {
        // return res.status(401).json({ error: 'Not authenticated' });
        return res.redirect('/login_blog')
    }
    pool.query('SELECT * FROM awards WHERE  awardsId = ? ', [awardid], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error occurred fetching the awards,kindly login' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'No awards records found' });
        }
    res.render('portfolio/edit_view_award',{award:results[0]})

})
})

router.post('/update_award/:id', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        const awardid = req.params.id;
        
        if (!userId) {
            return res.redirect('/login_blog');
        }

        const { award } = req.body;

        const result = await pool.query(
            'UPDATE awards SET award = ? WHERE awardsId = ? AND user_id = ?',
            [award, awardid, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Award not found or unauthorized' });
        }

        res.redirect('/edit_view_awards');
    } catch (error) {
        console.error('Error updating award:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

router.post('/delete_award/:id', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        const awardid = req.params.id;
        
        if (!userId) {
            return res.redirect('/login_blog');
        }
        const result = await pool.query(
            'DELETE FROM awards WHERE awardsId = ? AND user_id = ?',
            [awardid, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Award not found or unauthorized' });
        }

        res.redirect('/myportfolio');
    } catch (error) {
        console.error('Error updating award:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

//languages
router.get('/edit_view_languages',isAuthenticated,(req,res)=>{
    const userId = req.session.userId;
     const user_id=req.params.id
     console.log('session id is',userId)
     if (!userId) {
         return res.status(401).json({ error: 'Not authenticated' });
     }
     pool.query('SELECT * FROM languages WHERE user_id = ? ', [userId], (err, results) => {
         if (err) {
             return res.status(500).json({ error: 'Database error occurred,kindly login' });
         }
         if (results.length === 0) {
             return res.status(404).json({ error: 'No education records found' });
         }
     res.render('portfolio/languages_edit',{languages:results})
 
 })

})

router.get('/edit_language/:id',isAuthenticated,(req,res)=>{
    const languageId=req.params.id
    const userId = req.session.userId;
    console.log('session id is',userId)
    if (!userId) {
        // return res.status(401).json({ error: 'Not authenticated' });
        return res.redirect('/login_blog')
    }
    pool.query('SELECT * FROM languages WHERE  languagesId = ? ', [languageId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error occurred fetching the awards,kindly login' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'No languages records found' });
        }
    res.render('portfolio/language_edit_view',{languages:results[0]})

})
})

router.post('/update_language/:id', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        const languageId = req.params.id;
        
        if (!userId) {
            return res.redirect('/login_blog');
        }

        const { languages } = req.body;

        const result = await pool.query(
            'UPDATE languages SET languages = ? WHERE languagesId = ? AND user_id = ?',
            [languages, languageId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Languages not found or unauthorized' });
        }

        res.redirect('/edit_view_languages');
    } catch (error) {
        console.error('Error updating languages:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
router.post('/delete_language/:id', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        const languagesId = req.params.id;
        
        if (!userId) {
            return res.redirect('/login_blog');
        }
        const result = await pool.query(
            'DELETE FROM languages WHERE languagesId= ? AND user_id = ?',
            [languagesId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Languages not found or unauthorized' });
        }

        res.redirect('/edit_view_languages');
    } catch (error) {
        console.error('Error updating languages:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    
}
});

//skills

router.get('/edit_view_skill',isAuthenticated,(req,res)=>{
    const userId = req.session.userId;
     const user_id=req.params.id
     console.log('session id is',userId)
     if (!userId) {
         return res.status(401).json({ error: 'Not authenticated' });
     }
     pool.query('SELECT * FROM skills WHERE user_id = ? ', [userId], (err, results) => {
         if (err) {
             return res.status(500).json({ error: 'Database error occurred,kindly login' });
         }
         if (results.length === 0) {
             return res.status(404).json({ error: 'No education records found' });
         }
     res.render('portfolio/skill_update',{skills:results})
 
 })

})

router.get('/edit_skill/:id',isAuthenticated,(req,res)=>{
    const skillsId=req.params.id
    const userId = req.session.userId;
    console.log('session id is',userId)
    if (!userId) {
        // return res.status(401).json({ error: 'Not authenticated' });
        return res.redirect('/login_blog')
    }
    pool.query('SELECT * FROM skills WHERE  skillsId = ? ', [skillsId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error occurred fetching the Skills,kindly login' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'No skills records found' });
        }
    res.render('portfolio/skill_edit',{skills:results[0]})

})
})

router.post('/update_skills/:id', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        const skillsId = req.params.id;
        
        if (!userId) {
            return res.redirect('/login_blog');
        }

        const { skills } = req.body;

        const result = await pool.query(
            'UPDATE skills SET skills = ?, skilltitle=? WHERE skillsId = ? AND user_id = ?',
            [skills, skillsId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Skills not found or unauthorized' });
        }

        res.redirect('/edit_view_skill');
    } catch (error) {
        console.error('Error updating skills:', error);
        res.status(500).send({ success: false, message: 'Internal Server Error' });
    }
});
router.post('/delete_skills/:id', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        const skillsId = req.params.id;
        
        if (!userId) {
            return res.redirect('/login_blog');
        }
        const result = await pool.query(
            'DELETE FROM skills WHERE skillsId= ? AND user_id = ?',
            [skillsId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Skills not found or unauthorized' });
        }

        res.redirect('/edit_view_skill');
    } catch (error) {
        console.error('Error updating Skills:', error);
        res.status(500).send({ success: false, message: 'Internal Server Error' });
    
}
});

//references

router.get('/edit_view_references',isAuthenticated,(req,res)=>{
    const userId = req.session.userId;
     const user_id=req.params.id
     console.log('session id is',userId)
     if (!userId) {
         return res.status(401).json({ error: 'Not authenticated' });
     }
     pool.query('SELECT * FROM user_references WHERE user_id = ? ', [userId], (err, results) => {
         if (err) {
             return res.status(500).json({ error: 'Database error occurred,kindly login' });
         }
         if (results.length === 0) {
             return res.status(404).json({ error: 'No references records found' });
         }
     res.render('portfolio/references_edit',{references:results})
 
 })

})

router.get('/edit_references/:id',isAuthenticated,(req,res)=>{
    const referenceid=req.params.id
    const userId = req.session.userId;
    console.log('session id is',userId)
    if (!userId) {
        // return res.status(401).json({ error: 'Not authenticated' });
        return res.redirect('/login_blog')
    }
    pool.query('SELECT * FROM user_references WHERE  referenceid = ? ', [referenceid], (err,results ) => {
        if (err) {
            return res.status(500).json({ error: 'Database error occurred fetching the references,kindly login' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'No references records found' });
        }
    res.render('portfolio/references_edit_view',{references:results[0]})

})
})

router.post('/update_references/:id', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        const referenceId = req.params.id;

        if (!userId) {
            return res.redirect('/login_blog');
        }

        const { username, relationship, organisation, email, phone } = req.body;

        // Fix: Extract affectedRows correctly
        const [result] = await pool.query(
            'UPDATE user_references SET username = ?, relationship=?, organisation=?, email=?, phone=? WHERE referenceid = ? AND user_id = ?',
            [username, relationship, organisation, email, phone, referenceId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Reference not found or unauthorized' });
        }

        res.redirect('/edit_view_references');
    } catch (error) {
        console.error('Error updating reference:', error);
        res.status(500).send({ success: false, message: 'Internal Server Error' });
    }
});

router.post('/delete_references/:id', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        const refrencesid = req.params.id;
        
        if (!userId) {
            return res.redirect('/login_blog');
        }
        const result = await pool.query(
            'DELETE FROM user_references WHERE referenceid= ? AND user_id = ?',
            [refrencesid, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'user_references not found or unauthorized' });
        }

        res.redirect('/edit_view_references');
    } catch (error) {
        console.error('Error updating user references:', error);
        res.status(500).send({ success: false, message: 'Internal Server Error' });
    
}
});


    

    
module.exports = router;
