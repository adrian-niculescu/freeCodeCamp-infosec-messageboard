const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

// Requirements
//
// Creating a new thread: POST request to /api/threads/{board}
// Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}
// Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password
// Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password
// Reporting a thread: PUT request to /api/threads/{board}
// Creating a new reply: POST request to /api/replies/{board}
// Viewing a single thread with all replies: GET request to /api/replies/{board}
// Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password
// Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password
// Reporting a reply: PUT request to /api/replies/{board}

/// Utils
// Thread Utils

async function createThread(boardName, text, deletePassword) {
    return new Promise((resolve, reject) => {
        boardName = boardName || 'Teamboard';
        text = text || `message ${new Date()}`;
        deletePassword = deletePassword || 'secret password';
        chai
        .request(server)
        .post(`/api/threads/${boardName}`)
        .set('Content-Type', 'application/json')
        .send({ text, delete_password: deletePassword })
        .end(function(error, response) {
            resolve({error, response});
        });
    });
}

async function getThreadsInBoard(boardName) {
    return new Promise((resolve, reject) => {
        chai
        .request(server)
        .get(`/api/threads/${boardName}`)
        .set('Content-Type', 'application/json')
        .end(function(error, response) {
            resolve({error, response});
        });
    });
}

async function reportThread(boardName, threadId) {
    return new Promise((resolve, reject) => {
        chai
        .request(server)
        .put(`/api/threads/${boardName}`)
        .set('Content-Type', 'application/json')
        .send({ report_id: threadId })
        .end(function(error, response) {
            resolve({error, response});
        });
    });
}

async function deleteThread(boardName, threadId, deletePassword) {
    return new Promise((resolve, reject) => {
        chai
        .request(server)
        .delete(`/api/threads/${boardName}`)
        .set('Content-Type', 'application/json')
        .send({
            thread_id: threadId,
            delete_password: deletePassword
        })
        .end(function(error, response) {
            resolve({error, response});
        });
    });
}

// Replies Utils

async function createReply(boardName, threadId, text, deletePassword) {
    return new Promise((resolve, reject) => {
        chai
        .request(server)
        .post(`/api/replies/${boardName}`)
        .set('Content-Type', 'application/json')
        .send({
            thread_id: threadId,
            text,
            delete_password: deletePassword
        })
        .end(function(error, response) {
            resolve({error, response});
        });
    });
}

async function getReplies(boardName, threadId) {
    return new Promise((resolve, reject) => {
        chai
        .request(server)
        .get(`/api/replies/${boardName}`)
        .set('Content-Type', 'application/json')
        .query({
            thread_id: threadId
        })
        .end(function(error, response) {
            resolve({error, response});
        });
    });
}

async function reportReply(boardName, threadId, replyId) {
    return new Promise((resolve, reject) => {
        chai
        .request(server)
        .put(`/api/replies/${boardName}`)
        .set('Content-Type', 'application/json')
        .send({
            thread_id: threadId,
            reply_id: replyId
         })
        .end(function(error, response) {
            resolve({error, response});
        });
    });
}

async function deleteReply(boardName, threadId, replyId, deletePassword) {
    return new Promise((resolve, reject) => {
        chai
        .request(server)
        .delete(`/api/replies/${boardName}`)
        .set('Content-Type', 'application/json')
        .send({
            thread_id: threadId,
            reply_id: replyId,
            delete_password: deletePassword
        })
        .end(function(error, response) {
            resolve({error, response});
        });
    });
}

suite('Functional Tests', async function() {
    this.timeout(30000);

    test("Creating a new thread: POST request to /api/threads/{board}", async function() {
        const boardName = 'Teamboard1';
        const text = `Post in ${boardName} - ${new Date()}`;
        const deletePassword = 'password123';
        let { error, response } = await createThread(boardName, text, deletePassword);
        assert.equal(response.status, 200);
        assert.notExists(error);
        ({ error, response } = await getThreadsInBoard(boardName));
        assert.equal(response.status, 200);
        assert.notExists(error);
        const body = response.body;
        assert.isArray(body, "response should be an array of Thread");
        assert.isAtLeast(body.length, 1);
        assert.equal(body[0].text, text);
    });


    test("Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}", async function() {
        const boardName = 'Teamboard1';
        const deletePassword = 'password123';
        for (let index = 0; index < 11; index++) {
            const text = `Post ${index} in ${boardName} - ${new Date()}`;
            let { error, response } = await createThread(boardName, text, deletePassword);
            assert.equal(response.status, 200);
            assert.notExists(error);
            ({ error, response } = await getThreadsInBoard(boardName));
            assert.equal(response.status, 200);
            assert.notExists(error);
            const body = response.body;
            assert.isArray(body, "response should be an array of Thread");
            assert.isAtLeast(body.length, 1);
            assert.equal(body[0].text, text);
        }
    });

    test("Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password", async function() {
        const boardName = 'Teamboard1';
        const text = `Post in ${boardName} - ${new Date()}`;
        const deletePassword = 'password123';
        let { error, response } = await createThread(boardName, text, deletePassword);
        assert.equal(response.status, 200);
        assert.notExists(error);

        ({ error, response } = await getThreadsInBoard(boardName));
        assert.equal(response.status, 200);
        assert.notExists(error);
        const body = response.body;
        assert.isArray(body, "response should be an array of Thread");
        assert.isAtLeast(body.length, 1);
        assert.equal(body[0].text, text);
        const threadId = body[0]._id;
        assert.exists(threadId);

        ({ error, response } = await deleteThread(boardName, threadId, "not the correct pass"));
        assert.equal(response.text, "incorrect password");
    });

    test("Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password", async function() {
        const boardName = 'Teamboard1';
        const text = `Post in ${boardName} - ${new Date()}`;
        const deletePassword = 'password123';
        let { error, response } = await createThread(boardName, text, deletePassword);
        assert.equal(response.status, 200);
        assert.notExists(error);

        ({ error, response } = await getThreadsInBoard(boardName));
        assert.equal(response.status, 200);
        assert.notExists(error);
        const body = response.body;
        assert.isArray(body, "response should be an array of Thread");
        assert.isAtLeast(body.length, 1);
        assert.equal(body[0].text, text);
        const threadId = body[0]._id;
        assert.exists(threadId);

        ({ error, response } = await deleteThread(boardName, threadId, deletePassword));
        assert.equal(response.status, 200);
        assert.notExists(error);
        assert.equal(response.text, "success");
    });

    test("Reporting a thread: PUT request to /api/threads/{board}", async function() {
        const boardName = 'Teamboard1';
        const text = `Post in ${boardName} - ${new Date()}`;
        const deletePassword = 'password123';
        let { error, response } = await createThread(boardName, text, deletePassword);
        assert.equal(response.status, 200);
        assert.notExists(error);

        ({ error, response } = await getThreadsInBoard(boardName));
        assert.equal(response.status, 200);
        assert.notExists(error);
        const body = response.body;
        const threadId = body[0]._id;
        assert.exists(threadId);

        ({ error, response } = await reportThread(boardName, threadId));
        assert.equal(response.status, 200);
        assert.notExists(error);
    });

    test("Creating a new reply: POST request to /api/replies/{board}", async function() {
        const boardName = 'Teamboard1';
        const text = `Post in ${boardName} - ${new Date()}`;
        const deletePassword = 'password123';
        let { error, response } = await createThread(boardName, text, deletePassword);
        assert.equal(response.status, 200);
        assert.notExists(error);

        ({ error, response } = await getThreadsInBoard(boardName));
        assert.equal(response.status, 200);
        assert.notExists(error);
        const body = response.body;
        const threadId = body[0]._id;
        assert.exists(threadId);

        const replyText = `Reply in ${boardName} - ${threadId} - ${new Date()}`;
        ({error, response} = await createReply(boardName, threadId, replyText, deletePassword));
        assert.equal(response.status, 200);
        assert.notExists(error);

        ({error, response} = await getReplies(boardName, threadId));
        assert.equal(response.status, 200);
        assert.notExists(error);
        assert.equal(response.body.replies[0].text, replyText);
    });

    test("Viewing a single thread with all replies: GET request to /api/replies/{board}", async function() {
        const boardName = 'Teamboard1';
        const text = `Post in ${boardName} - ${new Date()}`;
        const deletePassword = 'password123';
        let { error, response } = await createThread(boardName, text, deletePassword);
        assert.equal(response.status, 200);
        assert.notExists(error);

        ({ error, response } = await getThreadsInBoard(boardName));
        assert.equal(response.status, 200);
        assert.notExists(error);
        const body = response.body;
        const threadId = body[0]._id;
        assert.exists(threadId);

        const replyText = `Reply in ${boardName} - ${threadId} - ${new Date()}`;
        ({error, response} = await createReply(boardName, threadId, replyText, deletePassword));
        assert.equal(response.status, 200);
        assert.notExists(error);

        ({error, response} = await getReplies(boardName, threadId));
        assert.equal(response.status, 200);
        assert.notExists(error);
        const replies = response.body.replies;
        assert.isArray(replies);
        assert.equal(replies[0].text, replyText);
    });

    test("Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password", async function() {
        const boardName = 'Teamboard1';
        const text = `Post in ${boardName} - ${new Date()}`;
        const deletePassword = 'password123';
        let { error, response } = await createThread(boardName, text, deletePassword);
        assert.equal(response.status, 200);
        assert.notExists(error);

        ({ error, response } = await getThreadsInBoard(boardName));
        assert.equal(response.status, 200);
        assert.notExists(error);
        const body = response.body;
        const threadId = body[0]._id;
        assert.exists(threadId);

        const replyText = `Reply in ${boardName} - ${threadId} - ${new Date()}`;
        ({error, response} = await createReply(boardName, threadId, replyText, deletePassword));
        assert.equal(response.status, 200);
        assert.notExists(error);

        ({error, response} = await getReplies(boardName, threadId));
        assert.equal(response.status, 200);
        assert.notExists(error);
        const replies = response.body.replies;
        assert.isArray(replies);
        const replyToDelete = replies[0];
        const replyId = replyToDelete._id;
        assert.exists(replyToDelete);
        ({error, response} = await deleteReply(boardName, threadId, replyId, "not the correct pass"));
        assert.equal(response.text, "incorrect password");
    });

    test("Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password", async function() {
        const boardName = 'Teamboard1';
        const text = `Post in ${boardName} - ${new Date()}`;
        const deletePassword = 'password123';
        let { error, response } = await createThread(boardName, text, deletePassword);
        assert.equal(response.status, 200);
        assert.notExists(error);

        ({ error, response } = await getThreadsInBoard(boardName));
        assert.equal(response.status, 200);
        assert.notExists(error);
        const body = response.body;
        const threadId = body[0]._id;
        assert.exists(threadId);

        const replyText = `Reply in ${boardName} - ${threadId} - ${new Date()}`;
        ({error, response} = await createReply(boardName, threadId, replyText, deletePassword));
        assert.equal(response.status, 200);
        assert.notExists(error);

        ({error, response} = await getReplies(boardName, threadId));
        assert.equal(response.status, 200);
        assert.notExists(error);
        const replies = response.body.replies;
        assert.isArray(replies);
        const replyToDelete = replies[0];
        assert.exists(replyToDelete);
        const replyId = replyToDelete._id;
        assert.exists(replyId);
        ({error, response} = await deleteReply(boardName, threadId, replyId, deletePassword));
        assert.equal(response.status, 200);
        assert.notExists(error);
        assert.equal(response.text, "success");
    });

    test("Reporting a reply: PUT request to /api/replies/{board}", async function() {
        const boardName = 'Teamboard1';
        const text = `Post in ${boardName} - ${new Date()}`;
        const deletePassword = 'password123';
        let { error, response } = await createThread(boardName, text, deletePassword);
        assert.equal(response.status, 200);
        assert.notExists(error);

        ({ error, response } = await getThreadsInBoard(boardName));
        assert.equal(response.status, 200);
        assert.notExists(error);
        const body = response.body;
        const threadId = body[0]._id;
        assert.exists(threadId);

        const replyText = `Reply in ${boardName} - ${threadId} - ${new Date()}`;
        ({error, response} = await createReply(boardName, threadId, replyText, deletePassword));
        assert.equal(response.status, 200);
        assert.notExists(error);

        ({error, response} = await getReplies(boardName, threadId));
        assert.equal(response.status, 200);
        assert.notExists(error);
        let replies = response.body.replies;
        assert.isArray(replies);
        const replyToReport = replies[0];
        assert.exists(replyToReport);
        const replyId = replyToReport._id;
        assert.exists(replyId);
        ({error, response} = await reportReply(boardName, threadId, replyId));
        assert.equal(response.status, 200);
        assert.notExists(error);
    });
});
