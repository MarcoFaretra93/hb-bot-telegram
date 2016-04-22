var seneca = require('seneca')()
var bot = require('../modules/telegram-bot');
var client = seneca.client({
	host: 'localhost',
	port: 3000,
	pins: [{role:'mongo',cmd:'persist'}]
})

module.exports = function comandoInfoLinea(msg, match) {
	client.act({role:'mongo', cmd:'persist', userId:msg.from.id, userObj:{telegramId:msg.from.id.toString(), name:msg.chat.first_name+" "+msg.chat.last_name, command:[{name:"numero_linea", date: new Date()}], preferiti: []}}, function(err, result) {
		if(err) console.log(err);
	})
 	bot.sendMessage(msg.chat.id, 'Inserisci al posto di "numero_linea", il numero della linea di tuo interesse, ad esempio /170');
}