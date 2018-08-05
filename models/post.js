const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var User = require('./user');

const PostSchema = new Schema({
    poster: {type: Schema.Types.ObjectId,
        ref: 'User'},
    image: {type: String},
    description: {type: String},
    likes: [{type: Schema.Types.ObjectId,
    ref: 'User'}]
})

const Post = mongoose.model('Post', PostSchema);
module.exports = Post;