var dbPhoto  = require('../dbsource').Photo;

/**
 * 添加一张图片
 * @param  {Object}   data     
 * @param  {Function} callback 
 */
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
 * @param  {Object}   query   
 * @param  {Object}   opt     
 * @param  {Function} callback
 */
exports.getPhotosByQuery = function(query, opt, callback) {
    dbPhoto.find(query, '', opt, callback);
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