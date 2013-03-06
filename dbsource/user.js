var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var userSchema = new Schema({
    username   : { type: String, unique: true },
    email      : { type: String, unique: true },
    password   : { type: String},
    create_time: { type: Date, default: Date.now },
    update_time: { type: Date, default: Date.now }
});

mongoose.model('User', userSchema);