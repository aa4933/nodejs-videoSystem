/**
 * Created by wuilly on 2017/4/27.
 */
'use strict'

var mongoose = require('mongoose');
var User = mongoose.model('User');
var robot = require('../service/robot');

exports.signature = function *(next) {
    var body = this.request.body;
    var cloud = body.cloud;
    var data
    if (cloud === 'qiniu') {
        data = robot.getQiniuToken(body);
    } else {
        data = robot.getCloudinary(body);
    }

    this.body = {
        success: true,
        data: data,
    }
}


//校验中间件
exports.hasToken = function *(next) {
    //1.get/post过来的token获取
    var accessToken = this.query.accessToken;
    if (!accessToken) {
        accessToken = this.request.body.accessToken;
    }
    if (!accessToken) {
        this.body = {
            success: false,
            err: '钥匙没了'
        }
        return next
    }
    //2.查询相对应的token值的用户

    var user = yield User.findOne({
        accessToken: accessToken,
    }).exec()

    if (!user) {
        this.body = {
            success: false,
            err: '用户没了'
        }
        return next
    }
    this.session = this.session || {};
    this.session.user = user;

    yield next
}


exports.hasBody = function *(next) {
    var body = this.request.body || {};
    if (Object.keys(body).length === 0) {
        this.body = {
            success: false,
            err: '漏了'
        }
        return next
    }

    yield next
}
