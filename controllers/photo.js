var User    = require('../models').User;
var Photo   = require('../models').Photo;
var dbPhoto = require('../dbsource').Photo;
var upload  = require('./upload');
var config  = require('../config').config;
var fs      = require('fs');
var path    = require('path');
var ndir    = require('ndir');
var im      = require('imagemagick');

exports.showPhotos = function(req, res) {
    var data = {
        title: '图片列表'
    };
    dbPhoto.find({}, function(err, photos) {
        for (var i = photos.length - 1; i >= 0; i--) {
            photos[i].src = parsePhoto(photos[i]);
        };
        data.photos = photos;
        res.render('photo/photo_list', data);
    });
}

exports.showPhoto = function(req, res) {
    Photo.getPhotoById(req.params.id, function(err, photo) {
        if(!photo) {
            return res.send({code: '404', error: '1', msg: '图片不存在'});
        }
        
        photo.src = parsePhoto(photo);

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
            return res.send({code: '404', error: '1', msg: '图片不存在'});
        }
        if( err ) {
            console.log(err);
        }

        photo.src = parsePhoto(photo);

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
            return res.send({code: '404', error: '1', msg: '图片不存在'});
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

exports.showUserPhoto = function(req, res) {
    User.getUserByName(req.params.username, function(err, user) {
        if(!user) {
            return res.send({code: '404', error: '1', msg: '用户不存在'});
        }

        var data = {
            title: '图片列表'
        };

        dbPhoto.find({uid: user._id}, function(err, photos) {
            for (var i = photos.length - 1; i >= 0; i--) {
                photos[i].src = parsePhoto(photos[i]);
            };
            data.photos = photos;
            res.render('photo/photo_list', data);
        });
    });
}

exports.destroyPhoto = function(req, res) {
    if(!req.session.user) {
        return res.send({code: '403', error: '1', msg: '未获得授权'});
    }

    var pid = req.params.id;

    Photo.getPhotoById(pid, function(err, photo) {
        if (err) throw err;

        if(!photo) {
            return res.send({code: '404', error: '1', msg: '没有找到图片'});
        }

        if( photo.uid == req.session.user._id ) {
            Photo.destroyPhotoById(pid, function(err) {
                //res.send('delete');
                photo.src = parsePhoto(photo, true);
                for( var type in photo.src ) {
                    var len = (config.site_url + 'upload').length;
                    console.log(photo.src[type]);
                    fs.unlink(photo.src[type], function(err) {
                        if(err) throw err;
                    });
                }
                res.send({code: '200', msg: '删除成功'});
            });
        } else {
            res.send({code: '403', error: '1', msg: '没有权限'});
        }
    });
}

exports.showUpload = function(req, res) {
    if( !req.session.user ) {
        return res.send({code: '403', error: '1', msg: '未获得授权'});
    }
    var data = {
        title: '上传图片'
    };
    res.render('photo/upload', data);
}

exports.upload = function(req, res) {
    if( !req.session.user ) {
        return res.send({code: '403', error: '1', msg: '未获得授权'});
    }

    upload.uploadFile(req, res, function(err, file) {
        if(err) {
            console.log(err);
        }
        im.identify(config.root_dir + '/' + config.static_dir + file.dir, function(err, features){
            if (err) throw err;
            // { format: 'JPEG', width: 3904, height: 2622, depth: 8 }
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
            
            var filename = file.dir.slice(0, file.dir.lastIndexOf('.'));
            var ext      = file.dir.substr(file.dir.lastIndexOf('.'));
            var src      = config.root_dir + '/' + config.static_dir + file.dir;
            var dst      = config.root_dir + '/' + config.static_dir + filename;

            if( newPhoto.width >= 200 ) {
                im.crop({
                    srcPath: src,
                    dstPath: dst + '_small_' + ext,
                    width: 200,
                    height: 200,
                    quality: 1,
                    gravity: "North"
                }, function(err, stdout, stderr){
                    console.log(err);
                });
            }

            im.crop({
                srcPath: src,
                dstPath: dst + '_square_' + ext,
                width: 75,
                height: 75,
                quality: 1,
                gravity: "North"
            }, function(err, stdout, stderr){
                console.log(err);
            });

            if( newPhoto.width >= 650 ) {
                im.resize({
                    srcPath: src,
                    dstPath: dst + '_midddle_' + ext,
                    width  : 650
                }, function(err, stdout, stderr){
                    if (err) throw err;
                    console.log('resized');
                });
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

function parsePhoto(photo, dir) {
    var site_url = dir ? path.join(config.root_dir, config.static_dir) + '/' : config.site_url;
    var filename = photo.dir.slice(0, photo.dir.lastIndexOf('.'));
    var ext      = photo.dir.substr(photo.dir.lastIndexOf('.'));
    var src      = site_url + photo.dir.slice(1);
    var dst      = site_url + filename.slice(1);
    return {
        large: src,
        middle: dst + '_midddle_' + ext,
        small: dst + '_small_' + ext,
        square: dst + '_square_' + ext
    }
}