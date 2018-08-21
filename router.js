const Authentication = require('./controllers/authentication');
const passportService = require('./services/passport');
const passport = require('passport');
const AppActions = require('./controllers/app-actions');

const requireAuth = passport.authenticate('jwt', {session: false});
const requireSignIn = passport.authenticate('local', {session: false });

module.exports = function(app) {
    app.get('/all-posts', AppActions.fetchAllPosts);
    app.post('/signin',requireSignIn, Authentication.signin);
    app.post('/signup', Authentication.signup);
    app.post('/localupload',requireAuth, AppActions.saveLocalImage);
    app.get('/user/:id', requireAuth, AppActions.loadUserProfile);
    app.get('/user-content/:id', AppActions.loadFilteredContent);
    app.post('/like-post', requireAuth, AppActions.likePost);
    app.post('/delete-post', requireAuth, AppActions.deletePost);

}