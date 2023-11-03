/**********************************************************************************  
 * BTI325 – Assignment 02* 
 * I declare that this assignment is my own work in accordance with Seneca Academic 
 * Policy. No part* of this assignment has been copied manually or electronically 
 * from any other source* (including 3rd party web sites) or distributed
 *  to other students.*
 * 
 * * Name: __Luqman__Dirie___ Student ID: __108737222___ Date: __10/20/23__*
 * 
 * * Online (Cyclic) Link: ____https://sangria-iguana-hem.cyclic.cloud_______
 * 
 * *********************************************************************************/
const path = require('path');
const Handlebars = require('handlebars');


const blogService = require('./blog-service.js');
const express = require('express');
const app = express();
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
        }
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

    getPosts.then(data => {
        if (data && data.length > 0) {
            res.render("posts", { posts: data });
        } else {
            res.render("posts", { message: "no results" });
        }
    }).catch(err => {
        res.render("posts", { message: "no results", error: err });
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
    blogService.getCategories()
    .then(data => {
      res.render("categories", { categories: data });
    })
    .catch(err => {
      res.render("categories", { message: "no results" });
    });
});  

app.get('/posts/add', (req, res) => {
    res.render('addPost');
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