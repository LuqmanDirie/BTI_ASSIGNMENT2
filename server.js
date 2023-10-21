/**********************************************************************************  
 * BTI325 – Assignment 02* 
 * I declare that this assignment is my own work in accordance with Seneca Academic 
 * Policy. No part* of this assignment has been copied manually or electronically 
 * from any other source* (including 3rd party web sites) or distributed
 *  to other students.*
 * 
 * * Name: __Luqman__Dirie___ Student ID: __108737222___ Date: __09/29/23__*
 * 
 * * Online (Cyclic) Link: ____https://sangria-iguana-hem.cyclic.cloud/_______
 * 
 * *********************************************************************************/
const blogService = require('./blog-service.js');
const express = require('express');
const app = express();

const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const PORT = process.env.PORT || 8080;

cloudinary.config({
    cloud_name: 'djvn4evjm',
    api_key: '685418754863581',
    api_secret: '2KuIyS0xSYL-ylQvg8RE2-vqncM',
    secure: true
});

const upload = multer();

app.use(express.static('public'));

app.get('/', (req, res) => {
   res.redirect('/about');
});

app.get('/about', (req, res) => {
   res.sendFile(__dirname + '/views/about.html');
});

app.get('/blog', (req, res) => {
    blogService.getPublishedPosts()
    .then((data) => {
        res.json(data);
    })
    .catch((err) => {
        res.json({message: err});
    });
});

app.get('/posts', (req, res) => {
    if(req.query.category) {
        blogService.getPostsByCategory(req.query.category)
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            res.status(404).json({message: err});
        });
    } else if(req.query.minDate) {
        blogService.getPostsByMinDate(req.query.minDate)
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            res.status(404).json({message: err});
        });
    } else {
        blogService.getAllPosts()
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            res.status(404).json({message: err});
        });
    }
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
    .then((data) => {
        res.json(data);
    })
    .catch((err) => {
        res.json({message: err});
    });
});

app.get('/posts/add', (req, res) => {
    res.sendFile(__dirname + '/views/addPost.html');
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
    res.status(404).send("Page Not Found");
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