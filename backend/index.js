const express = require('express');
const app = express();
app.use(express.json());
const logger = require('morgan');
const Vacationer = require("./models/vacationer")
require('dotenv').config()

const cors = require('cors')
app.use(cors())
app.use(logger('dev'));
app.use(express.urlencoded({extended: false}));
//app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})
app.get('/vacationers', (req, res) => {
    Vacationer.find({}).then(vacationer => {
        res.json(vacationer)
    })
})
app.get('/vacationers/try', (req, res) => {
    Vacationer.find({
        "vacations": {
            $elemMatch:{
                start: {
                    $gte: ("2022-02-05T12:00:00.000Z"),
                    $lte: ("2022-03-04T12:00:00.000Z")
                }
            }
        }
    }
    ).then (vacationer => {
        res.json(vacationer)
    })
})

app.post('/vacationers', (req, res) => {
    try {
        const body = req.body
        const VacationerObject = new Vacationer(body)
        VacationerObject.save().then(savedVacationer => {
            res.json(savedVacationer)
        })
    } catch (e) {
        res.json({error: e})
    }
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}
app.use(unknownEndpoint)

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
