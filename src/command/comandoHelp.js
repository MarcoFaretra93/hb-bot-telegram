var seneca = require('seneca')()
var bot = require('../modules/telegram-bot');
var client = seneca.client({
	host: 'localhost',
	port: 3000,
	pins: [{role:'mongo',cmd:'persist'}]
})

module.exports = function comandoStart(msg, match) {
	client.act({role:'mongo', cmd:'persist', userId:msg.from.id, userObj:{telegramId:msg.from.id.toString(), name:msg.chat.first_name+" "+msg.chat.last_name, command:[{name:"help", date: new Date()}], preferiti: []}}, function(err, result) {
		if(err) console.log(err);
	})
 	bot.sendMessage(msg.chat.id, 'Eccoti una lista di comandi che puoi chiedermi:\n1. /numero_fermata\n2. /numero_linea\n3. /preferiti');
}