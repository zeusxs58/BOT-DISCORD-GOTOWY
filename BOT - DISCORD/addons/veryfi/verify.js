const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('veryfi panel')

    .addChannelOption(o =>
      o.setName('kanał')
       .setDescription('Kanał docelowy (domyślnie bieżący)')
       .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
       .setRequired(false)
    ),

  async execute(interaction) {

    const ALLOWED_ROLE_IDS = [
      '1341621666949763143', 
    ];
    const VERIFY_URL   = 'https://restorecord.com/verify/LV%20SHOP';
    const IMAGE_URL    = 'https://cdn.discordapp.com/attachments/1341631699548635136/1428434651290275840/VERIFY.gif?ex=68f27cef&is=68f12b6f&hm=ac817b2c23a0b11ed3faf3bb4fd68ebbee96597f98dc7a51204d49844de60543&';
    const PANEL_TITLE  = '<a:vouch:1374849565492252704>︲WERYFIKACJA';
    const PANEL_DESC   = 'Aby przejść weryfikacje, kliknij poniższy przycisk!';
    const BUTTON_TEXT  = 'Zweryfikuj się';

    const member = interaction.member; 
    const hasRole = member.roles.cache.some(r => ALLOWED_ROLE_IDS.includes(r.id));
    if (!hasRole) {
      return interaction.reply({
        content: '❌ Nie masz uprawnień do użycia tej komendy.',
        ephemeral: true,
      });
    }


    const target = interaction.options.getChannel('kanał') ?? interaction.channel;


    const embed = new EmbedBuilder()
      .setTitle(PANEL_TITLE)
      .setDescription(`> ${PANEL_DESC}`)
      .setImage(IMAGE_URL)
      .setColor(0x2b2d31);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel(BUTTON_TEXT).setStyle(ButtonStyle.Link).setURL(VERIFY_URL)
    );

    
    const perms = target.permissionsFor(interaction.client.user.id);
    if (!perms?.has(PermissionFlagsBits.SendMessages) || !perms?.has(PermissionFlagsBits.EmbedLinks)) {
      return interaction.reply({
        content: '⚠️ Bot nie ma uprawnień do wysyłania wiadomości/embeda w wybranym kanale.',
        ephemeral: true,
      });
    }

    await target.send({ embeds: [embed], components: [row] });
    return interaction.reply({ content: `✅ Wysłano panel do ${target}.`, ephemeral: true });
  },
};
