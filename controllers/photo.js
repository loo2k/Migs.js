var User        = require('../models').User;
var Photo       = require('../models').Photo;
var config      = require('../config').config;
var util        = require('../helper').util;
var photoHelper = require('../helper').photo;
var im          = require('imagemagick');
var url         = require('url');
var fs          = require('fs');

exports.showPhotos = function(req, res) {
    var data = {
        title: '所有图片',
        page: req.query['page'] ? parseInt(req.query['page'], 10) : 1,
    };
    
    var query = {};

    var option   = {};
    option.sort  = [['create_time', 'desc']];
    option.limit = req.query['show'] ? parseInt(req.query['show'], 10) : config.photo_limit;
    option.skip  = ( data.page - 1)*option.limit;

    Photo.getPhotosByQuery(query, option, function(err, photos) {
        for (var i = photos.length - 1; i >= 0; i--) {
            photos[i].src = photoHelper.parsePhoto(photos[i]);
            photos[i].formated_create_time = util.formatDate(photos[i].create_time);
            photos[i].formated_update_time = util.formatDate(photos[i].update_time);
            photos[i].author.avatar = util.avatar(photos[i].author.email);
        };

        Photo.getQueryCount(query, function(err, total) {
            if(err) throw err;

            // 分页的准备
            if( req.query.page ) delete req.query.page;
            data.base_url = url.format({
                pathname: req.path,
                query: req.query
            });
            data.pagination = util.pagination(total, data.page, option.limit, 5, 5);
            data.photos = photos;
            res.render('photo/photo_list', data);
        });

    });
}

exports.showUserPhoto = function(req, res) {
    User.getUserByName(req.params.username, function(err, user) {
        if(!user) {
            return res.json('404', {code: '404', error: '1', msg: '用户不存在'});
        }

        var data = {
            title: user.username + '的图片',
            page: req.query['page'] ? parseInt(req.query['page'], 10) : 1,
        };

        var query = { uid: user._id };

        var option = {};
        option.limit = req.query['show'] ? parseInt(req.query['show'], 10) : config.photo_limit;
        option.skip = ( data.page - 1)*option.limit;
        option.sort = [['create_time', -1]];

        Photo.getPhotosByQuery(query, option, function(err, photos) {
            for (var i = photos.length - 1; i >= 0; i--) {
                photos[i].src = photoHelper.parsePhoto(photos[i]);
                photos[i].formated_create_time = util.formatDate(photos[i].create_time);
                photos[i].formated_update_time = util.formatDate(photos[i].update_time);
                photos[i].author.avatar = util.avatar(photos[i].author.email);
            };
            
            Photo.getQueryCount(query, function(err, total) {
                if(err) throw err;

                // 分页的准备
                if( req.query.page ) delete req.query.page;
                data.base_url = url.format({
                    pathname: req.path,
                    query: req.query
                });
                data.pagination = util.pagination(total, data.page, option.limit, 5, 5);
                data.photos = photos;
                res.render('photo/photo_list', data);
            });
        });
    });
}

exports.showPhoto = function(req, res) {
    Photo.getPhotoById(req.params.id, function(err, photo) {
        if(!photo) {
            return res.json('404', {code: '404', error: '1', msg: '图片不存在'});
        }
        
        photo.src = photoHelper.parsePhoto(photo);
        photo.formated_create_time = util.formatDate(photo.create_time);
        photo.formated_update_time = util.formatDate(photo.update_time);
        photo.author.avatar = util.avatar(photo.author.email);

        var data = {
            title: photo.title,
            photo: photo
        };

        res.render('photo/photo', data);
    });
}

exports.showEditPhoto = function(req, res) {
    Photo.getPhotoById(req.params.id, function(err, photo) {
        if(!photo) {
            return res.json('404', {code: '404', error: '1', msg: '图片不存在'});
        }
        if( err ) {
            console.log(err);
        }

        photo.src = photoHelper.parsePhoto(photo);

        var data = {
            title: photo.title.slice(photo.title.indexOf('_') + 1),
            photo: photo
        };
        res.render('photo/edit', data);
    });
}

exports.editPhoto = function(req, res) {
    Photo.getPhotoById(req.params.id, function(err, photo) {
        if(!photo) {
            return res.json('404', {code: '404', error: '1', msg: '图片不存在'});
        }
        if( err ) {
            console.log(err);
        }

        photo.title = req.sanitize('title').xss();
        photo.update_time = Date.now();
        photo.save(function(err) {
            if(err) {
                console.log(err);
                return;
            }
            res.redirect('/p/' + req.params.id);
        });
    });
}

exports.destroyPhoto = function(req, res) {
    if(!req.session.user) {
        return res.json('403', {code: '403', error: '1', msg: '未获得授权'});
    }

    var pid = req.params.id;

    Photo.getPhotoById(pid, function(err, photo) {
        if (err) throw err;

        if(!photo) {
            return res.json('404', {code: '404', error: '1', msg: '没有找到图片'});
        }

        if( photo.uid == req.session.user._id ) {
            Photo.destroyPhotoById(pid, function(err) {
                
                photo.src = photoHelper.parsePhoto(photo, true);
                for( var type in photo.src ) {
                    var len = (config.site_url + 'upload').length;
                    console.log(photo.src[type]);
                    fs.unlink(photo.src[type], function(err) {
                        if(err) throw err;
                    });
                }
                res.json('200', {code: '200', msg: '删除成功'});
            });
        } else {
            res.json('403', {code: '403', error: '1', msg: '没有权限'});
        }
    });
}

exports.showUpload = function(req, res) {
    if( !req.session.user ) {
        return res.json('403', {code: '403', error: '1', msg: '未获得授权'});
    }
    var data = {
        title: '上传图片'
    };
    res.render('photo/upload', data);
}

exports.upload = function(req, res) {
    if( !req.session.user ) {
        return res.json('403', {code: '403', error: '1', msg: '未获得授权'});
    }

    photoHelper.uploadFile(req, res, function(err, file) {
        if(err) {
            console.log(err);
        }

        var uploadFilePath = config.root_dir + '/' + config.static_dir + file.dir;

        photoHelper.identifyImage(uploadFilePath, function(err, features){
            if (err) throw err;

            var thumbFile = {
                width   : features.width,
                height  : features.height,
                filename: file.dir.slice(0, file.dir.lastIndexOf('.')),
                ext     : file.dir.substr(file.dir.lastIndexOf('.')),
                src     : uploadFilePath,
                dst     : uploadFilePath.slice(0, uploadFilePath.lastIndexOf('.'))
            }

            photoHelper.thumbImage(thumbFile, function(err) {
                if(err) throw err;
            });

            var newPhoto = {
                uid   : req.session.user._id,
                title : file.name,
                desc  : '',
                size  : file.length,
                dir   : file.dir,
                width : features.width,
                height: features.height,
                status: 1
            }

            Photo.createPhoto(newPhoto, function(err) {
                if(err) {
                    console.log(err);
                    res.send('error');
                    return;
                }
                res.redirect('/');
            });

        });

    });
}