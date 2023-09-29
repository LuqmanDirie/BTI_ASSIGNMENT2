const fs = require('fs');

let posts = [];
let categories = [];

module.exports = {
    initialize: function() {
        return new Promise((resolve, reject) => {
            fs.readFile('./data/posts.json', 'utf8', (err, data) => {
                if (err) reject("Unable to read posts.json");
                posts = JSON.parse(data);
                fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                    if (err) reject("Unable to read categories.json");
                    categories = JSON.parse(data);
                    resolve();
                });
            });
        });
    },
    getAllPosts: function() {
        return new Promise((resolve, reject) => {
            if (posts.length === 0) reject("No posts found");
            resolve(posts);
        });
    },
    getPublishedPosts: function() {
        return new Promise((resolve, reject) => {
            const publishedPosts = posts.filter(post => post.published === true);
            if (publishedPosts.length === 0) reject("No published posts found");
            resolve(publishedPosts);
        });
    },
    getCategories: function() {
        return new Promise((resolve, reject) => {
            if (categories.length === 0) reject("No categories found");
            resolve(categories);
        });
    }
};
