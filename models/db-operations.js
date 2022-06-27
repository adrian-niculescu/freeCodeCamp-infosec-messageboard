const { Board } = require('./Board.js');
const { Thread } = require('./Thread.js');
const { Reply } = require('./Reply.js');

/**
 * Clear all DataBase collections.
 */
async function clearDataBase() {
   await Promise.all([
        Reply.deleteMany().exec(),
        Thread.deleteMany().exec(),
        Board.deleteMany().exec()
   ]);
}

// clearDataBase();

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
 * @return {Promise<Board|undefined>} a Board.
 */
 async function findBoard(boardName) {
    return await Board.findOne( {name: boardName} ).exec();
}

/**
 * @param {Thread} thread The thread to be decorated with computed properties.
 */
 function updateComputedPropertiesForThread(thread) {
    thread.replycount = thread.replies.length;
}

/**
 * 
 * @param {string} boardName The name of the board. 
 * @returns {Promise<Board|undefined>} A Board.
 */
async function getBoard(boardName) {
    const board = await findBoard(boardName);
    if (!board) {
        return undefined;
    }
    const threads = board.threads;
    if (!threads) {
        console.error(`Board ${boardName} has ${board.threads} threads`);
        throw new Error('Board has no threads');
    }
    threads.map((thread) => {
        /* Map to add the replycount property */
        updateComputedPropertiesForThread(thread);
    });
    return board;
}

/**
 *
 * @param {string} boardName The name of the board.
 * @param {boolean} save Whether to perform DB save or not.
 * @returns {Promise<Board>} a Board.
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
 * @param {string} text The message.
 * @param {string} deletePassword The password to delete the resource.
 * @param {boolean} save Whether to perform DB save or not.
 * @returns {Promise<Thread>} a Thread.
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

/**
 * @typedef ThreadInBoard
 * @property {Thread} thread
 * @property {Board} board
 */
/**
 * 
 * @param {string} boardName The name of the board. 
 * @param {string} threadId The id of the thread to be retrieved.
 * @returns {Promise<ThreadInBoard|undefined>}
 */
 async function getThreadInBoard(boardName, threadId) {
    const board = await findBoard(boardName);
    if (!board) {
        console.error(`Found no board: ${boardName}`);
        return undefined;
    }
    const threads = board.threads;
    if (!threads) {
        console.error(`Board ${boardName} has no threads`);
        throw new Error('Board has no threads');
    }
    const thread = threads.id(threadId);
    updateComputedPropertiesForThread(thread);
    return { board, thread };
}

/**
 *
 * @param {string} text The message.
 * @param {string} boardName The name of the board.
 * @param {string} deletePassword The password to delete the resource.
 * @returns {Promise<Thread>} a Thread.
 */
async function addThreadInBoard(text, boardName, deletePassword) {
    const newThread = await createThread(text, deletePassword);
    const board = await findOrCreateBoard(boardName);
    if (!board) {
        return undefined;
    }
    board.threads.push(newThread);
    await board.save();
    return newThread;
}

/**
 * 
 * @param {string} boardName The name of the board.
 * @param {string} threadId The id of the thread to be reported.
 * @returns {Promise<boolean>} true if the operation succeeds; false if the board or thread could not be found.
 */
 async function reportThread(boardName, threadId) {
    const { thread, board } = await getThreadInBoard(boardName, threadId);
    if (!thread || !board) {
        console.error(`Could not report thread in boardName: ${boardName}, threadId: ${threadId}`);
        return false;
    }
    thread.reported = true;
    thread.bumped_on = new Date();;
    await board.save();
    return true;
}

/**
 *
 * @param {string} boardName The name of the board.
 * @param {string} threadId The id of the thread.
 * @param {string} deletePassword The password to delete the resource.
 * @returns {Promise<boolean>} true if the operation succeeded; false if the board or thread could not be found.
 * If the password is incorrect an Error is thrown.
 */
 async function deleteThread(boardName, threadId, deletePassword) {
    const { thread, board } = await getThreadInBoard(boardName, threadId);
    if (!thread || !board) {
        console.error(`Could not delete thread in boardName: ${boardName}, threadId: ${threadId}`);
        return undefined;
    }
    if (thread.delete_password !== deletePassword) {
        throw new Error("Incorrect password");
    }
    thread.remove();
    await board.save();
    return true;
}

/**
 *
 * @param {string} text the message.
 * @param {string} deletePassword The password to delete the resource.
 * @param {boolean} save Whether to perform DB save or not.
 * @return {Promise<Reply>} a Reply.
 */
 async function createReply(text, deletePassword, save) {
    if (save == null) {
        save = true;
    }
    const newReply = new Reply({
        text,
        delete_password: deletePassword,
    });
    if (save) {
        return await newReply.save();
    }
    return newReply;
}

/**
 *
 * @param {string} text The message.
 * @param {string} boardName The name of the board.
 * @param {string} threadId The id of the thread to attatch the reply to.
 * @param {string} deletePassword The password to delete the resource.
 * @param {boolean} save Whether to perform DB save or not.
 * @return {Promise<Board|undefined>} The updated Board.
 */
 async function addReplyMessage(text, boardName, threadId, deletePassword) {
    const newReply = await createReply(text, deletePassword);
    const { thread, board } = await getThreadInBoard(boardName, threadId);
    if (!thread || !board) {
        console.log(`Could not add reply: ${text} to boardName: ${boardName} threadId: ${threadId}`);
        return undefined;
    }
    const currentDate = new Date();
    thread.bumped_on = currentDate;
    thread.replies.push(newReply);
    updateComputedPropertiesForThread(thread);
    return await board.save();
}

/**
 * @typedef ReplyInThread
 * @property {Thread} thread
 * @property {Board} board
 * @property {Reply} reply
 */
/**
 * 
 * @param {string} boardName The name of the board. 
 * @param {string} threadId The id of the thread.
 * @param {string} replyId The id of the reply to be retrieved. 
 * @returns {Promise<ReplyInThread|undefined>} The reply.
 */
async function getReplyInThread(boardName, threadId, replyId) {
    const { thread, board } = await getThreadInBoard(boardName, threadId);
    if (!thread || !board) {
        console.error(`Could not get reply: ${replyId} in boardName: ${boardName} threadId: ${threadId}`);
        return undefined;
    }
    const replies = thread.replies;
    if (!replies) {
        console.error(`Board: ${boardName} has thread: ${threadId} with no replies`);
        return undefined;
    }
    const reply = replies.id(replyId);
    return { thread, board, reply };
}

/**
 *
 * @param {string} boardName The name of the board.
 * @param {string} threadId The id of the thread.
 * @param {string} replyId The id of the reply to be reported.
 * @returns {Promise<boolean>} true if the operation succeeds; false if the board or thread or reply could not be found.
 */
async function reportReply(boardName, threadId, replyId) {
    const { board, reply } = await getReplyInThread(boardName, threadId, replyId);
    if (!board || !reply) {
        console.error(`Could not reply in boardName: ${boardName}, threadId: ${threadId}, replyId: ${replyId}`);
        return false;
    }
    reply.reported = true;
    reply.bumped_on = new Date();
    await board.save();
    return true;
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
 async function deleteReply(boardName, threadId, replyId, deletePassword) {
    const { board, thread, reply } = await getReplyInThread(boardName, threadId, replyId);

    if (!reply) {
        console.error(`Could not delete reply in boardName: ${boardName}, threadId: ${threadId}, replyId: ${replyId}`);
        return undefined;
    }
    if (reply.delete_password !== deletePassword) {
        throw new Error("Incorrect password");
    }
    reply.remove();
    updateComputedPropertiesForThread(thread);
    await board.save();
    return true;
}

exports.createBoard = createBoard;
exports.findBoard = findBoard;
exports.getBoard = getBoard;
exports.findOrCreateBoard = findOrCreateBoard;

exports.createThread = createThread;
exports.getThreadInBoard = getThreadInBoard;
exports.addThreadInBoard = addThreadInBoard;
exports.reportThread = reportThread;
exports.deleteThread = deleteThread;

exports.addReplyMessage = addReplyMessage;
exports.reportReply = reportReply;
exports.deleteReply = deleteReply;