const User = require('../models/user');
const Post = require('../models/post');
const ROOT_URL = 'http://localhost:3090';

const validateImageType = function(img) {
    let fileType = img.substring(img.length - 3);
    if(fileType.toLowerCase() == "png" || fileType.toLowerCase() == "jpg" || fileType.toLowerCase() == "gif" || fileType.toLowerCase() == "svg") {
        return true;
    }
    else {
        return false;
    }
}
exports.fetchAllPosts = function(req, res, next) {
    Post.find({})
        .populate({
            path: 'poster',
            model: 'user'
        })
        .then((posts) => {
            if(posts.length) {
                res.send({data: posts});
            }
            
        })
}

exports.loadUserProfile = function(req, res, next) {
    let userId = req.params.id;
    User.findById({_id: userId})
        .populate('posts')
        .populate('userLikes.post')
        .then((user) => {
            res.send({data: user});
        })
        .catch((err) => {
            res.send({err: err})
        })
}

exports.loadFilteredContent = function(req, res, next) {
    let userId = req.params.id;
    User.findById({_id: userId})
        .populate('posts')
        .then((user) => {
            res.send({data: user})
        })
        .catch((err) => {
            console.log(err);
        })
}
//function to save local upload images to db 
exports.saveLocalImage = function(req, res, next) {
    let userId = req.body.userId;
    let newFile = req.files.file;
    let validFile = validateImageType(newFile.name);
        if(!validFile) {
            res.send({data: "not  valid file type"})
            return;
        }
        else {
            newFile.mv('public/uploaded-posts/'+newFile.name, function(err) {
                if(err) {
                    console.log(err)
                }
                else {
                    console.log('no errors yet')
                    User.findOne({_id: userId})
                    .then((user) => {
                        let newPost = new Post({
                            poster: userId,
                            image: ROOT_URL+'/uploaded-posts/'+newFile.name
                        })
                        newPost.save()
                        .then((post) => {
                            res.send({data: post})
                            user.posts.push(post._id);
                            user.save();
                            
                        })
                        .catch((e) => {
                            res.status(400).json({
                                error: "post could not be saved"
                            })
                        })
                    })
                }
            });
        }
        
} 


exports.likePost = function(req, res, next) {
    let userId = req.body.userId;
    let postId = req.body.postId;
    let posterEmail = "";
    Post.findById({_id: postId})
        .populate('poster')
        .then((post) => {
            if(post.likes.indexOf(userId) > -1) {
                res.send({post: post, error: 'You already like this post'});
                return;
            }
            console.log(userId, post.poster._id.toString())
            if(post.poster._id.toString() === userId) {
                console.log('same')
                res.send({post: post, error: 'You cannot like your own post'});
                return;
            }
            
            else {
                posterEmail = post.poster.email;
                post.likes.push(userId);
                post.numLikes = post.likes.length;
                post.save();
                User.findById({_id:  userId })
                .then((user) => {
                    user.userLikes.push({post: post, ownerOfPost: posterEmail})
                    user.save();
                    res.send({data: post})
                })
                
                
            }
            

        })
}
exports.deletePost = function(req, res, next) {
    let postId = req.body.postId;
    let userId = req.body.userId;
    console.log(postId)
    Post.findOneAndRemove({
        _id: postId
    })
    .then((post) => {
        res.send({data: post});
    })
}