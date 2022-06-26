const { Board } = require('./Board.js');
const { Thread } = require('./Thread.js');
const { Reply } = require('./Reply.js');

/**
 *
 * @param {string} boardName The name of the board.
 * @return {Promise<Board|undefined>} a Board.
 */
async function findBoard(boardName) {
    return Board.findOne( {name: boardName} ).exec();
}

/**
 *
 * @param {string} boardName The name of the board.
 * @param {boolean} save Whether to perform DB save or not.
 * @return {Promise<Board>} a Board.
 */
async function createBoard(boardName, save) {
    if (save == null) {
        save = true;
    }
    const newBoard = new Board({
        name: boardName,
        threads: []
    });
    if (save) {
        return await newBoard.save();
    }
    return newBoard;
}

/**
 *
 * @param {string} boardName The name of the board.
 * @param {boolean} save Whether to perform DB save or not.
 * @return {Promise<Board>} a Board.
 */
async function findOrCreateBoard(boardName, save) {
    if (save == null) {
        save = true;
    }
    let board = await findBoard(boardName, save);
    if (!board) {
        board = createBoard(boardName, save);
    }
    return board;
}

/**
 *
 * @param {string} text the message.
 * @param {string} deletePassword The password to delete the resource.
 * @param {boolean} save Whether to perform DB save or not.
 * @return {Promise<Thread>} a Thread.
 */
async function createThread(text, deletePassword, save) {
    if (save == null) {
        save = true;
    }
    const newThread = new Thread({
        text,
        delete_password: deletePassword,
        replies: []
    });
    if (save) {
        return await newThread.save();
    }
    return newThread;
}

exports.createBoard = createBoard;
exports.findBoard = findBoard;
exports.findOrCreateBoard = findOrCreateBoard;
exports.createThread = createThread;
