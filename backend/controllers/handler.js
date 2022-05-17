const fetchVacationsBetween = require("../mongo.js");

// Creates the array of dates with vacationer numbers
//https://dev.to/ashikpaul42/how-to-count-occurrences-of-dates-in-an-array-of-date-ranges-javascript-kjo
async function handleVacationData(start, end) {
    const holidaysBetweenDates = await fetchVacationsBetween(start, end)
    console.log("data", holidaysBetweenDates)

    let holidayTimes = []

    for (let i = 0; i < holidaysBetweenDates.length; i++) {
        let vacationObject = {}
        vacationObject["start"] = new Date(holidaysBetweenDates[i].vacations.start)
        vacationObject["end"] = new Date(holidaysBetweenDates[i].vacations.end)
        holidayTimes.push(vacationObject)
    }
    console.log("DR", holidayTimes)

    let earlyDate = new Date(start)
    let lateDate = new Date(end)

    let arrayOfDates = []
    while (earlyDate <= lateDate) {
        let count = 0
        holidayTimes.forEach(
            function (range) {
                console.log("onko ", earlyDate, " aikavälillä ", range.start, " - ", range.end, "? ", earlyDate >= range.start && earlyDate <= range.end)
                if (earlyDate >= range.start && earlyDate <= range.end) {
                    count++
                }
            }
        )
        let dateObject = []
        dateObject[0] = new Date(JSON.parse(JSON.stringify(earlyDate)))
        dateObject[1] = count
        console.log("Objekti", dateObject)
        arrayOfDates.push(dateObject)
        earlyDate.setDate(earlyDate.getDate() + 1)
    }
    return arrayOfDates;
}

module.exports = handleVacationData