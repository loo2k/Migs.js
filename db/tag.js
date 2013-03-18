var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var tagSchema = new Schema({
    tag_name: { type: String },
    tag_desc: { type: String, default: ''},
    tag_type: { type: String, default: 'tag' },
    user_id : { type: ObjectId },
    photo_count: { type: Number },
    create_time: { type: Date, default: Date.now },
    update_time: { type: Date, default: Date.now }
});

mongoose.model('Tag', tagSchema);