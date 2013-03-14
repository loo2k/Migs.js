var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var photoSchema = new Schema({
    uid        : { type: ObjectId },
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