const mongoose = require('mongoose');
// https://discord.authguards.com
const schema = new mongoose.Schema ({
    guildID: String,
    url: String,
    port: String,
});
// https://discord.authguards.com
module.exports = mongoose.model('dashboard', schema);