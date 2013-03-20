var fs     = require('fs');
var path   = require('path');
var util   = require('util');
var im     = require('imagemagick');
var config = require('../config').config;

exports.uploadFile = function(req, res, next) {
    var file = req.files && req.files.images;

    if (!file) {
        return next({code: '404', msg: '没有上传文件'});
    }

    var uid = req.session.user._id.toString();
    var userDir = path.join(config.upload_dir, uid);

    fs.exists(userDir, function(exists) {
        if( !exists ) {
            fs.mkdirSync(userDir, function(err) {
                if(err) {
                    return next({code: '500', msg: '服务器创建用户目录不成功'});
                }
            });
        }

        var filename = Date.now() + '_' + file.name;
        var savepath = path.resolve(path.join(userDir, filename));
        if (savepath.indexOf(path.resolve(userDir)) !== 0) {
            return next({code: '402', msg: '没有文件目录操作权限'});
        }

        var readStream = fs.createReadStream(file.path);
        var writeStream = fs.createWriteStream(savepath);

        util.pump(readStream, writeStream, function() {
            fs.unlink(file.path, function() {
                var url   = '/upload/' + uid + '/' + filename;
                file.dir  = url;
                return next(null, file);
            });
        });

    });

}

exports.identifyImage = function(path, next) {
    im.identify(path, function(err, features) {
        if(err) {
            return next(err);
        }

        return next(null, {type: features.format, width: features.width, height: features.height});
    });
}

exports.thumbImage = function(file, next) {

    // 处理传入参数样例
    // D:\nodejs\migs\public\upload\513dc88610788e2419000002\1363003540623_58088323tw1dmbz5kgr7sj.jpg
    // var file = {
    //     width   : ,
    //     height  : ,
    //     filename: '1363003540623_58088323tw1dmbz5kgr7sj',
    //     ext     : 'jpg',
    //     src     : 'D:\nodejs\migs\public\upload\513dc88610788e2419000002\1363003540623_58088323tw1dmbz5kgr7sj.jpg',
    //     dst     : 'D:\nodejs\migs\public\upload\513dc88610788e2419000002\1363003540623_58088323tw1dmbz5kgr7sj'
    // }
    
    im.crop({
        srcPath: file.src,
        dstPath: file.dst + '_small_' + file.ext,
        width: 200,
        height: 200,
        quality: 1,
        gravity: "North",
    }, function(err, stdout, srderr) {
        console.log('Small thumb create.');
        if(err) {
            return next(err);
        }
    });

    im.crop({
        srcPath: file.src,
        dstPath: file.dst + '_square_' + file.ext,
        width: 75,
        height: 75,
        quality: 1,
        gravity: "North"
    }, function(err, stdout, stderr){
        console.log('Square thumb create.');
        if(err) {
            return next(err);
        }
    });

    if( file.width >= 650 ) {
        im.resize({
            srcPath: file.src,
            dstPath: file.dst + '_midddle_' + file.ext,
            width  : 650
        }, function(err, stdout, stderr){
            console.log('Middle thumb create.');
            if(err) {
                return next(err);
            }
        });
    }

}

exports.parsePhoto = function(photo, dir) {
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