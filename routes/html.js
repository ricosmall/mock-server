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
            res.render('error', {
                errorContent: '路径错误'
            })
        } else {

            // 先把json内容直接用eval解析给tempObj对象
            try {
                eval('var tempObj =' + data)
            } catch (err) {
                console.log(err)
                if (err instanceof SyntaxError) {
                    res.render('error', {
                        errorContent: 'json解析错误，请检查json文件'
                    })
                } else {
                    res.render('error', {
                        errorContent: '未知错误'
                    })
                }
                return
            }

            var temp = Mock.mock(tempObj)

            var code = JSON.stringify(temp, null, 4)

            // 渲染并发送给页面
            res.render('code', {
                layout: 'code',
                code: code
            })
        }
    })
}

/* GET code page. */
router.get('/*', handleRequest).post('/*', handleRequest)

module.exports = router;
