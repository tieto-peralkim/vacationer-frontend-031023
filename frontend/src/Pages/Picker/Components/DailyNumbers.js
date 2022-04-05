import {useEffect, useState} from "react";

export default function DailyNumbers({ setAlertingDates, workerLimit, dailyVacationers}) {
    const [average, setAverage] = useState(0)

    useEffect(() => {
        let sumOfVacationers = 0
        for (let i = 0; i < dailyVacationers.length; i++) {
            sumOfVacationers += dailyVacationers[i][1]
        }
        setAverage(sumOfVacationers / dailyVacationers.length)
    }, [dailyVacationers])

    useEffect(() => {
        let tooManyVacationers = []
        for (let i = 0; i < dailyVacationers.length; i++) {
            if (dailyVacationers[i][1] >= workerLimit) {
                tooManyVacationers.push(dailyVacationers[i])
            }
        }
        setAlertingDates(tooManyVacationers)
    }, [dailyVacationers, workerLimit])

    return (
        <>
            {/*<div>*/}
            {/*    {props.dailyVacationers.map((daily, index) => (*/}
            {/*                <div key={index}>{daily[0].toLocaleDateString()}: {daily[1]} people on holiday</div>*/}
            {/*            )*/}
            {/*        )}*/}
            {/*</div>*/}
            <div>
                Average: {!isNaN(average) && Math.round(average * 2) / 2} people per day
            </div>
        </>
    )
}