//Add require npm package
var fs = require('fs');
// var async = require('async');
var TelegramBot = require('node-telegram-bot-api');

//declaring bot token
var token = '209336735:AAHlZCTwBGJhS066dX6LMbSwJEs_sXhqW00';

//declaring global variable
var data = []; //data array
var queryResult = []; // for query use
var form = [];  //make data to become the correct format

//declaring AWS-related variable
var AWS = require('aws-sdk'); // For DynamoDB 
AWS.config.update({ // THE KEYS MUST BE MOVED to separated file when in production stage
    accessKeyId: 'AKIAJEXJVKONFMRV3HVA',
    secretAccessKey: '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',
    region: 'ap-northeast-1'
});

//Note, The second one is for uploading file to DB, do not delete
var dynamodb = new AWS.DynamoDB();
var dynamoDB = new AWS.DynamoDB.DocumentClient();

//creating bot of NPM package 'node-telegram-bot-api'
var bot = new TelegramBot(token, {
    polling: true
});


var http = require('http').Server(app);
//var io = require('./chatbox/chatbox.js');
//var io = require('socket.io')(http);
var ioClient = require('socket.io-client');

//Express
var express = require('express');
var app = express(); //Express App

var socket = ioClient.connect("http://localhost:8080");

    
//Array used to generate keyboards, will be imported in the future, so wont be in this server file

// var questionArray = ["中文全名", "英文全名", "電話號碼", "照片", "銀行", "銀行戶口", "性別", "出生年份", "地區", "可工作場所", "銷售經驗", "銷售產品類別", "工作日數","工作類別", "顯示資料"  , "返回"  ];
// var bankName = ["匯豐", "恆生", "渣打", "中銀"];
// var workDay = ['三日檔', '七天檔', '超過十天檔'];
// var workArea = ['超巿', '萬屈', '日資場', '百貨公司', '反斗城', '街藥房'];
// var gender = ['男', '女'];
// var sellCate = ['食物', '朱古力', '飲品', '健康產品', '清潔用品', '淋浴洗頭產品', '電器', '玩具', '化粧品', '食油', '水餃煮食'];
// var district = ['屯門', '元朗', '天水圍', '荃灣', '葵涌', '九龍西', '九龍東', '九龍中', '將軍澳', '沙田', '馬鞍山', '大埔', '上水粉嶺', '東涌', '港島'];

var queryArray = ["工作類別", "舖頭資料", "工作開始時間", "工作結束時間", "開始日期", "結束日期", "銷售產品類別","推廣牌子", "年資", "確定", "返回"];

var queryObject =   {   工作類別:['推廣員', '上貨', '查舖資料'],
                        舖頭資料:["A", "B", "C"],
                        工作開始時間:"",
                        工作結束時間:"",
                        開始日期:"",
                        結束日期:"",
                        銷售產品類別:['食物', '朱古力', '飲品', '健康產品', '清潔用品', '淋浴洗頭產品', '電器', '玩具', '化粧品', '食油', '水餃煮食'],
                        推廣牌子:["百佳", "惠康", "711", "OK", "萬寧", "屈臣", "千色", "街藥房", "莎莎", "卓悅", "崇光", "一田", "Aeon", "永安", "Piago", "Uny", "反斗城", "其他"],
                        年資:["1-3個月", "6-12個月", "1-3年", "4-6年", "6年以上"],
                        // 工作日數:['三日檔', '七天檔', '超過十天檔'],
                    };

var answerqueryObject = {   
                            工作類別:"nil",
                            舖頭資料:"nil",
                            工作開始時間:"nil",
                            工作結束時間:"nil",
                            開始日期:"nil",
                            結束日期:"nil",
                            銷售產品類別:"nil",
                            推廣牌子:"nil",
                            年資:"nil",
                            wid:"nil",
                            // 工作日數:"nil",
                        };

//starting server
console.log('Starting recruitBot.js on localhost...');

//Initialize Bot
bot.onText(/\/start/, function(msg, match) { //  /start to send Welcoming message
    var fromId = msg.from.id;
    var resp = 'Welcome to DoChat';
    bot.sendMessage(fromId, resp, generateKeyboard(['開新工作']));//
});


bot.onText(/返回$/, function(msg){
        
        var fromId = msg.from.id;
        var resp = 'Welcome to DoChat';
        bot.sendMessage(fromId, resp, generateKeyboard(['開新工作']));     
});


bot.onText(/取消$/, function(msg){
        
        var fromId = msg.from.id;
        var resp = 'Welcome to Dochat';
        bot.sendMessage(fromId, resp, generateKeyboard(['開新工作']));
});

//Main Function
bot.onText(/開新工作$/, function(msg) { // a /profile variation with input validation 
    
    var chatId = msg.from.id;
    var resp = "請選擇需輸入的資料項目";
    bot.sendMessage(chatId, "請選擇需輸入的資料項目", generateKeyboard(queryArray));

    var packet = new Object();
    var terminate = 0;
    packet.wid = msg.date.toString();
    packet.uid = chatId.toString();
    packet.timestamp = msg.date;
    packet.state = "creating";
    
    savingFunction(packet, "dochat-kpl-worklist");

    bot.onText(/確定$/, function(msg){
        var fromId = msg.from.id;
        var resp = "";
        bot.sendMessage(fromId, resp, generateKeyboard(["發送", "取消"]));
        getItemFromDB(packet.wid,function(result){
            var res = "確定開新工作？\n"+formList(result, queryArray);
            bot.sendMessage(fromId, res, generateKeyboard(["發送", "取消"]));
        });
     
    });
            
    bot.onText(/發送$/, function(msg){
        
                var fromId = msg.from.id;
                var resp = '正在開啟群組...';
                bot.sendMessage(fromId, resp, generateKeyboard(["開新工作"]));
                socket.emit('confirm',packet);
                updateDB("dochat-kpl-worklist",packet.wid, "state", "matching");
                 
    });

    attributeListener(packet);
    // bot.onText(/(.+)/, function(msg, match) { // /echo
    //     console.log(msg.text);
    //     console.log(match);
    //     var chatId = msg.from.id;
    //     var resp = "請輸入"+match[1]+": ";
    //     var entity = match[1];
    //     // console.log('match[1]'+match[1]);
    //     bot.sendMessage(chatId, resp,generateKeyboard(queryObject[match[1]]));

        
    //     bot.once('message',function(message){
 
    //         var chatId = message.from.id;
    
    //         updateDB("dochat-kpl-worklist", packet.wid, entity, message.text);
    //         bot.sendMessage(chatId, "請選擇需輸入的資料項目", generateKeyboard(queryArray));
    
    //     });
    // });

});

function attributeListener(packet){
    console.log('attributeListener');
    var entity = "";
    bot.once("message", function(msg){
        var chatId = msg.from.id;
        var resp = "請輸入"+msg.text+": ";
        // entity = msg.text;
        // console.log('match[1]'+match[1]);
        bot.sendMessage(chatId, resp,generateKeyboard(queryObject[msg.text]));
        // valueListener(packet, entity);
    }).then(valueListener(packet, msg.text));

}

function valueListener(packet, entity){
    console.log('valueListener');
    bot.once("message", function(message){
        var chatId = message.from.id;
        updateDB("dochat-kpl-worklist", packet.wid, entity, message.text);
        bot.sendMessage(chatId, "請選擇需輸入的資料項目", generateKeyboard(queryArray));
    }).then(attributeListener(packet));

    // attributeListener(packet);
}

//Keyboard Generation
function generateKeyboard(questionArray, hideKeyboard) {
    
    if(typeof(questionArray) != "undefined"){
        var tempArray = questionArray.slice(0);    
    }else
        var tempArray = questionArray;
    
        
    function formKeyboard(a) {
        var keyboardArray = [];
        //keyboardArray.length = Math.ceil(questionArray.length/3);
        
        while (a.length > 0) {
            keyboardArray.push(a.splice(0, 3));
        }

        return keyboardArray;
    }

    var kb_generate = {
        reply_markup: JSON.stringify({

            resize_keyboard: true,
            keyboard: formKeyboard(tempArray), // successfully apply dynamic keyboard generation
            one_time_keyboard: true,
            force_reply: true,
            hide_keyboard: hideKeyboard
        }),
    };
    //console.log(kb_generate);
    return kb_generate;
}

//DataBase Related Function

//get
function getItemFromDB(uid, callback) { //get items by uid from dynamoDB
    uid = uid.toString();
    //uid="-1";
    var params = {
        "TableName": "dochat-kpl-worklist",
        "Key": {
            "wid": {"S":uid},
        }
    }
    return dynamodb.getItem(params, function(err, result) {
        if (err)
            console.log(err);
        else {
            callback && callback(result.Item);
            return result.Item;
        }
    });
};

// getItemFromDB(123, function(arr) { //callback function for getItemFromDB()
//     setValue(arr);
// });

function setValue(value) { //to setValue by callback function
    queryResult = [];
    queryResult.push(value);
};

//put
function savingFunction(data, tableName) {
    var param = buildParam(data, tableName);
    putItemToDB(param);
}

function buildParam(data, tableName){
    
    var params = {
        TableName: tableName,
        Item: data
    };

    return params;
}

function putItemToDB(params) { //put item to DB
    dynamoDB.put(params, function(err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Added item:", JSON.stringify(data, null, 2));
        }
    });
    console.log("Items are succesfully ingested in table ..................");
};

function queryFromDB(criteria){
    console.log(criteria);

    var params = {
    TableName: "dochat-kpl-user",
    ProjectionExpression: "uid",
    FilterExpression: "#a = :b and #c = :d",
    ExpressionAttributeNames: {
        "#a": "年資",
        "#c": "工作類別"
    },
    ExpressionAttributeValues: {
        ":b": criteria["年資"].S,
        ":d": criteria["工作類別"].S
    }
    };

    dynamoDB.scan(params, onScan);

    function onScan(err, data) {
        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            // print all the movies
            console.log("Scan succeeded.");
            data.Items.forEach(function(item) {
               // console.log(item);
               var targetID = item.uid;
               bot.sendMessage(targetID, "wid", generateKeyboard(["yes", "no"]));

            });

            // continue scanning if we have more movies
            if (typeof data.LastEvaluatedKey != "undefined") {
                console.log("Scanning for more...");
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                dynamoDB.scan(params, onScan);
            }
        }
    }
};

function updateDB(tableName, key, col, value){
    var params = {
    TableName: tableName,
    Key:{
        "wid": key
    },
    UpdateExpression: "set #a = :b",
    ExpressionAttributeNames:{
        "#a": col
    },
    ExpressionAttributeValues:{
        ":b":value
    },
    ReturnValues:"UPDATED_NEW"
};

console.log("Updating the item...");
dynamoDB.update(params, function(err, data) {
    if (err) {
        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
    }
});
}


function formList(result, attribute){
    var list = "";
    for (var i = 0; i<attribute.length-2; i++){
        if( typeof(result[attribute[i]]) !== "undefined" && typeof(result[attribute[i]].S) !== "undefined"){
            list = list+ attribute[i]+ ":"+ result[attribute[i]].S+ "\n";    
        }
        // console.log(list);
    }

    return list;
}


