const teamsRouter = require('express').Router()
const Team = require('../models/team');

teamsRouter.get('/teams', (req, res, next) => {
    Team.find({})
        .then(team => {
            res.status(200).json(team)
        })
        .catch(error => next(error))
})

teamsRouter.post('/teams', (req, res, next) => {
    const body = req.body
    console.log("body", body)
    const TeamObject = new Team(body)
    TeamObject.save()
        .then(savedTeam => {
            res.status(201).json(savedTeam)
        })
        .catch(error => next(error))
})

teamsRouter.get('/teams/:id', (req, res, next) => {
    Team.findById(req.params.id)
        .then(foundTeam => {
            res.status(200).json(foundTeam)
        })
        .catch(error => next(error))
})

// Receives Vacationer to add to team
teamsRouter.put('/teams/:id', (req, res, next) => {
    const teamId = req.params.id;
    const newMember = {name: req.body.name, vacationerId: req.body.id};

    console.log("Adding newMember:", newMember, " ", " to ->", teamId);

    Team.findByIdAndUpdate(
        teamId, {$push: {members: newMember}}, {new: true, runValidators: true, context: 'query'})
        .then(updatedTeam => {
            res.status(200).json(updatedTeam)
        })
        .catch(error => next(error))

})

teamsRouter.patch('/teams/:id', (req, res, next) => {
    const teamId = req.params.id;
    const newName = req.body.newName;

    console.log("Changing team:", teamId, " ", "name to", newName);

    Team.findByIdAndUpdate(
        teamId, {$set: {title: newName}}, {new: true, runValidators: true, context: 'query'})
        .then(updatedTeam => {
            res.status(200).json(updatedTeam)
        })
        .catch(error => next(error))

})

teamsRouter.put('/teams/members/:id', (req, res, next) => {
    const teamId = req.params.id;
    const memberId = req.body.vacationerId;
    console.log("IDs", teamId, memberId)
    Team.updateOne({_id: teamId}, {
        $pull: {
            members: {vacationerId: memberId}
        }
    })
        .then(updatedTeam => {
            res.status(200).json(updatedTeam)
        })
        .catch(error => next(error))

})

teamsRouter.delete('/teams/:id', (req, res, next) => {
    Team.findByIdAndRemove(req.params.id)
        .then(deletedTeam => {
            res.status(200).json(deletedTeam)
        })
        .catch(error => next(error))

})

module.exports = teamsRouter