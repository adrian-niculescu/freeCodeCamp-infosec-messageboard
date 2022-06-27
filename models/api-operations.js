const { Board } = require('./Board.js');
const { Thread } = require('./Thread.js');

const {
    addReplyMessage,
    getThreadInBoard,
    addThreadInBoard,
    reportThread,
    deleteThread,
    reportReply,
    deleteReply,
    findBoard,
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
    const threadCountLimit = 10;
    const replyLimit = 3;
    const board = await findBoard(boardName);
    if (!board) {
        return undefined;
    }
    let { threads } = board;
    if (!threads) {
        console.error(`Board ${boardName} has ${board.threads} threads`);
        throw new Error('Board has no threads');
    }
    /* Sort by bumped_on DESC */
    threads.sort((thread1, thread2) => thread2.bumped_on - thread1.bumped_on);
    /* Take only first 10 threads */ 
    if (threads.length > threadCountLimit) {
        threads = threads.slice(0, threadCountLimit);
    }
    let returnedThreads = threads.map((thread) => {
        /* Remove properties reported and delete_password */
        let { _id, text, created_on, bumped_on, replies } = thread;
        replies = replies || [];
        let returnedThread = { _id, text, created_on, bumped_on };
        /* Add the replycount property */
        returnedThread.replycount = replies.length;
        let returnedReplies = replies.map((reply) => {
            /* Remove properties reported and delete_password */
            const { _id, text, created_on, bumped_on } = reply;
            return { _id, text, created_on, bumped_on };
        });
        /* Sort by bumped_on DESC */
        returnedReplies.sort((reply1, reply2) => reply2.bumped_on - reply1.bumped_on);
        /* Take only first 3 replies */ 
        if (returnedReplies.length > replyLimit) {
            returnedReplies = returnedReplies.slice(0, replyLimit);
        }
        returnedThread.replies = returnedReplies;
        return returnedThread;
    });
    return returnedThreads;
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
    if (thread) {
        /* Remove properties reported and delete_password */
        let { _id, text, created_on, bumped_on, replies } = thread;
        replies = replies || [];
        let returnedThread = { _id, text, created_on, bumped_on };
        /* Add the replycount property */
        returnedThread.replycount = replies.length;
        let returnedReplies = replies.map((reply) => {
            /* Remove properties reported, delete_password and bumped_on */
            const { _id, text, created_on } = reply;
            return { _id, text, created_on };
        });
        returnedThread.replies = returnedReplies;
        return returnedThread;
    }
    return undefined;
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