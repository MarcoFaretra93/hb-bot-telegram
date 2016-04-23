var seneca = require('seneca')()
var bot = require('../modules/telegram-bot');
var client = seneca.client({
	host: 'localhost',
	port: 3000,
	pins: [{role:'mongo',cmd:'getAll'}]
})

module.exports = function broadcastMessage(msg, match) {
	if(msg.from.id == '132568272' || msg.from.id == '9351865') {
		client.act({role:'mongo', cmd:'getAll'}, function(err, users) {
			var list_telegramId = [];
			var i = 0;
			for(i=0; i<users.getAll.length; i++) {
				var telegramId = users.getAll[i].telegramId
				if(list_telegramId.indexOf(telegramId) == -1)
					list_telegramId.push(telegramId);
			}
			var mess = msg.text.substring(11, msg.text.length);
			for(var element in list_telegramId) {
				bot.sendMessage(list_telegramId[element], mess);
			}
		})
		return	
	}
}