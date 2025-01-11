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

db.connect((err) => {
    if (!err) {
        console.log('Connected to the database');
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
        }
        res.redirect('/login_blog'); 
    }



router.get('/home', (req, res) => {
    console.log('Session Username:', req.session.username);
    const { categoryId } = req.query;  
    const username = req.session.username; 
    const mostrecent=`select form.id, form.title,form.file, form.message, categories.category, registration.username, form.create_at, form.status
                        from form   LEFT JOIN categories ON form.categoryId = categories.categoryId
                        LEFT JOIN registration ON form.user_id = registration.user_id    where form.status='approved' order by create_at desc limit 5`
    const liked=`select form.id,form.title,form.file,form.message,form.create_at,count(form.likes)from form limit 5;`

    const mostpopular1=`select form.id,form.title,form.file,form.message,form.status,form.create_at,categories.categoryId ,form.categoryId,count(comments.commentId)
                        from form
                        left join categories on categories.categoryId=form.categoryId
                        left join comments on comments.id=form.id where form.status='approved'
                        group by form.id  order by comments.commentId desc limit 1`
    const trending=`select form.id,form.title,form.file,form.message,form.create_at,count(form.likes)from form limit 5;`

   
   const mostpppular=`select form.id,form.title,form.file,form.message,form.status,form.create_at,categories.categoryId ,form.categoryId,count(comments.commentId)
                    from form
                    left join categories on categories.categoryId=form.categoryId
                    left join comments on comments.id=form.id where form.status='approved'
                    group by form.id  order by comments.commentId desc `
    db.query(
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
                    categories: []  
                });
            }

            const blogs = Array.isArray(result) ? result : [];
            console.log("Blogs:", blogs);

            db.query(mostpppular,(err,mostpopular)=>{
                if (err) {
                    console.error('Database error:', err);
                    return res.render('student_blog/index', { 
                        successMessage: null, 
                        errorMessage: 'Error occurred during fetching most popular results',
                        blogs, 
                        username,
                        categories: [] ,
                        mostpopular:[]

                    });
                }
                const mostpopula = Array.isArray(mostpopular) ? mostpopular : [];
                // console.log('here are the most popular blogs',mostpopular)
            db.query(trending,(err,trendingblogs)=>{
                if (err) {
                    console.error('Database error:', err);
                    return res.render('student_blog/index', { 
                        successMessage: null, 
                        errorMessage: 'Error occurred during fetching most popular results',
                        blogs, 
                        username,
                        categories: [] ,
                        mostpopular:[],
                        trendingblog:[]

                    });
                }
                const trendingblog = Array.isArray(trendingblogs) ? trendingblogs : [];   
                db.query(liked,(err,likeone)=>{
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
                            like:[]
    
                        });
                    }
             const like = Array.isArray(likeone) ? likeone : [];   
             db.query(mostrecent,(err,recentresults)=>{
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
                        like:[]

                    });
                }
            const recentblog = Array.isArray(recentresults) ? recentresults : [];           

                           
    
                       

            db.query('SELECT * FROM categories', (err, categories) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.render('student_blog/index', { 
                        successMessage: null, 
                        errorMessage: 'Error occurred during fetching categories',
                        blogs, 
                        username,
                        categories: [] ,
                        trendingblog
                        
                                        });
                }


                // console.log("Categories:", categories);

                if (categoryId) {
                    console.log("Fetching blogs for categoryId:", categoryId);
                    db.query(
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
                                    trendingblog


                                });
                            }

                            const categoryblog = Array.isArray(categoryblogs) ? categoryblogs : [];
                            // console.log("Category Blogs:", categoryblog);  
                            // console.log("Category Blog ID:", categoryId);

                            return res.render('student_blog/index', { 
                                blogs,
                                categories,
                                username,
                                categoryblogs: categoryblog,  
                                currentCategoryId: categoryId,
                                mostpopula:mostpopula,
                                trendingblog,
                                like:like,
                                recentblog:recentblog



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
                        recentblog:recentblog

                    });   
                }
            }); })
        })
        })
        });
});})





router.get('/student_blogform',(req,res)=>{

    db.query('SELECT * FROM categories',(err,result)=>{
        
        if (err) {
            console.error('Database error:', err);
            return res.render('form', { successMessage: null, errorMessage: 'Error occurred during submission.' });
        }
        
        console.log(result)
        
        res.render('student_blog/form', { successMessage: null, errorMessage: null ,categories:result}); 



    })


})
// router.post('/likes/:id', (req, res) => {
//     const blogId = req.params.id;
//     const username = req.session.username;

//     // Query to update blog likes
//     const updateBlogLikes = 'UPDATE form SET likes = likes + 1 WHERE id = ?';
//     // Query to update comment likes
//     const updateCommentLikes = 'UPDATE comments SET likes = likes + 1 WHERE id = ?';

//     db.query(updateCommentLikes, [blogId], (err) => {
//         if (err) {
//             console.error('Error updating comment likes:', err);
//             return res.render('student_blog/latest_news', {
//                 blog: null,
//                 successMessage: null,
//                 errorMessage: 'Error updating comment likes',
//                 comments: [],
//                 username,
//                 likes: [],
//                 likecomments: [],
//             });
//         }

//         db.query(updateBlogLikes, [blogId], (err) => {
//             if (err) {
//                 console.error('Error updating blog likes:', err);
//                 return res.render('student_blog/latest_news', {
//                     blog: null,
//                     successMessage: null,
//                     errorMessage: 'Error updating blog likes',
//                     comments: [],
//                     username,
//                     likes: [],
//                     likecomments: [],
//                 });
//             }

//             // Fetch updated blog and comments data
//             const getBlog = 'SELECT * FROM form WHERE id = ?';
//             const getComments = 'SELECT * FROM comments WHERE id = ?';

//             db.query(getBlog, [blogId], (err, blog) => {
//                 if (err || blog.length === 0) {
//                     console.error('Error fetching blog:', err);
//                     return res.render('student_blog/latest_news', {
//                         blog: null,
//                         successMessage: null,
//                         errorMessage: 'Error fetching blog',
//                         comments: [],
//                         username,
//                         likes: [],
//                         likecomments: [],
//                     });
//                 }

//                 db.query(getComments, [blogId], (err, comments) => {
//                     if (err) {
//                         console.error('Error fetching comments:', err);
//                         return res.render('student_blog/latest_news', {
//                             blog: blog[0],
//                             successMessage: null,
//                             errorMessage: 'Error fetching comments',
//                             comments: [],
//                             username,
//                             likes: blog[0].likes,
//                             likecomments: [],
//                         });
//                     }

//                     // Render the updated data
//                     return res.render('student_blog/latest_news', {
//                         blog: blog[0],
//                         successMessage: 'Blog liked successfully!',
//                         errorMessage: null,
//                         comments,
//                         username,
//                         likes: blog[0].likes,
//                         likecomments: comments.map((comment) => comment.likes),
//                     });
//                 });
//             });
//         });
//     });
// });


router.get('/latest_news/:id', (req, res) => {
    const blogId = req.params.id;
    const username = req.session.username; 

    // const likeblog=`UPDATE form SET likes=likes+1 where id=1`
    // const likecomments=`UPDATE comments SET likes=likes+1 where id=1`
    const trending=`select form.id,form.title,form.message,form.create_at,count(form.likes)from form limit 5;`
    const mostpppular=`select form.id,form.title,form.message,form.create_at,categories.categoryId ,form.categoryId,count(comments.commentId)
                     from form
                     left join categories on categories.categoryId=form.categoryId
                     left join comments on comments.id=form.id 
                     group by form.id order by comments.commentId desc`


    db.query('SELECT * FROM comments WHERE id = ?', [blogId], (err, comments) => {
        if (err) {
            console.error('Error fetching comments:', err);
            return res.render('student_blog/latest_news', { 
                blog: null, 
                successMessage: null,
                errorMessage: 'Error loading comments', 
                comments: [], 
                username ,
                
            });
        }

        db.query('SELECT * FROM form WHERE id = ?', [blogId], (err, blog) => {
            if (err) {
                console.error('Error fetching blog:', err);
                return res.render('student_blog/latest_news', { 
                    blog: null,
                    successMessage: null, 
                    errorMessage: 'Blog not found', 
                    comments, 
                    username 
                });
            }
            if (!blog || blog.length === 0) {
                return res.render('student_blog/latest_news', {
                    blog: null,
                    successMessage: null,
                    errorMessage: 'Blog not found',
                    comments,
                    username,
                });
            }
            console.log('here are the blogs',blog)
            

            return res.render('student_blog/latest_news', {
                blog: blog||[],
                successMessage: null,
                errorMessage: null, 
                comments, 
                username,
              

            });  }) })
        });
    

router.post('/blogs/:id/comment', isAuthenticated, (req, res) => {
    const blogId = req.params.id;
    console.log('Received blog ID:', blogId); // Add this for debugging
    
    const userId = req.session.userId;
    if (!userId) {
        return res.redirect('/login_blog');
    }

    const { comment_text, username, email, subjects } = req.body;
    
    // Add validation to ensure blogId exists
    if (!blogId) {
        console.error('No blog ID provided');
        return res.status(400).send('Blog ID is required');
    }

    // Insert the comment into the comments table
    db.query(
        `INSERT INTO comments (comment_text, username, email, subjects, id, user_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [comment_text, username, email, subjects, blogId, userId],
        (err, results) => {
            if (err) {
                console.error('Error creating comment:', err);
                return res.render('student_blog/latest_news', {
                    successMessage: null,
                    errorMessage: 'Error creating comment',
                    results: [],
                    blog:[]
                });
            }

            db.query('SELECT * FROM form WHERE id = ?', [blogId], (err, blogResults) => {
                if (err || blogResults.length === 0) {
                    console.error('Error fetching blog:', err);
                    return res.status(404).send('Blog not found');
                }

                const blog = blogResults[0]; 

                db.query('SELECT * FROM comments WHERE id = ?', [blogId], (err, comments) => {
                    if (err) {
                        console.error('Error fetching comments:', err);
                        return res.render('student_blog.latest_news', { 
                            errorMessage: 'Error loading comments' 
                        });
                    }

                    res.render('student_blog/latest_news', {
                        blog: blog||[],      
                        comments: comments,  
                        successMessage: 'Comment added successfully'
                    });
                });
            });
        }
    );
});

router.post('/post',upload.single('file'), (req, res) => {
   
    const filePath = req.file ? `/uploads/images/${req.file.filename}` : null
    const { title, message,categoryId,user_id } = req.body;
    const data = { file: filePath, title, message }; 

 

    db.query(
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
