const fetchVacationData = require("../mongo.js");

// Creates the array of dates with vacationer numbers
//https://dev.to/ashikpaul42/how-to-count-occurrences-of-dates-in-an-array-of-date-ranges-javascript-kjo
async function handleVacationData(start, end) {
    const databaseData = await fetchVacationData(start, end)
    console.log("data", databaseData)

    let allVacations = []

    for (let i = 0; i < databaseData.length; i++) {
        let vacationObject = {}
        vacationObject["start"] = new Date(databaseData[i].vacations.start)
        vacationObject["end"] = new Date(databaseData[i].vacations.end)
        allVacations.push(vacationObject)
    }
    console.log("DR", allVacations)

    let earlyDate = new Date(start)
    let lateDate = new Date(end)

    let result = []
    while (earlyDate <= lateDate) {
        let count = 0;
        allVacations.forEach(
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
        result.push(dateObject)
        earlyDate.setDate(earlyDate.getDate() + 1)
    }
    return result;
}

module.exports = handleVacationData