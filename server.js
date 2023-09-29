const blogService = require('./blog-service.js');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 8080;

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
    blogService.getAllPosts()
    .then((data) => {
        res.json(data);
    })
    .catch((err) => {
        res.json({message: err});
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