'use strict';

const {
  processNewBoardPostRequest,
  processGetBoardRequest,
  processReportThreadRequest,
  processDeleteThreadRequest,
  processNewReplyRequest,
  processGetRepliesRequest,
  processReportReplyRequest,
  processDeleteReplyRequest
} = require('../models/api-operations.js');

module.exports = function (app) {
  
  async function postThread(req, res) {
    try {
      const { text, delete_password } = req.body;
      let board = req.body.board;
      if (!board) {
        board = req.params.board;
      }
      console.log(`POST New thread for boardName: ${board} text: ${text}`);
      await processNewBoardPostRequest(text, board, delete_password);
      res.redirect(`/b/${board}/`);
    } catch(err) {
      console.error(`Error saving a new post: ${err}`);
      res.send('There was an error saving the new post');
    }
  }

  async function getThread(req, res) {
    try {
      const boardName = req.params.board;
      console.log(`GET threads for board: ${boardName}`);
      const response = await processGetBoardRequest(boardName);
      if (!response) {
        res.sendStatus(404);
        return;
      }
      res.json(response);
    } catch(err) {
      console.error(`Error retrieving board: ${err}`);
      res.send('There was an error retrieving the board');
    }
  }

  async function putThread(req, res) {
    try {
      const boardName = req.params.board;
      const { report_id } = req.body;
      console.log(`Report thread for boardName: ${boardName} report_id: ${report_id}`);
      const response = await processReportThreadRequest(boardName, report_id);
      if (typeof response !== 'boolean') {
        res.sendStatus(404);
        return;
      }
      res.send(response ? "reported": "Failed to report the message!");
    } catch(err) {
      console.error(`Failed to report the message: ${err}`);
      res.send('Failed to report the message!');
    }
  }
  
  async function deleteThread (req, res) {
    try {
      const { thread_id, delete_password } = req.body;
      const boardName = req.params.board;
      console.log(`Delete thread for boardName: ${boardName}, threadId: ${thread_id}`);
      const response = await processDeleteThreadRequest(boardName, thread_id, delete_password);
      if (typeof response !== 'boolean') {
        res.sendStatus(404);
        return;
      }
      res.send(response ? "success": "Failed to delete the message!");
    } catch(err) {
      let message;
      if (err && err.message) {
        message = err.message;
      } else {
        message = 'Failed to delete the message!';
      }
      console.error(`${message}: ${err}`);
      res.send(message);
    }
  }

  app.route('/api/threads/:board')
  .post(postThread)
  .get(getThread)
  .put(putThread)
  .delete(deleteThread);

  /* Add support for the same route, but with an ending "/" */
  app.route('/api/threads/:board/')
  .post(postThread)
  .get(getThread)
  .put(putThread)
  .delete(deleteThread);
    
  async function postReply(req, res) {
    try {
      const { thread_id, text, delete_password } = req.body;
      const board = req.params.board;
      console.log(`POST New reply text: ${text}, boardName: ${board}, threadId: ${thread_id}`);
      const response = await processNewReplyRequest(text, board, thread_id, delete_password);
      if (!response) {
        res.sendStatus(404);
        return;
      }
      res.redirect(`/b/${board}/${thread_id}`);
    } catch(err) {
      let message;
      if (err && err.message) {
        message = err.message;
      } else {
        message = 'There was an error adding the new reply!';
      }
      console.error(`${message}: ${err}`);
      res.send(message);
    }
  }

  async function getReplies(req, res) {
    try {
      const boardName = req.params.board;
      const threadId = req.query.thread_id;
      console.log(`GET thread for boardName: ${boardName}, threadId: ${threadId}`);
      const response = await processGetRepliesRequest(boardName, threadId);
      if (!response) {
        res.sendStatus(404);
        return;
      }
      res.json(response);
    } catch(err) {
      console.error(`Error retrieving board: ${err}`);
      res.send('There was an error retrieving the board');
    }
  }

  async function putReply(req, res) {
    try {
      const { thread_id, reply_id } = req.body;
      const boardName = req.params.board;
      console.log(`Report reply for boardName: ${boardName}, threadId: ${thread_id}, replyId: ${reply_id}`);
      const response = await processReportReplyRequest(boardName, thread_id, reply_id);
      if (typeof response !== 'boolean') {
        res.sendStatus(404);
        return;
      }
      res.send(response ? "reported": "Failed to report the thread!");
    } catch(err) {
      console.error(`Error retrieving board: ${err}`);
      res.send('There was an error retrieving the board');
    }
  }

  async function deleteReply(req, res) {
    try {
      const { thread_id, reply_id, delete_password } = req.body;
      const boardName = req.params.board;
      console.log(`Delete reply for boardName: ${boardName}, threadId: ${thread_id}, replyId: ${reply_id}`);
      const response = await processDeleteReplyRequest(boardName, thread_id, reply_id, delete_password);
      if (typeof response !== 'boolean') {
        res.sendStatus(404);
        return;
      }
      res.send(response ? "success": "Failed to delete the reply!");
    } catch(err) {
      let message;
      if (err && err.message) {
        message = err.message;
      } else {
        message = 'Failed to delete the reply!';
      }
      console.error(`${message}: ${err}`);
      res.send(message);
    }
  }

  app.route('/api/replies/:board')
  .post(postReply)
  .get(getReplies)
  .put(putReply)
  .delete(deleteReply);

  /* Add support for the same route, but with an ending "/" */
  app.route('/api/replies/:board/')
  .post(postReply)
  .get(getReplies)
  .put(putReply)
  .delete(deleteReply);
};
