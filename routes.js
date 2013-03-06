var index = require('./controllers');
var user = require('./controllers/user');
var photo = require('./controllers/photo');

module.exports = function (app) {
    // 主页
    app.get('/', photo.showPhotos);

    // 用户模块路由
    app.get('/login', user.showLogin);
    app.get('/register', user.showRegister);
    app.get('/users', user.showUsers);
    app.get('/u/:username', user.showEditUser);
    app.get('/u/:username/edit', user.showEditUser);
    app.get('/u/:username/destroy', user.destroyUser);
    app.get('/logout', user.logout);

    app.post('/login', user.login);
    app.post('/register', user.register);
    app.post('/u/:username/edit', user.editUser);
    
    // 图片模块路由
    app.get('/p/:id', photo.showPhoto);
    app.get('/p/:id/edit', photo.showEditPhoto);
    app.get('/p/:id/destroy', photo.destroyPhoto);
    app.get('/photos/:username', photo.showUserPhoto);
    app.get('/upload', photo.showUpload);

    app.post('/p/:id/edit', photo.editPhoto);
    app.post('/upload', photo.upload);
}