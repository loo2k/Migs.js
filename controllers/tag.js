var Photo       = require('../models').Photo;
var Tag         = require('../models').Tag;
var TagRelation = require('../models').TagRelation;
var config      = require('../config').config;
var EventProxy  = require('eventproxy');

exports.showCreateTag = function(req, res) {
    var data = {
        title: 'Tag Test'
    };
    Tag.getTagsByQuery({}, {}, function(err, tags) {
        data.tags = tags;
        res.render('test', data);
    });
}

exports.createTag = function(req, res) {
    if(!req.session.user) {
        return res.json('403', {code: '403', error: '1', msg: '未获得授权'});
    }

    req.assert('tag_name', '标签名错误').notEmpty();
    var errors = req.validationErrors(true);
    if( errors ) {
        return res.json('400', {code: '400', error: '1', msg: errors.tag_name.msg});
    }

    var newTag = {
        tag_name: req.sanitize('tag_name').xss().trim(),
        tag_desc: req.sanitize('tag_desc').xss().trim(),
        tag_type: 'tag',
        user_id: req.session.user._id
    }

    // 检查该用户是否已经存在了这个标签
    Tag.getTagsByQuery({tag_name: newTag.tag_name, user_id: req.session.user._id}, function(err, tags) {
        if(err) {
            return res.json('400', {code: '400', error: '1', msg: '服务器错误'});
        }

        if(tags.length > 0) {
            return res.json('400', {code: '400', error: '1', msg: '标签已存在'});
        }

        Tag.createTag(newTag, function(err) {
            if(err) {
                return res.json('400', {code: '400', error: '1', msg: '服务器错误'});
            }

            res.json('200', {code: '200', error: '0', msg: '标签添加成功'});
        });
    });

}

exports.showTags = function(req, res) {
    if( req.query.uid ) {
        Tag.getTagsByQuery({user_id: req.sanitize('uid').xss().trim()}, function(err, tags) {
            if(err) {
                return res.json('400', {code: '400', error: '1', msg: '服务器错误'});
            }

            res.json(tags);
        });
    } else {
        res.json('400', {code: '400', error: '1', msg: '参数错误'});
    }
    
}

exports.destroyTag = function(req, res) {
    if(!req.session.user) {
        return res.json('403', {code: '403', error: '1', msg: '未获得授权'});
    }

    Tag.destroyTagByQuery({tag_name: req.params.tag, user_id: req.session.user._id}, function(err) {
        if(err) {
            return res.json('400', {code: '400', error: '1', msg: '服务器错误'});
        }

        res.json('200', {code: '200', error: '0', msg: '标签删除成功'});
    })
}

exports.bindTag = function(req, res) {
    if(!req.session.user) {
        return res.json('403', {code: '403', error: '1', msg: '未获得授权'});
    }

    var newBind = {
        photo_id: req.body.photo_id,
        tag_id: req.body.tag_id,
        user_id: req.session.user._id,
        tag_type: 'tag'
    }

    if( !newBind.photo_id || !newBind.tag_id || !newBind.user_id ) {
        return res.json('400', {code: '400', error: '1', msg: '参数错误'});
    }

    var ep = new EventProxy();
    ep.all('photo', 'tag', 'relation', function(photo, tag, relation) {
        // 判断图片和标签是否存在
        if( !photo || !tag ) {
            return res.json('400', {code: '400', error: '1', msg: '参数错误'});
        }

        console.log(relation);

        if(relation.length > 0) {
            return res.json('400', {code: '400', error: '1', msg: '标签关系已存在'});
        }

        TagRelation.createRelation(newBind, function(err) {
            if(err) {
                return res.json('400', {code: '400', error: '1', msg: '服务器错误'});
            }

            res.json('200', {code: '200', error: '0', msg: '绑定标签成功'});
        });

    }).fail(function() {
        return res.json('400', {code: '400', error: '1', msg: '服务器错误'});
    });

    Photo.isExist({_id: newBind.photo_id}, function(err, photo) {
        ep.emit('photo', photo);
    });

    Tag.getTagById(newBind.tag_id, function(err, tag) {
        ep.emit('tag', tag);
    });

    console.log(newBind);
    TagRelation.getRelationByQuery(newBind, {}, function(err, relation) {
        ep.emit('relation', relation);
    });

}

exports.unbindTag = function(req, res) {
    if(!req.session.user) {
        return res.json('403', {code: '403', error: '1', msg: '未获得授权'});
    }

    var unBind = {
        photo_id: req.body.photo_id,
        tag_id: req.body.tag_id,
        user_id: req.session.user._id
    }

    if( !unBind.photo_id || !unBind.tag_id || !unBind.user_id ) {
        return res.json('400', {code: '400', error: '1', msg: '参数错误'});
    }

    TagRelation.destroyRelationByQuery(unBind, function(err) {
        res.json('200', {code: '200', error: '0', msg: '解绑标签成功'});
    });
}