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
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Modal,
    Select,
    Slider,
    TextField
} from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';
import VacationerNumber from "../Heat/Components/VacationerNumber";
import Apitester from "./Components/Apitester";
import Typography from "@mui/material/Typography";

registerLocale("fi", fi);

export default function Picker() {

    //  Dates are in UTC time
    const today = new Date();
    const thisYear = today.getUTCFullYear()
    today.setUTCHours(0, 0, 0)

    const nextMonday = new Date();
    nextMonday.setUTCDate(
        today.getUTCDate() + ((1 + 7 - today.getUTCDay()) % 7 || 7)
    );
    nextMonday.setUTCHours(0, 0, 0, 0);
    const nextSunday = new Date(nextMonday);
    nextSunday.setUTCDate(nextSunday.getUTCDate() + 6);
    nextSunday.setUTCHours(23, 59, 59, 999);
    const [startDate, setStartDate] = useState(new Date());
    startDate.setUTCHours(12, 0, 0, 0);
    const [endDate, setEndDate] = useState(null);

    const [comment, setComment] = useState("");
    const [annualAmount, setAnnualAmount] = useState(20);
    const [vacationers, setVacationers] = useState([]);
    const [dateErrorMessage, setDateErrorMessage] = useState(false);
    const [overlapErrorMessage, setOverlapErrorMessage] = useState(false);
    const [showAllVacations, setShowAllVacations] = useState(false);

    const [openCalendar, setOpenCalendar] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);

    const [idToEdit, setIdToEdit] = useState()
    const [idToDelete, setIdToDelete] = useState()

    // Represent that a user has been chosen, does not change
    const [chosenVacationer, setChosenVacationer] = useState("")
    const [editingSpace, setEditingSpace] = useState(false);

    // Represents the holidays which can change
    const [holidays, setHolidays] = useState([]);
    const [dayAmount, setDayAmount] = useState(0);

    const [holidaySeason, setHolidaySeason] = useState(2022);

    // const [datepickerHolidays, setDatepickerHolidays] = useState([]);

    const handleOpenCalendar = () => {
        setOpenCalendar(true);
    };
    const handleCloseCalendar = () => {
        setOpenCalendar(false);
        setEditingSpace(false);
        setDateErrorMessage(false);
        setOverlapErrorMessage(false);
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
        setHolidays((holidays) =>
            holidays.filter((holidays) => holidays.id !== idToDelete)
        )
        handleCloseAlert();
    };


    useEffect(() => {
        axios
            .get("http://localhost:3001/vacationers")
            .then((response) => {
                setVacationers(response.data);
            })
            .catch((error) => {
                console.log("There was a get error!", error)
            });
    }, []);

    useEffect(() => {
        let amountOfDays = 0
        for (let i = 0; i < holidays.length; i++) {
            amountOfDays += daysInDateRange(holidays[i].start, holidays[i].end)
        }
        setDayAmount(amountOfDays);
    }, [holidays]);

    const updateVacation = (e) => {
        e.preventDefault();
        if (chosenVacationer !== "") {
            const newVacation = {
                name: chosenVacationer.name,
                vacations: holidays,
            };
            console.log("NV", newVacation);

            axios
                .put(`http://localhost:3001/vacationers/${chosenVacationer.id}`, newVacation)
                .then((response) => console.log(response))
                .catch((error) => {
                    console.error("There was a put error!", error);
                });
            resetDates();
            setHolidays([]);
            setChosenVacationer("")
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


    const calendarDatesOverlap = () => {
        for (let i = 0; i < holidays.length; i++) {
            if (startDate <= holidays[i].start && endDate >= holidays[i].end) {
                return true;
            }
        }
        return false
    };

    const validateCalendar = () => {
        if (endDate === null) {
            setDateErrorMessage(true);
            return false;
        } else if (!editingSpace && calendarDatesOverlap()) {
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
                comment: comment,
                id: Math.random().toString(16).slice(2)
            };
            if (newHoliday.start >= today || newHoliday.end >= today) {
                newHoliday.upcoming = true;
            } else {
                newHoliday.upcoming = false;
            }
            console.log("NHD", newHoliday)
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
        }
    }

    const addHolidayEditSpace = () => {
        if (validateCalendar()) {
            let editedHoliday = {
                start: startDate,
                end: endDate,
                comment: comment,
                id: idToEdit
            };
            console.log("ajat on", editedHoliday.start, editedHoliday.end);
            if (editedHoliday.start >= today || editedHoliday.end >= today) {
                editedHoliday.upcoming = true;
            } else {
                editedHoliday.upcoming = false;
            }
            let vacationIndex = holidays.findIndex((holiday) => holiday.id === idToEdit)
            console.log("YYY", holidays[vacationIndex], editedHoliday)
            let holidaysCopy = [...holidays]
            holidaysCopy[vacationIndex] = editedHoliday
            setHolidays(holidaysCopy)
            handleCloseCalendar()
        }
    };


    const deleteHoliday = (id) => {
        setIdToDelete(id);
        console.log("id", id)
        handleOpenAlert()
    };

    const editHoliday = (id) => {
        let editedItem = 0
        for (let i = 0; i < holidays.length; i++) {
            if (id === holidays[i].id) {
                editedItem = holidays[i]
            }
        }
        console.log("editedItem", editedItem)
        setComment(editedItem.comment)
        setStartDate(editedItem.start)
        setEndDate(editedItem.end)
        setIdToEdit(id)
        setOpenCalendar(true)
        setEditingSpace(true)
        console.log("CVVVV", chosenVacationer)
    }

    const setExcludedDates = (vacations) => {
        let pureVacations = [];
        for (let i = 0; i < vacations.length; i++) {
            let holidayObject = new Object()
            holidayObject.start = new Date(vacations[i].start)
            holidayObject.end = new Date(vacations[i].end)
            holidayObject.comment = vacations[i].comment
            holidayObject.id = vacations[i]._id
            if (holidayObject.start >= today || holidayObject.end >= today) {
                holidayObject.upcoming = true;
            } else {
                holidayObject.upcoming = false;
            }
            pureVacations.push(holidayObject);
        }
        setHolidays(pureVacations)
        console.log("PV", pureVacations)
    }

    const calculateUpcomingHolidays = () => {
        let numberOfUpcomingHolidays = 0;
        let numberOfDays = 0;
        for (let i = 0; i < holidays.length; i++) {
            if (holidays[i].upcoming) {
                numberOfUpcomingHolidays++
                numberOfDays += daysInDateRange(holidays[i].start, holidays[i].end)
            }
        }
        return [numberOfUpcomingHolidays, numberOfDays];
    }

    const selectVacationer = (name) => {
        console.log("vacationers", vacationers)
        for (let i = 0; i < vacationers.length; i++) {
            if (vacationers[i].name === name) {
                setChosenVacationer(vacationers[i])
                console.log("vvv", vacationers[i].vacations)
                setExcludedDates(vacationers[i].vacations)
            }
        }
    };

    const daysInDateRange = (firstDate, secondDate) => {
        console.log(firstDate, secondDate)
        let millisecondsDay = 24 * 60 * 60 * 1000;
        let daysInRange = Math.round(Math.abs((firstDate - secondDate) / millisecondsDay)) + 1;
        return daysInRange;
    }


    return (
        <div>
            <h1>Picker</h1>
            {/*<h4>*/}
            {/*    Today's {today.toLocaleDateString()}. getDay is {today.getUTCDay()}*/}
            {/*</h4>*/}
            {/*<h4>*/}
            {/*    Next week {nextMonday.toISOString()} - {nextSunday.toISOString()}*/}
            {/*</h4>*/}

            <Divider/>
            On vacation {nextMonday.getUTCDate()}.{nextMonday.getUTCMonth() + 1}.
            {nextMonday.getUTCFullYear()} - {nextSunday.getUTCDate()}.
            {nextSunday.getUTCMonth() + 1}.{nextSunday.getUTCFullYear()}
            : <Apitester start={nextMonday.toISOString()} end={nextSunday.toISOString()}/> colleague(s)
            <Divider/>
            <br/>
            <div>
                <form onSubmit={updateVacation} className={styles.form}>
                    <FormControl fullWidth>
                        <InputLabel>Choose your name</InputLabel>
                        <Select value={chosenVacationer ? chosenVacationer.name : ""}
                                onChange={e => selectVacationer(e.target.value)}>
                            {vacationers.map((h) => (
                                    <MenuItem key={h.id} value={h.name}>{h.name}</MenuItem>
                                )
                            )}

                        </Select>
                    </FormControl>
                    <Typography>
                        Holiday season (accrued 1.4.{holidaySeason - 1} - 31.3.{holidaySeason})
                    </Typography>
                    <Select value={holidaySeason} onChange={e => setHolidaySeason(e.target.value)}>
                        <MenuItem key={thisYear + 1} value={thisYear + 1}>{thisYear + 1}</MenuItem>
                        <MenuItem key={thisYear} value={thisYear}>{thisYear}</MenuItem>
                        <MenuItem key={thisYear - 1} value={thisYear - 1}>{thisYear - 1}</MenuItem>
                    </Select>
                    <Box className={styles.sliderBox}>
                        <Typography>
                            Holidays in season <b>{annualAmount}</b>
                        </Typography>
                        <Slider
                            className={styles.slider}
                            value={annualAmount}
                            min={0}
                            max={50}
                            onChange={(e) => setAnnualAmount(e.target.value)}
                        />
                    </Box>
                    {chosenVacationer &&
                        <>
                            YOU ARE {chosenVacationer.name}<br/>
                            FOUND {holidays.length} HOLIDAYS ({dayAmount} DAYS)
                            OF WHICH {calculateUpcomingHolidays()[0]} ({calculateUpcomingHolidays()[1]} DAYS) ARE STILL
                            COMING<br/>
                            HOLIDAYS LEFT {annualAmount - dayAmount}
                        </>}
                    <Button className={styles.extraMargin} variant="contained" color="primary" disabled={!chosenVacationer}
                            onClick={handleOpenCalendar}>
                        Add a holiday
                    </Button>
                    <Modal className={styles.modal} open={openCalendar} onClose={handleCloseCalendar}>
                        <Box className={styles.box}>
                            <h3>Chosen dates:<br/>
                                {startDate && <>{startDate.getUTCDate()}.{startDate.getUTCMonth() + 1}.{startDate.getUTCFullYear()}</>}
                                {"  "} - {endDate && <>{endDate.getUTCDate()}.{endDate.getUTCMonth() + 1}.{endDate.getUTCFullYear()}</>}
                                {endDate && <div>{daysInDateRange(startDate, endDate)} days</div>}
                            </h3>
                            <h5><VacationerNumber vacationers={vacationers} startDate={startDate}
                                                  endDate={endDate}/> colleague(s) on holiday too</h5>
                            {/*<h6><Apitester start={startDate} end={endDate}/> APIn mukaan lomalla</h6>*/}
                            {editingSpace ? <DatePicker
                                    locale="en"
                                    selected={startDate}
                                    onChange={onChange}
                                    selectsRange
                                    startDate={startDate}
                                    endDate={endDate}
                                    minDate={today}
                                    dateFormat="dd.MM.yyyy"
                                    calendarStartDay={1}
                                    showWeekNumbers
                                    disabledKeyboardNavigation
                                    inline
                                /> :
                                <DatePicker
                                    locale="en"
                                    selected={startDate}
                                    onChange={onChange}
                                    selectsRange
                                    excludeDateIntervals={holidays}
                                    startDate={startDate}
                                    endDate={endDate}
                                    minDate={today}
                                    dateFormat="dd.MM.yyyy"
                                    calendarStartDay={1}
                                    showWeekNumbers
                                    disabledKeyboardNavigation
                                    inline
                                />}
                            <TextField className={styles.extraMargin}
                                       label="Comment about the holiday"
                                       variant="outlined"
                                       value={comment}
                                       onChange={(e) => setComment(e.target.value)}/>
                            {editingSpace ?
                                <Button className={styles.addHoliday} onClick={addHolidayEditSpace} variant="contained">
                                    Edit a holiday
                                </Button> :
                                <Button className={styles.addHoliday} onClick={addHoliday} variant="contained">
                                    Add a holiday
                                </Button>}
                            <div>{dateErrorMessage && "Choose the end date!"}</div>
                            <div>{overlapErrorMessage && "Dates overlap!"}</div>
                        </Box>
                    </Modal>
                    {holidays.length > 0 && (
                        <div>
                            <div className={styles.holidays}>
                                {showAllVacations === false &&
                                    holidays.filter(holiday => holiday.upcoming)
                                        .sort((v1, v2) => v1.start - v2.start)
                                        .map((holidays) => (
                                            <ButtonGroup size="large" variant="outlined" key={holidays.id}
                                            >
                                                <Button onClick={() => editHoliday(holidays.id)}
                                                        className={styles.dates}>
                                                    {new Date(holidays.start).getUTCDate()}.{new Date(holidays.start).getUTCMonth() + 1}.{new Date(holidays.start).getUTCFullYear()} -{" "}
                                                    {new Date(holidays.end).getUTCDate()}.{new Date(holidays.end).getUTCMonth() + 1}.{new Date(holidays.end).getUTCFullYear()}
                                                    {" "} ({daysInDateRange(holidays.start, holidays.end)} days)
                                                </Button>
                                                <Button onClick={() => deleteHoliday(holidays.id)}
                                                        endIcon={<ClearIcon/>}>Delete</Button>
                                            </ButtonGroup>
                                        ))
                                }
                                {showAllVacations === true &&
                                    holidays
                                        .sort((v1, v2) => v1.start - v2.start)
                                        .map((holidays, index) => (
                                            <ButtonGroup size="large" variant="outlined" key={holidays.id}
                                            >
                                                <Button onClick={() => editHoliday(holidays.id)}
                                                        color={holidays.upcoming ? "primary" : "secondary"}
                                                        className={styles.dates} disabled={!holidays.upcoming}>
                                                    {new Date(holidays.start).getUTCDate()}.{new Date(holidays.start).getUTCMonth() + 1}.{new Date(holidays.start).getUTCFullYear()} -{" "}
                                                    {new Date(holidays.end).getUTCDate()}.{new Date(holidays.end).getUTCMonth() + 1}.{new Date(holidays.end).getUTCFullYear()}
                                                    {" "} ({daysInDateRange(holidays.start, holidays.end)} days)
                                                </Button>
                                                <Button onClick={() => deleteHoliday(holidays.id)}
                                                        color={holidays.upcoming ? "primary" : "secondary"}
                                                        disabled={!holidays.upcoming}
                                                        endIcon={<ClearIcon/>}>Delete</Button>
                                            </ButtonGroup>
                                        ))
                                }
                            </div>
                        </div>
                    )}
                    {chosenVacationer !== "" && holidays.length === 0 && <p>No vacations...</p>}
                    {!showAllVacations && chosenVacationer !== "" && holidays.length !== 0 && calculateUpcomingHolidays()[0] !== holidays.length &&
                        <Button onClick={() => setShowAllVacations(true)}>Show old vacations</Button>}
                    {showAllVacations && chosenVacationer !== "" && holidays.length !== 0 && calculateUpcomingHolidays()[0] !== holidays.length &&
                        <Button onClick={() => setShowAllVacations(false)}>Hide old vacations</Button>}
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
                    <Button className={styles.extraMargin} type="submit"
                            variant="contained">
                        Save
                    </Button>
                </form>
            </div>
            {/*<div>*/}
            {/*    <ul>*/}
            {/*        {vacationers.map((holidayer) => (*/}
            {/*            <li key={holidayer.id}>*/}
            {/*                {holidayer.name ? (*/}
            {/*                    <b>{holidayer.name}</b>*/}
            {/*                ) : (*/}
            {/*                    <b>No name</b>*/}
            {/*                )}*/}
            {/*                <ul>*/}
            {/*                    {holidayer.vacations.map((vacations, index) => (*/}
            {/*                        <li*/}
            {/*                            key={index}*/}
            {/*                        >*/}
            {/*                            {vacations.start} - {vacations.end}*/}
            {/*                        </li>*/}
            {/*                    ))}*/}
            {/*                </ul>*/}
            {/*            </li>*/}
            {/*        ))}*/}
            {/*    </ul>*/}
            {/*</div>*/}
        </div>
    )
        ;
}
