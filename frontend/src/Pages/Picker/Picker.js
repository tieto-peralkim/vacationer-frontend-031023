import {useEffect, useState} from "react";
import axios from "axios";
import DatePicker, {registerLocale} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./picker.module.css";
import fi from "date-fns/locale/fi";
import {
    Box,
    Button,
    ButtonGroup,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider, MenuItem,
    Modal, Select,
    TextField
} from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';
import VacationerNumber from "../Heat/Components/VacationerNumber";

registerLocale("fi", fi);

export default function Picker() {
    const [initials, setInitials] = useState("");
    const [holidayers, setHolidayers] = useState([]);
    const [dateErrorMessage, setDateErrorMessage] = useState(false);
    const [overlapErrorMessage, setOverlapErrorMessage] = useState(false);

    // startDate is local date at noon UTC (just to set the calendar default)
    const [startDate, setStartDate] = useState(new Date());
    startDate.setUTCHours(12, 0, 0, 0);
    console.log("sd", startDate);
    const [endDate, setEndDate] = useState(null);
    const [openCalendar, setOpenCalendar] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);
    const [holidayToDelete, setHolidayToDelete] = useState(new Date())

    const handleOpenCalendar = () => {
        setOpenCalendar(true);
    };
    const handleCloseCalendar = () => {
        setOpenCalendar(false);
        resetDates();
    };

    const handleOpenAlert = () => {
        setOpenAlert(true);
    };
    const handleCloseAlert = () => {
        setOpenAlert(false);
        resetDates();
    };
    const handleDeletion = () => {
        setHolidays(
            holidays.filter((holiday) =>
                holiday.end !== holidayToDelete
            )
        )
        handleCloseAlert();
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

    const [holidays, setHolidays] = useState([]);
    // const [datepickerHolidays, setDatepickerHolidays] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:3001/vacationers").then((response) => {
            setHolidayers(response.data);
        });
    }, []);


    const createVacation = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const newVacation = {
                initials: initials,
                vacations: holidays,
            };
            console.log("NV", newVacation);

            axios
                .post("http://localhost:3001/vacationers", newVacation)
                .then((response) => console.log(response))
                .catch((error) => {
                    console.error("There was a post error!", error);
                });
            resetDates();
            setHolidays([]);
            setInitials("");
        } else {
            console.log("Not valid, check!");
        }
    };

    const resetDates = () => {
        setStartDate(new Date());
        setEndDate(null);
    }

    const onChange = (dates) => {
        setDateErrorMessage(false);
        setOverlapErrorMessage(false);
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    };

    const initialsError =
        initials === "" || initials.length > 3 || initials.length < 2;

    const validateForm = () => {
        if (initialsError) {
            return false;
        } else if (holidays.length === 0) {
            return false;
        } else {
            return true;
        }
    };

    const calendarDatesOverlap = () => {
        for (let i = 0; i < holidays.length; i++) {
            if (startDate <= holidays[i].start && endDate > holidays[i].end) {
                return true;
            }
        }
        return false
    };

    const validateCalendar = () => {
        if (endDate === null) {
            setDateErrorMessage(true);
            return false;
        } else if (calendarDatesOverlap()) {
            setOverlapErrorMessage(true);
            return false;
        } else {
            return true;
        }
    }

    const addHoliday = () => {
        if (validateCalendar()) {
            let newHoliday = {
                start: startDate,
                end: endDate,
            };
            setHolidays((oldHolidays) => [...oldHolidays, newHoliday]);

            // // Fix for datepicker date exclusion
            // let dayBack = JSON.parse(JSON.stringify(startDate));
            // dayBack = new Date(dayBack);
            //
            // dayBack.setDate(dayBack.getDate() -1)
            // let newDPHoliday = {
            //     start: dayBack,
            //     end: endDate,
            // };
            // setDatepickerHolidays((oldDPHolidays) => [...oldDPHolidays, newDPHoliday]);
            // console.log(newDPHoliday)
            handleCloseCalendar()
            console.log(holidays)
        }
    };


    const deleteHoliday = (end) => {
        setHolidayToDelete(end);
        handleOpenAlert()
    };

    // const searchWithName = (e) => {
    //     for (let i = 0; i < holidayers.length; i++){
    //         if (holidayers[i].initials === e.target.value ){
    //             console.log("löytyyy", holidayers[i].initials)
    //         }
    //     }
    // }


    return (
        <div>
            <h1>Picker</h1>
            <h4>
                Today's {today.toLocaleDateString()}. getDay is {today.getUTCDay()}
            </h4>
            <h4>
                Next week {nextMonday.toISOString()} - {nextSunday.toISOString()}
            </h4>
            On vacation {nextMonday.getUTCDate()}.{nextMonday.getUTCMonth() + 1}.
            {nextMonday.getUTCFullYear()} - {nextSunday.getUTCDate()}.
            {nextSunday.getUTCMonth() + 1}.{nextSunday.getUTCFullYear()}
            : <VacationerNumber vacationers={holidayers} startDate={nextMonday} endDate={nextSunday}/> colleague(s)
            <Divider variant="middle"/>

            <div>
                <form onSubmit={createVacation} className={styles.form}>

                    {/*<Select>*/}
                    {/*    {holidayers.map((holidayer, index) => (*/}
                    {/*        <MenuItem value={holidayer.initials} onChange={(e) => searchWithName(e.target.value)}>{holidayer.initials}</MenuItem>*/}
                    {/*        )*/}
                    {/*    )}*/}
                    {/*        </Select>*/}
                    <TextField
                        className={styles.extraMargin}
                        required
                        label="Your initials"
                        variant="outlined"
                        error={initialsError}
                        value={initials}
                        helperText={initialsError && "Initials must be 2 or 3 characters"}
                        onChange={(e) => setInitials(e.target.value)}
                    />
                    <Button className={styles.extraMargin} variant="contained" color="primary"
                            onClick={handleOpenCalendar}>
                        Add a holiday
                    </Button>
                    <Modal className={styles.modal} open={openCalendar} onClose={handleCloseCalendar}>
                        <Box className={styles.box}>
                            <h3>Chosen dates:<br/>
                                {startDate && <>{startDate.getUTCDate()}.{startDate.getUTCMonth() + 1}.{startDate.getUTCFullYear()}</>}
                                {"  "} - {endDate && <>{endDate.getUTCDate()}.{endDate.getUTCMonth() + 1}.{endDate.getUTCFullYear()}</>}
                            </h3>
                            <h5><VacationerNumber vacationers={holidayers} startDate={startDate} endDate={endDate}/> colleague(s) on holiday too</h5>
                            <DatePicker
                                locale="fi"
                                selected={startDate}
                                onChange={onChange}
                                selectsRange
                                startDate={startDate}
                                excludeDateIntervals={holidays}
                                endDate={endDate}
                                dateFormat="dd.MM.yyyy"
                                calendarStartDay={1}
                                monthsShown={3}
                                showWeekNumbers
                                inline
                            />
                            <Button className={styles.addHoliday} onClick={addHoliday} variant="contained">
                                Add a holiday
                            </Button>
                            <div>{dateErrorMessage && "Choose the end date!"}</div>
                            <div>{overlapErrorMessage && "Dates overlap!"}</div>
                        </Box>
                    </Modal>
                    {holidays.length > 0 && (
                        <div>
                            <div className={styles.holidays}>
                            {holidays.map((holidays, index) => (
                                <ButtonGroup size="large" variant="outlined" key={index}
                                >
                                    <Button className={styles.dates}>
                                        {holidays.start.getUTCDate()}.{holidays.start.getUTCMonth() + 1}.{holidays.start.getUTCFullYear()} -{" "}
                                        {holidays.end.getUTCDate()}.{holidays.end.getUTCMonth() + 1}.{holidays.end.getUTCFullYear()}</Button>
                                    <Button onClick={() => deleteHoliday(holidays.end)}
                                            endIcon={<ClearIcon/>}>Delete</Button>
                                </ButtonGroup>
                            ))}
                            </div>
                        </div>
                    )}
                    <Dialog open={openAlert} onClose={handleCloseAlert}>
                        <DialogTitle>
                            Delete holiday
                        </DialogTitle>
                        <DialogContent>
                            Are you sure you want to delete the holiday?
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseAlert}>No</Button>
                            <Button onClick={handleDeletion}>Yes delete</Button>
                        </DialogActions>
                    </Dialog>
                    <Button className={styles.extraMargin} disabled={holidays.length === 0} type="submit"
                            variant="contained">
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
