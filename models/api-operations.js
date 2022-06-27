const { Board } = require('./Board.js');
const { Thread } = require('./Thread.js');
const { Reply } = require('./Reply.js');
const { 
    getBoard,
    addReplyMessage,
    getThreadInBoard,
    addThreadInBoard,
    reportThread,
    deleteThread,
    reportReply,
    deleteReply,
} = require('./db-operations.js');

/**
 * 
 * @param {string} boardName The message.
 * @param {string} boardName The name of the board.
 * @param {string} deletePassword The password to delete the resource.
 * @returns {Promise<Thread|undefined>}
 */
async function processNewBoardPostRequest(text, boardName, deletePassword) {
    return await addThreadInBoard(text, boardName, deletePassword);
}

/**
 * 
 * @param {string} boardName The name of the board.
 * @returns {Promise<[Thread]|undefined>} The threads in the board.
 */
async function processGetBoardRequest(boardName) {
    const board = await getBoard(boardName);
    if (board) {
        return board.threads;
    }
    return undefined;
}

/**
 * 
 * @param {string} boardName The name of the board.
 * @param {string} threadId The id of the thread to be reported.
 * @returns {Promise<boolean>} true if the operation succeeds; false if the board or thread could not be found.
 */
 async function processReportThreadRequest(boardName, threadId) {
    return await reportThread(boardName, threadId);
}

/**
 * 
 * @param {string} boardName The name of the board.
 * @param {string} threadId The thread to delete.
 * @param {string} deletePassword The password to delete the resource.
 * @returns {Promise<boolean>} true if the operation succeeded; false if the board or thread could not be found.
 * If the password is incorrect an Error is thrown.
 */
 async function processDeleteThreadRequest(boardName, threadId, deletePassword) {
    return await deleteThread(boardName, threadId, deletePassword);
}

/**
 *
 * @param {string} text The message.
 * @param {string} boardName The name of the board.
 * @param {string} threadId The id of the thread to attatch the reply to.
 * @param {string} deletePassword The password to delete the resource.
 * @return {Promise<Board|undefined>} The updated Board.
 */
 async function processNewReplyRequest(text, boardName, threadId, deletePassword) {
    return await addReplyMessage(text, boardName, threadId, deletePassword);
}

/**
 * 
 * @param {string} boardName The name of the board.
 * @param {string} threadId The id of the thread to attatch the reply to.
 * @returns {Promise<Thread|undefined>}
 */
async function processGetRepliesRequest(boardName, threadId) {
    const { thread } = await getThreadInBoard(boardName, threadId);
    return thread;
}

/**
 *
 * @param {string} boardName The name of the board.
 * @param {string} threadId The id of the thread.
 * @param {string} replyId The id of the reply to be reported.
 * @returns {Promise<boolean>} true if the operation succeeds; false if the board or thread or reply could not be found.
 */
async function processReportReplyRequest(boardName, threadId, replyId) {
    return await reportReply(boardName, threadId, replyId);
}

/**
 *
 * @param {string} boardName The name of the board.
 * @param {string} threadId The id of the thread.
 * @param {string} replyId The id of the reply.
 * @param {string} deletePassword The password to delete the resource.
 * @returns {Promise<boolean>} true if the operation succeeded; false if the board or thread or reply could not be found.
 * If the password is incorrect an Error is thrown.
 */
async function processDeleteReplyRequest(boardName, threadId, replyId, deletePassword) {
    return await deleteReply(boardName, threadId, replyId, deletePassword);
}

exports.processNewBoardPostRequest = processNewBoardPostRequest;
exports.processGetBoardRequest = processGetBoardRequest;
exports.processReportThreadRequest = processReportThreadRequest;
exports.processDeleteThreadRequest = processDeleteThreadRequest;
exports.processNewReplyRequest = processNewReplyRequest;
exports.processGetRepliesRequest = processGetRepliesRequest;
exports.processReportReplyRequest = processReportReplyRequest;
exports.processDeleteReplyRequest = processDeleteReplyRequest;