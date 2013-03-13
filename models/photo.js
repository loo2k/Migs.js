var EventProxy = require('eventproxy');
var dbPhoto  = require('../db').Photo;
var User  = require('../models').User;

/**
 * 添加一张图片
 * @param  {Object}   data     
 * @param  {Function} callback 
 */
exports.createPhoto = function(data, callback) {
    var photo = new dbPhoto();
    photo.uid    = data.uid;
    photo.title  = data.title;
    photo.desc   = '';
    photo.size   = data.size;
    photo.dir    = data.dir;
    photo.width  = data.width;
    photo.height = data.height;
    photo.status = data.status;
    photo.save(callback);
}

/**
 * 根据ID，查找图片
 * @param  {Number}   id       
 * @param  {Function} callback 
 */
exports.getPhotoById = function(id, callback) {
    // dbPhoto.findOne({_id: id}, callback);
    var ep = new EventProxy();
    var events = ['photo', 'author'];
    ep.assign(events, function(photo, author) {
        photo.author = author;
        return callback(null, photo);
    }).fail(callback);

    dbPhoto.findOne({_id: id}, ep.done(function(photo) {
        if(!photo) {
            ep.emit('photo', null);
            ep.emit('author', null);
            return;
        }
        ep.emit('photo', photo);

        User.getUserById(photo.uid, ep.done('author'));
        //ep.emit('author', null);

    }));
}

/**
 * 根据条件，查找一组图片
 * @param  {Object}   query   
 * @param  {Object}   opt     
 * @param  {Function} callback
 */
exports.getPhotosByQuery = function(query, opt, callback) {
    // dbPhoto.find(query, '', opt, callback);
    dbPhoto.find(query, '_id', opt, function(err, docs) {
        if(err) {
            return callback(err);
        }

        if(docs.length === 0) {
            return callback(null, []);
        }

        var photos_id = [];
        for (var i = 0; i < docs.length; i++) {
            photos_id.push(docs[i]._id);
        };

        var ep = new EventProxy();

        var photos = [];
        ep.after('photos_ready', photos_id.length, function() {
            return callback(null, photos);
        });
        ep.fail(callback);

        photos_id.forEach(function(id, i) {
            exports.getPhotoById(id, ep.done(function(photo) {
                photos[i] = photo;
                ep.emit('photos_ready');
            }));
        });
    });
};

/**
 * 获取符合条件的图片数目
 * @param  {Object}   query    
 * @param  {Function} callback 
 */
exports.getQueryCount = function(query, callback) {
    dbPhoto.count(query, callback);
}

/**
 * 根据ID，删除一张图片
 * @param  {Number}   id       
 * @param  {Function} callback 
 */
exports.destroyPhotoById = function(id, callback) {
    dbPhoto.remove({'_id': id}, callback);
}