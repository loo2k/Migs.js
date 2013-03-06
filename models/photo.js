var dbPhoto  = require('../dbsource').Photo;


exports.createPhoto = function(data, callback) {
    var photo = new dbPhoto();
    photo.uid    = data.uid;
    photo.title  = data.title;
    //photo.desc   = data.desc;
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
    dbPhoto.findOne({_id: id}, callback);
}

/**
 * 根据条件，查找一组图片
 * @param  {String}   query   
 * @param  {Object}   opt     
 * @param  {Function} callback
 */
exports.getPhotosByQuery = function (query, opt, callback) {
    dbPhoto.find(query, [], opt, callback);
};

exports.destroyPhotoById = function(id, callback) {
    dbPhoto.remove({'_id': id}, callback);
}