const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();
const db = mysql.createConnection({
    host: process.env.host,
    user: process.env.username,
    password: process.env.password,
    database: process.env.database
});


function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return next(); 
    }
    res.redirect('/login_blog'); 
}





//whole portfolio
router.get('/myportfolio',isAuthenticated,(req,res)=>{


    res.render('portfolio/resume')
})
function redirectBasedOnProgress(req, res, next) {
    const userId = req.session.userId;

    db.query('SELECT * FROM profile_status WHERE user_id = ?', [userId], (err, profileStatus) => {
        if (err || profileStatus.length === 0) {
            console.error('Error fetching profile status:', err || 'No profile status found');
            return res.redirect('/education');
        }

        const { education_completed, experience_completed, references_completed } = profileStatus[0];

        if (!education_completed) {
            return res.redirect('/personal_details');
        } else if (!experience_completed) {
            return res.redirect('/portfolio_view_experience');
        } else if (!references_completed) {
            return res.redirect('/portfolio_view_references');
        }

        next(); 
    });
}

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
    const { salutation, fullname, gender, gmail, number_,
        dob, ethnicity, religion, nationality} = data;

        const completeData = {
            salutation,
            fullname,
            gender,
            gmail,
            number_,
            dob,
            ethnicity,
            religion,
            nationality,
            user_id: userId, 
        };

   

        db.query('INSERT INTO personal_details SET ?', completeData, (err, result) => {
            if (err) {
                console.error('Error inserting personal details:', err);
                return res.redirect('/portfolio_view_education');
            }
            console.log(result);
            db.query('UPDATE registration SET profile_status = 1 WHERE user_id = ?', [userId], (err) => {
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

router.post('/auth/education_details', isAuthenticated,(req, res) => {
    const data = req.body;

    const userId = req.session.userId;


    if (!userId) {
        return res.redirect('/login_blog');
    }

    const { degree, institution, start, end,current } = data;
    const length = degree.length;

    
 

    for (let i = 0; i < length; i++) {
        const finalEnd = current[i] === 'on' ? 'CURRENT' : end[i];

        const completeData = {
            degree: degree[i],
            institution: institution[i],
            start: start[i],
            end: end,
            current: finalEnd[i],
            user_id: userId
        };




    db.query('INSERT INTO education SET ?', completeData, (err, result) => {
        if (err) {
            console.error('Error inserting education details:', err);
            return res.redirect('/portfolio_view_education?error=true');
        }

        console.log('Education record inserted successfully:', result);

        db.query('UPDATE registration SET profile_status = 2 WHERE user_id = ?', [userId], (err) => {
            if (err) {
                console.error('Error updating profile status:', err);
                return res.redirect('/portfolio_view_education?error=profile_update_failed');
            }

            return res.redirect('/portfolio_view_experience');
        });
    });
}
});

//experience
router.post('/auth/experience', (req, res) => {
    const data = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect('/login_blog');
    }

    const { position, organisation, start, end, current } = data;
    const length = position.length;

    for (let i = 0; i < length; i++) {
        const finalEnd = current[i] === 'on' ? 'CURRENT' : end[i];

        const startDate = start[i] ? start[i] : null; 
        const endDate = finalEnd ? finalEnd : null; 

        const completeData = {
            position: position[i],
            organisation: organisation[i],
            start: startDate,
            end: endDate,
            current: current[i] === 'on' ? 'CURRENT' : null, 
            user_id: userId
        };

        db.query('INSERT INTO experience SET ?', completeData, (err, result) => {
            if (err) {
                console.error('Error inserting experience details:', err);
                return res.redirect('/portfolio_view_experience?error=true');
            }

            console.log('Experience record inserted successfully:', result);

            if (i === length - 1) { // Ensure this only happens once after all records are inserted
                db.query('UPDATE registration SET profile_status = 3 WHERE user_id = ?', [userId], (err) => {
                    if (err) {
                        console.error('Error updating profile status:', err);
                        return res.redirect('/portfolio_view_experience?error=profile_update_failed');
                    }

                    return res.redirect('/portfolio_view_references');
                });
            }
        });
    }
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
  

    db.query('insert into  user_references set ?',reference,(err,result)=>{
        if (err){
            console.error('Error approving blog:', err);
            return res.redirect('/portfolio_view_references');
        }
        console.log(result)
       if (i === length - 1) {  // This ensures the update happens only after the last insert
        db.query('UPDATE registration SET profile_status = 4 WHERE user_id = ?', [userId], (err) => {
            if (err) {
                console.error('Error updating profile status:', err);
                return res.redirect('/portfolio_view_references?error=profile_update_failed');
            }

            return res.redirect('/portfolio_view_success');
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
