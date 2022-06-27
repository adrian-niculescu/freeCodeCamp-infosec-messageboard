const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ReplySchema } = require('./Reply.js');

const currentDate = Date();

const ThreadSchema = new Schema({
    text: { type: String },
    delete_password: { type: String },
    reported: { type: Boolean, default: false },
    created_on: { type: Date, default: currentDate },
    bumped_on: { type: Date, default: currentDate },
    replies: { type: [ ReplySchema ] },
    replycount: { type: Number, default: 0 }
});

const Thread = mongoose.model("Thread", ThreadSchema);

exports.ThreadSchema = ThreadSchema;
exports.Thread = Thread;