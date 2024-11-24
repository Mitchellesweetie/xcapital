const resultsPerPage=1
    const numOfResults=results.length
    let numberOfpages=Math.ceil(numOfResults/resultsPerPage)

    const page=req.query.page? Number(req.query.page):1
    if(page>numberOfpages){
        res.redirect('/pendingblogs?page='+encodeURIComponent(numberOfpages))
    }
    else if(page<1){
        res.redirect('/pendingblogs?page='+encodeURIComponent(1))

    }
    const startingLimit=(page-1)*resultsPerPage

     // let iterator=(page-5)<1?1:page -5
                // let endingLink=(iterator +9)<= numberOfpages? (iterator + 9): page +
                // (numberOfpages - page)
                // if(endingLink < (page +4)){
                //     iterator=(page + 4)-numberOfpages
                // }


    // <% if(page>1){%>
    //     <a href="/pendingblogs?page=<%= page-1 %>">before</a> 
    //     <% } %>
    //     <% for(let i=iterator;i<=endingLink;i++) {%>
    //       <% if(i===page){ %>
    //         <a href="/pendingblogs?page=<%= i %>"><%= i %></a> 
    //         <% continue; %>
    //      <% } %>
    //      <a href="/pendingblogs?page=<%= i %>"><%= i %></a> 
    //      <% } %>
    router.get('/pendingblogs', (req, res) => {
        getBlogCounts((err, counts) => {
            if (err) {
                return res.render('pendingblogs', { successMessage: null, errorMessage: 'Error fetching blog counts', blogs: [] });
            }
    
            db.query('SELECT COUNT(*) AS count FROM form', (err, results) => {
                if (err) {
                    console.error('Error fetching blog count:', err);
                    return res.render('pendingblogs', { successMessage: null, errorMessage: 'Error fetching blogs', blogs: [] });
                }
    
                const numOfResults = results[0].count;
                const numberOfPages = Math.ceil(numOfResults / resultsPerPage);
                const page = req.query.page ? Math.max(1, Math.min(Number(req.query.page), numberOfPages)) : 1;
                const startingLimit = (page - 1) * resultsPerPage;
    
                const iterator = Math.max(1, page - 5);
                const endingLink = Math.min(iterator + 9, numberOfPages);
    
                db.query('SELECT * FROM form ORDER BY create_at DESC LIMIT ?, ?', [startingLimit, resultsPerPage], (err, blogs) => {
                    if (err) {
                        console.error('Error fetching blogs:', err);
                        return res.render('pendingblogs', { successMessage: null, errorMessage: 'Error fetching blogs', blogs: [] });
                    }
                    console.log({ page, startingLimit, numberOfPages ,blogs});
    
    
                    res.render('pendingblogs', {
                        blogs,
                        totalBlogs: counts.totalBlogs || 0,
                        pendingBlogs: counts.pendingBlogs || 0,
                        approvedBlogs: counts.approvedBlogs || 0,
                        successMessage: null,
                        errorMessage: null,
                        numberOfPages,
                        page,
                        iterator,
                        endingLink,
                    });
                });
            });
        });
    });
    


    router.get('/pendingblogs', (req, res) => {
        getBlogCounts((err, counts) => {
            if (err) {
                return res.render('pendingblogs', {
                    successMessage: null,
                    errorMessage: 'Error fetching blog counts',
                    blogs: [],
                });
            }
    
            // Fetch total number of blogs for pagination
            db.query('SELECT COUNT(*) AS count FROM form', (err, results) => {
                if (err) {
                    console.error('Error fetching blog count:', err);
                    return res.render('pendingblogs', {
                        successMessage: null,
                        errorMessage: 'Error fetching blogs',
                        blogs: [],
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
    
                // Fetch the blogs for the current page
                db.query(
                    'SELECT * FROM form WHERE status="pending" ORDER BY create_at DESC LIMIT ?, ?',
                    [startingLimit, resultsPerPage],
                    (err, blogs) => {
                        if (err) {
                            console.error('Error fetching blogs:', err);
                            return res.render('pendingblogs', {
                                successMessage: null,
                                errorMessage: 'Error fetching blogs',
                                blogs: [],
                            });
                        }
    
                        // Add truncated and full content to each blog for Read More/Less functionality
                        const blogsWithFullContent = blogs.map(blog => {
                            const truncatedContent = blog.message.slice(0, 500); // Adjust character limit
                            return {
                                ...blog,
                                isFullContent: false, // Initially show truncated content
                                truncatedContent: truncatedContent, // Truncated message for initial display
                                fullContent: blog.message, // Full content for later display
                            };
                        });
    
                        // Render the page with all necessary data
                        res.render('pendingblogs', {
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
                        });
                    }
                );
            });
        });
    });


    router.post('/post', upload.single('file'), (req, res) => {
        const filePath = req.file ? `/uploads/images/${req.file.filename}` : null
        const { title, message } = req.body;
        const data = { file: filePath, title, message }; // Store the correct file path in the database
    
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
                    successMessage: 'Form created successfully!',
                    errorMessage: null,
                    totalBlogs: counts.totalBlogs || 0,
                    pendingBlogs: counts.pendingBlogs || 0,
                    approvedBlogs: counts.approvedBlogs || 0,
                });
            });
        });
    });
    

    //FRIDAY NIGHT
//     <!-- <ul class="pagination justify-content-center">
//     <% if (page > 1) { %>

//     <li class="page-item disabled">
//       <a class="page-link" href="/api/pendingblogs?page=<%= page - 1 %>">Before</a>
//     </li>
//     <% } %>
//     <% for (let i = iterator; i <= endingLink; i++) { %>
//       <% if (i === page) { %>
//     <li class="page-item">                    
//       <a  class="page-link" href="/api/pendingblogs?page=<%= i %>" class="active"><%= i %></a>
//     </li>
//     <% } else { %>

//     <li class="page-item"><a class="page-link" href="/api/pendingblogs?page=<%= i %>"><%= i %></a></li>
//     <% } %>
//     <% } %>
//     <% if (page < numberOfPages) { %>

//     <li class="page-item">
//       <a class="page-link" href="/api/pendingblogs?page=<%= page + 1 %>">Next</a>
//     </li>
//     <% } %>

//   </ul>
//   </nav> -->