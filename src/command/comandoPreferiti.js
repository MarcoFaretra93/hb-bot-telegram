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

module.exports = {
	comandoPreferiti: function(msg, match) {
		client.act({role:'mongo', cmd:'getPreferito', telegramId:msg.from.id}, function(err, result) {
			var i = 0;
			var mess = "";
			if(result.getPreferito.length == 0) {
				bot.sendMessage(msg.chat.id, "Mi dispiace ma non hai salvato nessun preferito.\n\nPer salvarne uno basta fare il comando add seguito dal numero della fermata, ad esempio /add70951 e per rimuoverlo facendo il comando remove ad esempio /remove70951");
			}
			else {
				for(i=0; i<result.getPreferito.length; i++) {
					mess = mess + result.getPreferito[i] + "\n";
				}
				bot.sendMessage(msg.chat.id, "Ecco la lista dei tuoi preferiti:\n"+mess+"\n\nTi ricordiamo che per salvare un preferito basta fare il comando add seguito dal numero della fermata, ad esempio /add70951 e per rimuoverlo facendo il comando remove ad esempio /remove70951");
			}
		})
	},
	addPreferito: function(msg, match) {
		var preferito = msg.text.substring(4, msg.text.length);
		client2.act({role:'atac', cmd:'getTempiPaletta', palina:preferito}, function(err, result) {
			var mess = "";
			if (result.getTempiPaletta == undefined)
	    		bot.sendMessage(msg.chat.id, "Mi dispiace ma il numero della fermata che hai inserito non esiste");
	    	else {
	    		var temp = result.getTempiPaletta.risposta;
	    		mess = "/"+preferito+" - "+temp.nome;
	    		client.act({role:'mongo', cmd:'addPreferito', preferito:mess, userId:msg.from.id}, function(err, result) {
	    			if(err) console.log(err);
	    			else bot.sendMessage(msg.chat.id, "Il preferito è stato salvato correttamente, utilizza /remove"+preferito+" per eliminarlo dai preferiti");
	    		})
	    	}
		})
	}, 
	removePreferito: function(msg, match) {
		client.act({role:'mongo', cmd:'getPreferito', telegramId:msg.from.id}, function(err, result) {
			var preferito = msg.text.substring(7, msg.text.length);
			var i = 0;
			var j = 0;
			for(j=0; j<result.getPreferito.length; j++){
				if(result.getPreferito[j]!=undefined && result.getPreferito[j].indexOf(preferito) > -1)
					i = 1;
			}
			if(i == 1) {
				client.act({role:'mongo', cmd:'deletePreferito', preferito:preferito, userId:msg.from.id}, function(err, result) {
					if(err) console.log(err);
					else bot.sendMessage(msg.chat.id, "Il preferito "+msg.text+" è stato rimosso");
				})
			}
			else bot.sendMessage(msg.chat.id, msg.text+" non fa parte dei tuoi preferiti");	
		})
	}
}