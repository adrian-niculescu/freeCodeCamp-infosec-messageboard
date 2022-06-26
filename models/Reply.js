const mongoose = require('mongoose');
const { Schema } = mongoose;

const currentDate = Date();

const ReplySchema = new Schema({
    text: { type: String },
    delete_password: { type: String },
    reported: { type: Boolean, default: false },
    created_on: { type: Date, default: currentDate },
    bumped_on: { type: Date, default: currentDate }
});

const Reply = mongoose.model("Reply", ReplySchema);

/**
 * @typedef Reply
 * @property {string} text
 * @property {string} delete_password
 * @property {boolean} reported
 * @property {Date} created_on
 * @property {Date} bumped_on
 * 
 */

exports.ReplySchema = ReplySchema;
exports.Reply = Reply;