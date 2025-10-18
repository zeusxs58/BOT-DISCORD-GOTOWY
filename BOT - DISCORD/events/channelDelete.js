const Discord = require("discord.js");
const fs = require('fs');
const yaml = require("js-yaml")
const config = yaml.load(fs.readFileSync('./config.yml', 'utf8'))
const guildModel = require("../models/guildModel");
const ticketModel = require("../models/ticketModel");
// https://discord.authguards.com
module.exports = async (client, channel) => {
  const ticketDB = await ticketModel.findOne({ channelID: channel.id });
  if(!ticketDB) return
// https://discord.authguards.com
  const statsDB = await guildModel.findOne({ guildID: config.GuildID });

  ticketDB.status = 'Closed';
  ticketDB.closedAt = Date.now();
  await ticketDB.save();
  // https://discord.authguards.com

    // Sync globalStats.openTickets
    const openNow = await ticketModel.countDocuments({ status: 'Open', guildID: config.GuildID });

    if (statsDB.openTickets !== openNow) {
        statsDB.openTickets = openNow;
        await statsDB.save();
    }
    //

};