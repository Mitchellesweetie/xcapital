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
    const recentone=`select form.id, form.title,form.file, form.message, categories.category, registration.username, form.create_at, form.status
                        from form   LEFT JOIN categories ON form.categoryId = categories.categoryId
                        LEFT JOIN registration ON form.user_id = registration.user_id    where form.status='approved' order by create_at desc limit 1`
    const liked=`select form.id,form.title,form.file,form.message,form.create_at,count(form.likes) , 
                       categories.categoryId ,form.categoryId,registration.username 
                      from form
                        left join categories on categories.categoryId=form.categoryId
                        left join registration on form.user_id=registration.user_id
                        left join comments on comments.id=form.id where form.status='approved'
                        group by form.id  order by comments.commentId desc limit 1;`

    const mostpopular1=`select form.id,form.title,form.file,form.message,form.status,form.create_at,categories.categoryId ,form.categoryId,count(comments.commentId),
                        registration.username
                        from form
                        left join categories on categories.categoryId=form.categoryId
                        left join registration on form.user_id=registration.user_id
                        left join comments on comments.id=form.id where form.status='approved'
                        group by form.id  order by comments.commentId desc limit 1`
    const trending=`select form.id,form.title,form.file,form.message,form.create_at,count(form.likes)from form limit 5;`

   
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
                    mostpopula1: [] ,like:[],mostrecentone:[]

                });
            }

            const blogs = Array.isArray(result) ? result : [];
            console.log("Blogs:", blogs);

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
                pool.query(liked,(err,likeone)=>{
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
                            mostpopula1: [] ,mostrecentone:[]

    
                        });
                    }
             const like = Array.isArray(likeone) ? likeone : [];   
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
                        mostpopula1: [] ,mostrecentone:[]


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
                        like:[],mostrecentone:[]


                        
                                        });
                }


                // console.log("Categories:", categories);

                if (categoryId) {
                    console.log("Fetching blogs for categoryId:", categoryId);
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
                                    like:like,mostrecentone:[]




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
                        mostpopula1:mostpopula1,mostrecentone:mostrecentone


                    });   
               
                }
            }); })
        })
        })
        });
});})
});
});

// router.get('/home', (req, res) => {
//     console.log('Session Username:', req.session.username);

//     const { categoryId } = req.query;
//     const username = req.session.username;

//     // Queries
//     const mostRecentQuery = `
//         SELECT form.id, form.title, form.file, form.message, categories.category, registration.username, form.create_at, form.status
//         FROM form
//         LEFT JOIN categories ON form.categoryId = categories.categoryId
//         LEFT JOIN registration ON form.user_id = registration.user_id
//         WHERE form.status = 'approved'
//         ORDER BY form.create_at DESC LIMIT 5`;

//     const likedQuery = `
//         SELECT form.id, form.title, form.file, form.message, form.create_at, COUNT(form.likes) AS likeCount
//         FROM form
//         LIMIT 5`;

//     const mostPopularQuery = `
//         SELECT form.id, form.title, form.file, form.message, form.status, form.create_at, categories.categoryId, form.categoryId, COUNT(comments.commentId) AS commentCount
//         FROM form
//         LEFT JOIN categories ON categories.categoryId = form.categoryId
//         LEFT JOIN comments ON comments.id = form.id
//         WHERE form.status = 'approved'
//         GROUP BY form.id
//         ORDER BY commentCount DESC LIMIT 1`;

//     const trendingQuery = `
//         SELECT form.id, form.title, form.file, form.message, form.create_at, COUNT(form.likes) AS likeCount
//         FROM form
//         LIMIT 5`;

//     const allPopularQuery = `
//         SELECT form.id, form.title, form.file, form.message, form.status, form.create_at, categories.categoryId, form.categoryId, COUNT(comments.commentId) AS commentCount
//         FROM form
//         LEFT JOIN categories ON categories.categoryId = form.categoryId
//         LEFT JOIN comments ON comments.id = form.id
//         WHERE form.status = 'approved'
//         GROUP BY form.id
//         ORDER BY commentCount DESC`;

//     const categoriesQuery = `SELECT * FROM categories`;

//     const categoryBlogsQuery = `
//         SELECT categories.categoryId, categories.category, form.id, form.title, form.message, form.file, form.create_at
//         FROM categories
//         LEFT JOIN form ON categories.categoryId = form.categoryId
//         WHERE categories.categoryId = ?`;

//     // Fetch main blogs
//     pool.query(
//         `SELECT form.id, form.title, form.file, form.message, categories.category, registration.username, form.create_at, form.status
//         FROM form
//         LEFT JOIN categories ON form.categoryId = categories.categoryId
//         LEFT JOIN registration ON form.user_id = registration.user_id
//         WHERE form.status = 'approved'`,
//         (err, blogs) => {
//             if (err) {
//                 console.error('Database error:', err);
//                 return res.render('student_blog/index', {
//                     successMessage: null,
//                     errorMessage: 'Error occurred during fetching blogs',
//                     blogs: [],
//                     username,
//                     categories: [],
//                     mostpopula1: []
//                 });
//             }

//             const blogList = Array.isArray(blogs) ? blogs : [];

//             // Fetch additional data
//             const promises = [
//                 pool.query(mostRecentQuery),
//                 pool.query(likedQuery),
//                 pool.query(mostPopularQuery),
//                 pool.query(trendingQuery),
//                 pool.query(allPopularQuery),
//                 pool.query(categoriesQuery)
//             ];

//             Promise.all(promises)
//                 .then(([recentResults, likesResults, mostPopularResults, trendingResults, allPopularResults, categories]) => {
//                     const recentBlogs = Array.isArray(recentResults) ? recentResults : [];
//                     const likes = Array.isArray(likesResults) ? likesResults : [];
//                     const mostPopular1 = Array.isArray(mostPopularResults) ? mostPopularResults : [];
//                     const trendingBlogs = Array.isArray(trendingResults) ? trendingResults : [];
//                     const mostPopular = Array.isArray(allPopularResults) ? allPopularResults : [];
//                     const categoryList = Array.isArray(categories) ? categories : [];

//                     // Handle category filtering
//                     if (categoryId) {
//                         console.log('Fetching blogs for categoryId:', categoryId);
//                         pool.query(categoryBlogsQuery, [categoryId], (err, categoryBlogs) => {
//                             if (err) {
//                                 console.error('Database error:', err);
//                                 return res.render('student_blog/index', {
//                                     successMessage: null,
//                                     errorMessage: 'Error occurred during fetching category blogs',
//                                     blogs: blogList,
//                                     username,
//                                     categories: categoryList,
//                                     categoryblogs: [],
//                                     currentCategoryId: categoryId,
//                                     mostpopula: mostPopular,
//                                     trendingblog: trendingBlogs,
//                                     like: likes,
//                                     recentblog: recentBlogs,
//                                     mostpopula1: mostPopular1
//                                 });
//                             }

//                             const categoryBlogList = Array.isArray(categoryBlogs) ? categoryBlogs : [];

//                             return res.render('student_blog/index', {
//                                 blogs: blogList,
//                                 username,
//                                 categories: categoryList,
//                                 categoryblogs: categoryBlogList,
//                                 currentCategoryId: categoryId,
//                                 mostpopula: mostPopular,
//                                 trendingblog: trendingBlogs,
//                                 like: likes,
//                                 recentblog: recentBlogs,
//                                 mostpopula1: mostPopular1
//                             });
//                         });
//                     } else {
//                         return res.render('student_blog/index', {
//                             blogs: blogList,
//                             username,
//                             categories: categoryList,
//                             categoryblogs: [],
//                             currentCategoryId: null,
//                             mostpopula: mostPopular,
//                             trendingblog: trendingBlogs,
//                             like: likes,
//                             recentblog: recentBlogs,
//                             mostpopula1: mostPopular1
//                         });
//                     }
//                 })
//                 .catch(err => {
//                     console.error('Error during parallel query execution:', err);
//                     return res.render('student_blog/index', {
//                         successMessage: null,
//                         errorMessage: 'Error occurred during fetching additional data',
//                         blogs: blogList,
//                         username,
//                         categories: [],
//                         mostpopula1: []
//                     });
//                 });
//         }
//     );
// });


router.get('/student_blogform',(req,res)=>{

    pool.query('SELECT * FROM categories',(err,result)=>{
        
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

//     pool.query(updateCommentLikes, [blogId], (err) => {
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

//         pool.query(updateBlogLikes, [blogId], (err) => {
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

//             pool.query(getBlog, [blogId], (err, blog) => {
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

//                 pool.query(getComments, [blogId], (err, comments) => {
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


// router.get('/latest_news/:i', (req, res) => {
//     const blogId = req.params.id;
//     const username = req.session.username; 

//     // const likeblog=`UPDATE form SET likes=likes+1 where id=1`
//     const likecomments=`UPDATE comments SET likes=likes+1 where id=1`
//     const trending=`select form.id,form.title,form.message,form.create_at,count(form.likes)from form limit 5;`
//     const mostpppular=`select form.id,form.title,form.message,form.create_at,categories.categoryId ,form.categoryId,count(comments.commentId)
//                      from form
//                      left join categories on categories.categoryId=form.categoryId
//                      left join comments on comments.id=form.id 
//                      group by form.id order by comments.commentId desc`


//     pool.query('SELECT * FROM comments WHERE id = ?', [blogId], (err, comments) => {
//         if (err) {
//             console.error('Error fetching comments:', err);
//             return res.render('student_blog/latest_news', { 
//                 blog: null, 
//                 successMessage: null,
//                 errorMessage: 'Error loading comments', 
//                 comments: [], 
//                 username ,
                
//             });
//         }

//         pool.query('SELECT * FROM form WHERE id = ?', [blogId], (err, blog) => {
//             if (err) {
//                 console.error('Error fetching blog:', err);
//                 return res.render('student_blog/latest_news', { 
//                     blog: null,
//                     successMessage: null, 
//                     errorMessage: 'Blog not found', 
//                     comments:[], 
//                     username 
//                 });
//             }
//             if (!blog || blog.length === 0) {
//                 return res.render('student_blog/latest_news', {
//                     blog: null,
//                     successMessage: null,
//                     errorMessage: 'Blog not found',
//                     comments:[],
//                     username,
//                 });
//             }
//             console.log('here are the blogs',blog)
            

//             return res.render('student_blog/latest_news', {
//                 blog: blog||[],
//                 successMessage: null,
//                 errorMessage: null, 
//                 comments:comments, 
//                 username,
              

//             });  }) })
//         });




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

                });
            });
        });
        });
        
        
      
        // Endpoint to handle like post
        router.post('/likePost:id', (req, res) => {
            const postId = req.params.id;
            pool.query('UPDATE comments SET likes=likes+1 where commentId=?', [postId], (err) => {
                if (err) {
                    console.error('Error creating comment:', err);
                    return res.status(500).json({ success: false, message: 'Error adding a like' });
                }
    
                res.json({ success: true, message: 'like added successfully' });
            
                             
            });
        });

        router.post('/blogs/:id/comment', isAuthenticated, (req, res) => {
            const blogId = req.params.id;
            const userId = req.session.userId;
        
            if (!userId) {
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
