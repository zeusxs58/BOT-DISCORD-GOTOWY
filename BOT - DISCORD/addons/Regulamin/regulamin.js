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
    .setName('regulamin')
    .setDescription('regulamin panel')

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
    const VERIFY1_URL   = 'https://docs.google.com/document/d/1n2LZTnkCKmpDt-DXWeIWKxK07xRm9ewNARM8BiTNTDc/edit?usp=sharing';
    const IMAGE1_URL    = 'https://cdn.discordapp.com/attachments/1407800973774028902/1428639029007618069/regulamin.gif?ex=68f33b47&is=68f1e9c7&hm=c6e7de0053a40c96707e1f027d1040bc5f6c95141f398e3ea81b3e120efdf40e&';
    const PANEL1_TITLE  = '```🎇 LV SHOP × REGULAMIN```';
    const PANEL1_DESC   = '**📜 × Aby zapoznać się z regulaminem serwera LV SHOP.**\n **kliknij poniższy przycisk!**';
    const BUTTON1_TEXT  = 'Regulamin';

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
      .setTitle(PANEL1_TITLE)
      .setDescription(`> ${PANEL1_DESC}`)
      .setImage(IMAGE1_URL)
      .setColor(0x2b2d31);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel(BUTTON1_TEXT)
        .setStyle(ButtonStyle.Link)
        .setURL(VERIFY1_URL)
        .setEmoji('<:1423769770817228900:1428639975284408340>') // 🔥 emoji dodane do przycisku
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
