const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
        username: String,
        password: String,
        scopes: Object,
        created_at: {type: Date, default: Date.now}
    },
    {
        versionKey: false
    }
);

module.exports = mongoose.model('User', UserSchema);