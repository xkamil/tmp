const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TokenSchema = new Schema({
        type: String,
        grant_type: String,
        token: String,
        expires: Date,
        user_id: String,
        scope: String,
        created_at: {type: Date, default: Date.now}
    },
    {
        versionKey: false
    }
);

module.exports = mongoose.model('Token', TokenSchema);