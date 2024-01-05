const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');

dotenv.config();

router.get('/getApiKey', (req, res) => {
  const apiKey = process.env.REACT_APP_TMDB_API_KEY;
  res.json({ apiKey });
});

module.exports = router;