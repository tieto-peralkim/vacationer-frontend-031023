import {useEffect, useState} from "react";

export default function LimitSetter({holidayToEdit, endDate, setAlertingDates, workerLimit, dailyVacationers}) {
    const [average, setAverage] = useState(0)

    useEffect(() => {
        let sumOfVacationers = 0
        for (let i = 0; i < dailyVacationers.length; i++) {
            sumOfVacationers += dailyVacationers[i][1]
        }
        if (dailyVacationers.length !== 0) {
            setAverage(sumOfVacationers / dailyVacationers.length)
        }
    }, [dailyVacationers, endDate])

    useEffect(() => {
        console.log("noi", holidayToEdit, dailyVacationers)
        let tooManyVacationers = []
        for (let i = 0; i < dailyVacationers.length; i++) {
            if (dailyVacationers[i][1] >= workerLimit) {
                tooManyVacationers.push(dailyVacationers[i])
            }
        }
        setAlertingDates(tooManyVacationers)
        console.log("toomany", tooManyVacationers)
    }, [dailyVacationers, workerLimit])

    return (
        <>
            {/*<div>*/}
            {/*    {dailyVacationers && dailyVacationers.map((daily, index) => (*/}
            {/*                <div key={index}>{daily[0]}: {daily[1]} people on holiday</div>*/}
            {/*            )*/}
            {/*        )}*/}
            {/*</div>*/}
            <div>
                Average: {endDate ? Math.round(average * 2) / 2 : "?"} people / day on holiday
            </div>
        </>
    )
}