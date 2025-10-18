const Discord = require("discord.js");
const fs = require('fs');
const yaml = require("js-yaml") // https://discord.authguards.com
const config = yaml.load(fs.readFileSync('./config.yml', 'utf8'))
// https://discord.authguards.com
module.exports = async (client, guild) => {
        if(!config.GuildID.includes(guild.id)) {
        guild.leave();
        console.log('\x1b[31m%s\x1b[0m', `[INFO] Someone tried to invite the bot to another server! I automatically left it (${guild.name})`)
    }
};