import {useEffect, useState} from "react";
import axios from "axios";
import DatePicker, {registerLocale} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./picker.module.css";
import fi from "date-fns/locale/fi";
import {Box, Button, ListItem, Modal, TextField} from "@mui/material";

registerLocale("fi", fi);

export default function Picker() {
    const [initials, setInitials] = useState("");
    const [holidayers, setHolidayers] = useState([]);
    const [dateErrorMessage, setDateErrorMessage] = useState(false);

    // startDate is local date at noon UTC (just to set the calendar default)
    const [startDate, setStartDate] = useState(new Date());
    startDate.setUTCHours(12, 0, 0, 0);
    console.log("sd", startDate);
    const [endDate, setEndDate] = useState(null);
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
        resetDates();
    };

    const today = new Date();

    //  nexMonday and nextSunday are in UTC time
    const nextMonday = new Date();
    nextMonday.setUTCDate(
        today.getUTCDate() + ((1 + 7 - today.getUTCDay()) % 7 || 7)
    );
    nextMonday.setUTCHours(0, 0, 0, 0);
    const nextSunday = new Date(nextMonday);
    nextSunday.setUTCDate(nextSunday.getUTCDate() + 6);
    nextSunday.setUTCHours(23, 59, 59, 999);

    const [vacationers, setVacationers] = useState(0);
    const [holidays, setHolidays] = useState([]);

    const checkOverlaps = (vacations) => {
        for (let i = 0; i < vacations.length; i++) {
            // console.log(nextMonday.toISOString() < vacations[i].end);
            // console.log(nextSunday.toISOString() >= vacations[i].start);
            // console.log("nääää", nextSunday.toISOString(), vacations[i].start);
            // console.log("onko date", typeof vacations[i].start);
            // console.log("MON", nextMonday.toISOString(), "SUN", nextSunday.toISOString());
            // console.log("today", today.toISOString());

            if (
                nextMonday.toISOString() <= vacations[i].end &&
                nextSunday.toISOString() >= vacations[i].start
            ) {
                console.log("Lomalla", vacations[i].start, "-", vacations[i].end);
                setVacationers((vacationers) => vacationers + 1);
                vacations[i].hasHoliday = true;
                return;
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
            console.log(holidayers[i].initials);
            checkOverlaps(holidayers[i].vacations);
        }
    }, [holidayers]);

    const createVacation = (e) => {
        e.preventDefault();
        if (!initialsError) {
            const newVacation = {
                initials: initials,
                vacations: holidays,
            };
            console.log("NV", newVacation);
            console.log("NV", startDate instanceof Date);

            axios
                .post("http://localhost:3001/vacationers", newVacation)
                .then((response) => console.log(response))
                .catch((error) => {
                    console.error("There was a post error!", error);
                });
            resetForm();
            setInitials("");
        } else {
            console.log("Not valid, check!");
        }
    };

    const resetDates = () => {
        setStartDate(new Date());
        setEndDate(null);
    }


    const resetForm = () => {
        setStartDate(new Date());
        setEndDate(null);
        setHolidays([]);
    };

    const onChange = (dates) => {
        setDateErrorMessage(false);
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    };

    const initialsError =
        initials === "" || initials.length > 3 || initials.length < 2;

    const validateForm = () => {
        if (endDate !== null) {
            return true;
        } else {
            setDateErrorMessage(true);
            return false;
        }
    };

    const addHoliday = () => {
        if (validateForm()) {
            let newHoliday = {
                start: startDate,
                end: endDate,
            };
            setHolidays((oldHolidays) => [...oldHolidays, newHoliday]);
            handleClose()
        }
    };

    return (
        <div>
            <h1>Picker</h1>
            <h3>
                Today's {today.toLocaleDateString()}. getDay is {today.getUTCDay()}
            </h3>
            <h3>
                Next week {nextMonday.toISOString()} - {nextSunday.toISOString()}
            </h3>
            <h2>Next week {vacationers} employees on vacation!</h2>

            <div>
                <h4>Add vacation</h4>
                <form onSubmit={createVacation}>
                    <TextField
                        required
                        label="Your initials"
                        variant="outlined"
                        error={initialsError}
                        value={initials}
                        helperText={initialsError && "Initials must be 2 or 3 characters"}
                        onChange={(e) => setInitials(e.target.value)}
                    />

                    <Button variant="contained" color="primary" onClick={handleOpen}>
                        Add a vacation
                    </Button>
                    <Modal className={styles.modal} open={open} onClose={handleClose}>
                        <Box className={styles.box}>
                            <h3>{startDate && <>{startDate.getUTCDate()}.{startDate.getUTCMonth() + 1}.{startDate.getUTCFullYear()}</>}
                                {"  "} -  {endDate && <>{endDate.getUTCDate()}.{endDate.getUTCMonth() + 1}.{endDate.getUTCFullYear()}</>}</h3>
                            <DatePicker
                                locale="fi"
                                className={styles.datePicker}
                                selected={startDate}
                                onChange={onChange}
                                selectsRange
                                startDate={startDate}
                                endDate={endDate}
                                dateFormat="dd.MM.yyyy"
                                calendarStartDay={1}
                                showWeekNumbers
                                inline
                            />
                            <Button onClick={addHoliday} variant="contained">
                                Save one holiday
                            </Button>
                            {dateErrorMessage && "Choose the end date!"}
                        </Box>
                    </Modal>
                    {holidays.length > 0 && (
                        <div>
                            The holiday periods:
                            {holidays.map((holidays, index) => (
                                <ListItem className={styles.ListItem} key={index}>
                                    {holidays.start.toISOString()} -{" "}
                                    {holidays.end.toISOString()}
                                </ListItem>
                            ))}
                        </div>
                    )}
                    <Button type="submit" variant="contained">
                        Save
                    </Button>
                </form>
            </div>
            <div>
                <ul>
                    {holidayers.map((holidayer) => (
                        <li key={holidayer.id}>
                            {holidayer.initials ? (
                                <b>{holidayer.initials}</b>
                            ) : (
                                <b>No name</b>
                            )}
                            <ul>
                                {holidayer.vacations.map((vacations, index) => (
                                    <li
                                        key={index}
                                        className={vacations.hasHoliday ? styles.redText : ""}
                                    >
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
