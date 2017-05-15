/**
 * Created by wuilly on 2017/5/5.
 */
'use strict'
var mongoose = require('mongoose');
var Schema=mongoose.Schema;
var Mixed=Schema.Types.Mixed;
var ObjectId=Schema.Types.ObjectId;


var VideoSchema = new Schema({
    author: {
        type: ObjectId,
        ref: 'User',
    },
    //qiniu

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

VideoSchema.pre('save', function (next) {
    if (this.isNew) {
        this.meta.updateAt = this.meta.createAt = Date.now();
    } else {
        this.meta.updateAt = Date.now();
    }

    next();
});

module.exports = mongoose.model('Video', VideoSchema);