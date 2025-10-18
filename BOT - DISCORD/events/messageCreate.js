const { Discord, EmbedBuilder } = require("discord.js");
const fs = require('fs');
const yaml = require("js-yaml")
const config = yaml.load(fs.readFileSync('./config.yml', 'utf8'))
const color = require('ansi-colors');
const utils = require("../utils.js");
const ticketModel = require("../models/ticketModel");
const guildModel = require("../models/guildModel");

module.exports = async (client, message) => {
    if(!message.channel.type === 0) return;
    const ticketDB = await ticketModel.findOne({ channelID: message.channel.id });
    if(message.author.bot) return;


// WIP: Store all support users in userStats DB, to get specific user stats
    // let supportRole = utils.checkIfUserHasSupportRoles(message)
    // if(supportRole) {

    // }

// Custom Commands
if(config.CommandsEnabled) {
    config.CustomCommands.forEach(cmd => {

        let messageArray = message.content.split(" ");
        let command = messageArray[0].toLowerCase();
        messageArray.slice(1);
        let commandfile = command.slice(config.CommandsPrefix.length);
        if(message.content.startsWith(config.CommandsPrefix) && commandfile === cmd.command) {
            if(config.OnlyInTickets && !ticketDB) return;

          let logMsg = `\n\n[${new Date().toLocaleString()}] [CUSTOM COMMAND] Command: ${cmd.command}, User: ${message.author.username}`;
          fs.appendFile("./logs.txt", logMsg, (e) => { 
            if(e) console.log(e);
          });
  
          if(config.LogCommands) console.log(`${color.yellow(`[CUSTOM COMMAND] ${color.cyan(`${message.author.username}`)} used ${color.cyan(`${config.CommandsPrefix}${cmd.command}`)}`)}`);
  
          let respEmbed = new EmbedBuilder()
          .setColor(config.EmbedColors)
          .setDescription(`${cmd.response}`)
  
          if(cmd.deleteMsg) setTimeout(() => message.delete(), 100);
          if(cmd.replyToUser && cmd.Embed) message.reply({ embeds: [respEmbed] })
          if(cmd.replyToUser === false && cmd.Embed) message.channel.send({ embeds: [respEmbed] })
  
          if(cmd.replyToUser && cmd.Embed === false) message.reply({ content: `${cmd.response}` })
          if(cmd.replyToUser === false && cmd.Embed === false) message.channel.send({ content: `${cmd.response}` })
      }
})
}

// Count messages in tickets and update lastMessageSent, and check if alert command is active
if (ticketDB) {
  // Increment messages in the ticket
  if (!message.author.bot) {
    let supportRole = await utils.checkIfUserHasSupportRoles(message);

    // Determine who is waiting for the reply from
    const waitingReplyFrom = supportRole ? "user" : "staff";

    // Check if this is the first staff response
    if (supportRole && !ticketDB.firstStaffResponse) {
      await ticketModel.findOneAndUpdate(
        { channelID: message.channel.id },
        { $set: { firstStaffResponse: Date.now() } }
      );
    }

    await ticketModel.findOneAndUpdate(
      { channelID: message.channel.id },
      {
        $set: {
          lastMessageSent: Date.now(),
          waitingReplyFrom: waitingReplyFrom,
        },
        $inc: { messages: 1 },
      },
      { new: true }
    );
  }

  // Increment totalMessages in global stats
  await guildModel.findOneAndUpdate(
    { guildID: message.guild.id },
    { $inc: { totalMessages: 1 } }
  );

  // Alert command auto close, check for response in ticket
  if (config.TicketAlert.Enabled) {
    const filtered = await ticketModel.find({
      closeNotificationTime: { $exists: true, $ne: null },
      channelID: message.channel.id
    });

    for (const time of filtered) {
      if(!time) return;
      if(!time.channelID) return;
      if(time.closeNotificationTime === 0) return

      if(time.channelID === message.channel.id) {
      // Reset closeNotificationTime
      await ticketModel.findOneAndUpdate(
        { channelID: message.channel.id },
        { $unset: { closeReason: 1 }, $set: { closeNotificationTime: 0 } }
      );

      // Delete the notification message
      if(message) await message.channel.messages.fetch(time.closeNotificationMsgID).then(msg => {
        try {
          msg.delete();
        } catch (error) {
          console.error("Error deleting message:", error);
        }
      });
}

    }
  }
}

const stringSimilarity = require("string-similarity");

if (config.AutoResponse.Enabled && config.AutoResponse.Responses) {
  // Restrict to tickets if OnlyInTickets is true
  if (config.AutoResponse.OnlyInTickets && !ticketDB) {
    return;
  }

  // Extract user message and configured responses
  const userMessage = message.content.toLowerCase();
  const responseKeys = Object.keys(config.AutoResponse.Responses);

  // Find the best match for the user's message
  const matches = stringSimilarity.findBestMatch(userMessage, responseKeys);
  //console.log(`[DEBUG] Best match for "${userMessage}":`, matches.bestMatch);

  // Check if the best match meets the confidence threshold
  if (matches.bestMatch.rating >= config.AutoResponse.ConfidenceThreshold) {
    const matchedKey = matches.bestMatch.target; // The matched response key
    const responseConfig = config.AutoResponse.Responses[matchedKey];

    if (!responseConfig || !responseConfig.Message) {
      console.log(`[INFO] Response configuration missing for key: ${matchedKey}`);
      return;
    }

    const responseMsg = responseConfig.Message;
    const responseType = responseConfig.Type || "TEXT"; // Default to TEXT if not specified

    // Respond with EMBED or TEXT
    if (responseType === "EMBED") {
      const respEmbed = new EmbedBuilder()
        .setColor(config.EmbedColors)
        .setDescription(`<@!${message.author.id}>, ${responseMsg}`)
        .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      message.reply({ embeds: [respEmbed] });
    } else if (responseType === "TEXT") {
      message.reply({ content: `<@!${message.author.id}>, ${responseMsg}` });
    } else {
      console.log(`[INFO] Invalid response type for key: ${matchedKey}. Expected "EMBED" or "TEXT".`);
    }
  } else {
    //console.log(`[INFO] No suitable response found for: "${userMessage}". Confidence score: ${matches.bestMatch.rating}`);
  }
}


};