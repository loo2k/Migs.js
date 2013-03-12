var User    = require('../models').User;
var Photo   = require('../models').Photo;
var dbPhoto = require('../dbsource').Photo;
var upload  = require('./upload');
var config  = require('../config').config;
var fs      = require('fs');
var path    = require('path');
var im      = require('imagemagick');
var url     = require('url');
exports.showPhotos = function(req, res) {
    var data = {
        title: '图片列表',
        page: req.query['page'] ? parseInt(req.query['page'], 10) : 1,
    };
    
    var query = {};

    var option = {};
    option.limit = req.query['show'] ? parseInt(req.query['show'], 10) : config.photo_limit;
    option.skip = ( data.page - 1)*option.limit;
    option.sort = [['create_time', -1]];

    Photo.getPhotosByQuery(query, option, function(err, photos) {
        for (var i = photos.length - 1; i >= 0; i--) {
            photos[i].src = parsePhoto(photos[i]);
        };

        Photo.getQueryCount(query, function(err, total) {
            if(err) throw err;

            // 分页的准备
            if( req.query.page ) delete req.query.page;
            data.base_url = url.format({
                pathname: req.path,
                query: req.query
            });
            data.pagination = pagination(total, data.page, option.limit, 5, 5);
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
            title: '图片列表',
            page: req.query['page'] ? parseInt(req.query['page'], 10) : 1,
        };

        var query = { uid: user._id };

        var option = {};
        option.limit = req.query['show'] ? parseInt(req.query['show'], 10) : config.photo_limit;
        option.skip = ( data.page - 1)*option.limit;
        option.sort = [['create_time', -1]];

        Photo.getPhotosByQuery(query, option, function(err, photos) {
            for (var i = photos.length - 1; i >= 0; i--) {
                console.log(photos[i]);
                photos[i].src = parsePhoto(photos[i]);
            };
            
            Photo.getQueryCount(query, function(err, total) {
                if(err) throw err;

                // 分页的准备
                if( req.query.page ) delete req.query.page;
                data.base_url = url.format({
                    pathname: req.path,
                    query: req.query
                });
                data.pagination = pagination(total, data.page, option.limit, 5, 5);
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
            return res.json('404', {code: '404', error: '1', msg: '图片不存在'});
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
                
                photo.src = parsePhoto(photo, true);
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

    upload.uploadFile(req, res, function(err, file) {
        if(err) {
            console.log(err);
        }

        var uploadFilePath = config.root_dir + '/' + config.static_dir + file.dir;

        upload.identifyImage(uploadFilePath, function(err, features){
            if (err) throw err;

            var thumbFile = {
                width   : features.width,
                height  : features.height,
                filename: file.dir.slice(0, file.dir.lastIndexOf('.')),
                ext     : file.dir.substr(file.dir.lastIndexOf('.')),
                src     : uploadFilePath,
                dst     : uploadFilePath.slice(0, uploadFilePath.lastIndexOf('.'))
            }

            upload.thumbImage(thumbFile, function(err) {
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

function pagination(total, page, pagesize, offset, length) {

    //最后一页
    //计算方法：最大文章数 / 每页文章数
    var lastpage   = Math.ceil( total / pagesize );

    //共有多少个分页
    var loopcount  = Math.ceil( lastpage / pagesize );

    //重新计算
    page = page    > lastpage ? 1 : page;

    //前一页、后一页
    var previous   = parseInt( page ) - 1;
    var next       = parseInt( page ) + 1;

    //是否显示前一页/后一页
    var isprevious, isnext;
    isnext     = next - 1             < lastpage ? true : false;
    isprevious = parseInt( previous ) > 0        ? true : false;

    //开始 结束 步长
    var begin, end, step;
    //计算步长
    step       = lastpage >  length       ? length         : lastpage;
    //计算开始
    //1 2 3 4 5 6
    //点击6时，产生4 5 6 7 8 9
    //而非 7 8 9 10 11 12
    //if ( lastpage - page < step ) {
    //  begin   = lastpage - step + 1;
    //}
    //else if ( offset > 0 ) {
    //  begin   = page    <= offset        ? 1              : page - offset;
    //}
    if ( offset > 0 ) {
        begin   = page   <= offset         ? 1              : page - offset;
    }
    else if ( offset == 0 && page == 1 ) {
        begin   = 1;
    }
    else if ( page != 1 && oldpage < page ) {
        begin   = page    < pagesize        ? 1             : page;
    }
    else if ( page != 1 && oldpage >= page ) {
        begin   = page    < pagesize        ? 1             : page - step + 1;
    }
    //计算结束
    end     = parseInt( begin )    +  parseInt( step );
    //如果end比lastpage大的话，赋值为lastpage
    end     = end      >= lastpage ? lastpage + 1 : end;

    if ( end - begin + 1 != step ) {
        end = begin + step;
    }
    if ( begin + step - 1 > lastpage ) {
        begin = lastpage - step + 1;
        end   = lastpage + 1;
    }

    //前滚、后滚
    //是否显示>> and <<
    var isforward, isback;
    isforward = lastpage - end >= 1          ? true         : false;
    isback    = begin          >  1          ? true         : false;

    //前进/后退到第几页
    var forward , back;
    back      = begin - 1      <= 0          ? 1            : begin - 1;
    forward   = end;

    //backup page
    oldpage = page;

    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////

    var pv = {};
    //总数
    pv.total     = total;
    //当前页
    pv.page      = parseInt( page );
    //每页的内容数
    pv.pagesize  = pagesize;
    //最后一页
    pv.lastpage  = lastpage;
    //共计多少分页
    pv.loopcount = loopcount;
    //前一页
    pv.previous  = previous;
    //后一页
    pv.next      = next;
    //是否显示前一页
    pv.isprevious = isprevious;
    //是否显示后一页
    pv.isnext     = isnext;
    //开始
    pv.begin    = begin;
    //结束
    pv.end      = end;
    //步长
    pv.step     = step;
    //是否可以前进，指">>"
    pv.isforward  = isforward;
    //是否可以后退，指"<<"
    pv.isback     = isback;
    //前进到第几页
    pv.forward  = forward;
    //后退到第几页
    pv.back     = back;
    //偏移量
    pv.offset   = offset;
    //begin -> end 时的步长
    pv.length   = length;

    console.log( "pv.page           = " + pv.page );
    console.log( "pv.total          = " + pv.total );
    console.log( "pv.loopcount      = " + pv.loopcount );
    console.log( "pv.pagesize       = " + pv.pagesize );
    console.log( "pv.lastpage       = " + pv.lastpage );
    console.log( "pv.begin          = " + pv.begin );
    console.log( "pv.end            = " + pv.end );
    console.log( "pv.previous       = " + pv.previous );
    console.log( "pv.next           = " + pv.next );
    console.log( "pv.isprevious     = " + pv.isprevious );
    console.log( "pv.isnext         = " + pv.isnext );
    console.log( "pv.isforward      = " + pv.isforward );
    console.log( "pv.isback         = " + pv.isback );
    console.log( "pv.forward        = " + pv.forward );
    console.log( "pv.back           = " + pv.back );
    console.log( "pv.offset         = " + pv.offset );
    console.log( "pv.length         = " + pv.length );

    return pv;
}