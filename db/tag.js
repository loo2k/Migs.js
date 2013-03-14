var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var tagSchema = new Schema({
    tag_nane: { type: String },
    tag_desc: { type: String },
    tag_type: { type: String },
    photo_count: { type: Number },
    create_time: { type: Date, default: Date.now },
    update_time: { type: Date, default: Date.now }
});

mongoose.model('Tag', tagSchema);