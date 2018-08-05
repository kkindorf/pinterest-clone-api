const User = require('../models/user');
exports.saveLocalImage = function(req, res, next) {
    let newFile = req.files.file;
    newFile.mv('uploaded-posts/'+newFile.name, function(err) {
        if(err) {
            console.log(err)
        }
        else {
            console.log(newFile.name);
        }
    });
} 