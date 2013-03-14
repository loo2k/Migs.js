var mongoose = require('mongoose');
var config = require('../config').config;

mongoose.connect(config.db, function (err) {
    if (err) {
        console.error('connect to %s error: ', config.db, err.message);
        process.exit(1);
    }
});

require('./user');
require('./photo');
require('./tag');
require('./tagRelation');

exports.User = mongoose.model('User');
exports.Photo = mongoose.model('Photo');
exports.Tag = mongoose.model('Tag');
exports.TagRelation = mongoose.model('TagRelation');