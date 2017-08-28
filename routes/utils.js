var Mock = require('mockjs');
var fs = require('fs');

var mockDataByUrl = function (url) {
    var result = {}
    fs.readFileSync(`./api${url}.json`, 'utf-8', function (err, data) {
        if (err) {
            console.log(err);
            result =  {
                status: 1,
                msg: '路径错误'
            }
        } else {
            // 先把json内容直接用eval解析给tempObj对象
            eval('var tempObj =' + data)
            console.log(JSON.stringify(tempObj))

            // 定义一个对象用于存放tempObj中的value数据类型为函数的键值对，形式为tempObj[key] = value
            var funObj = pickFuncKeyFromObj(tempObj)
            console.log(JSON.stringify(funObj))
            console.log(JSON.stringify(tempObj))

            // 应用Mock插件生成key => mock value组成的对象
            var data = Mock.mock(tempObj)
            console.log(JSON.stringify(data))

            // 遍历funObj，将对应的key的value函数直接作用于上面mock后的对象
            insertValueIntoObj(data, funObj)

            result = data
        }
    })
    console.log(result)
    return result
}

function pickFuncKeyFromObj (obj) {
    var Result = {}
    Object.keys(obj).forEach(key => {
        switch (Object.prototype.toString.call(obj[key])) {
            case "[object Array]":
                var temp = new Array();
                for (var i = 0, a; a = obj[key][i]; i++) {
                    temp[i] = pickFuncKeyFromObj(a);
                }
                Result[key] = temp;
                delete temp;
                break;
            case "[object Object]":
                var temp = {};
                var keys = Object.keys(obj[key]);
                for (var i = 0, a; a = keys[i]; i++) {
                    temp[a] = pickFuncKeyFromObj(obj[key][a]);
                }
                Result[key] = temp;
                delete temp;
                delete keys;
                break;
            default:
                if (typeof obj[key] === 'function') {
                    Result[key] = obj[key]
                    obj[key] = undefined
                }
                break;
        }
    })
    return Result
}

function insertValueIntoObj (obj, funObj) {
    Object.keys(funObj).forEach(key => {
        switch (Object.prototype.toString.call(funObj[key])) {
            case "[object Array]":
                var temp = new Array();
                for (var i = 0, a; a = funObj[key][i]; i++) {
                    insertValueIntoObj(obj[key], a);
                }
                delete temp;
                break;
            case "[object Object]":
                var temp = {};
                var keys = Object.keys(funObj[key]);
                for (var i = 0, a; a = keys[i]; i++) {
                    insertValueIntoObj(obj[key], funObj[key][a]);
                }
                delete temp;
                delete keys;
                break;
            default:
                obj[key] = funObj[key].call(obj)
                break;
        }
    })
}

var cloneObject = function (src) {
    var Result;
    switch (Object.prototype.toString.call(src)) {
        case "[object Number]":
            Result = (typeof src === "object" ? new Number(src) : parseInt(src.toString()));
            break;
        case "[object String]":
            Result = (typeof src === "object" ? new String(src) : src.toString());
            break;
        case "[object Boolean]":
            Result = (typeof src === "Boolean" ? new Boolean(src) : src);
            break;
        case "[object Date]":
            Result = new Date(src);
            break;
        case "[object Array]":
            var temp = new Array();
            // Array.prototype.push.apply(temp,src);
            // 当使用for(var i=0,a;a = src[i++];) i会在a被赋值后就自动增加而不是
            // 等到一个循环完成再增加
            for (var i = 0, a; a = src[i]; i++) {
                // temp.push(cloneObject(a));
                // 使用push方法会让数组所有元素的类型变成undfined
                temp[i] = cloneObject(a);
            }
            Result = temp;
            delete temp;
            break;
        case "[object Object]":
            var temp = {};
            var keys = Object.keys(src);
            // keys 为对象src的键名字数组
            // 它是数组！！！
            for (var i = 0, a; a = keys[i]; i++) {
                temp[a] = cloneObject(src[a]);
            }
            Result = temp;
            delete temp;
            delete keys;
            break;
        default:
            break;
    }
    return Result;
}

module.exports = {
    mockDataByUrl
}