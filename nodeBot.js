//Add require npm package
var fs = require('fs');
var TelegramBot = require('node-telegram-bot-api');
//var Telegram = require('telegram-api');
//var Message = require('telegram-api/types/Message');


//declaring bot token
var token = '189573317:AAEQXcSxr8YI1F5Zex65_TCvRc_jEtTi4UY';

//declaring global variable
var data = []; //data array

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

//var tel = new Telegram();

var state = 0; //Questionnaire state
var start; //flag of the program start, not yet used
var count = 0; //counter for data
var string = ''; //output string

var contents = ["Name", "Gender", "Age", "WorkType", "UserType", "Company", "Experience", "District", "Marks", "WorkingHour", "Absent", "Photo", "SelfIntro"];
var userInputContent = ["Name", "Gender", "Age", "WorkType", "Experience", "District", "Photo", "SelfIntro"];

var questionArray = ["中文全名", "英文全名", "電話號碼", "照片", "銀行", "銀行戶口", "性別", "出生年份", "地區", "可工作場所", "銷售經驗", "銷售產品類別", "工作日數"];
//var questionArray = [{"中文全名": ""}, {"英文全名": ""}];
//try sending keyboard
//Whenever 
bot.onText(/\/keyboard/, function(msg, match) {
    chatId = msg.chat.id;
    bot.sendMessage(chatId, 'This is keyboard', kb_YN);
    console.log('Finish sending keyboard...');
});


bot.onText(/\/profile/, function(msg, match) {
    var chatId = msg.chat.id;
    var breaktrue = 0;

    bot.sendMessage(chatId, 'Press any button to continue...');

    bot.on('message', function(msg) {

        var chatId = msg.chat.id;
        var question = contents[count];

        data[count] = msg.text;
        console.log(count);
        console.log(data[count]);
        count++;
        state++;

        if (state <= contents.length) {
            bot.sendMessage(chatId, question);
        }

        if (count == contents.length + 1) {

            for (var i = 1; i < contents.length + 1; i++) {
                string = string + contents[i - 1] + ': ' + data[i] + '\n';
            };

            bot.sendMessage(chatId, string);

        };

    });
});

bot.onText(/更新用戶資料/, function(msg, match) { // a /profile variation with input validation 
    var chatId = msg.chat.id;
    var breaktrue = 0;
    var continueFlag = true; // change to false when fail input validation                             
    var returnValue = ""; // for the validation return value
    var keyboard;

    //var question = "Please enter your " + userInputContent[0];
    console.log('更新用戶資料');
    //var question = "請選擇需輸入的資料項目"；
    var question = "請選擇需輸入的資料項目";
    bot.sendMessage(chatId, question, functionListKeyboard());

    bot.onText(/中文全名$/, function(msg, match) { // 中文全名$ means: any String end with 中文全名
        console.log('中文全名');
        bot.sendMessage(chatId, "請輸入您的中文全名", generateKeyboard(["取消更改"])); // generateKeyboard() is now edited
        var inputDone = false; // use as a flag to stop JavaScript weird behavior

        bot.on('message', function(msg) {
            if (msg.text === "取消更改" && inputDone === false) {
                inputDone = true;
                bot.sendMessage(chatId, "請選擇想更改的資料", functionListKeyboard());
            }

            if (inputDone === false) {
                data.push({
                    '中文全名': [msg.text] // saving in JSON Format
                });
                console.log(data);
                inputDone = true;
                bot.sendMessage(chatId, "你輸入了: " + msg.text).then(bot.sendMessage(chatId, "請選擇想更改的資料", functionListKeyboard()));
            }
        });
    });

    bot.onText(/英文全名$/, function(msg, match) {
        console.log('英文全名');
        bot.sendMessage(chatId, "請輸入您的英文全名", generateKeyboard(["取消更改"]));
        inputDone = false;

        bot.on('message', function(msg) {
            if (msg.text === "取消更改" && inputDone === false) {
                inputDone = true;
                bot.sendMessage(chatId, "請選擇想更改的資料", functionListKeyboard());
            }

            if (inputDone === false) {
                data.push({
                    '英文全名': [msg.text]
                });
                console.log(data);
                inputDone = true;
                bot.sendMessage(chatId, "你輸入了: " + msg.text).then(bot.sendMessage(chatId, "請選擇想更改的資料", functionListKeyboard()));
            }
        });
    });

    bot.onText(/電話號碼$/, function(msg, match) {
        console.log('電話號碼');
        bot.sendMessage(chatId, "請輸入您的電話號碼", generateKeyboard(["取消更改"]));
        var inputDone = false;

        bot.on('message', function(msg, match) {
            if (msg.text === "取消更改" && inputDone === false) {
                inputDone = true;
                bot.sendMessage(chatId, "請選擇想更改的資料", functionListKeyboard());
            }

            if (inputDone === false) {
                try {
                    telephoneValidate(msg.text);
                    data.push({
                        '電話號碼': [msg.text]
                    });
                    console.log(data);
                    inputDone = true;
                    bot.sendMessage(chatId, "你輸入了: " + msg.text).then(bot.sendMessage(chatId, "請選擇想更改的資料", functionListKeyboard()));
                } catch (err) {
                    bot.sendMessage(chatId, "你輸入了: " + msg.text).then(bot.sendMessage(chatId, "請重新輸入您的電話號碼"));
                    inputDone = false;
                }
            }
        });
    });

    bot.onText(/照片$/, function(msg, match) {
        console.log('照片');
        bot.sendMessage(chatId, "請上傳您的照片", generateKeyboard(["取消更改"]));
        var inputDone = false;

        bot.on('message', function(msg) {
            if (msg.text === "取消更改" && inputDone === false) {
                inputDone = true;
                bot.sendMessage(chatId, "請選擇想更改的資料", functionListKeyboard());
            }
        })
    });

    bot.onText(/銀行$/, function(msg, match) { // $ is to prevent bug generated by 銀行 and 銀行戶口
        console.log('銀行');
        bot.sendMessage(chatId, "請選擇您的銀行", bankCateKeyboard());
        var inputDone = false;

        bot.on('message', function(msg, match) {
            if (msg.text === "取消更改" && inputDone === false) {
                inputDone = true;
                bot.sendMessage(chatId, "請選擇想更改的資料", functionListKeyboard());
            }

            if (inputDone === false) {
                try {
                    data.push({
                        '銀行': [msg.text]
                    });
                    console.log(data);
                    inputDone = true;
                    bot.sendMessage(chatId, "你輸入了: " + msg.text).then(bot.sendMessage(chatId, "請選擇想更改的資料", functionListKeyboard()));
                } catch (err) {}
            }
        });
    });

    bot.onText(/銀行戶口$/, function(msg, match) { // RegExp introduction at http://www.w3schools.com/jsref/jsref_obj_regexp.asp
        console.log('銀行戶口');
        bot.sendMessage(chatId, "請輸入您的銀行戶口", generateKeyboard(["取消更改"]));
        var inputDone = false;

        bot.on('message', function(msg, match) {
            if (msg.text === "取消更改" && inputDone === false) {
                inputDone = true;
                bot.sendMessage(chatId, "請選擇想更改的資料", functionListKeyboard());
            }

            if (inputDone === false) {
                try {
                    data.push({
                        '銀行戶口': [msg.text]
                    });
                    console.log(data);
                    inputDone = true;
                    bot.sendMessage(chatId, "你輸入了: " + msg.text).then(bot.sendMessage(chatId, "請選擇想更改的資料", functionListKeyboard()));
                } catch (err) {}
            }
        });
    });

    bot.onText(/性別$/, function(msg, match) {
        console.log('性別');
        bot.sendMessage(chatId, "請選擇您的性別", genderKeyboard());
        var inputDone = false;

        bot.on('message', function(msg, match) {
            if (msg.text === "取消更改" && inputDone === false) {
                inputDone = true;
                bot.sendMessage(chatId, "請選擇想更改的資料", functionListKeyboard());
            }

            if (inputDone === false) {
                try {
                    data.push({
                        '性別': [msg.text]
                    });
                    console.log(data);
                    inputDone = true;
                    bot.sendMessage(chatId, "你輸入了: " + msg.text).then(bot.sendMessage(chatId, "請選擇想更改的資料", functionListKeyboard()));
                } catch (err) {}
            }
        });
    });

    bot.onText(/出生年份$/, function(msg, match) {
        console.log('出生年份');
        bot.sendMessage(chatId, "請輸入您的出生年份", generateKeyboard(["取消更改"]));
        var inputDone = false;

        bot.on('message', function(msg, match) {
            if (msg.text === "取消更改" && inputDone === false) {
                inputDone = true;
                bot.sendMessage(chatId, "請選擇想更改的資料", functionListKeyboard());
            }

            if (inputDone === false) {
                try {
                    data.push({
                        '出生年份': [msg.text]
                    });
                    console.log(data);
                    inputDone = true;
                    bot.sendMessage(chatId, "你輸入了: " + msg.text).then(bot.sendMessage(chatId, "請選擇想更改的資料", functionListKeyboard()));
                } catch (err) {}
            }
        });
    });

    bot.onText(/地區$/, function(msg, match) {
        console.log('地區');
        bot.sendMessage(chatId, "請選擇您的地區", districtKeyboard());
        var inputDone = false;

        bot.on('message', function(msg, match) {
            if (msg.text === "取消更改" && inputDone === false) {
                inputDone = true;
                bot.sendMessage(chatId, "請選擇想更改的資料", functionListKeyboard());
            }

            if (inputDone === false) {
                try {
                    data.push({
                        '地區': [msg.text]
                    });
                    console.log(data);
                    inputDone = true;
                    bot.sendMessage(chatId, "你輸入了: " + msg.text).then(bot.sendMessage(chatId, "請選擇想更改的資料", functionListKeyboard()));
                } catch (err) {}
            }
        });
    });

    bot.onText(/可工作場所$/, function(msg, match) {
        console.log('可工作場所');
        bot.sendMessage(chatId, "請選擇您的可工作場所", generateKeyboard(["取消更改"]));
        var inputDone = false;

        bot.on('message', function(msg, match) {
            if (msg.text === "取消更改" && inputDone === false) {
                inputDone = true;
                bot.sendMessage(chatId, "請選擇想更改的資料", functionListKeyboard());
            }

            if (inputDone === false) {
                try {
                    data.push({
                        '可工作場所': [msg.text]
                    });
                    console.log(data);
                    inputDone = true;
                    bot.sendMessage(chatId, "你輸入了: " + msg.text).then(bot.sendMessage(chatId, "請選擇想更改的資料", functionListKeyboard()));
                } catch (err) {}
            }
        });
    });

    bot.onText(/銷售經驗$/, function(msg, match) {
        console.log('銷售經驗');
        bot.sendMessage(chatId, "請輸入您的銷售經驗", generateKeyboard(["取消更改"]));
        var inputDone = false;

        bot.on('message', function(msg, match) {
            if (msg.text === "取消更改" && inputDone === false) {
                inputDone = true;
                bot.sendMessage(chatId, "請選擇想更改的資料", functionListKeyboard());
            }

            if (inputDone === false) {
                try {
                    data.push({
                        '銷售經驗': [msg.text]
                    });
                    console.log(data);
                    inputDone = true;
                    bot.sendMessage(chatId, "你輸入了: " + msg.text).then(bot.sendMessage(chatId, "請選擇想更改的資料", functionListKeyboard()));
                } catch (err) {}
            }
        });
    });

    bot.onText(/銷售產品類別$/, function(msg, match) {
        console.log('銷售產品類別');
        bot.sendMessage(chatId, "請選擇您的銷售產品類別", sellCateKeyboard());
        var inputDone = false;

        bot.on('message', function(msg, match) {
            if (msg.text === "取消更改" && inputDone === false) {
                inputDone = true;
                bot.sendMessage(chatId, "請選擇想更改的資料", functionListKeyboard());
            }

            if (inputDone === false) {
                try {
                    data.push({
                        '銷售產品類別': [msg.text]
                    });
                    console.log(data);
                    inputDone = true;
                    bot.sendMessage(chatId, "你輸入了: " + msg.text).then(bot.sendMessage(chatId, "請選擇想更改的資料", functionListKeyboard()));
                } catch (err) {}
            }
        });
    });

    bot.onText(/工作日數$/, function(msg, match) {
        console.log('工作日數');
        bot.sendMessage(chatId, "請選擇您的工作日數", workDayCateKeyboard());
        var inputDone = false;

        bot.on('message', function(msg, match) {
            if (msg.text === "取消更改" && inputDone === false) {
                inputDone = true;
                bot.sendMessage(chatId, "請選擇想更改的資料", functionListKeyboard());
            }

            if (inputDone === false) {
                try {
                    data.push({
                        '工作日數': [msg.text]
                    });
                    console.log(data);
                    inputDone = true;
                    bot.sendMessage(chatId, "你輸入了: " + msg.text).then(bot.sendMessage(chatId, "請選擇想更改的資料", functionListKeyboard()));
                } catch (err) {}
            }
        });
    });

    // bot.on('message', function(msg) {
    //     console.log('Attribute: '+msg);
    //     var chatId = msg.chat.id;


    // switch (userInputContent[count]) { // input validation by calling function
    //     case "Name":
    //         returnValue = nameValidate(msg.text);
    //         //keyboard = kb_Hide;
    //         if (returnValue === "-1") { // "-1" when char number <2 && input is number
    //             continueFlag = false;
    //         } else {
    //             continueFlag = true;
    //         }
    //         break;

    //     case "Gender":
    //         //console.log('In Gender..');
    //         //keyboard = kb_Gender;
    //         returnValue = genderValidate(msg.text);
    //         if (returnValue === "-1") { // "-1" when input is neither male or female
    //             continueFlag = false;
    //         } else {
    //             continueFlag = true;
    //         }
    //         break;

    //     case "Age":
    //         returnValue = ageValidate(msg.text);
    //         if (returnValue === "-1") { // "-1" when input doesn't lie between 18 and 65
    //             continueFlag = false;
    //         } else {
    //             continueFlag = true;
    //         }
    //         break;

    //         case "Photo":                         // not working, testing by /photo command
    //         console.log(msg.photo);
    //         continueFlag=true;
    //         break;


    //     case "SelfIntro":
    //         returnValue = selfIntroValidate(msg.text);
    //         if (returnValue === "-1") { // "-1" when char number is less than 10
    //             continueFlag = false;
    //         } else {
    //             continueFlag = true;
    //         }
    //         break;

    //     default:
    //         continueFlag = true;
    // }

    // if (continueFlag) {
    //     data[count] = msg.text;
    //     question = "Please enter your " + userInputContent[count + 1];
    //     console.log(data[count]);
    //     count++;
    //     state++;
    // } else {
    //     question = "Please re-enter your " + userInputContent[count];
    // }

    // if (state < userInputContent.length) {
    //     bot.sendMessage(chatId, question, chooseKeyboard(userInputContent[count]));
    // }

    // if (count == userInputContent.length) {

    //     for (var i = 0; i < userInputContent.length; i++) {
    //         string = string + userInputContent[i] + ': ' + data[i] + '\n';
    //     };

    // bot.sendMessage(chatId, string);

    // };

    // });
});

//bot commands
bot.onText(/\/start/, function(msg, match) { //  /start to send Welcoming message
    console.log('From: ' + msg.from.id);
    console.log('Chat: ' + msg.chat.id);
    var fromId = msg.chat.id;
    var name = bot.getMe().id;
    console.log(bot.getMe());
    var resp = 'Welcome to DoChat';
    bot.sendMessage(fromId, resp, initialkeyboard());
});

bot.onText(/\/me/, function(msg, match) { // /me to add user info by user
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

// bot.onText(/Update/,function (msg,match){
//     JSON.stringify(
//             {
//                 "operation":"create",
//                 "TableName":"dochat-kpl-user",
//                 "Item":Item
//             }

//         );




// });
// bot.onText(/\/optioninput (.+)/,function (msg,match){
//     bot.on('message', function(msg) {
//         Item[match[1]]=msg;
//     });
// });

// bot.onText(/\/numinput (.+)/,function (msg,match){
//     bot.on('message', function(msg) {
//         Item[match[1]]=msg;
//     });
// });

// bot.onText(/\/textinput (.+)/,function (msg,match){
//     bot.on('message', function(msg) {

//         Item[match[1]]=msg;


//     });
// });

bot.onText(/gen/, function(msg) { // /echo
    console.log('in gen...');
    var chatId = msg.chat.id;
    // console.log(questionArray);
    // console.log(questionArray.length);
    bot.sendMessage(chatId, "Hello", generateKeyboard(['HI', 'test']));
});


bot.onText(/\/echo (.+)/, function(msg, match) { // /echo
    var fromId = msg.from.id;

    var resp = 'You said: ' + match[1];
    bot.sendMessage(fromId, resp);
});

bot.onText(/\/photo/, function(msg, match) { // /testing get photo path
    var fromId = msg.from.id;

    bot.on('message', function(msg) {
        var fileID = msg.photo[3].file_id;
        var photo = bot.getFile(fileID);
        var photoURL = "";

        var photoPromise = bot.getFileLink(fileID);
        console.log(Promise.resolve(photoPromise).then(function(value, callback) {
            console.log(value);
        }));

        bot.sendMessage(fromId, photoURL);
    });
});

bot.onText(/\/message/, function(msg) { // /search now for return the name of uid = 1 from DB
    console.log('In message...');
    var fromId = msg.from.id; // will be used to /search (name / id) in future
    var chatId = msg.chat.id; //getItemFromDB();
    var answer = new Message().text('Hello, Sir').to(msg.chat.id);
    //Telegram.messages.addChatUser(fromId, chatId, 0);
    console.log('Answer: ' + answer);
    bot2.sendMessage(fromId, answer);
});

bot.onText(/\/search/, function(msg, match) { // /search now for return the name of uid = 1 from DB
    var fromId = msg.from.id; // will be used to /search (name / id) in future
    getItemFromDB();
    bot.sendMessage(fromId, data[0]);
});


//Database related function
function getItemFromDB(test, callback) { //get items by uid from dynamoDB
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

getItemFromDB(123, function(arr) { //callback function for getItemFromDB()
    setValue(arr);
});

function setValue(value) { //to setValue by callback function
    data = [];
    data.push(value.name.S);
};

function putItemToDB(msg) { //put item to DB 
    var params = {
        TableName: "dochat-kpl-user",
        Item: {
            "uid": "2",
            "name": "David"
        }
    };

    console.log("Adding a new item...");

    dynamoDB.put(params, function(err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Added item:", JSON.stringify(data, null, 2));
        }
    });

    console.log("Items are succesfully ingested in table ..................");
};


bot.onText(/\/save/, function(msg) {
    console.log('In \/save...')
    putItemToDB(msg);
});

//Input Validation
function nameValidate(nameInput) { //will be used for name input validation
    if (nameInput.length >= 3 && isNaN(nameInput))
        console.log("Name OK");
    else
        return "-1";
}

function ageValidate(ageInput) { //will be used for age input validation
    if (Number(ageInput) >= 18 && Number(ageInput) <= 65) {
        console.log("Age OK");
    } else {
        return "-1";
    }
}

function genderValidate(genderInput) { //will be used for gender input validation
    var validCounter = false;
    var maleString = ["male", "m", "man", "boy"];
    var femaleString = ["female", "f", "woman", "girl", "lady"];

    for (var i = 0; i < maleString.length; i++) {
        if (genderInput.toLowerCase() === maleString[i]) {
            validCounter = true;
            return "Male";
        }
    }

    for (var i = 0; i < femaleString.length; i++) {
        if (genderInput.toLowerCase() === femaleString[i]) {
            validCounter = true;
            return "Female";
        }
    }

    if (validCounter === false)
        return "-1";
}

function telephoneValidate(telephoneInput) {
    if (telephoneInput.length != 8)
        throw "error";
}

function workExpValidate(workExpInput) { //will be used for working experience input validation
    //unfinished
}

function districtValidate(districtInput) { //will be used for district input validation
    var validCounter = false;
    var districtChiString = ["離島區", "葵青區", "北區", "西貢區", "沙田區", "大埔區", "荃灣區", "屯門區", "元朗區", "九龍城區", "觀塘區", "深水埗區", "黃大仙區", "油尖旺區", "中西區", "東區", "南區", "灣仔區"];
    var districtEngString = ["Islands", "Kwai Tsing", "North", "Sai Kung", "Sha Tin", "Tai Po", "Tsuen Wan", "Tuen Mun", "Yuen Long", "Kowloon City", "Kwun Tong", "Sham Shui Po", "Wong Tai Sin", "Yau Tsim Mong", "Central & Western", "Eastern", "Southern", "Wan Chai"];

    for (var i = 0; i < 18; i++) {
        if (districtInput === districtChiString[i]) {
            validCounter = true;
            return districtChiString[i];
        }
    }

    for (var i = 0; i < 18; i++) {
        if (districtInput.toLowerCase() === districtEngString[i].toLowerCase()) {
            validCounter = true;
            return districtChiString[i];
        }
    }

    if (validCounter === false)
        return "-1";
}

function selfIntroValidate(selfIntroInput) { // will be used for self-introduction input validation
    if (selfIntroInput.length >= 10) {
        console.log("Intro OK");
    } else {
        return "-1";
    }
}

function initialkeyboard() {
    console.log('In initialkeyboard...');
    //send a keyboard layout when bot start
    var kb_init = {
        //reply_to_message_id: msg.chat.id,
        reply_markup: JSON.stringify({
            resize_keyboard: true,
            keyboard: [
                ['更新用戶資料']
            ],
            one_time_keyboard: true

        }),
    };
    return kb_init;
}

function functionListKeyboard() {
    var kb_funcList = {
        //reply_to_message_id: msg.chat.id,
        resize_keyboard: true,
        reply_markup: JSON.stringify({
            keyboard: [
                ['中文全名', '英文全名', '電話號碼'],
                ['照片', '銀行', '銀行戶口'],
                ['性別', '出生年份', '地區'],
                ['可工作場所', '銷售經驗', '銷售產品類別'],
                ['工作日數']
            ],
            one_time_keyboard: true

        }),
    };
    return kb_funcList;
}

function bankCateKeyboard() {
    var kb_bankCate = {
        //reply_to_message_id: msg.chat.id,
        reply_markup: JSON.stringify({

            resize_keyboard: true,
            keyboard: [
                ['匯豐', '恆生', '渣打', '中銀']
            ],
            one_time_keyboard: true

        }),
    };

    return kb_bankCate;
}

function genderKeyboard() {
    var kb_Gender = {
        //reply_to_message_id: msg.chat.id,
        reply_markup: JSON.stringify({

            resize_keyboard: true,
            keyboard: [
                ['男', '女']
            ],
            one_time_keyboard: true

        }),
    };

    return kb_Gender;
}

function districtKeyboard() {
    var kb_district = {
        //reply_to_message_id: msg.chat.id,
        reply_markup: JSON.stringify({

            resize_keyboard: true,
            keyboard: [
                ['屯門', '元朗', '天水圍'],
                ['荃灣', '葵涌', '九龍西'],
                ['九龍東', '九龍中', '將軍澳'],
                ['沙田', '馬鞍山', '大埔'],
                ['上水粉嶺', '東涌', '港島'],
            ],
            one_time_keyboard: true

        }),
    };

    return kb_district;
}

function workAreaKeyboard() {
    var kb_workArea = {
        //reply_to_message_id: msg.chat.id,
        reply_markup: JSON.stringify({

            resize_keyboard: true,
            keyboard: [
                ['超巿', '萬屈', '日資場'],
                ['百貨公司', '反斗城', '街藥房']
            ],
            one_time_keyboard: true

        }),
    };

    return kb_workArea;
}

function sellCateKeyboard() {
    var kb_sellCate = {
        //reply_to_message_id: msg.chat.id,
        reply_markup: JSON.stringify({

            resize_keyboard: true,
            keyboard: [
                ['食物', '朱古力', '飲品'],
                ['健康產品', '清潔用品', '淋浴洗頭產品'],
                ['電器', '玩具', '化粧品'],
                ['食油', '水餃煮食']
            ],
            one_time_keyboard: true

        }),
    };

    return kb_sellCate;
}

function workDayCateKeyboard() {
    var kb_workDayCate = {
        //reply_to_message_id: msg.chat.id,
        reply_markup: JSON.stringify({

            resize_keyboard: true,
            keyboard: [
                ['三日檔', '七天檔', '超過十天檔']
            ],
            one_time_keyboard: true

        }),
    };
    //三日檔 / 七天檔 / 超過十天檔
    return kb_workDayCate;
}

function generateKeyboard(questionArray, hideKeyboard) {
    console.log('length: ' + questionArray.length);
    console.log(questionArray);
    var kb_generate = {
        //reply_to_message_id: msg.chat.id,
        reply_markup: JSON.stringify({

            resize_keyboard: true,
            keyboard: [questionArray], // successfully apply dynamic keyboard generation
            one_time_keyboard: true,
            hide_keyboard: hideKeyboard
        }),
    };
    console.log(kb_generate);
    return kb_generate;
}

function chooseKeyboard(item) {
    //Keyboard Template
    var kb_YN = {
        //reply_to_message_id: msg.chat.id,
        reply_markup: JSON.stringify({
            keyboard: [
                ['Yes', 'No']
            ],
            one_time_keyboard: true

        }),
    };

    var kb_nil = {
        //reply_to_message_id: msg.chat.id,
        reply_markup: JSON.stringify({
            keyboard: [],
            one_time_keyboard: true

        }),
    };

    //Keyboard Hide
    var kb_Hide = {
        //reply_to_message_id: msg.chat.id,
        reply_markup: JSON.stringify({
            hide_keyboard: true
        }),
    };

    //Keyboard for Gender
    var kb_Gender = {
        //reply_to_message_id: msg.chat.id,
        reply_markup: JSON.stringify({

            resize_keyboard: true,
            keyboard: [
                ['Male', 'Female']
            ],
            one_time_keyboard: true

        }),
    };

    switch (userInputContent[count]) {
        case "Name":
            return kb_nil;
        case "Gender":
            return kb_Gender;
        case "Age":
            return kb_Hide;
    }
}

//unfinish function

//@Keith: ReplyHandle should also send custom keyboard to user
function replyHandle() { //will be use to handle the Y/N input from user
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

// this function is causing error since keyboard array cannot be empty
function nilKeyboard() {
    var kb_nil = {
        //reply_to_message_id: msg.chat.id,
        reply_markup: JSON.stringify({
            keyboard: [' '],
            one_time_keyboard: true

        }),
    };
    return kb_nil;
}

bot.onText(/\/send (.+)/, function(msg, match) { //will be used to send msg to specific user
    var toId = msg.from.id;
    var resp = match[1];
    bot.sendMessage(toId, resp);
});

//deprecated function
function confirm(dataInput) { //will be used to ask user for confirmation
    var ask = "Are you sure to add " + dataInput + " to your profile? (Y/N)\n";
    bot.sendMessage(fromId, ask);

    bot.on('message', function(msg) {
        if (msg == "Y")
            return dataInput;
        if (msg == "N")
            return "-1";
    });
}