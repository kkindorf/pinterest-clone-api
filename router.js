const Authentication = require('./controllers/authentication');
const passportService = require('./services/passport');
const passport = require('passport');
const AppActions = require('./controllers/app-actions');

const requireAuth = passport.authenticate('jwt', {session: false});
const requireSignIn = passport.authenticate('local', {session: false });

module.exports = function(app) {
    app.get('/', requireAuth, function(req,res) {
        res.send({ hi: 'there' });
    })
    app.post('/signin',requireSignIn, Authentication.signin);
    app.post('/signup', Authentication.signup);
    //will eventually need to make this an authenticated post
    app.post('/localupload', AppActions.saveLocalImage);
}