var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var tagRelationSchema = new Schema({
    photo_id   : { type: ObjectId },
    tag_id     : { type: ObjectId },
    user_id    : { type: ObjectId },
    tag_type   : { type: String }
    create_time: { type: Date, default: Date.now }
});

mongoose.model('TagRelation', tagRelationSchema);