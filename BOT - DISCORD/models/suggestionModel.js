const mongoose = require('mongoose');
// https://discord.authguards.com
const schema = new mongoose.Schema ({
    msgID: String,
    userID: String,
    suggestion: String,
    upVotes: Number,
    downVotes: Number,
    status: String,
    voters: [
        {
          userID: String,
          voteType: String,
        },
      ],
});
// https://discord.authguards.com
module.exports = mongoose.model('suggestion', schema);