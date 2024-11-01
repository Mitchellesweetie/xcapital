    const express=require('express')
    const router=express.Router()
    const mysql=require('mysql')
    const dotenv=require('dotenv')
    const cors=require('cors')

    const jwt=require('jsonwebtoken')


    dotenv.config()
    const db=mysql.createConnection({
        host: process.env.host,
        user: process.env.username,
        password: process.env.password,
        database: process.env.database

    })
    db.connect((err)=>{
        if(!err){
            console.log('Connect')
        }
        
    })


    //insert data into the table
    router.post('/post',(req,res)=>{

        const data=req.body
        db.query('INSERT INTO form SET ?', data,(err,result)=>{
            if(err)
                res.send('<h1>Error fetching data from the database</h1>')
            else 
                // res.send(result)
            res.redirect('/')
            

        })
        
    })
        
    //gets all the posts

    router.get('/pendingblogs',(req, res) => {
        db.query('SELECT * FROM form', (err, results) => {
            if (err) {
                console.error('Error fetching data:', err);
                return res.status(500).send('Database error');
            }

            // Render the EJS template with all the results
            res.render('pendingblogs', { blogs: results });
        });
    });
    //getting the blog with the id
    router.get('/pendingblogs/:id', (req, res) => {
        const blogId = req.params.id; // Get the blog ID from the URL

        db.query('SELECT * FROM form WHERE id = ?', [blogId], (err, results) => {
            if (err) {
                console.error('Error fetching blog:', err);
                return res.status(500).send('Database error');
            }
            
            // Check if the blog post exists
            if (results.length > 0) {
                const blog = results[0]; // Get the first blog post
                res.render('pendingeditview', { blog }); // Render the edit form with blog data
            } else {
                res.status(404).send('Blog not found'); // Handle case where blog does not exist
            }
        });
    });
    //update the blog
    router.post('/update/:id',(req,res)=>{
        const blogId = req.params.id; // Get the blog ID from the URL
        const { title, message } = req.body; // Get title and message from the form data

        // Update the blog post in the database
        db.query('UPDATE form SET title = ?, message = ? WHERE id = ?', [title, message, blogId], (err, results) => {
            if (err) {
                console.log('Error updating blog:');
                return res.status(500).send('Database error');
            }
            res.redirect('/api/pendingblogs'); // Redirect after successful update
        });
    })
    //get all approved blogs
    router.get('/approvedblogs', (req, res) => {
        db.query('SELECT * FROM form', (err, results) => {
            if (err) {
                console.error('Error fetching data:', err);
                return res.status(500).json({ message: 'Database error' });
            }
    
            // Render the EJS template with the results
            res.render('approvedblogs', { blogs: results });
        });
    });
    

    //approved blogs
    router.post('/approve/:id',(req,res)=>{
        const id=req.params.id
        // const data=req.body
        db.query('update form set status=? where id=?',['approved',id],(err,results)=>{
            if(err) throw err;
            

            if(results.length>0){
                const blog=results[0]
                res.status(200).render('/api/pendingblogs', {blog})}
            // else{
            //     res.status(400).send('<h1>Error in submitting forms</h1>')}
            
            
        })
    })

    module.exports=router