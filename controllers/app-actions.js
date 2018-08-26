const User = require('../models/user');
const Post = require('../models/post');
const ROOT_URL = 'https://morning-beyond-12420.herokuapp.com/';

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

exports.saveOnlineImage = function(req, res, next) {
    let userId = req.body.userId;
    let imgString = req.body.imgString;
    let validFile = validateImageType(imgString);
    if(!validFile) {
        res.send({data: "not  valid file type"})
        return;
    }
    else {
        User.findOne({_id: userId})
            .then((user) => {
                let newPost = new Post({
                    poster: userId,
                    image: imgString
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


}


exports.likePost = function(req, res, next) {
    let userId = req.body.userId;
    let postId = req.body.postId;
    let posterEmail = "";
    Post.findById({_id: postId})
        .populate('poster')
        .then((post) => {
            if(post.poster._id.toString() === userId) {
                res.send({post: post, error: 'You cannot like your own post'});
                return;
            }
            const indexOfLikerId = post.likes.indexOf(userId);
            if(indexOfLikerId  > -1) {
                let postLikesMinusOne = post.likes.filter(function(aPost, i) {
                    if(i !== indexOfLikerId ) {
                        return aPost;
                    }
                })
                post.likes = postLikesMinusOne;
                post.numLikes = postLikesMinusOne.length;
                post.save()
                User.findById({_id: userId})
                    .populate('userLikes.post')
                    .then((user) => {
                        let userLikesMinusOne = user.userLikes.filter(function(thePost, i) {
                            if(post._id.toString() !== thePost.post._id.toString()) {
                                return thePost;
                            }

                        })

                        user.userLikes = userLikesMinusOne;
                        user.save();
                        res.send({updatedPost: post, updatedUser: user});  
                        return;
                    })
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
                    res.send({updatedPost: post, updatedUser: user})
                })
                
                
            }
            

        })
}
exports.deletePost = function(req, res, next) {
    let postId = req.body.postId;
    let userId = req.body.userId;
    Post.findOne({_id: postId})
    .then((post) => {
        Promise.all(post.likes).then(function(user, i){
            User.findOne({_id: user})
            .then((user)=> {
               let updatedUserLikes = user.userLikes.filter(function(thePost, i) {
                   if(thePost.post.toString() !== post._id.toString()) {
                        return thePost;
                   }
               })
               user.userLikes = updatedUserLikes;
               user.save();
            })
            .catch((e) => {
                console.log(e)
            })
        })
        post.remove();
        res.send({data: post});
    })
    .catch((e) => {
        console.log(e)
    })
}