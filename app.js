//images,video ,audio
// Approval routes
// Form search
const express=require('express')
const bcrypt=require('bcryptjs')
const mysql=require('mysql')
const dotenv=require('dotenv')
const port=process.env.localport||process.env.port
const path=require('path')
const cors=require('cors')
const flash = require('connect-flash')
const nodemailer=require('nodemailer')
const sanitizeHtml = require('sanitize-html')
const session=require('express-session')
// const sanitizedContent = sanitizeHtml(message);


dotenv.config()

const app=express()
app.use(cors())
app.use(flash());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({limit: '20mb',extend:true}))
app.use(express.json({limit: '20mb'}))
app.use(session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 1000 * 60 * 30 }
}));
app.use('/ckeditor', express.static(path.join(__dirname, 'node_modules/@ckeditor/ckeditor5-build-classic/build')));
app.use('/api',require('./api/management/blogs'))
app.use('/auth',require('./api/management/auth'))

app.use('/uploads/images',express.static(path.join(__dirname, 'uploads/images')));

  function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return next(); 
    }
    res.redirect('/login'); 
}
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



app.get('/verify-email', (req, res) => {
    const { token } = req.query;
  
    if (!token) {
        return res.render('register', { errorMessage: 'Invalid or missing token.',successMessage:null });
    }
  
    db.query('SELECT * FROM registration WHERE verifiedToken = ?', [token], (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.render('error', { message: 'An error occurred. Please try again later.' });
        }
  
        if (results.length === 0) {
            return res.render('register', { errorMessage: 'Invalid or expired token,kindly contact the administrator',successMessage:null });
        }
  
        db.query('UPDATE registration SET isVerified = 1, verifiedToken = NULL WHERE verifiedToken = ?', [token], (updateErr) => {
            if (updateErr) {
                console.error('Error updating user verification:', updateErr);
                return res.render('register', { successMessage:null,errorMessage:'An error occurred. Please try again later.' });
            }
  
            return res.render('login', { successMessage: 'Email verified successfully! You can now log in.', errorMessage: null });
        });
    });
  });
  



app.get('/',isAuthenticated,(req, res) => {
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
            });
        }

        const username = userResults[0].username;
   
    db.query('SELECT COUNT(*) AS totalBlogs FROM form', (err, results) => {
        if (err) {
            console.error('Error fetching blog count:', err);
            return res.render('pendingblogs', { successMessage: null, errorMessage: 'Error fetching the blog count', totalBlogs: 0 });
        }

        const totalBlogs = results[0].totalBlogs;

        db.query("SELECT COUNT(ID) AS pendingBlogs FROM form WHERE status='pending'", (err, results) => {
            if (err) {
                console.error('Error fetching pending blog count:', err);
                return res.render('pendingblogs', { successMessage: null, errorMessage: 'Error fetching the pending count', pendingBlogs: 0 });
            }

            const pendingBlogs = results[0].pendingBlogs; 

            db.query("SELECT COUNT(ID) AS approvedBlogs FROM form WHERE status='approved'", (err, results) => {
                if (err) {
                    console.error('Error fetching approved blog count:', err);
                    return res.render('pendingblogs', { successMessage: null, errorMessage: 'Error fetching the approved count', approvedBlogs: 0 });
                }

                const approvedBlogs = results[0].approvedBlogs; 

                res.render('index', {
                    totalBlogs: totalBlogs,
                    pendingBlogs: pendingBlogs,
                    approvedBlogs: approvedBlogs,
                    successMessage: null,
                    errorMessage: null,
                    username
                });
            });
        });
    });
});
})
app.get('/register', (req, res) => {
    res.render('register', { successMessage: null, errorMessage: null }); 
  });
app.get('/login', (req, res) => {
    res.render('login', { successMessage: null, errorMessage: null }); 
  });
app.get('/form',isAuthenticated,(req,res)=>{

    res.render('form', { successMessage: null, errorMessage: null }); 

})

app.get('/single',(req,res)=>{
    res.render('single')
})
app.get('/elearning',(req,res)=>{
    res.render('elearning')
})
app.get('/about',(req,res)=>{
    res.render('about1')
})
app.get('/home',(req,res)=>{
    res.render('index1')
})

app.get('/login_blog',(req,res)=>{
    res.render('login1')


})
app.get('/forgetpassword',(req,res)=>{
    res.render('forgetpassword', { successMessage: null, errorMessage: null }); 


})
app.get('/contact',(req,res)=>{
    res.render('contact')


})
app.get('/ejournal',(req,res)=>{
    res.render('ejournal')


})
app.get('/register_blog',(req,res)=>{
    res.render('register1')


})
app.get('/blog_details',(req,res)=>{
    res.render('blog_details')


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




app.get('/form',(req,res)=>{
    res.render('form')
})


app.listen(process.env.port,()=>{
    console.log('listening at port  http://localhost:'+`${port}`)
})