const Discord = require("discord.js");
const fs = require('fs');
const yaml = require("js-yaml")
const config = yaml.load(fs.readFileSync('./config.yml', 'utf8'))
const guildModel = require("../models/guildModel");
// https://discord.authguards.com
module.exports = async (client, interaction) => {
// https://discord.authguards.com
    // Add 1 to totalClaims everytime a ticket gets claimed
    const statsDB = await guildModel.findOne({ guildID: config.GuildID });
    statsDB.totalClaims++;
    await statsDB.save();

};