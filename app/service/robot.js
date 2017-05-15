/**
 * Created by wuilly on 2017/5/2.
 */
'use strict'

var qiniu = require('qiniu');
var config = require('../../config/config');
var cloudinary = require('cloudinary');
var Promise = require('bluebird');
var sha1 = require('sha1');
var uuid = require('uuid');

qiniu.conf.ACCESS_KEY = config.qiniu.AK;
qiniu.conf.SECRET_KEY = config.qiniu.SK;
cloudinary.config(config.cloudinary);

exports.saveToQiniu = function (url, key) {

    var client = new qiniu.rs.Client()

    console.log('返回一个异步承诺')
    return new Promise((resolve, reject)=> {
        client.fetch(url, 'test', key, (err, ret)=> {
            if (!err) {
                resolve(ret)
            } else {
                reject(err)
            }
        })
    })
}
exports.uploadToCloudinary = function (url) {
    return new Promise(function (resolve, reject) {
        cloudinary.uploader.upload(url, function (result) {

            console.log(result)
            if (result && result.public_id) {
                resolve(result)
            } else {
                reject(result);
            }
        }, {
            resource_type: 'video',
            folder: 'video',
        })
    });
}
exports.getQiniuToken = function (body) {
    var type = body.type;
    var key = uuid.v4();
    var putPolicy
    var options = {
        persistentNotifyUrl: config.notify
    }

    if (type === 'avatar') {
        key += '.png';
        putPolicy = new qiniu.rs.PutPolicy("videoavatar:" + key);
    } else if (type === 'video') {
        key += '.mp4';
        options.scope = 'videovideo:' + key
        options.persistentOps = 'avthumb/mp4/an/1';
        putPolicy = new qiniu.rs.PutPolicy2(options);
    } else if (type === 'audio') {
        //key += '.png';
    }

    var token = putPolicy.token();

    return {
        key: key,
        token: token,
    };
}

exports.getCloudinary = function (body) {
    var folder;
    var tags;
    var timestamp = body.timestamp
    var type = body.type;

    if (type === 'video') {
        folder = 'video';
        tags = 'app,video';
    } else if (type === 'avatar') {
        folder = 'avatar';
        tags = 'app,avatar';
    } else if (type === 'audio') {
        folder = 'audio';
        tags = 'app,audio';
    }


    let signature = 'folder=' + folder + '&tags=' + tags + '&timestamp=' + timestamp + config.cloudinary.api_secret;
    signature = sha1(signature);
    var key = uuid.v4();
    return {
        token: signature,
        key: key
    };
}

