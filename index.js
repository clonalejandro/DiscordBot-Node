const discord = require("discord.js");
const config = require("./config.json");
const $clientApi = require("./assets/clientApi");
const client = new discord.Client();
const clientApi = new $clientApi(client, config);

client.login(config.tokens.discord);
clientApi.startApp();
clientApi.registerClientMessages();