const mongoose = require('mongoose');

const db = mongoose.connect(process.env.DB, {
    useUnifiedTopology: true,
    usenewUrlParser: true
});

module.exports = db;