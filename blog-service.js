const Sequelize = require('sequelize');

var sequelize = new Sequelize('rhldyofb', 'rhldyofb', 'Q8oNZTykqmvBGlPHyPL9YEe41hw87VKu', {
    host: 'hansken.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    logging: console.log
});

const Category = sequelize.define('Category', {
    name: Sequelize.STRING
});

const Post = sequelize.define('Post', {
    title: Sequelize.STRING,
    body: Sequelize.TEXT,
    featureImage: {
        type: Sequelize.TEXT,
        allowNull: true
    },    categoryId: {
        type: Sequelize.INTEGER,
        references: {
            model: Category,
            key: 'id'
        }
    },
    published: Sequelize.BOOLEAN,
    postDate: Sequelize.DATE
});

Post.belongsTo(Category, { foreignKey: 'categoryId' });

module.exports = {
    initialize: function () {
        return new Promise((resolve, reject) => {
            sequelize.sync()
            .then(() => {
                resolve("Database synced successfully");
            })
            .catch(err => {
                reject("Unable to sync the database: " + err);
            });
        });
    }, 

    
    getAllPosts: function() {
        return new Promise((resolve, reject) => {
            Post.findAll()
            .then(posts => {
                if(posts) {
                    resolve(posts);
                } else {
                    reject("No posts found");
                }
            })
            .catch(err => {
                reject("Error retrieving posts: " + err);
            });
        });
    }, 

    getPublishedPosts: function() {
        return new Promise((resolve, reject) => {
            Post.findAll({
                where: {
                    published: true
                },
                include: [{
                    model: Category,
                    as: 'Category'
                }]
            })
            .then(posts => {
                if(posts && posts.length > 0) {
                    // Converting Sequelize objects to plain objects
                    const plainData = posts.map(post => post.get({ plain: true }));
                    resolve(plainData);
                } else {
                    reject("No published posts returned");
                }
            })
            .catch(err => {
                reject("Error retrieving published posts: " + err);
            });
        });
    },        

    getCategories: function() {
        return new Promise((resolve, reject) => {
            Category.findAll()
            .then(categories => {
                if (categories && categories.length > 0) {
                    resolve(categories);
                } else {
                    reject("no results");
                }
            })
            .catch(err => {
                reject("Error retrieving categories: " + err);
            });
        });
    },    

    getPostsByCategory: function(categoryId) {
        return new Promise((resolve, reject) => {
            Post.findAll({
                where: {
                    categoryId: categoryId
                }
            })
            .then(posts => {
                if (posts && posts.length > 0) {
                    resolve(posts);
                } else {
                    reject("No results returned");
                }
            })
            .catch(err => {
                reject("Error: " + err);
            });
        });
    },     

    getPublishedPostsByCategory: function(categoryId) {
        return new Promise((resolve, reject) => {
            Post.findAll({
                where: {
                    categoryId: categoryId,
                    published: true
                }
            })
            .then(posts => {
                if(posts && posts.length > 0) {
                    resolve(posts);
                } else {
                    reject("No published posts found in category: " + categoryId);
                }
            })
            .catch(err => {
                reject("Error retrieving published posts by category: " + err);
            });
        });
    },    

    getPostsByMinDate: function(minDateStr) {
        return new Promise((resolve, reject) => {
            Post.findAll({
                where: {
                    postDate: {
                        [Sequelize.Op.gte]: new Date(minDateStr)
                    }
                }
            })
            .then(posts => {
                if (posts && posts.length > 0) {
                    resolve(posts);
                } else {
                    reject("No results returned");
                }
            })
            .catch(err => {
                reject("Error: " + err);
            });
        });
    },        

    getPostById: function(id) {
        return new Promise((resolve, reject) => {
            Post.findByPk(id)
            .then(post => {
                if(post) {
                    resolve(post);
                } else {
                    reject("No post found with ID: " + id);
                }
            })
            .catch(err => {
                reject("Error retrieving post with ID: " + err);
            });
        });
    },    

    addPost: function(postData) {
        return new Promise((resolve, reject) => {
            postData.published = !!postData.published;
    
            for (let key in postData) {
                if (postData[key] === "") {
                    postData[key] = null;
                }
            }
    
            postData.postDate = new Date();
    
            Post.create(postData)
            .then(createdPost => {
                resolve(createdPost);
            })
            .catch(err => {
                reject("Unable to create post: " + err);
            });
        });
    },

    addCategory: function(categoryData) {
        return new Promise((resolve, reject) => {
            for (let prop in categoryData) {
                if (categoryData[prop] === "") {
                    categoryData[prop] = null;
                }
            }
    
            Category.create(categoryData).then(() => {
                resolve();
            }).catch(err => {
                reject("unable to create category: " + err);
            });
        });
    },

    deleteCategoryById: function(id) {
        return new Promise((resolve, reject) => {
            Category.destroy({
                where: { id: id }
            }).then(() => {
                resolve();
            }).catch(err => {
                reject("unable to delete category: " + err);
            });
        });
    },

    deletePostById: function(id) {
        return new Promise((resolve, reject) => {
            Post.destroy({
                where: { id: id }
            }).then(() => {
                resolve();
            }).catch(err => {
                reject("unable to delete post: " + err);
            });
        });
    }    
};
