const mongoose = require('mongoose')
require('dotenv').config();
const url = process.env.MONGODB_URI

console.log("connecting to MongoDB")

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

const vacationerSchema = new mongoose.Schema({
    initials: String,
    vacations: [
        {
            start: Date,
            end: Date
        }
    ]
})

vacationerSchema.set('toJSON', {
    transform: (document, returnedObject)=> {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model("Vacationer", vacationerSchema)