#! /usr/bin/env node


/**
 * Created by sina on 2016/6/27.
 */
"use strict";
const path = require('path');
const svnHandler = require('./lib/svnInit');
const _ = require('lodash');
const dirHandler = require('./lib/initDir');
const fileHandler = require('./lib/copyFile.js');
const devConfig = require('./build_config');
// console.log(123)
// debugger;
// let argv = require('optimist').default({
//     'dir': process.cwd(),
//     'svn': '',
//     'devPubilcPath': 'http://test.sina.com.cn/',
//     'onLinePublicPath': 'http://test.sina.com.cn/'
// }).argv;

//TODO 支持选择配置文件的方式
//TODO 修改readme以及打tag
console.log(devConfig.svnPath);
const projectName = _.last(devConfig.projectPath.split(path.sep));

//为了防止 用户的system time 错误，因此采用用户自己输入时间
let svnYear;

if (devConfig.svnPath) {
    let tmpSvnHref = devConfig.svnPath.split(path.sep).join('/');
    //主要是处理 有些内容 返回的结构是 https:\xxx\asdfas\asdfa\ 这种
    devConfig.svnPath = tmpSvnHref.replace(/^(https:\/)([^\/])(.*)/, '$1/$2$3');
    try {
        svnYear = devConfig.svnPath.match(/\/(\d+)\/{0,1}$/)[1];
    } catch (e) {
        throw new Error('svn path need year end!');
    }

}
//默认格式化 svn地址不已/结尾
//devConfig.svnPath = devConfig.svnPath.replace(/\/$/, '');

let svnConfig = devConfig.svnPath ? {
    //svn trunk 地址
    svn: devConfig.svnPath + '/' + projectName,
    //svn qb 输入发布代码路径
    onlinePath: devConfig.svnPath + '/' + projectName + '/assets/',
    //svn qb 输入标签路径
    tagPath: devConfig.svnPath.replace('trunk', 'tags') + '/' + projectName + '/',
    //标签名字
    tagName: projectName,
    //标签内新增目录
    addPath: 'news/items/' + svnYear + '/' + projectName + '/'
} : null;

// console.log(svnConfig);

if (devConfig.svnPath) {
    svnHandler.init(argv.dir, svnConfig, function(projectPath) {
        dirHandler.synBuildSubDir(projectPath);
        fileHandler.copy({
            devPubilcPath: devConfig.devHost,
            onLinePubilcPath: devConfig.onLinePath
        }, svnConfig, projectPath, function() {
            console.log('project build done!');
            console.log('project dir:%s', projectPath);
            console.log('project svn:%s', svnConfig.svn);
        });
    });


} else {
    //仅仅初始化本地文件夹
    dirHandler.initRootDir(argv.dir, function(projectPath) {
        //absPath 是项目生成的根目录路径
        fileHandler.copy({
            devPubilcPath: devConfig.devHost,
            onLinePubilcPath: devConfig.onLinePath
        }, svnConfig, projectPath, function() {
            console.log('project build done!');
            console.log('project dir:%s', projectPath);
        });
    });
}
