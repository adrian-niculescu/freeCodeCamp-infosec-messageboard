'use strict';

const {
  processNewBoardPostRequest,
  processGetBoardRequest,
  processReportThreadRequest,
  processDeleteThreadRequest
} = require('../models/api-operations.js');

module.exports = function (app) {
  
  app.route('/api/threads/:board')
  .post(async function(req, res) {
    try {
      const { text, delete_password } = req.body;
      let board = req.body.board;
      if (!board) {
        board = req.params.board;
      }
      const response = await processNewBoardPostRequest(text, board, delete_password);
      res.json(response);
    } catch(err) {
      console.error(`Error saving a new post: ${err}`);
      res.send('There was an error saving the new post');
    }
  })
  .get(async function(req, res) {
    try {
      const boardName = req.params.board;
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
  })
  .put(async function(req, res) {
    try {
      const boardName = req.params.board;
      const { report_id } = req.body;
      const response = await processReportThreadRequest(boardName, report_id);
      if (!response) {
        res.sendStatus(404);
        return;
      }
      res.send("Success");
    } catch(err) {
      console.error(`Error updating board: ${err}`);
      res.send('There was an error updating the board');
    }
  })
  .delete(async function(req, res) {
    try {
      const { thread_id, delete_password } = req.body;
      const board = req.params.board;
      const response = await processDeleteThreadRequest(board, thread_id, delete_password);
      if (!response) {
        res.sendStatus(404);
        return;
      }
      res.send("Success");
    } catch(err) {
      let message;
      if (err && err.message) {
        message = err.message;
      } else {
        message = 'There was an error deleting the message!';
      }
      console.error(`${message}: ${err}`);
      res.send(message);
    }
  });
    
  app.route('/api/replies/:board');
};
