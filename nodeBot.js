//Add require npm package
var fs = require('fs');
var TelegramBot = require('node-telegram-bot-api');

//declaring bot token
var token = '189573317:AAEQXcSxr8YI1F5Zex65_TCvRc_jEtTi4UY';

//declaring global variable
var data = []; //blank array for callback function to push

//declaring AWS-related variable
var AWS = require('aws-sdk'); // For DynamoDB 
AWS.config.update({          // THE KEYS MUST BE MOVED to separated file when in production stage
    accessKeyId: 'AKIAJEXJVKONFMRV3HVA',
    secretAccessKey: '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',
    region: 'ap-northeast-1'
});
var dynamodb = new AWS.DynamoDB();

//creating bot of NPM package 'node-telegram-bot-api'
var bot = new TelegramBot(token, {
    polling: true
});


//bot commands
bot.onText(/\/start/, function(msg, match) {    //  /start to send Welcoming message
    var fromId = msg.from.id;
    var name = bot.getMe().id;
    console.log(bot.getMe());
    var resp = 'Welcome to DoChat';
    bot.sendMessage(fromId, resp);
});

bot.onText(/\/me/, function(msg, match) {       // /me to add user info by user
    var fromId = msg.from.id;
    var ask = 'Do you want to start filling in Personal Information? \nY to start. N to abort';
    bot.sendMessage(fromId, ask).then(function(sended) {
        var chatId = sended.chat.id;
        var messageId = sended.message_id;
        bot.onReplyToMessage(chatId, messageId, function(message) {
            bot.sendMessage(chatId, 'you typed');
            console.log('You typed %c', message.text);
        });
    });
});

bot.onText(/\/echo (.+)/, function(msg, match) { // /echo
    var fromId = msg.from.id;
    var resp = 'You said: ' + match[1];
    bot.sendMessage(fromId, resp);
});

bot.onText(/\/search/, function(msg, match) { // /search now for return the name of uid = 1 from DB
    var fromId = msg.from.id;                 // will be used to /search (name / id) in future
    getItemFromDB();
    bot.sendMessage(fromId, data[0]);
});

//Database related function
function getItemFromDB(test, callback) {    //get items by uid from dynamoDB
    var params = {
        "TableName": "dochat-kpl-user",
        "Key": {
            "uid": {
                "S": "1"
            }
        }
    }
    dynamodb.getItem(params, function(err, result) {
        if (err)
            console.log(err);
        else {
            console.log(result.Item);
            callback && callback(result.Item);
        }
    });
};

getItemFromDB(123, function(arr) {          //callback function for getItemFromDB()
    setValue(arr);
    console.log("callback");
});

function setValue(value) {                  //to setValue by callback function
    data = [];
    data.push(value.name.S);
    console.log("SetValue");
};

//unfinish function
function nameInput(){                       //will be used for check name format
    var ask = 'Please enter your First name with Surname (e.g. Simon Lai)';
    bot.sendMessage(fromId,ask);

    bot.onText(/(.+)/, function (msg, match){
        var name = match[0];
        if(name != null && name.length > 2)

        insertID(name, fromId);
    });
}

function confirm(option){                   //will be used to ask user for confirmation
    var ask = "Are you sure to add " + option + " to your profile?";
    bot.sendMessage(fromId,ask);

    bot.onText(/(.+)/, function (msg, match){
        var choice = match[0];
        if(choice == yes){
            bot.sendMessage(fromId,"success");
        }else{
            nameInput();
        }
    });
}

function replyHandle() {                    //will be use to handle the Y/N input from user
    var reply = '';
    bot.onText(/(.+)/, function(msg, match) {
        if (match[1] == 'Y') {
            reply = 'continue';
            bot.sendMessage(fromId, reply);
        }
        if (match[1] == 'N') {
            reply = 'stop';
            bot.sendMessage(fromId, reply);
        };
    });
}

bot.onText(/\/send (.+)/, function(msg, match) { //will be used to send msg to specific user
    var toId = msg.from.id;
    var resp = match[1];
    bot.sendMessage(toId, resp);
});