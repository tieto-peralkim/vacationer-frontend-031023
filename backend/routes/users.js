const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', (req, res) => {
  res.cookie("spede", "e34533");
  res.send('respond with an aaa');
})

module.exports = router;
