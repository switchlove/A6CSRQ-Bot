(async function() {
	'use strict'

	const Discord = require("discord.js");
	const { GoogleSpreadsheet } = require('google-spreadsheet');

	const doc = new GoogleSpreadsheet(process.env.gsheetid);
	await doc.useServiceAccountAuth({
		client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
		private_key: process.env.GOOGLE_PRIVATE_KEY,
	});
	await doc.loadInfo();
	const a6csrqSheet = doc.sheetsById[process.env.sheetns];
	const a6csrqsSheet = doc.sheetsById[process.env.sheets];
	const playerData = doc.sheetsById[process.env.sheetp];

	const prefix = "!";
	const token = process.env.token;

	const client = new Discord.Client();

	var startTime = Date.now();
	var currentTime = new Date().toLocaleTimeString();
	
	client.on("ready", () => {
		console.log(`[ BOT ] : ${currentTime} : Logged in as ${client.user.tag}, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds!`);
		console.log('------');

		function botPresence(client) {
			client.user.setPresence({ game: { name: "Botting || !help", type: 0 } });
			setTimeout(function(){
				client.user.setPresence({ game: { name: `${client.users.cache.size} Users || !help`, type: 0 }});
			}, 10000);
			setTimeout(function(){
				client.user.setPresence({ game: { name: `${client.guilds.cache.size} Guilds || !help`, type: 0 }});
			}, 20000);
			setTimeout(function(){
				var time = new Date().toLocaleTimeString();
				client.user.setPresence({ game: { name: `${time} || !help`, type: 0 }});
			}, 30000);
		}

		botPresence(client);
		setInterval(function() { botPresence(client); }, 40000);
	});

	client.on("message", async message => {
		if(message.author.bot) return;
		if(message.content.indexOf(prefix) !== 0) return;
		const args = message.content.slice(prefix.length).trim().split(/ +/g);
		const command = args.shift().toLowerCase();
		
		if (message.channel.id === process.env.channel) {
			if(command === "help") {
				if(!message.member.roles.cache.some(r=>["A6CSRQ Player", "A6CSRQ-S Player"].includes(r.name)) )
					return message.reply({"embed": {
						"title": "Command Listing for A6CSRQ",
						"description": "Here you can see the commands that you have access to with A6CSRQ!",
						"footer": { "text": "Have Issues or Concerns? Please use the !report command!" },
						"color": Math.floor(Math.random() * 16777214) + 1,
						"fields": [
							{"name": "General","value": "!help - shows this message.\n!register s/ns \"NAME\" \"SHINY CODE\" - registers you with the leaderboard. NS for non-scripting, S for scripting. The name and shiny code pokemon must both be contained within quotes. E.g. !register ns \"Switch\" \"Pikachu\""},
						]
					}});
				if(message.member.roles.cache.some(r=>["A6CSRQ Player", "A6CSRQ-S Player"].includes(r.name)) )
					return message.reply({"embed": {
						"title": "Command Listing for A6CSRQ",
						"description": "Here you can see the commands that you have access to with A6CSRQ!",
						"footer": { "text": "Have Issues or Concerns? Please use the !report command!" },
						"color": Math.floor(Math.random() * 16777214) + 1,
						"fields": [
							{"name": "General","value": "!help - shows this message.\n!register s/ns \"NAME\" \"SHINY CODE\" - registers you with the leaderboard. NS for non-scripting, S for scripting. The name and shiny code pokemon must both be contained within quotes. E.g. !register ns \"Switch\" \"Pikachu\""},
							{"name": "Updating","value": "!ns # \"Location\" - Updates your pokemon count on the non-scripting leadercoard.\n!s # \"Location\" - Updates your pokemon count on the scripting leadercoard \n!namechange NAME - Updates your name on the leaderboard. Quotes are not required for the name. Anything after !namechange will be considered the name. Spaces are allowed."},
						]
					}});
			}
			
			if(command === "register") {
				if(!message.content.includes('"'))
					return message.reply("please enclose your name and shiny code pokemon in quotes! E.g. !register s/ns \"NAME\" \"SHINY CODE\"");
				var args1 = message.content.slice(prefix.length).trim().match(/".+?"/g).map(str => str.replace(/"/g, ''));
				var userE, userF, eRow;
				var userV = message.member.id;
				var typeV = args[0];
				var nameV = args1[0];
				var shinyV = args1[1];
				
				await playerData.loadCells('A2:B999');
				for (let x = 0; x < playerData._cells.length; x++) {
					if (playerData._cells[x] != undefined) {
						if (playerData._cells[x][1]._rawData.formattedValue == userV) {
							userName = playerData._cells[x][0]._rawData.formattedValue;
							console.log('Found: ' + playerData._cells[x][0]._rawData.formattedValue );
							userE = 1;
						}
					}
				}

				if (userE == 1) {
					if (typeV == 'ns') {
						await a6csrqSheet.loadCells('B2:H999');
						for (let x = 0; x < a6csrqSheet._cells.length; x++) {
							if (a6csrqSheet._cells[x] != undefined) {
								if (a6csrqSheet._cells[x][3]._rawData.formattedValue != undefined) {
									if (a6csrqSheet._cells[x][3]._rawData.formattedValue == userName) {
										userF = 1;
										message.reply("it looks like your already registered! Trying to change your name? Try !namechange to update your name on the leaderboards! Otherwise please contact <@213488164826906624> to be manually added.");
									}
								}
							}
						}
					} else if (typeV == 's') {
						await a6csrqsSheet.loadCells('B2:H999');
						for (let x = 0; x < a6csrqsSheet._cells.length; x++) {
							if (a6csrqsSheet._cells[x] != undefined) {
								if (a6csrqsSheet._cells[x][3]._rawData.formattedValue != undefined) {
									if (a6csrqsSheet._cells[x][3]._rawData.formattedValue == userName) {
										userF = 1;
										message.reply("it looks like your already registered! Trying to change your name? Try !namechange to update your name on the leaderboards! Otherwise please contact <@213488164826906624> to be manually added.");
									}
								}
							}
						}
					}
				} else {
					userF = 1;
					const newUser = await playerData.addRow([nameV, userV]);
					if (typeV == 'ns') {
						var role = message.guild.roles.cache.find(r => r.name === "A6CSRQ Player");
						if(!message.member.roles.cache.some(r=>["A6CSRQ Player"].includes(r.name)) ) {
							message.member.roles.add(role).catch(console.error);
						}
						await a6csrqSheet.loadCells('B2:H999');
						for (let x = 0; x < a6csrqSheet._cells.length; x++) {
							if (a6csrqSheet._cells[x] != undefined) {
								if (a6csrqSheet._cells[x][3]._rawData.formattedValue == undefined) {
									const a1 = a6csrqSheet.getCell(x, 1);
									const a2 = a6csrqSheet.getCell(x, 2);
									const a3 = a6csrqSheet.getCell(x, 3);
									const a4 = a6csrqSheet.getCell(x, 4);
									const a5 = a6csrqSheet.getCell(x, 5);
									const a6 = a6csrqSheet.getCell(x, 6);
									const a7 = a6csrqSheet.getCell(x, 7);
									a1.formula = '=IF($F54 = "","",RANK($F54,$F$2:$F$86))';
									a1.value = '=IF($F54 = "","",RANK($F54,$F$2:$F$86))';
									a2.value = Number(x);
									a3.value = nameV;
									a4.value = shinyV;
									a5.value = Number(1);
									a6.value = 'Kanto';
									a7.value = 'Route 1';
									await a6csrqSheet.saveUpdatedCells();
									break;
								}
							}
						}
					} else if (typeV == 's') {
						var role = message.guild.roles.cache.find(r => r.name === "A6CSRQ-S Player");
						if(!message.member.roles.cache.some(r=>["A6CSRQ-S Player"].includes(r.name)) ) {
							message.member.roles.add(role).catch(console.error);
						}					
						await a6csrqsSheet.loadCells('B2:H999');
						for (let x = 0; x < a6csrqsSheet._cells.length; x++) {
							if (a6csrqsSheet._cells[x] != undefined) {
								if (a6csrqsSheet._cells[x][3]._rawData.formattedValue == undefined) {
									const a2 = a6csrqsSheet.getCell(x, 2);
									const a3 = a6csrqsSheet.getCell(x, 3);
									const a4 = a6csrqsSheet.getCell(x, 4);
									const a5 = a6csrqsSheet.getCell(x, 5);
									const a6 = a6csrqsSheet.getCell(x, 6);
									const a7 = a6csrqsSheet.getCell(x, 7);
									a2.value = Number(x-1);
									a3.value = nameV;
									a4.value = shinyV;
									a5.value = Number(1);
									a6.value = 'Kanto';
									a7.value = 'Route 1';
									await a6csrqsSheet.saveUpdatedCells();
									break;
								}
							}
						}
					}
				}
				/*if (userF != 1) {
					if (typeV == 'ns') {
						var role = message.guild.roles.cache.find(r => r.name === "A6CSRQ Player");
						if(!message.member.roles.cache.some(r=>["A6CSRQ Player"].includes(r.name)) ) {
							message.member.roles.add(role).catch(console.error);
						}
						await a6csrqSheet.loadCells('B2:H999');
						for (let x = 0; x < a6csrqSheet._cells.length; x++) {
							if (a6csrqSheet._cells[x] != undefined) {
								if (a6csrqSheet._cells[x][3]._rawData.formattedValue == undefined) {
									const a2 = a6csrqSheet.getCell(x, 2);
									const a3 = a6csrqSheet.getCell(x, 3);
									const a4 = a6csrqSheet.getCell(x, 4);
									const a5 = a6csrqSheet.getCell(x, 5);
									const a6 = a6csrqSheet.getCell(x, 6);
									const a7 = a6csrqSheet.getCell(x, 7);
									a2.value = Number(x);
									a3.value = userName;
									a4.value = shinyV;
									a5.value = Number(1);
									a6.value = 'Kanto';
									a7.value = 'Route 1';
									await a6csrqSheet.saveUpdatedCells();
									break;
								}
							}
						}
					} else if (typeV == 's') {
						var role = message.guild.roles.cache.find(r => r.name === "A6CSRQ-S Player");
						if(!message.member.roles.cache.some(r=>["A6CSRQ-S Player"].includes(r.name)) ) {
							message.member.roles.add(role).catch(console.error);
						}					
						await a6csrqsSheet.loadCells('B2:H999');
						for (let x = 0; x < a6csrqsSheet._cells.length; x++) {
							if (a6csrqsSheet._cells[x] != undefined) {
								if (a6csrqsSheet._cells[x][3]._rawData.formattedValue == undefined) {
									const a2 = a6csrqsSheet.getCell(x, 2);
									const a3 = a6csrqsSheet.getCell(x, 3);
									const a4 = a6csrqsSheet.getCell(x, 4);
									const a5 = a6csrqsSheet.getCell(x, 5);
									const a6 = a6csrqsSheet.getCell(x, 6);
									const a7 = a6csrqsSheet.getCell(x, 7);
									a2.value = Number(x);
									a3.value = userName;
									a4.value = shinyV;
									a5.value = Number(1);
									a6.value = 'Kanto';
									a7.value = 'Route 1';
									await a6csrqsSheet.saveUpdatedCells();
									break;
								}
							}
						}
					}					
				}*/
				if (typeV == 'ns') {
					await a6csrqSheet.loadCells('B2:H999');
					for (let x = 0; x < a6csrqSheet._cells.length; x++) {
						if (a6csrqSheet._cells[x] != undefined) {
							if (a6csrqSheet._cells[x][3]._rawData.formattedValue != undefined) {
								if (a6csrqSheet._cells[x][3]._rawData.formattedValue == nameV) {
									userF = 1;
								}
							}
						}
					}
					if (userF == 1) {
						message.react("👍");
					} else if (userF != 1) {
						message.react("👎");
						message.reply("I couldn't update your value!");
					}
				} else if (typeV == 's') {
					await a6csrqsSheet.loadCells('B2:H999');
					for (let x = 0; x < a6csrqsSheet._cells.length; x++) {
						if (a6csrqsSheet._cells[x] != undefined) {
							if (a6csrqsSheet._cells[x][3]._rawData.formattedValue != undefined) {
								if (a6csrqsSheet._cells[x][3]._rawData.formattedValue == nameV) {
									userF = 1;
								}
							}
						}
					}
					if (userF == 1) {
						message.react("👍");
					} else if (userF != 1) {
						message.react("👎");
						message.reply("I couldn't update your value!");
					}
				}
			}
			
			if(command === "namechange") {
				if(!message.member.roles.cache.some(r=>["A6CSRQ Player", "A6CSRQ-S Player"].includes(r.name)) )
					return message.reply("you don't have permissions to use this! Make sure that you've ran the !register command!");
				if(!message.content.includes('"'))
					return message.reply("please enclose your new name in quotes! E.g. !namechange \"new name\"");
				var userID = message.member.id;
				var args1 = message.content.slice(prefix.length).trim().match(/".+?"/g).map(str => str.replace(/"/g, ''));
				var newName = args1[0];
				var curName, uFound;
				
				await playerData.loadCells('A2:B999');
				for (let x = 0; x < playerData._cells.length; x++) {
					if (playerData._cells[x] != undefined) {
						if (playerData._cells[x][1]._rawData.formattedValue == userID) {
							curName = playerData._cells[x][0]._rawData.formattedValue;
							var a1 = playerData.getCell(x, 0);
							a1.value = newName;
							await playerData.saveUpdatedCells();

							await a6csrqSheet.loadCells('B2:H999');
							for (let y = 0; y < a6csrqSheet._cells.length; y++) {
								if (a6csrqSheet._cells[y] != undefined) {
									if (a6csrqSheet._cells[y][3]._rawData.formattedValue == curName) {
										var a1 = a6csrqSheet.getCell(y, 3);
										a1.value = newName;
										await a6csrqSheet.saveUpdatedCells();
									}
								}
							}
							await a6csrqsSheet.loadCells('B2:H999');
							for (let z = 0; z < a6csrqsSheet._cells.length; z++) {
								if (a6csrqsSheet._cells[z] != undefined) {
									if (a6csrqsSheet._cells[z][3]._rawData.formattedValue == curName) {
										var a1 = a6csrqsSheet.getCell(z, 3);
										a1.value = newName;
										await a6csrqsSheet.saveUpdatedCells();
									}
								}
							}
							uFound = 1;
							message.react("👍");
						} 
					}
				}
				if (uFound != 1) {
					message.react("👎");
					message.reply("I couldn't find you! Please use the !register command to add yourself to the leaderboard!");
				}
			}
			
			if(command === "ns") {
				if(!message.member.roles.cache.some(r=>["A6CSRQ Player"].includes(r.name)) )
					return message.reply("you don't have permissions to use this! Make sure that you've ran the !register command!");
				if(!message.content.includes('"'))
					return message.reply("please enclose the location in quotes! E.g. !ns/s \"Location\"");
				var userName, userRow;
				var arg = args[0];
				var args1 = message.content.slice(prefix.length).trim().match(/".+?"/g).map(str => str.replace(/"/g, ''));
				var loca = args1[0];
				var userID = message.member.id;

				await playerData.loadCells('A2:B999');
				for (let x = 0; x < playerData._cells.length; x++) {
					if (playerData._cells[x] != undefined) {
						if (playerData._cells[x][1]._rawData.formattedValue == userID) {
							userName = playerData._cells[x][0]._rawData.formattedValue;
							ufound = 1;
						}
					}
				}
				if (ufound != 1) {
					message.reply("I couldn't find your information! Make sure that you've ran the !register command!");
				} else {
					await a6csrqSheet.loadCells('B2:H999');
					for (let x = 0; x < a6csrqSheet._cells.length; x++) {
						if (a6csrqSheet._cells[x] != undefined) {
							if (a6csrqSheet._cells[x][3]._rawData.formattedValue != undefined) {
								if (a6csrqSheet._cells[x][3]._rawData.formattedValue == userName) {
									userRow = x;
								}
							}
						}
					}
					await a6csrqSheet.loadCells('B2:H999');
					const cell = a6csrqSheet.getCell( userRow, 5 );
					const cellL = a6csrqSheet.getCell( userRow, 7 );
					cell.value = Number(arg);
					cellL.value = loca;
					await a6csrqSheet.saveUpdatedCells();
					await a6csrqSheet.loadCells('B2:H999');
					if (a6csrqSheet._cells[userRow][5]._rawData.formattedValue == arg && a6csrqSheet._cells[userRow][7]._rawData.formattedValue == loca) {
						message.react("👍");
					} else {
						message.react("👎");
						message.reply("I couldn't update your value!");
					}
				}
			}
			
			if(command === "s") {
				if(!message.member.roles.cache.some(r=>["A6CSRQ-S Player"].includes(r.name)) )
					return message.reply("you don't have permissions to use this! Make sure that you've ran the !register command!");
				if(!message.content.includes('"'))
					return message.reply("please enclose the location in quotes! E.g. !ns/s \"Location\"");
				var userName, userRow, ufound, lbFound;
				var arg = args[0];
				var args1 = message.content.slice(prefix.length).trim().match(/".+?"/g).map(str => str.replace(/"/g, ''));
				var loca = args1[0];
				var userID = message.member.id;			
				await playerData.loadCells('A2:B999');
				for (let x = 0; x < playerData._cells.length; x++) {
					if (playerData._cells[x] != undefined) {
						if (playerData._cells[x][1]._rawData.formattedValue == userID) {
							userName = playerData._cells[x][0]._rawData.formattedValue;
							ufound = 1;
						}
					}
				}
				if (ufound != 1) {
					message.reply("I couldn't find your information! Make sure that you've ran the !register command!");
				} else {
					await a6csrqsSheet.loadCells('B2:H999');
					for (let x = 0; x < a6csrqsSheet._cells.length; x++) {
						if (a6csrqsSheet._cells[x] != undefined) {
							if (a6csrqsSheet._cells[x][3]._rawData.formattedValue != undefined) {
								if (a6csrqsSheet._cells[x][3]._rawData.formattedValue == userName) {
									userRow = x;
								}
							}
						}
					}
					await a6csrqsSheet.loadCells('B2:H999');
					const cell = a6csrqsSheet.getCell( userRow, 5 );
					const cellL = a6csrqsSheet.getCell( userRow, 7 );
					cell.value = Number(arg);
					cellL.value = loca;
					await a6csrqsSheet.saveUpdatedCells();
					await a6csrqsSheet.loadCells('B2:H999');					
					if (a6csrqsSheet._cells[userRow][5]._rawData.formattedValue == arg && a6csrqsSheet._cells[userRow][7]._rawData.formattedValue == loca) {
						message.react("👍");
					} else {
						message.react("👎");
						message.reply("I couldn't update your value!");
					}
				}
			}
			
			if(command === "remove") {
				if(!message.member.roles.cache.some(r=>["A6CSRQ Creator", "A6CSRQ-S Creator"].includes(r.name)) )
					return message.reply("you don't have permissions to use this!");
				if(!message.content.includes('"'))
					return message.reply("please enclose the name in quotes! E.g. !remove s/ns \"NAME\"");
				var userF;
				var args1 = message.content.slice(prefix.length).trim().match(/".+?"/g).map(str => str.replace(/"/g, ''));
				var typeV = args[0];
				var nameV = args1[0];
				if (typeV == 'ns') {
					await a6csrqSheet.loadCells('B2:H999');
					for (let x = 0; x < a6csrqSheet._cells.length; x++) {
						if (a6csrqSheet._cells[x] != undefined) {
							if (a6csrqSheet._cells[x][3]._rawData.formattedValue != undefined) {
								if (a6csrqSheet._cells[x][3]._rawData.formattedValue == nameV) {
									const rows = await a6csrqSheet.getRows();
									await rows[x - 1].delete();
								}
							}
						}
					}
					await a6csrqSheet.loadCells('B2:H999');
					for (let x = 0; x < a6csrqSheet._cells.length; x++) {
						if (a6csrqSheet._cells[x] != undefined) {
							if (a6csrqSheet._cells[x][3]._rawData.formattedValue != undefined) {
								if (a6csrqSheet._cells[x][3]._rawData.formattedValue == nameV) {
									userF = 1;
								}
							}
						}
					}
					if (userF != 1) {
						message.react("👍");
					} else if (userF == 1) {
						message.react("👎");
						message.reply("I couldn't update your value!");
					}
				} else if (typeV == 's') {
					await a6csrqsSheet.loadCells('B2:H999');
					for (let x = 0; x < a6csrqsSheet._cells.length; x++) {
						if (a6csrqsSheet._cells[x] != undefined) {
							if (a6csrqsSheet._cells[x][3]._rawData.formattedValue != undefined) {
								if (a6csrqsSheet._cells[x][3]._rawData.formattedValue == nameV) {
									const rows = await a6csrqsSheet.getRows();
									await rows[x - 1].delete();
								}
							}
						}
					}
					await a6csrqsSheet.loadCells('B2:H999');
					for (let x = 0; x < a6csrqsSheet._cells.length; x++) {
						if (a6csrqsSheet._cells[x] != undefined) {
							if (a6csrqsSheet._cells[x][3]._rawData.formattedValue != undefined) {
								if (a6csrqsSheet._cells[x][3]._rawData.formattedValue == nameV) {
									userF = 1;
								}
							}
						}
					}
					if (userF != 1) {
						message.react("👍");
					} else if (userF == 1) {
						message.react("👎");
						message.reply("I couldn't remove " + nameV + "!");
					}
				}
			}
		}
	});

	client.login(token);
}());
