const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path')

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
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });
router.get('/categories',(req,res)=>{

    res.render('student_blog/categori')
})

function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return next(); 
    } else {
        res.status(401).json({ success: false, message: 'You must be logged in to perform this action' });
    }
}




router.get('/home', (req, res) => {
    console.log('Session Username:', req.session.username);
    const { categoryId } = req.query;  
    const username = req.session.username; 
    const mostrecent=`select form.id, form.title,form.file, form.message, categories.category, registration.username, form.create_at, form.status
                        from form   LEFT JOIN categories ON form.categoryId = categories.categoryId
                        LEFT JOIN registration ON form.user_id = registration.user_id    where form.status='approved' order by create_at desc limit 5`
    const recentone=`select form.id, form.title,form.file, form.message, categories.category, registration.username, form.create_at, form.status
                        from form   LEFT JOIN categories ON form.categoryId = categories.categoryId
                        LEFT JOIN registration ON form.user_id = registration.user_id    where form.status='approved' order by create_at desc limit 1`
    const liked=`select form.id,form.title,form.file,form.message,form.create_at,count(form.likes) , 
                       categories.categoryId ,form.categoryId,registration.username 
                      from form
                        left join categories on categories.categoryId=form.categoryId
                        left join registration on form.user_id=registration.user_id
                        left join comments on comments.id=form.id where form.status='approved'
                        group by form.id  order by comments.commentId desc limit 1`

    const mostpopular1=`select form.id,form.title,form.file,form.message,form.status,form.create_at,categories.categoryId ,form.categoryId,count(comments.commentId),
                        registration.username
                        from form
                        left join categories on categories.categoryId=form.categoryId
                        left join registration on form.user_id=registration.user_id
                        left join comments on comments.id=form.id where form.status='approved'
                        group by form.id  order by comments.commentId desc limit 1`
    const trending=`select form.id,form.title,form.file,form.message,form.create_at,count(form.likes)from form limit 5`

   
   const mostpppular=`select form.id,form.title,form.file,form.message,form.status,form.create_at,categories.categoryId ,form.categoryId,count(comments.commentId)
                    from form
                    left join categories on categories.categoryId=form.categoryId
                    left join comments on comments.id=form.id where form.status='approved'
                    group by form.id  order by comments.commentId desc `
    pool.query(
        `SELECT form.id, form.title,form.file, form.message, categories.category, registration.username, form.create_at, form.status
         FROM form
         LEFT JOIN categories ON form.categoryId = categories.categoryId
         LEFT JOIN registration ON form.user_id = registration.user_id
         WHERE form.status = 'approved'`,
        (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.render('student_blog/index', { 
                    successMessage: null, 
                    errorMessage: 'Error occurred during fetching blogs',
                    blogs: [], 
                    username,
                    categories: []  ,
                    mostpopula1: [] ,
                    like:[],
                    mostrecentone:[]

                });
            }

            const blogs = Array.isArray(result) ? result : [];
            // console.log("Blogs:", blogs);

            pool.query(mostpppular,(err,mostpopular)=>{
                if (err) {
                    console.error('Database error:', err);
                    return res.render('student_blog/index', { 
                        successMessage: null, 
                        errorMessage: 'Error occurred during fetching most popular results',
                        blogs, 
                        username,
                        categories: [] ,
                        mostpopular:[],         
                        mostpopula1: [] ,like:[],mostrecentone:[]


                    });
                }
                const mostpopula = Array.isArray(mostpopular) ? mostpopular : [];
                pool.query(recentone,(err,recenti)=>{
                    if (err) {
                        console.error('Database error:', err);
                        return res.render('student_blog/index', { 
                            successMessage: null, 
                            errorMessage: 'Error occurred during fetching most popular results',
                            blogs, 
                            username,
                            categories: [] ,
                            mostpopular:[],         
                            mostpopula1: [] ,like:[],mostrecentone:[]
    
    
                        });
                    }
                    const mostrecentone = Array.isArray(recenti) ? recenti : [];
                // console.log('here are the most popular blogs',mostpopular)
            pool.query(trending,(err,trendingblogs)=>{
                if (err) {
                    console.error('Database error:', err);
                    return res.render('student_blog/index', { 
                        successMessage: null, 
                        errorMessage: 'Error occurred during fetching most popular results',
                        blogs, 
                        username,
                        categories: [] ,
                        mostpopular:[],
                        trendingblog:[],
                        mostpopula1: [] ,like:[],mostrecentone:[]


                    });
                }
                const trendingblog = Array.isArray(trendingblogs) ? trendingblogs : [];   
                 
             pool.query(mostrecent,(err,recentresults)=>{
                if (err) {
                    console.error('Database error:', err);
                    return res.render('student_blog/index', { 
                        successMessage: null, 
                        errorMessage: 'Error occurred during fetching most popular results',
                        blogs, 
                        username,
                        categories: [] ,
                        mostpopular:[],
                        trendingblog:[],
                        like:[],
                        mostpopula1: [] ,
                        mostrecentone:[]


                    });
                }
            const recentblog = Array.isArray(recentresults) ? recentresults : [];           
            pool.query(mostpopular1,(err,firstone)=>{
                if (err) {
                    console.error('Database error:', err);
                    return res.render('student_blog/index', { 
                        successMessage: null, 
                        errorMessage: 'Error occurred during fetching most popular results',
                        blogs, 
                        username,
                        categories: [] ,
                        mostpopular:[],
                        trendingblog:[],
                        mostpopula1:[],
                        like:[],mostrecentone:[]


                    });
                }
                const mostpopula1 = Array.isArray(firstone) ? firstone : [];   
                           
                pool.query(liked,(err,likeone)=>{
                    if (err) {
                        console.error('Database error:', err);
                        return res.render('student_blog/index', { 
                            successMessage: null, 
                            errorMessage: 'Error occurred during fetching most liked results',
                            blogs, 
                            username,
                            categories: [] ,
                            mostpopular:[],
                            trendingblog:[],
                            like:[],
                            mostpopula1: [] ,mostrecentone:[]

    
                        });
                    }
             const like = Array.isArray(likeone) ? likeone : [];  
             console.log('trying likes',like)

                       

            pool.query('SELECT * FROM categories', (err, categories) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.render('student_blog/index', { 
                        successMessage: null, 
                        errorMessage: 'Error occurred during fetching categories',
                        blogs, 
                        username,
                        categories: [] ,
                        trendingblog,
                        mostpopula1: mostpopula1 ,
                        like:like,
                        mostrecentone:[]


                        
                                        });
                }


                // console.log("Categories:", categories);

                if (categoryId) {
                    // console.log("Fetching blogs for categoryId:", categoryId);
                    pool.query(
                        `SELECT categories.categoryId, categories.category, form.id, form.title, form.message, form.file,form.create_at
                         FROM categories
                         LEFT JOIN form ON categories.categoryId = form.categoryId
                         WHERE categories.categoryId = ?`,
                        [categoryId],
                        (err, categoryblogs) => {
                            if (err) {
                                console.error('Database error:', err);
                                return res.render('student_blog/index', { 
                                    successMessage: null, 
                                    errorMessage: 'Error occurred during fetching blogs for category',
                                    blogs, 
                                    username,
                                    categories,
                                    categoryblogs: [],
                                    mostpopula:mostpopula,
                                    trendingblog,
                                    mostpopula1: mostpopula1 ,
                                    like:like,
                                    mostrecentone:[]




                                });
                            }

                            const categoryblog = Array.isArray(categoryblogs) ? categoryblogs : [];
                            // console.log("Category Blogs:", categoryblog);  
                            // console.log("Category Blog ID:", categoryId);
                            console.log('trying likes',like)

                            return res.render('student_blog/index', { 
                                blogs,
                                categories,
                                username,
                                categoryblogs: categoryblog,  
                                currentCategoryId: categoryId,
                                mostpopula:mostpopula,
                                trendingblog,
                                like:like,
                                recentblog:recentblog,
                                mostpopula1: mostpopula1 ,
                                mostrecentone:mostrecentone



                            });
                        });
                } else {
                    return res.render('student_blog/index', { 
                        blogs,
                        username,
                        categories,  
                        categoryblogs: [],
                        currentCategoryId: null,
                        mostpopula:mostpopula,
                        trendingblog,
                        like:like,
                        recentblog:recentblog,
                        mostpopula1:mostpopula1,
                        mostrecentone:mostrecentone


                    });   
               
                }
            }); })
        })
        })
        });
});})
});
});





router.get('/latest_news/:id', (req, res) => {
    const blogId = req.params.id;
    const username = req.session.username;

        
    pool.query('SELECT * FROM form WHERE id = ?', [blogId], (err, results) => {
                if (err) {
                    console.error('Error fetching blog:', err);
                    return res.render('student_blog/latest_news', {
                        blog: {
                            title: 'Error',
                            // Add other default properties your template might need
                        },
                        errorMessage: 'An error occurred while fetching the blog.',
                        comments: [],
                        username,
                    });
                }
        
                // If no blog found, provide default values
        const blog = results.length > 0 ? results[0] : {
                    title: 'Blog Not Found',
                    // Add other default properties your template might need
                };
       
                pool.query('SELECT * FROM categories', (err, categories) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.render('student_blog/latest_news', { 
                            successMessage: null, 
                            errorMessage: 'Error occurred during fetching categories',
                            blogs, 
                            username,
                            comments: comments,  
                            categories: [] ,
    
    
                            
                                            });
                    }
        pool.query('SELECT * FROM comments WHERE id = ? ORDER BY created_at DESC LIMIT 5;', [blogId], (err, comments) => {
            if (err) {
                console.error('Error fetching comments:', err);
                return res.render('student_blog.latest_news', { 
                    errorMessage: 'Error loading comments' 
                });
            }
            // console.log('lIKES being passed to render:', comment);

        
                return res.render('student_blog/latest_news', {
                    blog,
                    comments: comments,  
                    username,
                    categories

                });
            });
        });
        }); });
        
        
      
        // Endpoint to handle like post
        router.post('/likePost/:id', (req, res) => {
            const postId = req.params.id;
            pool.query('UPDATE comments SET likes=likes+1 where commentId=?', [postId], (err) => {
                if (err) {
                    console.error('Error creating comment:', err);
                    return res.status(500).json({ success: false, message: 'Error adding a like' });
                }
    
                res.json({ success: true, message: 'like added successfully' });
            
                             
            });
        });
        router.post('/likePosts/:id', isAuthenticated, (req, res) => {
            const postId = req.params.id;
            const userId = req.session.userId;
        
            // If the user is not logged in, send a response indicating this
            if (!userId) {
                return res.status(401).json({ success: false, message: 'You must be logged in to like a post' });
            }
        
            // Check if postId is valid
            if (!postId) {
                return res.status(400).json({ success: false, message: 'Invalid post ID' });
            }
        
            // Query the database to find the post by postId
            pool.query('SELECT * FROM form WHERE id = ?', [postId], (err, results) => {
                if (err) {
                    console.error('Error querying the database:', err);
                    return res.status(500).json({ success: false, message: 'Database error occurred' });
                }
        
                if (results.length === 0) {
                    return res.status(404).json({ success: false, message: 'Post not found' });
                }
        
                // Post found, proceed with the like update
                pool.query(
                    'UPDATE form SET likes = likes + 1 WHERE id = ?',
                    [postId],
                    (err, results) => {
                        if (err) {
                            console.error('Error updating likes:', err);
                            return res.status(500).json({ success: false, message: 'Database error occurred' });
                        }
        
                        if (results.affectedRows === 0) {
                            return res.status(404).json({ success: false, message: 'Post not found or user unauthorized' });
                        }
        
                        // Send a success response
                        res.json({ success: true, message: 'Like added successfully' });
                    }
                );
            });
        });
        
        
        
        
        

        router.post('/blogs/:id/comment', isAuthenticated, (req, res) => {
            const blogId = req.params.id;
            const userId = req.session.userId;
        
            if (!userId) {
                // return res.redirect('/login');

                return res.json({ success: false, message: 'You must be logged in to comment' });
            }
        
            const { comment_text, username, email, subjects } = req.body;
        
            if (!blogId || !comment_text || !username || !email || !subjects) {
                return res.status(400).json({ success: false, message: 'All fields are required' });
            }
        
            pool.query(
                `INSERT INTO comments (comment_text, username, email, subjects, id, user_id)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [comment_text, username, email, subjects, blogId, userId],
                (err) => {
                    if (err) {
                        console.error('Error creating comment:', err);
                        return res.status(500).json({ success: false, message: 'Error creating comment' });
                    }
        
                    res.json({ success: true, message: 'Comment added successfully' });
                }
            );
        });
        
        
        
        
        

router.post('/post',upload.single('file'), (req, res) => {
   
    const filePath = req.file ? `/uploads/images/${req.file.filename}` : null
    const { title, message,categoryId,user_id } = req.body;
    const data = { file: filePath, title, message }; 

 

    pool.query(
        `INSERT INTO form (title, message, user_id, categoryId) VALUES (?, ?, ?, ?)`, 
        [title, message, user_id, categoryId],  // Array of values, not objects
        (err, result) => {
          if (err) {
            console.error('Database error:', err);
            return res.render('form', { 
              successMessage: null, 
              errorMessage: 'Error occurred during submission.' 
            });
          }

        
            res.redirect('/student_blog/home')
        });
        
    });

module.exports = router;
