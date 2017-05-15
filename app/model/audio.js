/**
 * Created by wuilly on 2017/5/9.
 */
'use strict'
var mongoose = require('mongoose');
var Schema=mongoose.Schema;
var Mixed=Schema.Types.Mixed;
var ObjectId=Schema.Types.ObjectId;


var AudioSchema = new Schema({
    author: {
        type: ObjectId,
        ref: 'User',
    },
    video: {
        type: ObjectId,
        ref: 'Video',
    },
    //qiniu
    qiniu_video:String,
    qiniu_thumb:String,

    qiniu_key:String,
    persistentId:String,
    qiniu_final_key:String,
    qiniu_detail:Mixed,

    //cloudinary
    public_id:String,
    detail:Mixed,
    meta: {
        createAt: {
            type: Date,
            default: Date.now(),
        },
        updateAt: {
            type: Date,
            default: Date.now(),
        }
    }
});

AudioSchema.pre('save', function (next) {
    if (this.isNew) {
        this.meta.updateAt = this.meta.createAt = Date.now();
    } else {
        this.meta.updateAt = Date.now();
    }

    next();
});

module.exports = mongoose.model('Audio', AudioSchema);