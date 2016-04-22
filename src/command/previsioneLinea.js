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
	previsioneLinea: function(msg, match) {
		var linea = msg.text.toUpperCase();
		linea = linea.substring(1, linea.length);
		var direzioni = []
		var all_capolinea = []

		client2.act({role:'atac', cmd:'getCapolinea', capolinea:linea}, function(err, result) {
			percorsi = result.getCapolinea.risposta.percorsi;
			if(percorsi == 0) {
				bot.sendMessage(msg.chat.id, 'mi dispiace ma non ho trovato nessuna linea di autobus');
			}
			else {
				client.act({role:'mongo', cmd:'persist', userId:msg.from.id, userObj:{telegramId:msg.from.id.toString(), name:msg.chat.first_name+" "+msg.chat.last_name, command:[{name:"previsione_linea"+linea, date: new Date()}], preferiti: []}}, function(err, result) {
					if(err) console.log(err);
				})
				for(var element in percorsi) {
					if(percorsi[element].id_linea == linea) {
						all_capolinea.push([percorsi[element].id_percorso+" - "+ percorsi[element].direzione + " "+ percorsi[element].carteggio_dec]);
						direzioni.push(percorsi[element].direzione + " "+ percorsi[element].carteggio_dec);
					}
				}

				if(direzioni[1] == undefined) {
					bot.sendMessage(msg.chat.id, 'Scegli la direzione:\n1) '+direzioni[0], {
			        	reply_markup: JSON.stringify({
			            keyboard: all_capolinea,
			            resize_keyboard: true,
			            one_time_keyboard: true
			        	})
		    		});
				}
				else {
					bot.sendMessage(msg.chat.id, 'Scegli la direzione:\n1) '+direzioni[0]+'\n2) '+direzioni[1], {
			        	reply_markup: JSON.stringify({
			            keyboard: all_capolinea,
			            resize_keyboard: true,
			            one_time_keyboard: true
			        	})
		    		});
		    	}
			}
		})
	},
	getFermate: function(msg, match) {
		var numero_direzione = parseInt(msg.text);
		client2.act({role:'atac', cmd:'getFermate', fermate:numero_direzione}, function(err, result) {
			if(!result.getFermate)
				bot.sendMessage(msg.chat.id, 'Mi dispiace ma non ho trovato nessun autobus');
			else {
				var stop = result.getFermate.risposta.fermate;
				var response = "Inserisci il comando /numero_fermata, a seconda di dove ti trovi:\n";
				for(var element in stop) {
					response = response.concat("/"+stop[element].id_palina+" - "+stop[element].nome+"\n");
				}
				bot.sendMessage(msg.chat.id, response);
			}
		})
	}
}
