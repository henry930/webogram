
//Add require npm package
var fs = require('fs');
// var async = require('async');
var TelegramBot = require('node-telegram-bot-api');

//declaring bot token
var token = '220018224:AAEHTGAFJNKyTQlqew5IsqGpvMzriDMqR4Y';

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
var io = require('socket.io')(http);
var ioClient = require('socket.io-client');

//Express
var express = require('express');
var app = express(); //Express App
//var app = require('express')();
//var http = require('http').Server(app);
io.on('connection', function(socket){
  
  socket.on('msg', function(msg){
    // console.log('message: ' + msg);
    console.log(msg);
  });

  socket.on('confirm', function(msg){
    var wid = msg.wid;
    console.log(msg);
    getItemFromDB(msg.wid, function(result){
        // console.log(result);
        var wInfo = "您有新工作: \n";
        queryFromDB(result, function(list){
            // console.log(list.Item[0].uid);
            console.log(list.uid);
            bot.sendMessage(list.uid, wInfo, generateKeyboard(["應徵", "忽略"]));
        });

        
    })
  
  });

});

//starting server
console.log('Starting recruitBot.js on localhost...');

//Initialize Bot
bot.onText(/\/start/, function(msg, match) { //  /start to send Welcoming message
    var fromId = msg.from.id;
    var resp = 'Welcome to DoChat';
    bot.sendMessage(fromId, resp);//
});

bot.onText(/\/secret/, function(msg, match){    //Secret function for internal testing
    // generateItem(questionObject, data);
    updateDB("dochat-kpl-current", msg.from.id.toString() ,"abc", "1");
    bot.sendMessage(msg.from.id, "hi henry");
});

bot.onText(/應徵/, function(msg){
    var chatId = msg.from.id;
    bot.sendMessage(chatId, "已發送應徵請求");
});

bot.onText(/忽略/, function(msg){
    var chatId = msg.from.id;
    bot.sendMessage(chatId, "已忽略工作");
});

bot.onText(/(.+)/, function(msg, match) { // /echo
        var chatId = msg.from.id;
        var resp = "請輸入"+match[1]+": ";
        var entity = match[1];
        // console.log('match[1]'+match[1]);
        // bot.sendMessage(chatId, resp,generateKeyboard(queryObject[match[1]]));

        
        bot.once('message',function(message){
            
            var chatId = message.from.id;
            answerqueryObject[entity] = message.text;
            answerqueryObject.uid = chatId.toString();
            
            savingFunction(answerqueryObject);
            // bot.sendMessage(chatId, "請選擇需輸入的資料項目", generateKeyboard(queryArray));
    
        });
});

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
function savingFunction(data) {
    var param = buildParam(data);
    putItemToDB(param);
}

function buildParam(data){
    
    var tableName = 'dochat-kpl-worklist';
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

function queryFromDB(criteria, callback){
    // console.log(criteria);

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
               // sendToCandidate(item.uid);
               // var targetID = item.uid;
               // bot.sendMessage(targetID, "wid", generateKeyboard(["yes", "no"]));
                callback(item);
            });
            // callback(data);
            // continue scanning if we have more movies
            if (typeof data.LastEvaluatedKey != "undefined") {
                console.log("Scanning for more...");
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                dynamoDB.scan(params, onScan);
            }else{
                // console.log(data);
                // return data;
            }
        }
    }

    // console.log(data);
};

function updateDB(tableName, key, col, value){
    var params = {
    TableName: tableName,
    Key:{
        "uid": key
    },
    UpdateExpression: "set "+col+" = :b",
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
    //console.log(result[attribute[0]].S);
    var list = "";
    for (var i = 0; i<attribute.length-2; i++){
        if(result[attribute[i]].S != "nil"){
            list = list+ attribute[i]+ ":"+ result[attribute[i]].S+ "\n";    
        }
        // console.log(list);
    }

    return list;
}

function buildInfo(result){
    //console.log(result[attribute[0]].S);
    console.log(result);
    var list = "";
    for (var i = 0; i<attribute.length-2; i++){
        if(result[attribute[i]].S != "nil"){
            list = list+ attribute[i]+ ":"+ result[attribute[i]].S+ "\n";    
        }
        // console.log(list);
    }

    return list;
}
//Start server.
http.listen(8080,'127.0.0.1',function(){
    console.log('Server Listening on Port 8080');
});
