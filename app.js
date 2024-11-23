// messages done
//login done but need to verify your login link
//images
//remove all res.send done
//read more done 
//on update and approve need to see the latest blogs
const express=require('express')
const bcrypt=require('bcryptjs')
const mysql=require('mysql')
const dotenv=require('dotenv')
const port=process.env.localport||process.env.port
const path=require('path')
const cors=require('cors')
const flash = require('connect-flash')


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
const app=express()
app.use(cors())
app.use(flash());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({limit: '20mb',extend:true}))// parse url encoded bodies (as sent as HTML forms)
app.use(express.json({limit: '20mb'}))


app.use('/api',require('./api/management/blogs'))
app.use('/auth',require('./api/management/auth'))

app.use('/uploads/images',express.static(path.join(__dirname, 'uploads/images')));

app.get('/', (req, res) => {
    // Query to get the total number of blogs
    db.query('SELECT COUNT(*) AS totalBlogs FROM form', (err, results) => {
        if (err) {
            console.error('Error fetching blog count:', err);
            return res.render('pendingblogs', { successMessage: null, errorMessage: 'Error fetching the blog count', totalBlogs: 0 });
        }

        const totalBlogs = results[0].totalBlogs; // Get total blog count

        // Query to get the number of pending blogs
        db.query("SELECT COUNT(ID) AS pendingBlogs FROM form WHERE status='pending'", (err, results) => {
            if (err) {
                console.error('Error fetching pending blog count:', err);
                return res.render('pendingblogs', { successMessage: null, errorMessage: 'Error fetching the pending count', pendingBlogs: 0 });
            }

            const pendingBlogs = results[0].pendingBlogs; // Get pending blog count

            // Query to get the number of approved blogs
            db.query("SELECT COUNT(ID) AS approvedBlogs FROM form WHERE status='approved'", (err, results) => {
                if (err) {
                    console.error('Error fetching approved blog count:', err);
                    return res.render('pendingblogs', { successMessage: null, errorMessage: 'Error fetching the approved count', approvedBlogs: 0 });
                }

                const approvedBlogs = results[0].approvedBlogs; // Get approved blog count

                // Now render the 'index' page and pass the data
                res.render('index', {
                    totalBlogs: totalBlogs,
                    pendingBlogs: pendingBlogs,
                    approvedBlogs: approvedBlogs
                });
            });
        });
    });
});

app.get('/register', (req, res) => {
    res.render('register', { successMessage: null, errorMessage: null }); 
  });
app.get('/login', (req, res) => {
    res.render('login', { successMessage: null, errorMessage: null }); 
  });
app.get('/form',(req,res)=>{

    res.render('form', { successMessage: null, errorMessage: null }); 

})

app.get('/single',(req,res)=>{
    res.render('single')
})
app.get('/teacher',(req,res)=>{
    res.render('teacher')
})
app.get('/about',(req,res)=>{
    res.render('about')
})
app.get('/home',(req,res)=>{
    res.render('home')
})
app.get('/course',(req,res)=>{
    res.render('course')
})
app.get('/blog',(req,res)=>{

        db.query('SELECT * FROM form', (err, results) => {
            if (err) {
                console.error('Error fetching data:', err);
                return res.status(500).send('Database error');
            }
            const blogs=results.slice(0,2)
            const sidebarPosts = results.slice(2,6);

            // Render the EJS template with all the results
            res.render('blog', { blogs,sidebarPosts});
        });
    });
app.get('/apply',(req,res)=>{
    res.render('apply')
})



app.get('/form',(req,res)=>{
    res.render('form')
})


app.listen(process.env.port,()=>{
    console.log('listening at port  http://localhost:'+`${port}`)
})