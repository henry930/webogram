###Dependencies
welcome adam
Current: npm package: aws-sdk, node-telegram-bot-api

No longer use: mysql, telegram-bot-api, telegram-bot-bootstrap

just use the command below to get all modules automatically:

````npm install````

###Main Program (nodeBot.js)

而家呢個program暫時都係一個telegram bot, 要用telegram add @testingDriveBot

####Command List：

/start		- send welcoming message 

/profile	- create a profile, no data is inserted to dynamoDB

/newprofile - mainly work as /profile, apply part of input validation

/search 	- only use for searching the record with uid = 1 

/echo text 	- let you echo your text
---------------------------------------------------
2016-5-12 更新 @Keith

1. nodeBot.js 暫時只差 顯示資料的function
2. Data Validation will be done on web app side
---------------------------------------------------
2016-4-29 更新 @Keith

1. 大砍，將bot.onText() Generalize 
2. 新的Function List:
	generateKeyboard([youArray]);	
	getItemFromDB();				
	putItemToDB();					
	bot.onText(secret)	//For Testing
---------------------------------------------------
2016-4-14 更新 @Keith

1. 可以使用generateKeyboard([yourArray]); 
2. 新增顯示資料／返回 功能
3. 更新keyboard, 以後function keyboard 可以刪除

---------------------------------------------------

####Input Validation Functions (for development):

nameValidate(nameInput): return -1 when nameInput.length <2

ageValidate(ageInput): return -1 when ageInput <18 or ageInput >65

genderValidate(genderInput): return -1 when genderInput not in the two arrays

districtValidate(districtInput): return -1 when districtInput not in the two arrays

selfIntroValidate(selfIntroInput): return -1 when selfIntroInput.length <10

chooseKeyboard(userInputContent[count]): return suitable customized keyboard //kb Hide = hide the keyboard



[![Stories in Ready](https://badge.waffle.io/zhukov/webogram.png?label=ready&title=Ready)](https://waffle.io/zhukov/webogram)
## [Webogram](https://web.telegram.org) — Telegram Web App

Telegram offers great [apps for mobile communication](https://www.telegram.org). It is based on the [MTProto protocol](https://core.telegram.org/mtproto) and has an [Open API](https://core.telegram.org/api). I personally like Telegram for its speed and cloud-support (that makes a web app possible, unlike in the case of WA and others).

MTProto data can be carried over HTTP (SSL is also supported), so this project is my take at creating one.

That said, I'm using this app myself and I'd like to share its sources, so anyone can contribute to the development. Any help is welcome!


### Interface Henry


Here are some screenshots of the interface:


![Sample screenshot 1](/app/img/screenshot1.png)
![Mobile screenshot 2](/app/img/screenshot2.png)
![Mobile screenshot 3](/app/img/screenshot3.png)


### Unsupported at the moment

* Secret chats
* Black list
* ...


### Maintained locations


| Description        | URL           | Type  |
| ------------- |-------------| -----:|
| Online Web-version (hosted on Telegram servers)      | https://web.telegram.org/ | hosted
| Online Web-version (hosted on GitHub pages)      | https://zhukov.github.io/webogram | hosted
| Chrome Web Store      | [https://chrome.google.com/webstore/detail/telegram/ clhhggbfdinjmjhajaheehoeibfljjno](https://chrome.google.com/webstore/detail/telegram/clhhggbfdinjmjhajaheehoeibfljjno) |   packed
| Firefox & FirefoxOS Marketplace | https://marketplace.firefox.com/app/telegram |    packed



**Hosted version**: the app is downloaded via HTTPS as a usual website. Will be available offline due to application cache.

**Packed version**: the app is downloaded at once in a package via HTTPS. The package is updated less frequently than the Web-version.

All of the apps above are submitted and maintained by [@zhukov](https://github.com/zhukov), so feel free to use them and report bugs [here](https://github.com/zhukov/webogram/issues). Please do not report bugs which are only reproducible in different locations.


## Technical details

The app is based on the AngularJS JavaScript framework, and written in pure JavaScript. jQuery is used for DOM manipulations, and Bootstrap as the CSS-framework.


### Running locally


The project repository is based on angularjs-seed and includes gulp tasks, so it's easy to launch the app locally on your desktop.
Install [node.js](http://nodejs.org/) and run the following commands in the project directory

```
sudo npm install -g gulp
npm install
```

This will install all the needed dependencies.


#### Running web-server


Just run `gulp watch` to start the web server and the livereload task.
Open http://localhost:8000/app/index.html in your browser.



#### Running as Chrome Packaged App

To run this application in Google Chrome as a packaged app, open this URL (in Chrome): `chrome://extensions/`, then tick "Developer mode" and press "Load unpacked extension...". Select the downloaded `app` folder and Webogram should appear in the list.

Run `gulp watch` to watch for file changes and automatically rebuild the app.


#### Running as Firefox OS App

To run this application in Firefox as a packaged app, open "Menu" -> "Developer" -> "WebIDE" (or hit `Shift + F8`). Choose "Open packaged app" from the Project menu and select the `app` folder.

Run `gulp watch` to watch for file changes and automatically rebuild the app.


### Third party libraries

Besides the frameworks mentioned above, other libraries are used for protocol and UI needs. Here is the short list:

* [JSBN](http://www-cs-students.stanford.edu/~tjw/jsbn/)
* [CryptoJS](https://code.google.com/p/crypto-js/)
* [zlib.js](https://github.com/imaya/zlib.js)
* [UI Bootstrap](http://angular-ui.github.io/bootstrap/)
* [jQuery Emojiarea](https://github.com/diy/jquery-emojiarea)
* [nanoScrollerJS](https://github.com/jamesflorentino/nanoScrollerJS)
* [gemoji](https://github.com/github/gemoji)
* [emoji-data](https://github.com/iamcal/emoji-data)

Many thanks to all these libraries' authors and contributors. A detailed list with descriptions and licenses is available [here](/app/vendor).


### Licensing

The source code is licensed under GPL v3. License is available [here](/LICENSE).


### [Contribute](CONTRIBUTING.md)
