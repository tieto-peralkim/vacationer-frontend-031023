# Vacation app frontend

* CRUD operations for vacations
* Holidays calendar with team filtering
* Notifications to Slack of upcoming holidays
* Admin features: CRUD-functions for users and teams

## NOTICE
* No sign-in so don't use full names or real customer names

## Development instructions
*Add one local environmental variable (e.g. by creating .env file to root of the repo): REACT_APP_ADDRESS=http://localhost:3001

*Normal process:
1. Start the frontend with "npm start"
2. (Start the backend with "npm run dev")
3. Go to http://localhost:3000

## TODO:
**Calendar**

* Calendar filtering (all workers/workers on holiday)

**Holiday picker list**

* Filter past holidays by amount/time (eg last 10 holidays)
* How to add/edit old holidays? Do they matter?
* If you edit holiday which is partly in past, it gives wrong error message if new dates are in the past.

**Holiday datepicker**

* Count the average by team

**Admin**

* -

**Stuff to add**

* Personal settings (calendar colors)

