const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ThreadSchema } = require('./Thread.js');

const currentDate = Date();

const BoardSchema = new Schema({
    name: { type: String },
    threads: { type: [ ThreadSchema ]}
});

const Board = mongoose.model("Board", BoardSchema);

/**
 * @typedef Board
 * @property {string} name name
 * @property {[Thread]} threads threads
 */

exports.BoardSchema = BoardSchema;
exports.Board = Board;