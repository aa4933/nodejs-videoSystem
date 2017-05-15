'use strict'

var mongoose = require('mongoose')
var Comment = mongoose.model('Comment')
var Creation = mongoose.model('Creation')

var userFields = [
    'avatar',
    'nickname',
    'gender',
    'age',
    'breed'
]

exports.find = function *(next) {
    var id = this.query.creation

    if (!id) {
        this.body = {
            success: false,
            err: 'id 不能为空'
        }

        return next
    }

    var queryArray = [
        Comment.find({
            creation: id
        })
            .populate('replyBy', userFields.join(' '))
            .sort({
                'meta.createAt': -1
            })
            .exec(),
        Comment.count({creation: id}).exec()
    ]

    var data = yield queryArray

    console.log(data);
    this.body = {
        success: true,
        data: data[0],
        total: data[1]
    }
}

exports.save = function *(next) {
    var commentData = this.request.body.comment
    var user = this.session.user

    var creation = yield Creation.findOne({
        _id: commentData.creation
    })
        .exec()

    if (!creation) {
        this.body = {
            success: false,
            err: '视频不见了'
        }

        return next
    }

    var comment

    comment = new Comment({
        creation: creation._id,
        replyBy: user._id,
        replyTo: creation.author,
        content: commentData.content
    })

    comment = yield comment.save()
    console.log(comment);
    this.body = {
        success: true,
        data: [comment]
    }

}


