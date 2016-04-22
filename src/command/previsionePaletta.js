var seneca = require('seneca')()
var bot = require('../modules/telegram-bot');
var client = seneca.client({
	host: 'localhost',
	port: 3000,
	pins: [{role:'mongo',cmd:'*'}]
})
var client2 = seneca.client({
	host: 'localhost',
	port: 3001,
	pins: [{role:'atac',cmd:'*'}]
})

module.exports = function previsionePaletta(msg, match) {
	var paletta = msg.text;
	paletta = paletta.substring(1, paletta.length);
	client2.act({role:'atac', cmd:'getTempiPaletta', palina: paletta}, function(err, result) {
	    // Results of the method response
	    var mess = "";
	    if (result.getTempiPaletta == undefined)
	    	bot.sendMessage(msg.chat.id, "Mi dispiace ma il numero della fermata che hai inserito non esiste");
	    else {
		    var temp = result.getTempiPaletta.risposta.arrivi;
		    if (temp.length == 0) {
		    	client.act({role:'mongo', cmd:'persist', userId:msg.from.id, userObj:{telegramId:msg.from.id.toString(), command:[{name:"previsione_paletta"+paletta.toString(), date: new Date()}], preferiti: []}}, function(err, result) {
		    		if(err) console.log(err);
		    	})
		    	bot.sendMessage(msg.chat.id, "Nessuna informazione disponibile.\n\nVuoi aggiungere questa fermata ai preferiti: /add"+paletta);
		    }
		    else {
		    	mess = "🚩 "+temp[0].nome_palina+".\n";
			    for (var element in temp) {
			    	if (temp[element]["distanza_fermate"] == 1) 
			    		mess = mess+"🚌 "+temp[element].linea+" :\tIn arrivo.\n";
			    	else 
			    		mess = mess+"🚌 "+temp[element].linea+" :\t"+temp[element]["distanza_fermate"]+" fermate attesa "+ temp[element]["tempo_attesa"]+" minuti."+"\n";
			    }
			    client.act({role:'mongo', cmd:'persist', userId:msg.from.id, userObj:{telegramId:msg.from.id.toString(), name:msg.chat.first_name+" "+msg.chat.last_name, command:[{name:"previsione_paletta"+paletta.toString(), date: new Date()}], preferiti: []}}, function(err, result) {
			    	if(err) console.log(err);
			    })
			    mess = mess + "\n\nVuoi aggiungere questa fermata ai preferiti: /add"+paletta;
			    bot.sendMessage(msg.chat.id, mess);
			}
		}		
	})
}