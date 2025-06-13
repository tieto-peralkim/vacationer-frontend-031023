# Vacationer frontend
UI example 1, front page:
![Untitled](https://github.com/user-attachments/assets/247ace3d-b3ff-4b0c-a6d4-db75d37a64b3)

UI example 2, viewing own holidays:

![Untitled2](https://github.com/user-attachments/assets/c6ff72fa-f06f-4257-bdd7-0f63d2b86ba6)
UI example 3 and 4, popup window for adding holiday and its dates:

![Screenshot 2025-06-13 at 16 55 57](https://github.com/user-attachments/assets/6626a3dc-7104-4595-80d3-1512dc7565e2)
![Screenshot 2025-06-13 at 16 55 18](https://github.com/user-attachments/assets/03cc30c8-6c5a-4665-953a-d471cbab6100)

## Overview
- Vacationer is work holiday pre-planning tool. The application serves as a planning, monitoring and coordinating tool for staff holidays.

- Monthly calendar view of holidays, includes filtering of all users / only users with holidays.

- CRUD operations for vacations, users, teams. Recoverable deletion for users and teams.

- Workers can be added to customer or project teams which can be used as a filter in holiday calendar.

- Anyone can create teams. Only team members can edit and delete team

- Sends weekly Slack notifications of workers who are on vacation on the following weeks. Example messages:

  - Slack message example 1, public holidays and one user on holiday:<br><img width="337" alt="Screenshot 2025-06-13 at 16 48 35" src="https://github.com/user-attachments/assets/bd790a83-9eae-42f4-80d5-6b2c6db655d4" />

  - Slack message example 2, multiple users on holiday.<br><img width="1200" alt="Screenshot 2025-06-13 at 16 49 16" src="https://github.com/user-attachments/assets/dd4b28d3-9947-4b53-82fb-e2fd9fedea8e" />

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
