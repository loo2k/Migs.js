var dbUser  = require('../dbsource').User;

/**
 * 添加用户
 * @param  {object}   data     
 * @param  {Function} callback 
 */
exports.createUser = function(data, callback) {
    var user = new dbUser();
    user.username = data.username;
    user.email    = data.email;
    user.password = data.password;
    user.save(callback);
}

/**
 * 根据ID，查找用户
 * @param  {Number}   id       
 * @param  {Function} callback 
 */
exports.getUserById = function(id, callback) {
    dbUser.findOne({'_id': id}, callback);
}

/**
 * 根据用户名，查找用户
 * @param  {String}   name     
 * @param  {Function} callback 
 */
exports.getUserByName = function(username, callback) {
    dbUser.findOne({'username': username}, callback);
}

/**
 * 根据条件，查找一组用户
 * @param  {String}   query   
 * @param  {Object}   opt     
 * @param  {Function} callback
 */
exports.getUsersByQuery = function(query, opt, callback) {
    dbUser.find(query, [], opt, callback);
};

/**
 * 根据ID，删除用户
 * @param  {Number}   id       
 * @param  {Function} callback 
 */
exports.deleteUserById = function(id, callback) {
    dbUser.remove({'_id': id}, callback);
}

/**
 * 根据用户名，删除用户
 * @param  {String}   username 
 * @param  {Function} callback 
 */
exports.deleteUserByUsername = function(username, callback) {
    dbUser.remove({'username': username}, callback);
}