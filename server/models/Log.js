const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LogSchema = new Schema({
        code: Number,
        method: String,
        path: String,
        request_headers: Object,
        request_body: Object,
        response_headers: Object,
        response_body: Object,
        created_at: {type: Date, default: Date.now}
    },
    {
        versionKey: false
    }
);

module.exports = mongoose.model('Log', LogSchema);