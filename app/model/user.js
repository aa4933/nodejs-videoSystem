/**
 * Created by wuilly on 2017/4/27.
 */
'use strict'
var mongoose = require('mongoose');


var UserSchema = new mongoose.Schema({
    phoneNumber: {
        unique: true,
        type: String,
    },
    areaCode: String,
    verifyCode: String,
    verified: {
        type: Boolean,
        default: false,
    },
    accessToken: String,
    nickname: String,
    gender: String,
    breed: String,
    age: String,
    avatar: String,
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

UserSchema.pre('save', function (next) {
    if (this.isNew) {
        this.meta.updateAt = this.meta.createAt = Date.now();
    } else {
        this.meta.updateAt = Date.now();
    }

    next();
});

module.exports = mongoose.model('User', UserSchema);