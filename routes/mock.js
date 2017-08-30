var express = require('express');
var router = express.Router();
var Mock = require('mockjs');
var fs = require('fs');

var handleRequest = function (req, res, next) {
    var url = req.url.split('?')[0]
    console.log(url)
    fs.readFile(`./api${url}.json`, 'utf-8', function (err, data) {
        if (err) {
            console.log(err);
            res.json({
                status: 1,
                msg: '路径错误'
            })
        } else {
            // 先把json内容直接用eval解析给tempObj对象
            try {
                eval('var tempObj =' + data)
            } catch (err) {
                console.log(err)
                if (err instanceof SyntaxError) {
                    res.json({
                        status: 1,
                        msg: 'json解析错误，请检查json文件',
                        errInfo: err.message
                    })
                } else {
                    res.json({
                        status: 1,
                        msg: '未知错误',
                        errInfo: err.message
                    })
                }
                return
            }

            var data = Mock.mock(tempObj)

            res.json(data);
        }
    })
}

router.get('/*', handleRequest).post('/*', handleRequest)
module.exports = router
