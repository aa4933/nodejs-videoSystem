/**
 * Created by wuilly on 2017/4/27.
 */
'use strict'
var xss = require('xss');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var sms = require('../service/sms');
var uuid = require('uuid');

exports.signup = function *(next) {

    //1.取到手机号post
    var phoneNumber = xss(this.request.body.phoneNumber.trim());
    //get
    //var phoneNumber = this.query.phoneNumber;
    //2.匹配数据库手机号
    var user = yield User.findOne({
        phoneNumber: phoneNumber,
    }).exec()

    //3.生成验证码
    var verifyCode = sms.getCode();

    //4.注册用户存入验证码／重新存入验证码
    if (!user) {
        var accessToken = uuid.v4();
        user = new User({
            nickname: '默认名字',
            avatar: 'https://dummyimage.com/640x640/8e9afc)',
            phoneNumber: xss(phoneNumber),
            verifyCode: verifyCode,
            accessToken: accessToken,
        })
    } else {
        user.verifyCode = verifyCode;
    }

    //5.保存信息
    try {
        user = yield user.save();
    } catch (e) {
        this.body = {
            success: false,
        }
        return next
    }

    //6.发送短信----为节省资源，暂时关闭
    var msg = "您的验证码是" + user.verifyCode;
    try {
        //sms.send(user.phoneNumber, msg);
    } catch (e) {
        console.log(e);
        this.body = {
            success: false,
            err: '短信服务异常',
        }
        return next
    }

    this.body = {
        success: true,
    }
}


exports.verify = function *(next) {

    //1.取到验证码和手机号
    var phoneNumber = this.request.body.phoneNumber;
    var verifyCode = this.request.body.verifyCode;

    if (!verifyCode && !phoneNumber) {
        this.body = {
            success: false,
            err: '错误',
        }
        return next
    }

    //2.查询校验同时符合验证码和手机号账号

    var user = yield User.findOne({
        phoneNumber: phoneNumber,
        verifyCode: verifyCode,
    }).exec()

    //3.成功返回用户信息
    if (user) {
        user.verified = true;
        user = yield user.save();
        this.body = {
            success: true,
            data: {
                nickname: user.nickname,
                avatar: user.avatar,
                accessToken: user.accessToken,
                id: user._id,
            }
        }
    } else {
        this.body = {
            success: false,
            err: '验证未通过',
        }
        return next
    }

}


exports.update = function *(next) {
    //1.拿到body实体和token

    var body = this.request.body;
    var accessToken = body.accessToken;

    //2.找到相对应的用户

    var user = this.session.user;

    //3.遍历循环替换user并保存
    var field = 'avatar,gender,age,nickname,breed'.split(',');

    field.forEach(function (field) {
        if (body[field]) {
            user[field] = xss(body[field].trim());
        }
    })

    user = yield user.save();

    this.body = {
        success: true,
        data: {
            nickname: user.nickname,
            avatar: user.avatar,
            accessToken: user.accessToken,
            age: user.age,
            gender: user.gender,
            breed: user.breed,
            id: user._id,
        }
    }
}