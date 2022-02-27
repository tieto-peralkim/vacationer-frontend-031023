import {useEffect, useState} from "react";
import axios from "axios";
import DatePicker, {registerLocale} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./picker.module.css";
import fi from "date-fns/locale/fi";
import {Button, TextField} from "@mui/material";

registerLocale("fi", fi);

export default function Picker() {
    const [initials, setInitials] = useState("");
    const [holidayers, setHolidayers] = useState([]);
    const [dateErrorMessage, setDateErrorMessage] = useState(false)

    // startDate is local date at noon UTC (just to set the calendar default)
    const [startDate, setStartDate] = useState(new Date());
    startDate.setUTCHours(12, 0, 0, 0);
    console.log("sd", startDate)
    const [endDate, setEndDate] = useState(null);

    const today = new Date();

    //  nexMonday and nextSunday are in UTC time
    const nextMonday = new Date();
    nextMonday.setUTCDate(
        today.getUTCDate() + ((1 + 7 - today.getUTCDay()) % 7 || 7)
    );
    nextMonday.setUTCHours(0, 0, 0, 0);
    const nextSunday = new Date();
    nextSunday.setUTCDate(nextMonday.getUTCDate() + 6);
    nextSunday.setUTCHours(23, 59, 59, 999);

    const [vacationers, setVacationers] = useState(0);

    const checkOverlaps = (vacations) => {
        for (let i = 0; i < vacations.length; i++) {
            console.log(nextMonday.toISOString() < vacations[i].end);
            console.log(nextSunday.toISOString() >= vacations[i].start);
            console.log(vacations[i].start);
            console.log("onko date", typeof vacations[i].start);
            // console.log("MON", nextMonday.toISOString(), "SUN", nextSunday.toISOString());
            console.log("today", today.toISOString());

            if (
                nextMonday.toISOString() <= vacations[i].end &&
                nextSunday.toISOString() >= vacations[i].start
            ) {
                console.log("Lomalla", vacations[i].start, "-", vacations[i].end);
                setVacationers((vacationers) => vacationers + 1);
                vacations[i].hasHoliday = true;
                return;
            } else {
                // console.log("Loma ei ensi viikolla:", new Date(Date.parse(vacations[i].start)).toLocaleDateString(), "-", new Date(Date.parse(vacations[i].end)).toLocaleDateString());
            }
        }
    };

    useEffect(() => {
        axios.get("http://localhost:3001/vacationers").then((response) => {
            setHolidayers(response.data);
        });
    }, []);

    useEffect(() => {
        for (let i = 0; i < holidayers.length; i++) {
            checkOverlaps(holidayers[i].vacations);
        }
    }, [holidayers]);

    const createVacation = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const newVacation = {
                initials: initials,
                vacations: [
                    {
                        start: startDate,
                        end: endDate,
                    },
                ],
            };
            console.log("NV", newVacation);
            console.log("NV", startDate instanceof Date);

            axios
                .post("http://localhost:3001/vacationers", newVacation)
                .then((response) => console.log(response))
                .catch((error) => {
                    console.error("There was a post error!", error);
                });
        }
        else {
            console.log("Not valid, check!")
        }
    };

    const onChange = (dates) => {
        setDateErrorMessage(false);
        const [start, end] = dates;
        setStartDate(start)
        setEndDate(end);
    };
    const error = initials === "" || initials.length > 3 || initials.length < 2;

    function validateForm() {
        let initialsLengthOK = false;
        let endDateOK = false;
        if (initials.length < 4 && initials.length > 1) {
            initialsLengthOK = true;
        }
        if (endDate !== null) {
            endDateOK = true;
        } else {
            setDateErrorMessage(true);
        }
        if (initialsLengthOK && endDateOK){
            return true;
        } else {
            return false;
        }
    }

    return (
        <div>
            <h1>Picker</h1>
            <h3>
                Today's {today.toLocaleDateString()}. getDay is {today.getUTCDay()}
            </h3>
            <h3>
                Next week {nextMonday.toISOString()} - {nextSunday.toISOString()}
            </h3>
            <h2> {vacationers === 0 ? `Loading` : `Next week  ${vacationers} employees on vacation!`}</h2>

            <div>
                <h4>Add vacation</h4>
                <form onSubmit={createVacation}>
                    <TextField required label="Your initials" variant="outlined" error={error}
                               helperText={error && "Initials must be 2 or 3 characters"}
                               onChange={(e) => setInitials(e.target.value)}/>
                    <div>First day of the holiday: {startDate && startDate.toISOString()}</div>
                    <div>Last day of the holiday: {endDate && endDate.toISOString()} </div>

                    <DatePicker
                        locale="fi"
                        className={styles.datePicker}
                        selected={startDate}
                        onChange={onChange}
                        selectsRange
                        startDate={startDate}
                        endDate={endDate}
                        inline
                        calendarStartDay={1}
                        showWeekNumbers
                    />
                    <Button type="submit" variant="contained">Save</Button>
                    {dateErrorMessage && "Choose the end date!"}
                </form>
            </div>
            <div>
                <ul>
                    {holidayers.map((holidayer) => (
                        <li key={holidayer.id}>
                            {holidayer.initials ? <b>{holidayer.initials}</b> : <b>No name</b>}
                            <ul>
                                {holidayer.vacations.map((vacations, index) => (
                                    <li key={index} className={vacations.hasHoliday ? styles.redText : ''}>
                                        {vacations.start} - {vacations.end}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
