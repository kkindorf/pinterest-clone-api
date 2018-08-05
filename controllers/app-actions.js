const User = require('../models/user');
const Post = require('../models/post');


//function to save local upload images to db 
exports.saveLocalImage = function(req, res, next) {
    let userId = req.body.userId;
    let newFile = req.files.file;
    newFile.mv('public/uploaded-posts/'+newFile.name, function(err) {
        if(err) {
            console.log(err)
        }
        else {
            User.findOne({_id: userId})
            .then((user) => {
                var newPost = new Post({
                    poster: userId,
                    image: '/uploaded-posts/'+newFile.name
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