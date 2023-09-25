# Vacationer frontend

## Environment setup
1. Clone the repo.
2. Add code formatter Prettier to your IDE: https://prettier.io/docs/en/editors.html
3. Copy /.env.example file to /.env 
4. Run
```
npm install
```

## Run locally:
1. Start the frontend to port 3000 with
```
npm start
```

## Development instructions
* Kanban board with Github issues: https://github.com/orgs/tieto-cem/projects/2/views/1
* When you start working on an issue, mark it on your name and move to "In progress" column in Kanban.
* Git branching strategy is Github Flow: all feature branches are created from and merged to main branch.
* From Github issue select "Create a branch" and "Checkout locally".
* In commit and PR messages, always mark issue number as a prefix, e.g. "56 description".
* Before pushing the feature branch to remote, rebase the feature branch to main branch.
* Push the feature branch to remote feature branch.
* Create a pull request: describe it well and feel free to add screenshots.
* If PR resolves also other issues, mark to comment as "Closes #<issue number>".
* When your PR has been accepted, merge it. Merging will start QA deployment.
* Move resolved issue(s) to "Test on Qa" column in Kanban. If feature branch was created from Github issue, this should happen automatically.
* Test PR change on QA environment.
* If testing is ok, move ticket to "Done" column. If not, move ticket to "In progress" column and add a new commit for PR.
* After completing ticket, inform the team about it. With team members decide when next PROD deployment will be.