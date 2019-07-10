const Telegraf = require('telegraf');
const Markup = require('telegraf/markup')
// const Extra = require('telegraf/extra')
const Calendar = require('telegraf-calendar-telegram');
const getConfig = require('../config/config');
// const config = getConfig('eat_test_');
const API_TOKEN = process.env.API_TOKEN || '768875831:AAFEDe9uyBbUGKJ5ch-hXY8PYGeYfTLIGVg'; //the api token is into env var
const PORT = process.env.PORT || 3000;
const URL = process.env.URL || 'https://tg-bot-expense.herokuapp.com/';

// const koa = require('koa')
// const Router = require('koa-router')
// const app = new koa()
// const router = new Router()
// router.post('/bot', ctx => {
//   console.log(ctx)
//   ctx.status = 200
// })
// app.use(router.routes())
// app.listen(3000,() => {
//   console.log('rabotaet')
// })

const bot = new Telegraf(API_TOKEN);
// bot.setWebhook('https://c2d08ad2.ngrok.io/bot');
// bot.startWebhook('/bot${API_TOKEN}', null, PORT);

var jsforce = require('jsforce');

let login = new String()
let password = new String()
let userId = new String()

var user = [];
var reminderList = [];
var dateToday = ''
var enteredAmount = ''
var enteredDescription = ''
var todayDescription = ''
var selectedDate = ''

var conn = new jsforce.Connection({
  // you can change loginUrl to connect to sandbox or prerelease env.
  //loginUrl : 'https://test.salesforce.com'
});

conn.login('novableach1991@brave-fox-j6hq80.com', '12121991a', function (err, userInfo) {
  if (err) { return console.error(err); }
  console.log(conn.accessToken);
  console.log(conn.instanceUrl);
  // logged in user property
  console.log("User ID: " + userInfo.id);
  console.log("Org ID: " + userInfo.organizationId);

});
const keyboardStart = () => Markup.inlineKeyboard([
  Markup.callbackButton('текущий баланс', 'balance'),
  Markup.callbackButton('Создать карточку', 'Addcard')
]).extra()

const keyboardCard = () => Markup.inlineKeyboard([
  Markup.callbackButton('Сегодня', 'today'),
  Markup.callbackButton('Календарь', 'Calendar'),
  Markup.callbackButton('Отмена', 'Cancel')
]).extra()

const calendar = new Calendar(bot, {
  startWeekDay: 1,
  weekDayNames: ["S", "M", "T", "W", "T", "F", "S"],
  monthNames: [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]
});
calendar.setDateListener((context, date) => {
  selectedDate = date
  context.reply("Дата выбрана!")
  context.reply('Введите сумму!')

});

bot.action('balance', (ctx) => {
  console.log(userId)
  var balance = 0
  var records = [];
  conn.query("SELECT Reminder__c FROM Monthly_Expense__c WHERE  Keeper__c ='" + userId + "'", function (err, res) {
    if (err) { return console.error(err); }
    reminderList = res.records
    console.log('2222' + JSON.stringify(res.records));
    for (var i = 0; i < reminderList.length; i++) {
      var balanceFull = balance + reminderList[i].Reminder__c
      balance = balanceFull

    }
    var balanceUser = balanceFull
    
    ctx.reply("Текущий баланс: " + balanceUser)
  })
})

bot.action('Addcard', (ctx) => ctx.reply('На какой день желаете создать карточку?', keyboardCard()))

bot.action('today', (ctx) => {
  ctx.reply('Введите сумму!')
  dateToday = 'todaySelected'
})

bot.action('Calendar', (ctx) => {
  dateToday = 'CalendarSelected'
  const today = new Date();
  const minDate = new Date();
  minDate.setMonth(today.getMonth() - 100);
  const maxDate = new Date();
  maxDate.setMonth(today.getMonth() + 100);
  maxDate.setDate(today.getDate());
  ctx.reply("Выберите дату!", calendar.setMinDate(minDate).setMaxDate(maxDate).getCalendar())
})

bot.action('Cancel', (ctx) => {
  selectedDate = ''
  enteredAmount = ''
  enteredDescription = ''
  ctx.reply('Отменено!', keyboardStart())
})

bot.start((ctx) => {
  ctx.reply('Привет! Введите логин')
  login = ''
  console.log(login);
  password = ''
  console.log(password);

})

bot.on('text', (ctx) => {

  if (todayDescription == 'CalendarSelectedDescription') {
    enteredDescription = ctx.message.text
    todayDescription = ''
    conn.sobject("Expense_Card__c").create({
      CardDate__c: selectedDate,
      Amount__c: enteredAmount,
      Description__c: enteredDescription,
      Card_Keeper__c: userId,

    }, function (err, ret) {
      if (err || !ret.success) {
        console.error(err, ret);
        ctx.reply('Error! Incorrect data entry format')
        enteredAmount = ''
        enteredDescription = ''
        return
      }
    
      ctx.reply('Карточка успешно создана!', keyboardStart())
      enteredAmount = ''
      enteredDescription = ''
    });



  } else {
    if (dateToday == 'CalendarSelected') {
      enteredAmount = ctx.message.text
      ctx.reply('Введите описание.')
      dateToday = ''
      console.log(enteredAmount);
      todayDescription = 'CalendarSelectedDescription'
    } else {
      if (todayDescription == 'todaySelectedDescription') {
        enteredDescription = ctx.message.text
        var todayDate = new Date();
        todayDescription = ''
        console.log(todayDate);
        conn.sobject("Expense_Card__c").create({
          CardDate__c: todayDate,
          Amount__c: enteredAmount,
          Description__c: enteredDescription,
          Card_Keeper__c: userId,

        }, function (err, ret) {
          if (err || !ret.success) {
            console.error(err, ret);
            ctx.reply('Error! Incorrect data entry format')
            enteredAmount = ''
            enteredDescription = ''
            return
          }
          
          ctx.reply('Карточка успешно создана!', keyboardStart())
          enteredAmount = ''
          enteredDescription = ''
        });



      } else {
        if (dateToday == 'todaySelected') {
          enteredAmount = ctx.message.text
          ctx.reply('Введите описание.')
          dateToday = ''
          console.log(enteredAmount);
          todayDescription = 'todaySelectedDescription'
        } else {

          if (login != '' && password != '') {

            ctx.reply('ошибка!')

          } else {

            if (login == '') {

              login = ctx.message.text
              ctx.reply('Введите пароль!')
              loginUser = login
              console.log(login);
              console.log(password);
            }

            else {
              password = ctx.message.text
              passwordUser = password
              console.log(login);
              console.log(password);
              var records = [];
              conn.query("SELECT Id, Name, Email, Password__c FROM Contact WHERE Email ='" + login + "'  AND Password__c ='" + password + "'", function (err, res) {

                if (err) { return console.error(err); }
                if (res.totalSize < 1) {
                  ctx.reply('неправильный логин или пароль')
                  login = ''
                  password = ''
                  ctx.reply('Введите логин!')
                } else {
                  user = res.records
                  ctx.reply("Вы авторизовались как: " + user[0].Name, keyboardStart())
                  userId = user[0].Id
                }
                console.loge('sssss');
              });
            }
          }
        }
      }
    }
  }

})
// const log = 'login';
// var pas = '123'
// bot.start((ctx) => ctx.reply('привет! Введите логин'));
// bot.on('text', (ctx) => { 
//     console.log(ctx.reply);
//     return ctx.reply('Введите пароль!')
// },
// bot.on('message',(ctx) => { 
//     console.log(ctx.reply);
//     return ctx.reply('Вы успешно авторизовались!') 
// })
// );

//bot.on('text', (ctx) => ctx.reply('Вы успешно авторизовались!'));



bot.launch()
