/**
 * Created by wuilly on 2017/4/26.
 */
'use strict'
//模型-连接库
var fs=require('fs');
var path=require('path');
var mongoose=require('mongoose');
var db='mongodb://localhost/video-app';
mongoose.Promise=require('bluebird');
mongoose.connect(db);

//模型-遍历模型引入
var modulesPath=path.join(__dirname,'/app/model');

var walk =function (modulePath) {
    fs
        .readdirSync(modulePath)
        .forEach(function (file) {
            var filePath=path.join(modulePath,'/'+file);
            var stat=fs.statSync(filePath);

            if (stat.isFile()){
                if (/(.*)\.(js|coffee)/.test(file)){
                    require(filePath);
                }
            }else if(stat.isDirectory()) {
                walk(filePath)
            }
        })
}

walk(modulesPath);



//路由
var koa= require('koa');
var logger= require('koa-logger');
var session= require('koa-session');
var bodyParse= require('koa-bodyparser');
var app= new koa();

app.keys=['video'];

app.use(logger());
app.use(session(app));
app.use(bodyParse());

var router = require('./config/routes')();

app
    .use(router.routes())
    .use(router.allowedMethods())


app.listen(1234);
console.log('listen 1234');


