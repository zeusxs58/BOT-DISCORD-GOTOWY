const Discord = require("discord.js");
const fs = require('fs');
const yaml = require("js-yaml")
const config = yaml.load(fs.readFileSync('./addons/JoinLeaveMessages/config.yml', 'utf8'))
const moment = require('moment-timezone');

module.exports.run = async (client) => {

    client.on('guildMemberAdd', async (member) => {
      if(member.id === client.user.id) return;
      if(member.bot) return;

      let userTagTitle = config.Embeds.JoinEmbed.Title.replace(/{user-tag}/g, `${member.user.username}`).replace(/{user-name}/g, `${member.user.username}`);
      let embedDescription = config.Embeds.JoinEmbed.Description.replace(/{user-tag}/g, `${member.user.username}`).replace(/{user-createdAt}/g, `${moment(member.user.createdAt).format("MM/DD/YYYY")}`).replace(/{user}/g, `${member}`).replace(/{memberCount}/g, `${member.guild.memberCount}`).replace(/{guildName}/g, `${member.guild.name}`).replace(/{user-name}/g, `${member.user.username}`);
      let embedFooter = config.Embeds.JoinEmbed.Footer.text.replace(/{user-tag}/g, `${member.user.username}`).replace(/{user-createdAt}/g, `${moment(member.user.createdAt).format("MM/DD/YYYY")}`).replace(/{memberCount}/g, `${member.guild.memberCount}`).replace(/{guildName}/g, `${member.guild.name}`).replace(/{user-name}/g, `${member.user.username}`);
      let normalMsg = config.WelcomeNormalMessage.replace(/{user-tag}/g, `${member.user.username}`).replace(/{user-createdAt}/g, `${moment(member.user.createdAt).format("MM/DD/YYYY")}`).replace(/{user}/g, `${member}`).replace(/{memberCount}/g, `${member.guild.memberCount}`).replace(/{guildName}/g, `${member.guild.name}`).replace(/{user-name}/g, `${member.user.username}`);

        const joinEmbed = new Discord.EmbedBuilder()
        if(config.Embeds.JoinEmbed.Title) joinEmbed.setTitle(userTagTitle)
        joinEmbed.setDescription(embedDescription)
        if(config.Embeds.JoinEmbed.Color) joinEmbed.setColor(config.Embeds.JoinEmbed.Color)
        if(config.Embeds.JoinEmbed.PanelImage) joinEmbed.setImage(config.Embeds.JoinEmbed.PanelImage)
        if(config.Embeds.JoinEmbed.UserIconThumbnail) joinEmbed.setThumbnail(member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
        if(config.Embeds.JoinEmbed.Footer.Enabled && config.Embeds.JoinEmbed.Footer.text) joinEmbed.setFooter({ text: `${embedFooter}` })
        if(config.Embeds.JoinEmbed.Footer.Enabled && config.Embeds.JoinEmbed.Footer.text && config.Embeds.JoinEmbed.Footer.UserIcon) joinEmbed.setFooter({ text: `${embedFooter}`, iconURL: `${member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })}` })
        if(config.Embeds.JoinEmbed.Timestamp) joinEmbed.setTimestamp()

        if(config.EnableWelcomeMessages) {
            let welcomeChannel = member.guild.channels.cache.get(config.WelcomeChannel);
        
            if(config.MessageType === 1) {
            if (welcomeChannel) welcomeChannel.send({ embeds: [joinEmbed] })
            } else if(config.MessageType === 2) {
              if (welcomeChannel) welcomeChannel.send({ content: normalMsg })
            }
          }

    });

    client.on('guildMemberRemove', async (member) => {
      if(member.id === client.user.id) return;
      if(member.bot) return;

      let userTagTitle = config.Embeds.LeaveEmbed.Title.replace(/{user-tag}/g, `${member.user.username}`).replace(/{user-name}/g, `${member.user.username}`);
      let embedDescription = config.Embeds.LeaveEmbed.Description.replace(/{user-tag}/g, `${member.user.username}`).replace(/{user-createdAt}/g, `${moment(member.user.createdAt).format("MM/DD/YYYY")}`).replace(/{user}/g, `${member}`).replace(/{user-joinedAt}/g, `${moment(member.joinedAt).format("MM/DD/YYYY")}`).replace(/{memberCount}/g, `${member.guild.memberCount}`).replace(/{guildName}/g, `${member.guild.name}`).replace(/{user-name}/g, `${member.user.username}`);
      let embedFooter = config.Embeds.LeaveEmbed.Footer.text.replace(/{user-tag}/g, `${member.user.username}`).replace(/{user-createdAt}/g, `${moment(member.user.createdAt).format("MM/DD/YYYY")}`).replace(/{user-joinedAt}/g, `${moment(member.joinedAt).format("MM/DD/YYYY")}`).replace(/{memberCount}/g, `${member.guild.memberCount}`).replace(/{guildName}/g, `${member.guild.name}`).replace(/{user-name}/g, `${member.user.username}`);
      let normalMsg = config.LeaveNormalMessage.replace(/{user-tag}/g, `${member.user.username}`).replace(/{user-joinedAt}/g, `${moment(member.joinedAt).format("MM/DD/YYYY")}`).replace(/{user}/g, `${member}`).replace(/{memberCount}/g, `${member.guild.memberCount}`).replace(/{guildName}/g, `${member.guild.name}`).replace(/{user-name}/g, `${member.user.username}`);

      const leaveEmbed = new Discord.EmbedBuilder()
      if(config.Embeds.LeaveEmbed.Title) leaveEmbed.setTitle(userTagTitle)
      leaveEmbed.setDescription(embedDescription)
      if(config.Embeds.LeaveEmbed.Color) leaveEmbed.setColor(config.Embeds.LeaveEmbed.Color)
      if(config.Embeds.LeaveEmbed.PanelImage) leaveEmbed.setImage(config.Embeds.LeaveEmbed.PanelImage)
      if(config.Embeds.LeaveEmbed.UserRoles) leaveEmbed.addFields([
        { name: "Roles", value: `${member.roles.cache.filter(r => r.id !== member.guild.id).map(roles => `<@&${roles.id}>`).join(", ") || "No Roles"}`, inline: true },
        ])
      if(config.Embeds.LeaveEmbed.UserIconThumbnail) leaveEmbed.setThumbnail(member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
      if(config.Embeds.LeaveEmbed.Footer.Enabled && config.Embeds.LeaveEmbed.Footer.text) leaveEmbed.setFooter({ text: `${embedFooter}` })
      if(config.Embeds.LeaveEmbed.Footer.Enabled && config.Embeds.LeaveEmbed.Footer.text && config.Embeds.LeaveEmbed.Footer.UserIcon) leaveEmbed.setFooter({ text: `${embedFooter}`, iconURL: `${member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })}` })
      if(config.Embeds.LeaveEmbed.Timestamp) leaveEmbed.setTimestamp()

   if(config.EnableLeaveMessages) {
    let leaveChannel = member.guild.channels.cache.get(config.LeaveChannel);

    if(config.MessageType === 1) {
    if (leaveChannel) leaveChannel.send({ embeds: [leaveEmbed] })
    } else if(config.MessageType === 2) {
      if (leaveChannel) leaveChannel.send({ content: normalMsg })
    }
  }
    });

    console.log("[Addons] JoinLeave addon has been loaded!")
};