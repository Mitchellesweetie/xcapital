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
    res.redirect('/login'); 
}

router.get('/portfolio_view_education',(req,res)=>{

    res.render('portfolio/education')
})
router.post('/auth/personal_details',isAuthenticated,(req,res)=>{

    const data=req.body
    const userId = req.session.userId;


    if (!userId) {
      return res.redirect('/login');
    }
    db.query('SELECT username FROM registration WHERE id = ?', [userId], (err, userResults) => {
        if (err || userResults.length === 0) {
            console.error('Error fetching user data:', err || 'User not found');
            return res.render('login', {
                successMessage: null,
                errorMessage: 'Login to fetch your details',
                blogs: [],
                username
            });
        }

    const username = userResults[0].username;

    db.query('insert into  personal_details set ?',data,(err,result)=>{
        if (err){
            console.error('Error approving blog:', err);
            return res.redirect('/portfolio_view_education');
        }
        console.log(result)

        return res.redirect('/portfolio_view_education')

    })})
})

router.post('/auth/education_details',(req,res)=>{
    const data=req.body
    const userId = req.session.userId;


    if (!userId) {
      return res.redirect('/login');
    }
    db.query('SELECT username FROM registration WHERE id = ?', [userId], (err, userResults) => {
        if (err || userResults.length === 0) {
            console.error('Error fetching user data:', err || 'User not found');
            return res.render('login', {
                successMessage: null,
                errorMessage: 'Login to fetch your details',
                blogs: [],
                username
            });
        }

    const username = userResults[0].username;

    db.query('insert into  education set ?',data,(err,result)=>{
        if (err){
            console.error('Error approving blog:', err);
            return res.redirect('/portfolio_view_education');
        }
        console.log(result)

        return res.redirect('/portfolio_view_experience')

    })})

})
router.post('/auth/experience',(req,res)=>{
    const data=req.body
    const userId = req.session.userId;


    if (!userId) {
      return res.redirect('/login');
    }
    db.query('SELECT username FROM registration WHERE id = ?', [userId], (err, userResults) => {
        if (err || userResults.length === 0) {
            console.error('Error fetching user data:', err || 'User not found');
            return res.render('login', {
                successMessage: null,
                errorMessage: 'Login to fetch your details',
                blogs: [],
                username
            });
        }

    const username = userResults[0].username;

    db.query('insert into  experience set ?',data,(err,result)=>{
        if (err){
            console.error('Error approving blog:', err);
            return res.redirect('/portfolio_view_experience');
        }
        console.log(result)

        return res.redirect('/portfolio_view_references')

    })})

})
router.post('/auth/references',(req,res)=>{
    const data=req.body
    const userId = req.session.userId;


    if (!userId) {
      return res.redirect('/login');
    }
    db.query('SELECT username FROM registration WHERE id = ?', [userId], (err, userResults) => {
        if (err || userResults.length === 0) {
            console.error('Error fetching user data:', err || 'User not found');
            return res.render('login', {
                successMessage: null,
                errorMessage: 'Login to fetch your details',
                blogs: [],
                username
            });
        }

    const username = userResults[0].username;

    db.query('insert into  user_references set ?',data,(err,result)=>{
        if (err){
            console.error('Error approving blog:', err);
            return res.redirect('/portfolio_view_references');
        }
        console.log(result)

        return res.redirect('/dashboard')

    })})

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

        // Pass the blog post data to the EJS template
        const blogPost = result[0];
        res.render('blog', { blog: blogPost });
    });
});


module.exports = router;
