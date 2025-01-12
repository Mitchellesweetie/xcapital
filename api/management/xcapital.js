const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path')

dotenv.config();
const db = mysql.createConnection({
    host: process.env.host,
    user: process.env.username,
    password: process.env.password,
    database: process.env.database
});
router.get('/',(req,res)=>{

    res.render('xcapital/index')
})
router.get('/services',(req,res)=>{

    res.render('xcapital/course')
})
router.get('/about',(req,res)=>{

    res.render('xcapital/about')
})
router.get('/teacher',(req,res)=>{

    res.render('xcapital/teacher')
})
router.get('/blog',(req,res)=>{

    res.render('xcapital/single')
})
router.get('/about',(req,res)=>{

    res.render('xcapital/about')
})
router.get('/apply',(req,res)=>{

    res.render('xcapital/apply')
})
router.get('/students_blogs', (req, res) => {

    const perPage = 8;
    let page = req.query.page || 1;  
    page = parseInt(page);
    const offset = (page - 1) * perPage;

    const blogQuery = `
SELECT 
    form.id, 
    form.title, 
    form.file, 
    form.message, 
    form.status, 
    form.create_at, 
    categories.categoryId, 
    form.categoryId, 
    COUNT(comments.commentId) AS comment_count
FROM form 
LEFT JOIN categories  ON form.categoryId = categories.categoryId
LEFT JOIN comments  ON comments.id = form.id
WHERE form.status = 'approved'
GROUP BY form.id, categories.categoryId, form.categoryId
ORDER BY comment_count DESC  LIMIT ? OFFSET ?
    `;
    
    db.query(blogQuery, [perPage, offset], (err, results) => {
        if (err) {
            return res.send('Error fetching blogs');
        }

        const totalBlogsQuery = `SELECT COUNT(*) AS total FROM form WHERE status = 'approved'`;

        db.query(totalBlogsQuery, (err, countResult) => {
            if (err) {
                return res.send('Error fetching total blog count');
            }

            const totalBlogs = countResult[0].total;  
            const totalPages = Math.ceil(totalBlogs / perPage);

            const midpoint = Math.floor(results.length / 2);
            const firstHalf = results.slice(0, midpoint);
            const secondHalf = results.slice(midpoint);

            const iterator = Math.max(1, page - 2);
            const endingLink = Math.min(totalPages, page + 2);

            res.render('xcapital/blog', {
                firstcolumn: firstHalf,
                secondcolumn: secondHalf,
                page: page,
                numberOfPages: totalPages,
                iterator: iterator,
                endingLink: endingLink
            });
        });
    });
});

module.exports = router;
