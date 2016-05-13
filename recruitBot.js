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

bot.onText(/\/secret/, function(msg, match){    //Secret function for internal testing
    // generateItem(questionObject, data);
});

bot.onText(/返回$/, function(msg){
        
        var fromId = msg.from.id;
        var resp = 'Welcome to DoChat';
        bot.sendMessage(fromId, resp, generateKeyboard(['開新工作']));     
});

bot.onText(/確定$/, function(msg){
        
        var fromId = msg.from.id;
        getItemFromDB("kpl",function(result){
            var resp = formList(result, queryArray);
            bot.sendMessage(fromId, resp, generateKeyboard(["是", "否"]));
        });
             
});

bot.onText(/是$/, function(msg){
        
        var fromId = msg.from.id;
        var resp = '請稍候...';
        bot.sendMessage(fromId, resp);
        bot.sendMessage(fromId, "Abc");     //in fact i want to show the worklist here
        //on success we should do something
        //filter()
        //send message to to others
});

//Main Function
bot.onText(/開新工作$/, function(msg) { // a /profile variation with input validation 
    
    var chatId = msg.from.id;
    var resp = "請輸入工作名稱";
    bot.sendMessage(chatId, resp);
    
    bot.once('message',function(message){

            var chatId = message.from.id;
            answerqueryObject.wid = message.text;

            //we need validation here!!!
            savingFunction(answerqueryObject);
            bot.sendMessage(chatId, "請選擇需輸入的資料項目", generateKeyboard(queryArray));
    
    });

});

bot.onText(/(.+)/, function(msg, match) { // /echo
        var chatId = msg.from.id;
        var resp = "請輸入"+match[1]+": ";
        var entity = match[1];
        // console.log('match[1]'+match[1]);
        bot.sendMessage(chatId, resp,generateKeyboard(queryObject[match[1]]));

        
        bot.once('message',function(message){

            var chatId = message.from.id;
            answerqueryObject[entity] = message.text;
            answerqueryObject.uid = chatId.toString();
            
            savingFunction(answerqueryObject);
            bot.sendMessage(chatId, "請選擇需輸入的資料項目", generateKeyboard(queryArray));
    
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

function formList(result, attribute){
    //console.log(result[attribute[0]].S);
    var list = "確定開新工作？\n";
    for (var i = 0; i<attribute.length-2; i++){
        list = list+ attribute[i]+ ":"+ result[attribute[i]].S+ "\n";
        console.log(list);
    }

    return list;
}
