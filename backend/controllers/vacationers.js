const vacationersRouter = require('express').Router()
const Vacationer = require('../models/vacationer')

vacationersRouter.get('/vacationers', (req, res, next) => {
    Vacationer.find({})
        .then(vacationer => {
            res.status(200).json(vacationer)
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

// vacationersRouter.get('/testia', (req, res, next) => {
//     Vacationer.aggregate([
//
//         // {
//         //     $addFields: {days_diff: {$divide: [{$subtract: [{"$dateFromString": {"dateString": "$vacations[0].end"}}, {"$dateFromString": {"dateString": "$vacations[0].start"}}]}, 86400000.0]}}
//         // },{$project: {dates_in_between_inclusive: {
//         //     $map: {
//         //         input: {$range: [0, {$add: ["$days_diff", 1]}]},
//         //         as: "dd",
//         //         in: {$add: [{"$dateFromString": {"dateString": "$vacations[0].start"}}, {$multiply:["$$dd", 86400000]}]}
//         //     }
//         //         }}},
//         // {$unwind: "$dates_in_between_inclusive"}
//         // ])
//
//
//         // {$unwind: "$vacations"},
//         // {
//         //     $match: {
//         //         // check here date range matching documents
//         //         $and: [
//         //             {
//         //                 "vacations.start": {
//         //                     "$gte": new Date("2022-03-03T00:00:00Z")
//         //                 }
//         //             },
//         //             {
//         //                 "vacations.start": {
//         //                     "$lte": new Date("2022-04-14T20:00:00Z")
//         //                 }
//         //             }
//         //         ]
//         //     }
//         // },
//         // {
//         //     $group: {
//         //         _id: "$vacations.end",
//         //         count: {
//         //             $sum: 1
//         //         }
//         //     }
//         // },
//         // {
//         //     $project: {
//         //         startDate: "$_id",
//         //         count: "$count",
//         //         _id: 0
//         //     }
//         // }
//     ])
//
//         .then(vacationer => {
//             res.status(200).json(vacationer)
//         })
// });

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
                _id: "$_id"
            }
        }

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


module.exports = vacationersRouter