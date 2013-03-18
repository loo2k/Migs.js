var dbTag  = require('../db').Tag;
var TagRelation = require('../models').TagRelation;

/**
 * 添加一个标签
 * @param  {Object}   data    
 * @param  {Function} callback
 */
exports.createTag = function(data, callback) {
    var tag      = new dbTag();
    tag.tag_name = data.tag_name;
    tag.tag_desc = data.tag_desc;
    tag.tag_type = data.tag_type;
    tag.user_id  = data.user_id;
    tag.save(callback);
}

/**
 * 根据标签名获取标签
 * @param  {String}   name     
 * @param  {Function} callback 
 * @return {[type]}            
 */
exports.getTagByName = function(name, callback) {
    dbTag.findOne({tag_name: name}, callback);
}

/**
 * 根据 ID 获取标签
 * @param  {Number}   id       
 * @param  {Function} callback 
 */
exports.getTagById = function(id, callback) {
    dbTag.findOne({_id: id}, callback);
};

/**
 * 根据 ID 数组获取标签
 * @param  {Array}   ids      
 * @param  {Function} callback
 */
exports.getTagsByIds = function(ids, callback) {
    dbTag.find({_id: {'$in': ids}}, callback);
};

/**
 * 更新 Tag
 * @param  {MongooseObject}   tag 
 * @param  {Function} callback 
 */
exports.updateTag = function(tag, callback) {
    tag.save(callback);
}

/**
 * 根据 Tag Id 删除标签
 * @param  {Number}   id       
 * @param  {Function} callback 
 */
exports.destroyTagById = function(id, callback) {
    dbTag.remove({'_id': id}, function(err) {
        if(err) {
            return callback(err);
        }

        TagRelation.destroyRelationByQuery({tag_id: id}, callback);
    });
}

/**
 * 根据条件删除标签
 * @param  {Object}   query    
 * @param  {Function} callback 
 */
exports.destroyTagByQuery = function(query, callback) {
    dbTag.remove(query, callback);
}

/**
 * 根据请求查询一组 Tag
 * @param  {Object}   query
 * @param  {Object}   opt     
 * @param  {Function} callback
 */
exports.getTagsByQuery = function(query, opt, callback) {
    dbTag.find(query, '', opt, callback);
}