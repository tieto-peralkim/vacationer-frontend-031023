# Vacationer frontend
UI example 1 front page:
![Untitled](https://github.com/user-attachments/assets/247ace3d-b3ff-4b0c-a6d4-db75d37a64b3)
UI example 2 adding a holiday:
![Untitled2](https://github.com/user-attachments/assets/c6ff72fa-f06f-4257-bdd7-0f63d2b86ba6)

## Overview
- Vacationer is work holiday pre-planning tool. The application serves as a planning, monitoring and coordinating tool for staff holidays.

- Monthly calendar view of holidays, includes filtering of all users / only users with holidays.

- CRUD operations for vacations, users, teams. Recoverable deletion for users and teams.

- Workers can be added to customer or project teams which can be used as a filter in holiday calendar.

- Anyone can create teams. Only team members can edit and delete team

- Sends weekly Slack notifications of workers who are on vacation on the following weeks. Example messages:
Slack message example 1, public holidays and one user on holiday:
<img width="337" alt="Screenshot 2025-06-13 at 16 48 35" src="https://github.com/user-attachments/assets/bd790a83-9eae-42f4-80d5-6b2c6db655d4" />
Slack message example 2, multiple users on holiday.
<img width="1200" alt="Screenshot 2025-06-13 at 16 49 16" src="https://github.com/user-attachments/assets/dd4b28d3-9947-4b53-82fb-e2fd9fedea8e" />

- Calendar settings for user (colors, holiday symbols with “short” emojis accepted).

- Admin features:  add users, edit admin rights for users, delete users and teams from database, send Slack test messages, edit all teams

## Environment setup
1. Clone the repo.
2. Add code formatter Prettier to your IDE: https://prettier.io/docs/en/editors.html
3. Copy /.env.example file to /.env 
4. Run
```
npm install
```

### Run locally:
1. Start the frontend to port 3000 with
```
npm start
```

### Development instructions
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
