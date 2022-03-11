import {useEffect, useState} from "react";

export default function VacationerNumber(props) {

    const vacationers = props.vacationers
    const startDate = props.startDate
    const endDate = props.endDate
    const [numberOfVacationers, setNumberOfVacationers] = useState(0);

    useEffect(() => {
        setNumberOfVacationers(0);
        for (let i = 0; i < vacationers.length; i++) {
            console.log(vacationers[i].name);
            checkOverlaps(vacationers[i].vacations);
        }
    }, [vacationers, startDate, endDate]);

    const checkOverlaps = (vacations) => {
        if (startDate !== null && endDate !== null) {
            for (let i = 0; i < vacations.length; i++) {
                // console.log("n",startDate.toISOString() < vacations[i].end);
                // console.log("nn",endDate.toISOString() >= vacations[i].start);

                if (
                    startDate.toISOString() <= vacations[i].end &&
                    endDate.toISOString() >= vacations[i].start
                ) {
                    setNumberOfVacationers((numberOfVacationers) => numberOfVacationers + 1);
                    return;
                }
            }
        }
    };

    return (
        <>{numberOfVacationers}
        </>
    )
}