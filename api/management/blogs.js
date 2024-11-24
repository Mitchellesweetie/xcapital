const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');

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

// Image upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });

// function to get blog counts
const getBlogCounts = (callback) => {
    const countsQuery = `
        SELECT 
            (SELECT COUNT(*) FROM form) AS totalBlogs,
            (SELECT COUNT(ID) FROM form WHERE status='pending') AS pendingBlogs,
            (SELECT COUNT(ID) FROM form WHERE status='approved') AS approvedBlogs;
    `;
    db.query(countsQuery, (err, results) => {
        if (err) {
            console.error('Error fetching blog counts:', err);
            return callback(err, null);
        }
        console.log('Blog counts:', results[0]); 
        return callback(null, results[0]);
    });
};

function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return next(); 
    }
    res.redirect('/login'); 
}

// Insert new blog post
router.post('/post',isAuthenticated, upload.single('file'), (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
      return res.redirect('/login');
    }
    const filePath = req.file ? `/uploads/images/${req.file.filename}` : null
    const { title, message } = req.body;
    const data = { file: filePath, title, message }; 

    getBlogCounts((err, counts) => {
        if (err) {
            return res.render('pendingblogs', { successMessage: null, errorMessage: 'Error fetching blog counts', blogs: [] });
        }

        db.query('INSERT INTO form SET ?', data, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.render('form', { successMessage: null, errorMessage: 'Error occurred during submission.' });
            }

            res.render('index', {
                successMessage: 'Blog created successfully waiting for Approval!',
                errorMessage: null,
                totalBlogs: counts.totalBlogs || 0,
                pendingBlogs: counts.pendingBlogs || 0,
                approvedBlogs: counts.approvedBlogs || 0,
            });
        });
    });
});
//getting blogs
router.get('/pendingblogs', isAuthenticated,(req, res) => {
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
    getBlogCounts((err, counts) => {
        if (err) {
            return res.render('pendingblogs', { successMessage: null, errorMessage: 'Error fetching blog counts', blogs: [] });
        }

        db.query('SELECT * FROM form ORDER BY create_at DESC', (err, blogs) => {
            if (err) {
                console.error('Error fetching blogs:', err);
                return res.render('pendingblogs', { successMessage: null, errorMessage: 'Error fetching blogs', blogs: [] });
            }

            // Process blogs to add truncated and full content
            const blogsWithFullContent = blogs.map(blog => {
                const truncatedContent = blog.message.slice(0, 500); // Truncate message to 50 characters
                return {
                    ...blog,
                    isFullContent: false, // Initially show truncated content
                    truncatedContent: truncatedContent, // Truncated message for initial display
                    fullContent: blog.message, // Full content for later display
                };
            });

            // Render the template with the modified blog data
            res.render('pendingblogs', {
                blogs: blogsWithFullContent, // Pass the blogs data with full and truncated content
                totalBlogs: counts.totalBlogs || 0,
                pendingBlogs: counts.pendingBlogs || 0,
                approvedBlogs: counts.approvedBlogs || 0,
                successMessage: null,
                errorMessage: null,
                username
            });
        });
    });
});
})
//PENDING AGAIN
// router.get('/pendingblogs', (req, res) => {
//     getBlogCounts((err, counts) => {
//         if (err) {
//             return res.render('pendingblogs', {
//                 successMessage: null,
//                 errorMessage: 'Error fetching blog counts',
//                 blogs: [],
//             });
//         }

//         db.query('SELECT COUNT(*) AS count FROM form WHERE status="pending"', (err, results) => {
//             if (err) {
//                 console.error('Error fetching blog count:', err);
//                 return res.render('pendingblogs', {
//                     successMessage: null,
//                     errorMessage: 'Error fetching blogs',
//                     blogs: [],
//                 });
//             }

//             const numOfResults = results[0].count;
//             const resultsPerPage = 2;
//             const numberOfPages = Math.ceil(numOfResults / resultsPerPage);
//             const page = req.query.page ? Math.max(1, Math.min(Number(req.query.page), numberOfPages)) : 1;
//             const startingLimit = (page - 1) * resultsPerPage;

//             const iterator = Math.max(1, page - 2);
//             const endingLink = Math.min(iterator + 4, numberOfPages);

//             db.query(
//                 'SELECT  * FROM form WHERE status="pending" ORDER BY create_at DESC LIMIT ?, ?',
//                 [startingLimit, resultsPerPage],
//                 (err, blogs) => {
//                     if (err) {
//                         console.error('Error fetching blogs:', err);
//                         return res.render('pendingblogs', {
//                             successMessage: null,
//                             errorMessage: 'Error fetching blogs',
//                             blogs: [],
//                         });
//                     }

                 
//                     const blogsWithFullContent = blogs.map(blog => {
//                         const truncatedContent = blog.message.slice(0, 500); // Truncate message to 50 characters
//                         return {
//                             ...blog,
//                             isFullContent: false, // Initially show truncated content
//                             truncatedContent: truncatedContent, // Truncated message for initial display
//                             fullContent: blog.message, // Full content for later display
//                         };
//                     });

//                     res.render('pendingblogs', {
//                         blogs: blogsWithFullContent,
//                         totalBlogs: counts.totalBlogs || 0,
//                         pendingBlogs: counts.pendingBlogs || 0,
//                         approvedBlogs: counts.approvedBlogs || 0,
//                         successMessage: null,
//                         errorMessage: null,
//                         numberOfPages,
//                         page,
//                         iterator,
//                         endingLink,
//                     });
//                 }
//             );
//         });
//     });
// });



// Get pending blogs



// Get specific blog by ID
router.get('/pendingblogs/:id', isAuthenticated,(req, res) => {
    const userId = req.session.userId;

    if (!userId) {
      return res.redirect('/login');
    }
    const blogId = req.params.id;
    getBlogCounts((err, counts) => {
        if (err) {
            return res.render('pendingblogs', { successMessage: null, errorMessage: 'Error fetching blog counts', blogs: [] });
        }

        db.query('SELECT * FROM form WHERE id = ?', [blogId], (err, blog) => {
            if (err) {
                console.error('Error fetching blog:', err);
                return res.render('pendingblogs', { successMessage: null, errorMessage: 'Error fetching blog', blogs: [] });
            }

            if (blog.length > 0) {
                return res.render('pendingeditview', {
                    blog: blog[0],
                    successMessage: null,
                    errorMessage: null
                });
            }

            res.render('pendingblogs', {
                successMessage: null,
                errorMessage: 'No blog found',
                blogs: [],
                totalBlogs: counts.totalBlogs || 0,
                pendingBlogs: counts.pendingBlogs || 0,
                approvedBlogs: counts.approvedBlogs || 0,
            });
        });
    });
});

// Update the blog
router.post('/update/:id',isAuthenticated, (req, res) => {
    const blogId = req.params.id
    const data = req.body

   
        getBlogCounts((err, counts) => {
        if (err) {
            return res.render('pendingblogs', { successMessage: null, errorMessage: 'Error fetching blog counts', blogs: [] });
        }
        db.query('UPDATE form SET ? WHERE id = ?', [data,blogId], (err, result) => {
            if (err) {
                console.error('Error approving blog:', err);
                return res.redirect('/')
            }
     
        
            db.query('SELECT * FROM form WHERE status = "pending" ORDER BY create_at DESC', (err, blogs) => {
                if (err) {
                    console.error('Error fetching blogs:', err);
                    return res.render('pendingblogs', { successMessage: null, errorMessage: 'Error fetching blogs', blogs: [] });
                }
                
                res.render('index', { 
                    blogs,
                    successMessage: 'Blog Updated Successfully', 
                    errorMessage: null,
                    totalBlogs: counts.totalBlogs || 0,
                    pendingBlogs: counts.pendingBlogs || 0,
                    approvedBlogs: counts.approvedBlogs || 0,
                });
            });
        });
        
    });
});

// Get all approved blogs
router.get('/approvedblogs', isAuthenticated,(req, res) => {
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
    getBlogCounts((err, counts) => {
        if (err) {
            return res.render('approvedblogs', { successMessage: null, errorMessage: 'Error fetching blog counts', blogs: [] });
        }
        db.query('SELECT COUNT(*) AS count FROM form', (err, results) => {
            if (err) {
                console.error('Error fetching blog count:', err);
                return res.render('pendingblogs', {
                    successMessage: null,
                    errorMessage: 'Error fetching blogs',
                    blogs: [],
                    username,
                });
            }

            const numOfResults = results[0].count;
            const resultsPerPage = 2; // Define how many results per page
            const numberOfPages = Math.ceil(numOfResults / resultsPerPage);
            const page = req.query.page ? Math.max(1, Math.min(Number(req.query.page), numberOfPages)) : 1;
            const startingLimit = (page - 1) * resultsPerPage;

            // Calculate the pagination range
            const iterator = Math.max(1, page - 5);
            const endingLink = Math.min(iterator + 9, numberOfPages);

        db.query('SELECT  * FROM form WHERE status="approved" ORDER BY create_at DESC LIMIT ?, ?',
                [startingLimit, resultsPerPage], (err, blogs) => {
            if (err) {
                console.error('Error fetching approved blogs:', err);
                return res.render('approvedblogs', { successMessage: null, errorMessage: 'Error fetching approved blogs', blogs: [] });
            }
            const blogsWithFullContent = blogs.map(blog => {
                const truncatedContent = blog.message.slice(0, 50); // Truncate message to 10 characters
                return {
                    ...blog,
                    isFullContent: false, // Initially show truncated content
                    truncatedContent: truncatedContent, // Truncated message for initial display
                    fullContent: blog.message, // Full content for later display
                };
            });
            res.render('approvedblogs', {
                blogs: blogsWithFullContent,
                totalBlogs: counts.totalBlogs || 0,
                pendingBlogs: counts.pendingBlogs || 0,
                approvedBlogs: counts.approvedBlogs || 0,
                successMessage: null,
                errorMessage: null,
                numberOfPages,
                page,
                iterator,
                endingLink,
                username,
            });
        })
        });
        
    });
});
})

router.post('/approve/:id', isAuthenticated,(req, res) => {
    const userId = req.session.userId;

    if (!userId) {
      return res.redirect('/login');
    }
    const id = req.params.id;

    db.query('UPDATE form SET status = ? WHERE id = ?', ['approved', id], (err, result) => {
        if (err) {
            console.error('Error approving blog:', err);
            return res.render('index', { successMessage: null, errorMessage: 'Error approving the blog', blogs: [] });
        }

        if (result.affectedRows > 0) {
            getBlogCounts((err, counts) => {
                if (err) {
                    return res.render('index', { successMessage: null, errorMessage: 'Error fetching blog counts', blogs: [] });
                }
                const page = req.query.page || 1;
                res.redirect(`/pendingblogs?page=${page}`);
                
                });
            
        } else {
            res.render('pendingblogs', {
                successMessage: null,
                errorMessage: 'Error while approving the blog',
                blogs: [],
                totalBlogs: 0,
                pendingBlogs: 0,
                approvedBlogs: 0
            });
        }
    });
});

router.get('/search',isAuthenticated,(req,res)=>{
    const userId = req.session.userId;

    if (!userId) {
      return res.redirect('/login');
    }

    const data=req.body
    db.query('select * from form',data,(err,results)=>{
        if (err) {
            console.error('Error Fetching blog:', err);
            return res.render('index', { successMessage: null, errorMessage: 'Error fetching  blogs', blogs: [] });
        }

    })

})



module.exports = router;
