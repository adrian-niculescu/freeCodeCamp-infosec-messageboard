const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ThreadSchema } = require('./Thread.js');

const BoardSchema = new Schema({
    name: { type: String },
    threads: { type: [ ThreadSchema ]}
});

const Board = mongoose.model("Board", BoardSchema);

exports.BoardSchema = BoardSchema;
exports.Board = Board;