const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'Express' });
  // res.json(db)
})

const db = []

router.post('/', function (req, res, next){
  const newTodo = {
    id: Date.now(),
    text: req.body.text
  }
  db.push(newTodo)

  res.json(newTodo)
})

module.exports = router;
