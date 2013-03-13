var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var photoSchema = new Schema({
    uid        : { type: String },
    title      : { type: String },
    desc       : { type: String },
    size       : { type: Number },
    dir        : { type: String },
    width      : { type: Number },
    height     : { type: Number },
    status     : { type: Number },
    create_time: { type: Date, default: Date.now },
    update_time: { type: Date, default: Date.now }
});

mongoose.model('Photo', photoSchema);