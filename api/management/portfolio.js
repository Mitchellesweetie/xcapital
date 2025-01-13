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
        education: 'SELECT * FROM education WHERE user_id = ?',
        experience: 'SELECT * FROM experience WHERE user_id = ?',
        personal: 'SELECT * FROM personal_details WHERE user_id = ?',
        references: 'SELECT * FROM user_references WHERE user_id = ?',
        skills:'SELECT * FROM skills WHERE user_id = ?',
        awards:'SELECT * FROM awards WHERE user_id = ?',
        languages:'SELECT * FROM languages WHERE user_id = ?'
    };

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
            // res.json(data)
            console.log({personal:data.personal})
            res.render('portfolio/por',data); // Replace with res.render() for templates
        })
        .catch(err => {
            console.error('Database error:', err);
            res.status(500).send('An error occurred while fetching portfolio data.');
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


  
  
  
  
  
  
  
  
  
  
  
  
  


router.post('/auth/education_details',isAuthenticated, async (req, res) => {
  try {
    const data = req.body;
    const userId = req.session.userId; // Assuming session contains userId

    if (!userId) {
      return res.redirect('/login_blog');
    }

    const { degree, institution, start, end, current } = data;

    const entries = Array.isArray(degree)
      ? degree.map((_, i) => ({
          degree: degree[i],
          institution: institution[i],
          start: start[i],
          end: current && current[i] === 'true' ? 'present' : end[i] || null,
          user_id: userId,
        }))
      : [
          {
            degree,
            institution,
            start,
            end: current === 'true' ? 'present' : end || null,
            user_id: userId,
          },
        ];

    for (const entry of entries) {
      await new Promise((resolve, reject) => {
        pool.query('INSERT INTO education SET ?', entry, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });
    }

    res.redirect('/portfolio_view_education?success');
  } catch (error) {
    console.error('Error saving education details:', error);
    res.redirect('/portfolio_view_education?error=true');
  }
});


  
  
// router.post('/auth/education_details', isAuthenticated, async (req, res) => {
//   try {
//     const data = req.body;
//     const userId = req.session.userId;

//     if (!userId) {
//       return res.redirect('/login_blog');
//     }

//     const { degree, institution, start, end ,current} = data;

//     const length = Array.isArray(degree) ? degree.length : 1;
//     const isCurrent=current==='true'
//     const endDateValue=isCurrent?null:end

//     const entries = Array.isArray(degree)
//       ? degree.map((_, i) => ({
//           degree: degree[i],
//           institution: institution[i],
//           start: start[i],
//           end: endDateValue[i] === 'on' ? new Date().toISOString().split('T')[0] : end[i],
//           user_id: userId,
//         }))
//       : [
//           {
//             degree,
//             institution,
//             start,
//             end: end === 'on' ? new Date().toISOString().split('T')[0] : end,
//             user_id: userId,
//           },
//         ];

//     await Promise.all(
//       entries.map((entry) =>
//         new Promise((resolve, reject) => {
//           pool.query('INSERT INTO education SET ?', entry, (err, result) => {
//             if (err) return reject(err);
//             console.log('Education record inserted successfully:', result);
//             resolve(result);
//           });
//         })
//       )
//     );

//     pool.query('UPDATE registration SET profile_status = 2 WHERE user_id = ?', [userId], (err) => {
//       if (err) {
//         console.error('Error updating profile status:', err);
//         return res.redirect('/portfolio_view_education?error=profile_update_failed');
//       }

//       return res.redirect('/portfolio_view_experience');
//     });
//   } catch (error) {
//     console.error('Error inserting education details:', error);
//     res.redirect('/portfolio_view_education?error=true');
//   }
// });


//experience
router.get('/portfolio_view_experience',isAuthenticated,(req,res)=>{
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect('/login_blog');
    }
    res.render('portfolio/experience')

})



// router.post('/auth/experience', (req, res) => {
//     const data = req.body;
//     const userId = req.session.userId;

//     if (!userId) {
//         return res.redirect('/login_blog');
//     }

//     const { position, organisation, start, end } = data;
//     const length = position.length;

    

//     for (let i = 0; i < length; i++) {
       

//         const completeData = {
//             position: position[i],
//             organisation: organisation[i],
//             start: start[i],
//           end: end[i] === 'on' ? new Date().toISOString().split('T')[0] : end[i],
//             user_id: userId
//         };

//         pool.query('INSERT INTO experience SET ?', completeData, (err, result) => {
//             if (err) {
//                 console.error('Error inserting experience details:', err);
//                 return res.redirect('/portfolio_view_experience?error=true');
//             }

//             console.log('Experience record inserted successfully:', result);

//             if (i === length - 1) { // Ensure this only happens once after all records are inserted
//                 pool.query('UPDATE registration SET profile_status = 3 WHERE user_id = ?', [userId], (err) => {
//                     if (err) {
//                         console.error('Error updating profile status:', err);
//                         return res.redirect('/portfolio_view_experience?error=profile_update_failed');
//                     }

//                     return res.redirect('/portfolio_view_references');
//                 });
//             }
//         });
//     }
// });
// Assuming you're using Express.js and a MySQL database

router.post('/auth/experience', async (req, res) => {
    console.log(req.body); // Log the incoming form data
  
    const { position, organisation, start, end, current, roles, user_id } = req.body;
  
    // Check if all arrays exist and are not undefined or empty
    if (!position || !organisation || !start || !end || !roles || !current) {
      console.error('Missing form data arrays:', { position, organisation, start, end, roles, current });
      return res.status(400).send('Missing form data');
    }
  
    // Iterate over the experience entries and save the data
    for (let i = 0; i < position.length; i++) {
      const experience = {
        user_id: user_id,  // Assuming user_id is passed in the form or session
        position: position[i],
        organisation: organisation[i],
        start: start[i],
        end: current[i] === 'on' ? 'present' : end[i], // Set 'present' if current is checked
        current: current[i] === 'on', // True if checked, false otherwise
      };
  
      // Insert experience into the database
      const experienceResult = await pool.query('INSERT INTO experiences SET ?', experience);
      const experienceId = experienceResult.insertId;
  
      // Insert roles for this experience into the roles table
      for (let role of roles[i]) {
        const roleData = {
          experience_id: experienceId,
          role: role,
          user_id: user_id, // Assuming user_id is used for the roles too
        };
  
        await pool.query('INSERT INTO roles SET ?', roleData);
      }
    }
    console.log(req.body)
  
    res.redirect('/portfolio_view_experience?success');
  });
  
  


//references
router.get('/portfolio_view_references',isAuthenticated,(req,res)=>{
    const userId = req.session.userId;
    console.log(userId)


    if (!userId) {
        return res.redirect('/login_blog');
    }

    res.render('portfolio/refrences')
})
router.post('/auth/references',(req,res)=>{
    const data=req.body
    const userId = req.session.userId;

    const{username,organisation,email,phone}=data
    let experienceInsertCount = 0; 


    if (!userId) {
      return res.redirect('/login_blog');
    }
    const length = username.length;
    for (let i = 0; i < length; i++) {
        const reference = {
            username: username[i],
            organisation: organisation[i],
            email: email[i],
            phone: phone[i],
            user_id: userId 
        };
  

    pool.query('insert into  user_references set ?',reference,(err,result)=>{
        if (err){
            console.error('Error approving blog:', err);
            return res.redirect('/portfolio_view_references');
        }
        console.log('Experience record inserted successfully:', result);
        experienceInsertCount++;       
        
        if (experienceInsertCount === length ) {  
         pool.query('UPDATE registration SET profile_status = 4 WHERE user_id = ?', [userId], (err) => {
            if (err) {
                console.error('Error updating profile status:', err);
                return res.redirect('/portfolio_view_references?error=profile_update_failed');
            }

            return res.redirect('/portfolio_view_skills');
        });
    }
})
}

})


router.get('/portfolio_view_skills',isAuthenticated,(req,res)=>{
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect('/login_blog');
    }
    res.render('portfolio/skills')

})


router.post('/auth/portfolio_view_skills', isAuthenticated, (req, res) => {
    const data = req.body;
    const userId = req.session.userId;

    const { skilltitle, skills } = data;

    if (!userId) {
        return res.redirect('/login_blog');
    }

    if (!Array.isArray(skilltitle) || !Array.isArray(skills)) {

        skilltitle=[skilltitle]
        skills=skills
    }
  

    let experienceInsertCount = 0; 
    const length = skilltitle.length;

    for (let i = 0; i < length; i++) {
        const reference = {
            skilltitle: skilltitle[i],
            skills: skills[i],
            user_id: userId
        };

        pool.query('INSERT INTO skills SET ?', reference, (err, result) => {
            if (err) {
                console.error('Error inserting skills:', err);
                return res.redirect('/portfolio_view_skills?error=true');
            }
            console.log('Skills record inserted successfully:', result);
            experienceInsertCount++;

            if (experienceInsertCount === length) {
                pool.query('UPDATE registration SET profile_status = 5 WHERE user_id = ?', [userId], (err) => {
                    if (err) {
                        console.error('Error updating profile status:', err);
                        return res.redirect('/portfolio_view_skills?error=profile_update_failed');
                    }

                    return res.redirect('/portfolio_view_awards');
                });
            }
        });
    }
});



router.get('/portfolio_view_awards',isAuthenticated,(req,res)=>{
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect('/login_blog');
    }
    res.render('portfolio/awards')

})


router.post('/auth/portfolio_view_awards',isAuthenticated,(req,res)=>{
    const data=req.body
    const userId = req.session.userId;

    const{award}=data
    if (!Array.isArray(award)) {
        award = [award];  
    }
    let experienceInsertCount = 0; 


    if (!userId) {
      return res.redirect('/login_blog');
    }
    const length = award.length;
    for (let i = 0; i < length; i++) {
        const reference = {
            award: award[i],
            user_id: userId 
        };
  

    pool.query('insert into  awards set ?',reference,(err,result)=>{
        if (err){
            console.error('Error approving blog:', err);
            return res.redirect('/portfolio_view_awards');
        }
        console.log('Experience record inserted successfully:', result);
        experienceInsertCount++;       
        
        if (experienceInsertCount === length ) {  
         pool.query('UPDATE registration SET profile_status = 6 WHERE user_id = ?', [userId], (err) => {
            if (err) {
                console.error('Error updating profile status:', err);
                return res.redirect('/portfolio_view_awards?error=profile_update_failed');
            }
      
                return res.redirect('/portfolio_view_languages');
            
          });
    }
})
}

})



router.get('/portfolio_view_languages',isAuthenticated,(req,res)=>{
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect('/login_blog');
    }
    res.render('portfolio/languages')

})


router.post('/auth/portfolio_view_languages',isAuthenticated,(req,res)=>{
    const data=req.body
    const userId = req.session.userId;

    const{languages}=data
    if (!Array.isArray(languages)) {
        languages = [languages]; 
    }
    let experienceInsertCount = 0; 


    if (!userId) {
      return res.redirect('/login_blog');
    }
    const length = languages.length;
    for (let i = 0; i < length; i++) {
        const reference = {
            languages: languages[i],
            user_id: userId 
        };
  

    pool.query('insert into  languages set ?',reference,(err,result)=>{
        if (err){
            console.error('Error approving blog:', err);
            return res.redirect('/portfolio_view_languages');
        }
        console.log('Experience record inserted successfully:', result);
        experienceInsertCount++;       
        
       

        if (experienceInsertCount === length ) {  
            pool.query('UPDATE registration SET profile_status = 7 WHERE user_id = ?', [userId], (err) => {
               if (err) {
                   console.error('Error updating profile status:', err);
                   return res.redirect('/portfolio_view_languages?error=profile_update_failed');
               }
         
                   return res.redirect('/student_blog');
               
             });
       }
   })
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
