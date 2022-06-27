const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReplySchema = new Schema({
    text: { type: String },
    delete_password: { type: String },
    reported: { type: Boolean, default: false },
    created_on: { type: Date  },
    bumped_on: { type: Date }
});

const Reply = mongoose.model("Reply", ReplySchema);

exports.ReplySchema = ReplySchema;
exports.Reply = Reply;