const { Board } = require('./Board.js');
const { Thread } = require('./Thread.js');
const { Reply } = require('./Reply.js');
const { createThread, findOrCreateBoard, findBoard } = require('./db-operations.js');

/**
 * 
 * @param {string} boardName The message.
 * @param {string} boardName The name of the board.
 * @param {string} deletePassword The password to delete the resource.
 * @returns {Promise<Board|undefined>}
 */
async function processNewBoardPostRequest(text, boardName, deletePassword) {
    const newThread = await createThread(text, deletePassword);
    const board = await findOrCreateBoard(boardName);
    board.threads.push(newThread);
    await board.save();
    return newThread;
}

/**
 * 
 * @param {string} boardName The name of the board.
 * @returns {Promise<[Thread]|undefined>}
 */
async function processGetBoardRequest(boardName) {
    const board = await findBoard(boardName);
    if (!board) {
        return undefined;
    }
    const threads = board.threads;
    threads.map((thread) => {
        /* Map to add the replycount property */
        thread.replycount = thread.replies.length;
    });
    return threads;
}

/**
 * 
 * @param {string} boardName The name of the board.
 * @param {string} reportId The name of the board.
 * @returns {Promise<boolean>}
 */
 async function processReportThreadRequest(boardName, reportId) {
    const board = await findBoard(boardName);
    if (!board) {
        return false;
    }
    const currentDate = new Date();
    const reportedThread = board.threads.id(reportId);
    reportedThread.reported = true;
    reportedThread.bumped_on = currentDate;
    await board.save();
    return true;
}

/**
 * 
 * @param {string} boardName The name of the board.
 * @param {string} threadId The thread to delete.
 * @param {string} deletePassword The password to delete the resource.
 * @returns {Promise<boolean>}
 */
 async function processDeleteThreadRequest(boardName, threadId, deletePassword) {
    const board = await findBoard(boardName);
    if (!board) {
        return false;
    }
    const threadToDelete = board.threads.id(threadId);
    if (threadToDelete.delete_password === deletePassword) {
        threadToDelete.remove();
    } else {
        throw new Error("Incorrect password");
    }
    await board.save();
    return true;
}

exports.processNewBoardPostRequest = processNewBoardPostRequest;
exports.processGetBoardRequest = processGetBoardRequest;
exports.processReportThreadRequest = processReportThreadRequest;
exports.processDeleteThreadRequest = processDeleteThreadRequest;