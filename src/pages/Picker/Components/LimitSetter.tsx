import React, { useEffect, useState } from "react";
import styles from "../picker.module.css";
import PropTypes from "prop-types";

function LimitSetter({
    endDate,
    setAlertingDates,
    workerLimit,
    dailyVacationers,
}) {
    const [average, setAverage] = useState(0);

    // voiko endDaten poistaa riippuvuuksista?
    useEffect(() => {
        let sumOfVacationers = 0;
        for (let i = 0; i < dailyVacationers.length; i++) {
            sumOfVacationers += dailyVacationers[i][1];
        }
        if (dailyVacationers.length !== 0) {
            setAverage(
                Math.round((sumOfVacationers / dailyVacationers.length) * 2) / 2
            );
        }
    }, [dailyVacationers, endDate]);

    useEffect(() => {
        const tooManyVacationers = [];
        for (let i = 0; i < dailyVacationers.length; i++) {
            if (dailyVacationers[i][1] >= workerLimit) {
                tooManyVacationers.push(dailyVacationers[i]);
            }
        }
        setAlertingDates(tooManyVacationers);
    }, [dailyVacationers, workerLimit]);

    return (
        <>
            {/*<div>*/}
            {/*    {dailyVacationers && dailyVacationers.map((daily, index) => (*/}
            {/*                <div key={index}>{daily[0]}: {daily[1]} people on holiday</div>*/}
            {/*            )*/}
            {/*        )}*/}
            {/*</div>*/}
            <div className={styles.averageText}>
                Average:{" "}
                <b className={styles.averageNumber}>
                    {endDate ? average : "?"}
                </b>{" "}
                people / day on holiday
            </div>
        </>
    );
}

LimitSetter.propTypes = {
    endDate: PropTypes.object,
    setAlertingDates: PropTypes.func,
    workerLimit: PropTypes.number,
    dailyVacationers: PropTypes.array,
};
export default LimitSetter;
