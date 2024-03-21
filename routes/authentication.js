const express = require('express');

const router = express.Router();

router.get('/me', (req, res) => {
      return res.send('you are inside router');
})

module.exports = router;