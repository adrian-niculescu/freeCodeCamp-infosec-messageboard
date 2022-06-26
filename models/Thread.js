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
    replies: { type: [ ReplySchema ] }
});

const Thread = mongoose.model("Thread", ThreadSchema);

/**
 * @typedef Thread
 * @property {string} text
 * @property {string} delete_password
 * @property {boolean} reported
 * @property {Date} created_on
 * @property {Date} bumped_on
 * @property {[ Reply ]} replies
 * 
 */

exports.ThreadSchema = ThreadSchema;
exports.Thread = Thread;