const vacationersRouter = require('express').Router()
const Vacationer = require('../models/vacationer')

vacationersRouter.get('/vacationers', (req, res, next) => {
    Vacationer.find({})
        .then(vacationer => {
            res.status(200).json(vacationer)
        })
        .catch(error => next(error))
})

vacationersRouter.post('/vacationers', (req, res, next) => {
    const body = req.body
    console.log("body", body)
    const VacationerObject = new Vacationer(body)
    VacationerObject.save()
        .then(savedVacationer => {
            res.status(201).json(savedVacationer)
        })
        .catch(error => next(error))
})

vacationersRouter.get('/vacationers/:id', (req, res, next) => {
    Vacationer.findById(req.params.id)
        .then(foundVacationer => {
            res.status(200).json(foundVacationer)
        })
        .catch(error => next(error))
})

vacationersRouter.put('/vacationers/:id', (req, res, next) => {
    const body = req.body;
    const id = req.params.id;
    console.log(id)
    Vacationer.findByIdAndUpdate(id, body, {new: true, runValidators: true, context: 'query'})
        .then(updatedVacationer => {
            res.status(200).json(updatedVacationer)
        })
        .catch(error => next(error))

})

vacationersRouter.delete('/vacationers/:id', (req, res, next) => {
    Vacationer.findByIdAndRemove(req.params.id)
        .then(deletedVacationer => {
            res.status(200).json(deletedVacationer)
        })
        .catch(error => next(error))

})

vacationersRouter.get('/holidaysbetween', (req, res, next) => {
    let start = req.query.start;
    let end = req.query.end;
    console.log("start ", start)
    console.log("end ", end)

    Vacationer.aggregate([

            // ANTAA YKSITTÄISET LOMAT ERILLISINÄ
            {
                $unwind: {
                    path: "$vacations"
                }
            },
            {
                $match: {
                    $and: [
                        {
                            "vacations.end": {
                                $gte: (new Date(start))
                            }
                        },
                        {
                            "vacations.start": {
                                $lte: (new Date(end))
                            }
                        }
                    ]
                }
            },

            // antaa lomalaiset kaikkine lomineen, ei toimi oikein
            // $and: [
            //     {
            //         "vacations":
            //             {
            //                 $elemMatch: {
            //                     end: {
            //                         $gte: (start)
            //                     }
            //                 }
            //             }
            //     },
            //     {
            //         "vacations":
            //             {
            //                 $elemMatch: {
            //                     start: {
            //                         $lte: (end)
            //                     }
            //                 }
            //             }
            //     }
            // ]

        ]
    )
        .then(vacationer => {
            res.status(200).json(vacationer)
        })
        .catch(error => next(error))
})
vacationersRouter.get('/timespan', (req, res, next) => {
    let start = req.query.start;
    let end = req.query.end;
    console.log("start ", start)
    console.log("end ", end)

    Vacationer.aggregate([

            // ANTAA YKSITTÄISET LOMAT ERILLISINÄ
            {
                $unwind: {
                    path: "$vacations"
                }
            },
            {
                $match: {
                    $and: [
                        {
                            "vacations.end": {
                                $gte: (new Date(start))
                            }
                        },
                        {
                            "vacations.start": {
                                $lte: (new Date(end))
                            }
                        }
                    ]
                }
            },
            {
                $group: {
                    _id: "$_id",
                    count: {$sum: 1}
                }
            }
        ]
    )
        .then(vacationer => {
            res.status(200).json(vacationer)
        })
        .catch(error => next(error))
})


// vacationersRouter.get('/timespanks', (req, res, next) => {
//     let start = req.query.start;
//     let end = req.query.end;
//
//     Vacationer.aggregate([
//         {$addFields: {days_diff: {$divide: [{$subtract: [$end}, $start}], 86400000.0 ]} }}
//
//         ,{$project: {dates_in_between_inclusive: {
//                     $map: {
//                         input: {$range: [0, {$add:["$days_diff",1]}] }, // +1 for inclusive
//                         as: "dd",
//                         in: {$add: ["$start_date", {$multiply:["$$dd", 86400000]}]}
//                     }
//                 }}},
//
//         {$unwind: "$dates_in_between_inclusive"}
//         ]
//     )
//         .then(vacationer => {
//             res.status(200).json(vacationer)
//         })
//         .catch(error => next(error))
// })

module.exports = vacationersRouter