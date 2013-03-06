var User   = require('../models').User;
var dbUser = require('../dbsource').User;
var crypto = require('crypto');
var config = require('../config').config;

exports.authLogin = function(req, res, next) {
    if( req.cookies[config.cookies_prefix + 'login'] ) {
        var loginUser = req.cookies[config.cookies_prefix + 'login'];

        User.getUserByName(loginUser.username, function(err, user) {
            if(err) {
                console.log(err);
                return next(err); 
            }

            if(!user || loginUser.authkey !== cryptpass(user.password + req.headers['user-agent'])) {
                return next();
            }

            req.session.user = {
                '_id': user._id,
                'username': user.username,
                'email': user.email,
                'authkey': cryptpass(user.password + req.headers['user-agent'])
            };

            res.cookie(config.cookies_prefix + 'login', req.session.user);
            res.locals.loginUser = req.session.user;
            next();
        });
    } else {
        next();
    }
}

// 显示用户登录页面
exports.showLogin = function(req, res) {
    if( req.session.user ) {
        res.redirect('/');
    }

    var data = {
        title: '用户登录'
    }
    res.render('user/login', data);
}

// 用户登录操作
exports.login = function(req, res) {
    var data = {
        title: '用户登录'
    };

    req.assert('username', '用户名或密码错误').notEmpty().isAlphanumeric();
    req.assert('password', '用户名或密码错误').len(6, 20).notEmpty();

    // 准备登录数据
    var loginUser = {
        username : req.sanitize('username').xss().trim(),
        password : cryptpass(req.sanitize('password').xss().trim())
    }

    var errors = req.validationErrors(true);

    if(errors) {
        data.errors   = errors;
        data.username = loginUser.username;
        res.render('user/login', data);
        return;
    }

    User.getUserByName(loginUser.username, function(err, user) {
        if(err) {
            console.log(err);
            return; 
        }

        if(!user) {
            errors.username = {
                param: 'username',
                msg: '用户名或密码错误',
                value: loginUser.username
            };
        } else if(loginUser.password !== user.password) {
            errors.username = {
                param: 'username',
                msg: '用户名或密码错误',
                value: loginUser.username
            };
        }

        if(errors) {
            data.errors   = errors;
            data.username = loginUser.username;
            res.render('user/login', data);
            return;
        }

        req.session.user = {
            '_id': user._id,
            'username': user.username,
            'email': user.email,
            'authkey': cryptpass(user.password + req.headers['user-agent'])
        };

        res.cookie(config.cookies_prefix + 'login', req.session.user);

        res.redirect('/users');

    });

};

exports.showRegister = function(req, res) {
    var data = {
        title: '注册用户'
    };
    res.render('user/register', data);
}

exports.register = function(req, res) {
    var data = {
        title: '注册用户'
    };

    req.assert('username', '用户名为字母或数字 4 - 20 个字符').notEmpty().len(4, 20).isAlphanumeric();
    req.assert('email', '邮箱地址错误').notEmpty().isEmail();
    req.assert('password', '密码须为 6 - 20 个字符').len(6, 20).notEmpty();
    // todo: equals function usage
    // req.assert('vpassword', 'Invalid password. (not equals to the above password.)').equals(req.body.password);
    
    // 准备插入数据
    var user = {
        username : req.sanitize('username').xss().trim(),
        email    : req.sanitize('email').xss().trim().toLowerCase(),
        password : cryptpass(req.sanitize('password').xss().trim()),
        vpassword: cryptpass(req.sanitize('vpassword').xss().trim())
    }

    var errors = req.validationErrors(true);

    // 判断密码是否相同
    if( user.password !== user.vpassword ) {
        if(!errors) errors = {};
        errors.vpassword = {
            param: 'vpassword',
            msg: '两次输入的密码不相同',
            value: user.vpassword
        };
    }

    if(errors) {
        data.errors   = errors;
        data.username = user.username;
        data.email    = user.email;
        res.render('user/register', data);
        return;
    }
    
    // 判断用户名和邮箱是否被占用
    //User.getUsersByQuery({'username': req.body.username}, {}, function(err, users) {
    dbUser.find({'$or': [{'username': user.username}, {'email': user.email}]}, function (err, users) {
        if(users.length > 0) {
            //if(!errors) errors = {};

            for (var i = users.length - 1; i >= 0; i--) {

                // 如果已经存在用户名则返回用户名错误
                if(users[i].username == user.username) {
                    errors.username = {
                        param: 'username',
                        msg: '用户名已被使用',
                        value: req.body.username
                    };
                }

                // 如果存在邮箱则返回邮箱错误
                if(users[i].email == user.email) {
                    errors.email = {
                        param: 'email',
                        msg: '邮箱已被使用',
                        value: req.body.email
                    };
                }
            };
        }

        if(errors) {
            data.errors   = errors;
            data.username = user.username;
            data.email    = user.email;
            res.render('user/register', data);
            return;
        }

        User.createUser(user, function(err) {
            if(err) {
                console.log(err);
            }
            var message = {
                title: '注册成功',
                msg: '你的帐号 (' + user.username + ') 已经建立，点击这里<a href="/login">登录</a>。'
            };
            res.render('message', message);
        });

    });

}

exports.destroyUser = function(req, res) {
    if( req.session.user.isAdmin ) {
        User.deleteUserById(req.params.id, function(err) {
            res.redirect('/users');
        });
    } else {
        res.send('no approve');
    }
}

exports.showEditUser = function(req, res) {
    User.getUserByName(req.params.username, function(err, user) {
        if(err) console.log(err);
        if(!user) {
            res.render('message', {title: 'Not Found.', msg: 'Not found this user.'});
            return;
        }
        var data = {
            title: '编辑个人信息',
            user: user
        };
        res.render('user/edit', data);
    });
}

exports.editUser = function(req, res) {
    console.log(req.session.user.username + '====' + req.params.username);
    if( req.session.user && req.session.user.username == req.params.username ) {
        var data = {
            title: '编辑个人信息'
        };

        //req.assert('username', 'Invalid username.').notEmpty().isAlphanumeric();
        req.assert('email', '邮箱地址错误').notEmpty().isEmail();

        var user = {
            //username : req.sanitize('username').xss().trim(),
            email    : req.sanitize('email').xss().trim().toLowerCase()
        }

        var errors = req.validationErrors(true);

        console.log(req.session.user);

        if(errors) {
            data.errors = errors;
            data.user   = {
                username: req.session.user.username,
                email: req.session.user.email
            }
            res.render('user/edit', data);
            return;
        }

        User.getUserByName(req.params.username, function(err, userUpdate) {
            if(err) {
                console.log(err);
                return;
            }
            userUpdate.email = user.email;
            userUpdate.update_time = Date.now();
            userUpdate.save(function(err) {
                if(err) {
                    console.log(err);
                    return;
                }
                res.redirect('/u/' + req.params.username + '/edit');
            });
        });

    } else {
        res.send('请求错误');
    }
}

exports.showUsers = function(req, res) {
    if( !req.session.user ) {
        res.send('no session!');
        return;
    }

    var data = {
        title: '用户列表'
    };
    dbUser.find({}, function(err, users) {
        console.log(users);
        data.users = users;
        res.render('user/users', data);
    });
    
}

// 用户退出登录
exports.logout = function(req, res) {
    req.session.destroy(function(err) {
        if(err) {
            console.log(err);
        }
    });
    //res.clearCookie(config.cookie_prefix + 'login');
    res.clearCookie(config.cookies_prefix + 'login');
    res.redirect('../login');
    res.send("logout success");
}

// 私有函数
function md5(str) {
    var md5e = crypto.createHash('md5');
    md5e.update(str);
    str = md5e.digest('hex');
    return str;
}

function sha1(str) {
    var sha1 = crypto.createHash('sha1');
    sha1.update(str);
    str = sha1.digest('hex');
    return str;
}

function cryptpass(str) {
    return md5(md5(str) + sha1('migs'));
}