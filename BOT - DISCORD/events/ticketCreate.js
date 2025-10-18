const { Discord, StringSelectMenuBuilder, EmbedBuilder, ActionRowBuilder, TextInputBuilder, ModalBuilder } = require("discord.js");
const fs = require('fs');
const yaml = require("js-yaml")
const config = yaml.load(fs.readFileSync('./config.yml', 'utf8'))
const guildModel = require("../models/guildModel");
const ticketModel = require("../models/ticketModel");
const moment = require('moment-timezone');

// Maximum number of retries for editing questions into original ticket embed
const MAX_RETRIES = 2;
// Delay between retries in milliseconds
const RETRY_DELAY = 3000;

module.exports = async (client, interaction, channel, buttonConfig) => {
    try {
        const ticket = await ticketModel.findOne({ channelID: channel.id });
        if (!ticket) {
            console.error('No ticket found for channel:', channel.id);
            return;
        }

        // Add 1 to globalStats.totalTickets
        const statsDB = await guildModel.findOne({ guildID: config.GuildID });
        statsDB.totalTickets++;
        await statsDB.save();

        // Sync globalStats.openTickets
        const openNow = await ticketModel.countDocuments({ status: 'Open', guildID: config.GuildID });
        if (statsDB.openTickets !== openNow) {
            statsDB.openTickets = openNow;
            await statsDB.save();
        }

        // Handle ticket overload warning if enabled
        if (config.TicketOverload?.Enabled && openNow >= config.TicketOverload.Threshold) {
            const overloadEmbed = new EmbedBuilder()
                .setColor("Yellow")
                .setDescription(config.TicketOverload.WarningMessage)
                .setFooter({
                    text: interaction.user.username,
                    iconURL: interaction.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }),
                })
                .setTimestamp();

            await channel.send({ embeds: [overloadEmbed] }).catch(console.error);
        }

        // Handle working hours notice if enabled
        await handleWorkingHoursNotice(client, interaction, channel, config);

        // Handle ticket questions
        if (!ticket.questions?.length) return;

        // Attempt to update the ticket message with retries
        await updateTicketMessageWithRetry(channel, ticket, interaction, config);

    } catch (error) {
        console.error('Error in ticketCreate event:', error);
    }
};

async function updateTicketMessageWithRetry(channel, ticket, interaction, config, retryCount = 0) {
    try {
        // Get ticket message
        const ticketMessage = await channel.messages.fetch(ticket.msgID);
        if (!ticketMessage) {
            console.error('Could not find original ticket message');
            return;
        }

        const originalEmbed = ticketMessage.embeds[0];
        if (!originalEmbed) {
            console.error('No embed found in original message');
            return;
        }

        const updatedEmbed = EmbedBuilder.from(originalEmbed)
        .setImage("https://cdn.discordapp.com/attachments/1428588968538148931/1428647715193098291/ticket.gif?ex=68f3435e&is=68f1f1de&hm=1711c0f42d448ba9b28c14bfac306e32c8f45238e510de39d34a42635584e81d&"); // 🔹 tutaj link do obrazka

        ticket.questions.forEach(question => {
        updatedEmbed.addFields({
        name: question.question,
        value: question.response 
            ? `\`\`\`${question.response}\`\`\`` 
            : `\`\`\`${config.Locale.notAnswered}\`\`\``,
        inline: false
    });
});

        await ticketMessage.edit({ embeds: [updatedEmbed] });
    } catch (error) {
        console.error(`Error updating ticket message (attempt ${retryCount + 1}/${MAX_RETRIES}):`, error);
        
        // If we haven't exceeded max retries, wait and try again
        if (retryCount < MAX_RETRIES - 1) {
            console.log(`Retrying update in ${RETRY_DELAY}ms...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return updateTicketMessageWithRetry(channel, ticket, interaction, config, retryCount + 1);
        } else {
            console.error('Failed to update ticket message after all retry attempts');
        }
    }
}

async function handleWorkingHoursNotice(client, interaction, channel, config) {
    if (!config.WorkingHours?.Enabled || !config.WorkingHours.AllowTicketsOutsideWorkingHours || !config.WorkingHours.SendNoticeInTicket) {
        return;
    }

    const currentTime = moment().tz(config.WorkingHours.Timezone);
    const currentDay = currentTime.format('dddd');
    const workingHours = config.WorkingHours.Schedule[currentDay];

    if (!workingHours) return;

    const [startTime, endTime] = workingHours.split('-');
    const isWithinHours = currentTime.isBetween(
        moment.tz(`${currentTime.format('YYYY-MM-DD')} ${startTime}`, config.WorkingHours.Timezone),
        moment.tz(`${currentTime.format('YYYY-MM-DD')} ${endTime}`, config.WorkingHours.Timezone)
    );

    if (!isWithinHours) {
        const workingHoursEmbed = new EmbedBuilder()
            .setTitle(config.WorkingHours.outsideWorkingHoursTitle)
            .setColor("Red")
            .setDescription(config.WorkingHours.outsideWorkingHoursMsg)
            .setFooter({
                text: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })
            })
            .setTimestamp();

        await channel.send({ embeds: [workingHoursEmbed] }).catch(console.error);
    }
}