var dbTagRelation = require('../db').TagRelation;

/**
 * 添加标签绑定
 * @param  {Object}   data    
 * @param  {Function} callback
 */
exports.createRelation = function(data, callback) {
    var relation      = new dbTagRelation();
    relation.photo_id = data.photo_id;
    relation.tag_id   = data.tag_id;
    relation.user_id   = data.user_id;
    relation.tag_type = data.tag_type;
    relation.save(callback);
}

/**
 * 根据条件删除标签绑定
 * @param  {Object}   query   
 * @param  {Function} callback 
 */
exports.destroyRelationByQuery = function(query, callback) {
    dbTagRelation.remove(query, callback);
}

/**
 * 根据条件查询一组关系
 * @param  {Object}   query    
 * @param  {Object}   opt      
 * @param  {Function} callback 
 */
exports.getRelationByQuery = function(query, opt, callback) {
    dbTagRelation.find(query, '', opt, callback);
}