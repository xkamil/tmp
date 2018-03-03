const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TokenSchema = new Schema({
    code: Number,
    response_headers: Object,
    response_body: Object,
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Token', TokenSchema );