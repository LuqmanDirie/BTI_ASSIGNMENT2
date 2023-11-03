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
    },

    getPostsByCategory: function(category) {
        return new Promise((resolve, reject) => {
            const filteredPosts = posts.filter(post => post.category == category);
            if (filteredPosts.length === 0) {
                reject("no results returned");
            } else {
                resolve(filteredPosts);
            }
        });
    },
    
    getPublishedPostsByCategory: function(category) {
        return new Promise((resolve, reject) => {
            const publishedFilteredPosts = posts.filter(post => post.published === true && post.category == category);
            if (publishedFilteredPosts.length === 0) {
                reject("No published posts found for the category: " + category);
            } else {
                resolve(publishedFilteredPosts);
            }
        });
    },

    getPostsByMinDate: function(minDateStr) {
        return new Promise((resolve, reject) => {
            const filteredPosts = posts.filter(post => new Date(post.postDate) >= new Date(minDateStr));
            if (filteredPosts.length === 0) {
                reject("no results returned");
            } else {
                resolve(filteredPosts);
            }
        });
    },

    getPostById: function(id) {
        return new Promise((resolve, reject) => {
            const post = posts.find(post => post.id == id);
            if (!post) {
                reject("no result returned");
            } else {
                resolve(post);
            }
        });
    },

    addPost: function(postData) {
        return new Promise((resolve, reject) => {
            postData.published = !!postData.published;
            postData.id = posts.length + 1;
            let currentDate = new Date();
            postData.postDate = currentDate.toISOString().split('T')[0];
            posts.push(postData);
            resolve(postData);
        });
    }    
};
