/**********************************************************************************  
 * BTI325 – Assignment 02* 
 * I declare that this assignment is my own work in accordance with Seneca Academic 
 * Policy. No part* of this assignment has been copied manually or electronically 
 * from any other source* (including 3rd party web sites) or distributed
 *  to other students.*
 * 
 * * Name: __Luqman__Dirie___ Student ID: __108737222___ Date: __11/3/23__*
 * 
 * * Online (Cyclic) Link: ____https://sangria-iguana-hem.cyclic.cloud_______
 * 
 * *********************************************************************************/
const path = require('path');
const Handlebars = require('handlebars');


const blogService = require('./blog-service.js');
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));
const exphbs = require('express-handlebars');

const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const stripJs = require('strip-js');

const PORT = process.env.PORT || 8080;

cloudinary.config({
    cloud_name: 'djvn4evjm',
    api_key: '685418754863581',
    api_secret: '2KuIyS0xSYL-ylQvg8RE2-vqncM',
    secure: true
});

const upload = multer();

app.use(express.static('public'));

const formatDate = function(dateObj) {
    let year = dateObj.getFullYear();
    let month = (dateObj.getMonth() + 1).toString();
    let day = dateObj.getDate().toString();
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        safeHTML: function(content) {
            return new Handlebars.SafeString(stripJs(content));
        },      
        navLink: function(url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        formatDate: formatDate
    }
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});



app.get('/categories/add', (req, res) => {
    res.render('addCategory');
});

app.post('/categories/add', (req, res) => {
    blogService.addCategory({ name: req.body.name })
    .then(() => {
        res.redirect('/categories');
    })
    .catch(err => {
        // Handle error
        res.status(500).send("Unable to add category: " + err);
    });
});

app.get('/categories/delete/:id', (req, res) => {
    console.log("Attempting to delete category with ID:", req.params.id);
    blogService.deleteCategoryById(req.params.id)
        .then(() => res.redirect('/categories'))
        .catch(err => {
            console.error("Error when deleting category:", err);
            res.status(500).send("Unable to Remove Category / Category not found");
        });
});

app.get('/posts/delete/:id', (req, res) => {
    console.log('Attempting to delete post with ID:', req.params.id);
    blogService.deletePostById(req.params.id)
    .then(() => {
        res.redirect('/posts');
    })
    .catch(err => {
        console.error('Error deleting post:', err);
        res.status(500).send("Unable to Remove Post / Post not found");
    });
});





app.get('/', (req, res) => {
   res.redirect('/about');
});

app.get('/about', (req, res) => {
    res.render('about');
});
 
app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogService.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogService.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogService.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})

});

app.get('/blog/:id', async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};

    try {
        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogService.getPublishedPostsByCategory(req.query.category);
        } else {
            // Obtain the published "posts"
            posts = await blogService.getPublishedPosts();
        }

        // Sort the published posts by postDate
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

        // Store the "posts" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    } catch(err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the post by "id" from the route parameter
        viewData.post = await blogService.getPostById(req.params.id);

    } catch(err) {
        // If there is an error or no post is found, set the message accordingly
        console.log(err);
        viewData.message = "no results"; 
    }

    try {
        // Obtain the full list of "categories"
        let categories = await blogService.getCategories();

        // Store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;

    } catch(err) {
        viewData.categoriesMessage = "no results"
    }

    // Render the "blog" view with all of the data (viewData)
    console.log(viewData.post);
    res.render("blog", {data: viewData});
});

app.get('/posts', (req, res) => {
    let getPosts;

    if (req.query.category) {
        getPosts = blogService.getPostsByCategory(req.query.category);
    } else if (req.query.minDate) {
        getPosts = blogService.getPostsByMinDate(req.query.minDate);
    } else {
        getPosts = blogService.getAllPosts();
    }

    getPosts.then(posts => {
        // Convert Sequelize objects to plain objects
        const plainPosts = posts.map(post => post.get({ plain: true }));

        if (plainPosts.length > 0) {
            res.render("posts", { posts: plainPosts });
        } else {
            res.render("posts", { message: "no results" });
        }
    }).catch(err => {
        console.error("Error retrieving posts:", err);
        res.render("posts", { message: "Error: " + err });
    });
});


app.get('/post/:id', (req, res) => {
    blogService.getPostById(req.params.id)
    .then(data => {
        if(data) {
            res.json(data);
        } else {
            res.status(404).send("Post not found");
        }
    })
    .catch(err => {
        res.status(500).json({message: err});
    });
});

app.get('/categories', (req, res) => {
    blogService.getCategories().then(categories => {
        const plainData = categories.map(category => category.get({ plain: true }));
        console.log(plainData);

        if (plainData && plainData.length > 0) {
            res.render("categories", { categories: plainData });
        } else {
            res.render("categories", { message: "no results" });
        }
    }).catch(err => {
        res.render("categories", { message: "Error: " + err });
    });
});


app.get('/posts/add', (req, res) => {
    blogService.getCategories()
    .then(categories => {
        const plainCategories = categories.map(category => category.get({ plain: true }));
        res.render('addPost', { categories: plainCategories });
    })
    .catch(err => {
        console.error(err);
        res.render('addPost', { categories: [] });
    });
});

let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
            if (result) {
                resolve(result);
            } else {
                reject(error);
            }
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
};

app.post('/posts/add', upload.single("featureImage"), (req, res) => {
    async function uploadImage() {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }

    uploadImage().then((uploaded) => {
        req.body.featureImage = uploaded.url;
        let currentDate = new Date();
        req.body.postDate = currentDate.toISOString().split('T')[0];
        blogService.addPost(req.body)
        .then(() => {
            res.redirect('/posts');
        })
        .catch(err => {
            res.status(500).send("Error adding post: " + err);
        });
    });
});

app.use((req, res) => {
    res.status(404).render('404');
});

// The updated initialization logic from Step 5
blogService.initialize()
.then(() => {
    app.listen(PORT, () => {
        console.log(`Express http server listening on port ${PORT}`);
    });
})
.catch((err) => {
    console.error("Error initializing:", err);
});