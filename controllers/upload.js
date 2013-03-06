var fs     = require('fs');
var path   = require('path');
var ndir   = require('ndir');
var config = require('../config').config;

exports.uploadFile = function (req, res, next) {
    if (!req.session || !req.session.user) {
        return next({ status: 'forbidden' });
    }
    var file = req.files && req.files.images;
    if (!file) {
        return next({ status: 'failed', message: 'no file' });
    }
    var uid = req.session.user._id.toString();
    var userDir = path.join(config.upload_dir, uid);
    ndir.mkdir(userDir, function (err) {
        if (err) {
            return next(err);
        }
        var filename = Date.now() + '_' + file.name;
        var savepath = path.resolve(path.join(userDir, filename));
        if (savepath.indexOf(path.resolve(userDir)) !== 0) {
            return next({status: 'forbidden'});
        }
        ndir.copyfile(file.path, savepath, function (err) {
            if (err) {
                return next(err);
            }
            fs.unlink(file.path, function() {
                var url   = '/upload/' + uid + '/' + filename;
                file.dir  = url;
                return next(null, file);
            });
        });
    });
};