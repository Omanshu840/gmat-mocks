const express = require('express');
const cors = require('cors');
const app = express();
const questions = require('./questions.json');
app.use(cors());

app.get('/questions', (req, res) => {
    res.json(questions);
});

app.listen(5000, () => console.log('Server running on port 5000'));