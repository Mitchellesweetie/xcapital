
const express=require('express')
const bcrypt=require('bcryptjs')
const mysql=require('mysql')
const dotenv=require('dotenv')
const port=process.env.localport
// const port=process.env.localport||process.env.port
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path=require('path')
const cors=require('cors')
const flash = require('connect-flash')
const nodemailer=require('nodemailer')
const sanitizeHtml = require('sanitize-html')
const session=require('express-session')
const puppeteer = require('puppeteer');

// const sanitizedContent = sanitizeHtml(message);
const resume=require('./api/management/portfolio')
const categories=require('./api/management/admin')
const student_blog=require('./api/management/student_blogs')


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
app.use(cookieParser());
app.use(session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: process.env.NODE_ENV ? process.env.NODE_ENV === 'production' : false,
        // httpOnly: true,
        maxAge: 24* 60 * 60 * 1000 }
}));
app.use(morgan('combined'))
app.use('/ckeditor', express.static(path.join(__dirname, 'node_modules/@ckeditor/ckeditor5-build-classic/build')));
app.use('/api',require('./api/management/blogs'))
// app.use('/auth',require('./api/management/auth'))
app.use(resume)
app.use('/',categories)
app.use('/student_blog',student_blog)
app.use(require('./api/management/admin_auth'))
app.use(require('./api/management/publicroutes'))
app.use(require('./api/management/student_auth'))



app.use('/uploads/images',express.static(path.join(__dirname, 'uploads/images')));

function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return next(); 
    }
    res.redirect('/login'); 
}
// function isAdmin(req, res, next) {
//   if (req.session && req.session.userRole === 'admin') {
//       return next();
//   }
//   res.status(403).render('error', { message: 'Access denied.' }); 
// }
function isAdmin(req, res, next) {
    if (!req.session.admin)
         {        return next();
    }
    return res.status(403).render('error', { message: 'Access Denied. Admins only.' });
  }
const db=mysql.createConnection({
    host: process.env.host,
    user: process.env.username,
    password: process.env.password,
    database: process.env.database

})
db.connect((err)=>{
    if(err){
        // console.log('Connect')
        console.log(err)
    }

    
})


app.get('/student_blog',(req,res)=>{

    res.redirect('/student_blog/home')
})
app.get('/api',isAdmin,(req,res)=>{

    res.redirect('/')
})

app.post('/blogs/:id/comment', isAuthenticated, (req, res) => {
    const blogId = req.params.id;
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect('/login_blog');
    }

    const { comment_text, username, email, subjects } = req.body;

    db.query(
        `INSERT INTO comments (comment_text, username, email, subjects, blog_id, user_id) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [comment_text, username, email, subjects, blogId, userId],
        (err, results) => {
            if (err) {
                console.error('Error creating comment:', err);
                return res.render('student_blog/latest_news', { 
                    successMessage: null, 
                    errorMessage: 'Error creating comment', 
                    results: [] 
                });
            }

            db.query('SELECT * FROM comments WHERE blog_id = ?', [blogId], (err, comments) => {
                if (err) {
                    console.error('Error fetching comments:', err);
                    return res.render('student_blog/home', {
                        successMessage: null,
                        errorMessage: 'Error loading comments',
                    });
                }

                res.render('student_blog/home', {
                    blog: results,
                    comments: comments,
                });
            });
        }
    );
});

app.get('/',isAdmin,(req, res) => {
    // const userId = req.session.userId;

    // if (!userId) {
    //   return res.redirect('/login');
    // }
    // db.query('SELECT username FROM registration WHERE id = ?', [userId], (err, userResults) => {
    //     if (err || userResults.length === 0) {
    //         console.error('Error fetching user data:', err || 'User not found');
    //         return res.render('login', {
    //             successMessage: null,
    //             errorMessage: 'Login to fetch your details',
    //             blogs: [],
    //         });
    //     }

    //     const username = userResults[0].username;
   
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
                    // username
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
app.get('/elearning',(req,res)=>{
    res.render('elearning')
})
app.get('/about',(req,res)=>{
    res.render('about1')
})
app.get('/home',(req,res)=>{
    res.render('index1')
})


app.get('/forgetpassword',(req,res)=>{
    res.render('forgetpassword', { successMessage: null, errorMessage: null }); 


})
app.get('/contact',(req,res)=>{
    res.render('contact')


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


app.get('/verify-email', (req, res) => {
    const { token } = req.query;
  
    if (!token) {
        return res.render('Login/register1', { errorMessage: 'Invalid or missing token.',successMessage:null });
    }
  
    db.query('SELECT * FROM registration WHERE verifiedToken = ?', [token], (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.render('error', { message: 'An error occurred. Please try again later.' });
        }
  
        if (results.length === 0) {
            return res.render('Login/register1', { errorMessage: 'Invalid or expired token,kindly contact the administrator',successMessage:null });
        }
  
        db.query('UPDATE registration SET isVerified = 1, verifiedToken = NULL WHERE verifiedToken = ?', [token], (updateErr) => {
            if (updateErr) {
                console.error('Error updating user verification:', updateErr);
                return res.render('Login/register1', { successMessage:null,errorMessage:'An error occurred. Please try again later.' });
            }
  
            return res.render('Login/login', { successMessage: 'Email verified successfully! You can now log in.', errorMessage: null });
        });
    });
  });
  

app.listen(process.env.localport,()=>{
    console.log('listening at port  http://localhost:'+`${port}`)

})