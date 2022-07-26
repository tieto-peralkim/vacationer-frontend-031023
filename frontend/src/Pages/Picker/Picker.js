import {useEffect, useState} from "react";
import axios from "axios";
import DatePicker, {registerLocale} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./picker.module.css";

import fi from "date-fns/locale/fi";
import {
    Alert,
    Box,
    Button,
    ButtonGroup,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Modal,
    Select,
    Stack,
    TextField
} from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';
import LimitSetter from "./Components/LimitSetter";
import AlertDialog from "../Dialogs/AlertDialog";

registerLocale("fi", fi);

// Time stamps should be checked
export default function Picker() {

    // Max number of workers on holiday in a day
    const WORKER_LIMIT_DEFAULT = 100;
    //  Dates are in UTC time
    const today = new Date();
    today.setUTCHours(0, 0, 0)
    const nextMonday = new Date();
    nextMonday.setUTCDate(
        today.getUTCDate() + ((1 + 7 - today.getUTCDay()) % 7 || 7)
    );
    nextMonday.setUTCHours(12, 0, 0, 0);
    const nextSunday = new Date();
    nextSunday.setTime(nextMonday.getTime() + 6 * 24 * 60 * 60 * 1000);
    nextSunday.setUTCHours(12, 0, 0, 0);



    const [startDate, setStartDate] = useState(new Date());
    startDate.setUTCHours(12, 0, 0, 0);
    const [endDate, setEndDate] = useState(null);
    const [alertingDates, setAlertingDates] = useState([])

    const [comment, setComment] = useState("");
    const [annualAmount, setAnnualAmount] = useState(20);
    const [vacationers, setVacationers] = useState([]);
    const [startDateErrorMessage, setStartDateErrorMessage] = useState(false);
    const [endDateErrorMessage, setEndDateErrorMessage] = useState(false);
    const [overlapErrorMessage, setOverlapErrorMessage] = useState(false);
    const [daysInPastErrorMessage, setDaysInPastErrorMessage] = useState(false);
    const [showAllVacations, setShowAllVacations] = useState(false);
    const [dailyVacationers, setDailyVacationers] = useState([]);

    const [workerLimit, setWorkerLimit] = useState(WORKER_LIMIT_DEFAULT);

    const [openCalendar, setOpenCalendar] = useState(false);
    const [openEditAlert, setOpenEditAlert] = useState(false);
    const [openDeletionAlert, setOpenDeletionAlert] = useState(false);
    const [openRangeAlert, setOpenRangeAlert] = useState(false);

    const [idToEdit, setIdToEdit] = useState()
    const [idToDelete, setIdToDelete] = useState()
    const [holidayToEdit, setHolidayToEdit] = useState({})
    const [holidayToDelete, setHolidayToDelete] = useState({})

    const [chosenVacationer, setChosenVacationer] = useState("")
    const [editingSpace, setEditingSpace] = useState(false);
    const [changingStartedSpace, setChangingStartedSpace] = useState(false);

    const [holidays, setHolidays] = useState([]);

    const [calendarDaysExcluded, setCalendarDaysExcluded] = useState([]);

    const [dayAmount, setDayAmount] = useState(0);

    const [save, setSave] = useState(false)
    const [holidaySeason, setHolidaySeason] = useState(2022);

    const handleOpenCalendar = () => {
        setOpenCalendar(true);
        updateExcludedDates(0)
    };
    const handleCloseCalendar = () => {
        setOpenCalendar(false);
        setEditingSpace(false);
        setChangingStartedSpace(false);
        setOverlapErrorMessage(false);
        setDaysInPastErrorMessage(false);
        setDailyVacationers([])
        setComment("")
        resetDates();
    };

    const handleOpenEditAlert = () => {
        setOpenEditAlert(true);
    };
    const handleCloseEditAlert = () => {
        setOpenEditAlert(false);
    };
    const handleOpenDeletionAlert = () => {
        setOpenDeletionAlert(true);
    };
    const handleCloseDeletionAlert = () => {
        setOpenDeletionAlert(false);
        resetDates();
    };

    const handleCloseRangeAlert = () => {
        setOpenRangeAlert(false);
        resetDates();
    };


    useEffect(() => {
        if (endDate === null) {
            setEndDateErrorMessage(true)
        } else {
            setEndDateErrorMessage(false)
        }
    }, [endDate]);


    useEffect(() => {
        if (startDate === null) {
            setStartDateErrorMessage(true)
        } else {
            setStartDateErrorMessage(false)
        }
    }, [startDate]);

    useEffect(() => {
        axios
            .get("http://localhost:3001/vacationers")
            .then((response) => {
                setVacationers(response.data);
            })
            .catch((error) => {
                console.log("There was a get error!", error)
            });
    }, [save]);

    useEffect(() => {
        let amountOfDays = 0
        for (let i = 0; i < holidays.length; i++) {
            amountOfDays += daysInDateRange(holidays[i].start, holidays[i].end)
        }
        setDayAmount(amountOfDays);
        setCalendarDaysExcluded(holidays)
    }, [holidays]);

    const updateVacation = (e) => {
        e.preventDefault();
        if (chosenVacationer !== "") {
            const newVacation = {
                name: chosenVacationer.name,
                vacations: holidays
            };
            console.log("newVacation", newVacation);

            axios
                .put(`http://localhost:3001/vacationers/${chosenVacationer.id}`, newVacation)
                .then((response) => {
                    setSave(!save);
                    console.log(response)
                })
                .catch((error) => {
                    console.error("There was a put error!", error);
                });
            resetDates();
            setHolidays([]);
            setWorkerLimit(WORKER_LIMIT_DEFAULT)
            setChosenVacationer("")
        } else {
            console.log("Not valid, check!");
        }
    };


    // Kellonajan asettaminen startDatelle?
    const resetDates = () => {
        setStartDate(new Date());
        setEndDate(null);
    }

    const onChange = (dates) => {
        setOverlapErrorMessage(false);
        setDaysInPastErrorMessage(false);
        const [start, end] = dates;
        setStartDate(start);
        if (end !== null) {
            end.setUTCHours(14)
        }
        setEndDate(end);
        console.log("start", start, end)
        if (start !== null && end !== null) {
            calculatePerDay(start, end)
        }
    };


    const calendarDatesOverlap = () => {
        if (editingSpace) {
            let holidaysWithoutEditableHoliday = [];
            holidaysWithoutEditableHoliday = holidays.filter((holidays) => holidays.id !== idToEdit)

            for (let i = 0; i < holidaysWithoutEditableHoliday.length; i++) {
                if (startDate <= holidaysWithoutEditableHoliday[i].start && endDate >= holidaysWithoutEditableHoliday[i].end) {
                    return true;
                }
            }
            return false;
        } else {
            for (let i = 0; i < holidays.length; i++) {
                if (startDate <= holidays[i].start && endDate >= holidays[i].end) {
                    return true;
                }
            }
            return false;
        }
    };

    const validateCalendar = () => {
        if (calendarDatesOverlap()) {
            setOverlapErrorMessage(true);
            return false;
        } else if (alertingDates.length > 0) {
            setOpenRangeAlert(true)
            return false;
        } else if (endDate === null) {
            return false
        } else if (endDate < today) {
            setDaysInPastErrorMessage(true);
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
            newHoliday.edited = true;
            console.log("newHoliday", newHoliday)
            setHolidays((oldHolidays) => [...oldHolidays, newHoliday]);
            handleCloseCalendar()
        }
    }

    const confirmEdit = () => {
        if (validateCalendar()) {
            handleOpenEditAlert()
        }
    }

    const handleEdit = () => {
        let editedHoliday = {
            start: startDate,
            end: endDate,
            comment: comment,
            id: idToEdit
        };
        console.log("editedHoliday times", editedHoliday.start, editedHoliday.end, today);
        if (editedHoliday.end >= today) {
            editedHoliday.upcoming = true;
        } else {
            editedHoliday.upcoming = false;
        }
        editedHoliday.edited = true;
        let vacationIndex = holidays.findIndex((holiday) => holiday.id === idToEdit)
        console.log("handleEdit", holidays[vacationIndex], editedHoliday)
        let holidaysCopy = [...holidays]
        holidaysCopy[vacationIndex] = editedHoliday
        setHolidays(holidaysCopy)
        handleCloseEditAlert()
        handleCloseCalendar()
    };

    const confirmDeletion = (id) => {
        setIdToDelete(id);
        console.log("confirmDeletion: id", id)
        for (let i = 0; i < holidays.length; i++) {
            if (id === holidays[i].id) {
                setHolidayToDelete(holidays[i])
            }
        }
        handleOpenDeletionAlert()
    };

    const handleDeletion = () => {
        setHolidays((holidays) =>
            holidays.filter((holidays) => holidays.id !== idToDelete)
        )
        handleCloseDeletionAlert();
    };

    const editHoliday = (id) => {
        let editedItem = 0
        for (let i = 0; i < holidays.length; i++) {
            if (holidays[i].id === id) {
                editedItem = holidays[i]
            }
        }
        setHolidayToEdit(editedItem)

        console.log("editHoliday", holidays, calendarDaysExcluded)

        updateExcludedDates(id)
        setComment(editedItem.comment)
        setStartDate(editedItem.start)
        setEndDate(editedItem.end)
        calculatePerDay(editedItem.start, editedItem.end)
        setIdToEdit(id)

        if (editedItem.start < today && editedItem.end >= today) {
            setChangingStartedSpace(true)
        }
        setEditingSpace(true)
        setOpenCalendar(true)
        console.log("chosenVacationer", chosenVacationer)
    }

    // UI Method for adding the extra day before holiday. Because Datepicker exclusion does not include the 1st day of date range
    const updateExcludedDates = (id) => {
        let copyHolidays = JSON.parse(JSON.stringify(holidays))

        for (let i = 0; i < copyHolidays.length; i++) {
            let previousDate = new Date(copyHolidays[i].start);
            previousDate.setDate(previousDate.getDate() - 1)
            copyHolidays[i].start = previousDate
            copyHolidays[i].end = new Date(copyHolidays[i].end)
        }
        if (id !== 0) {
            let filteredHolidays = copyHolidays.filter((holidays) => holidays.id !== id)
            setCalendarDaysExcluded(filteredHolidays)
        } else {
            setCalendarDaysExcluded(copyHolidays)
        }
    }

    // Method for converting the date Strings to Dates
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
        setShowAllVacations(false)
        console.log("vacationers", vacationers)
        for (let i = 0; i < vacationers.length; i++) {
            if (vacationers[i].name === name) {
                setChosenVacationer(vacationers[i])
                console.log("selectVacationer", vacationers[i].vacations)
                setExcludedDates(vacationers[i].vacations)
            }
        }
    };

    const daysInDateRange = (firstDate, secondDate) => {
        let millisecondsDay = 24 * 60 * 60 * 1000;
        let daysInRange = Math.round(Math.abs((firstDate - secondDate) / millisecondsDay)) + 1;
        return daysInRange;
    }


    const calculatePerDay = (date1, date2) => {
        axios.get(`http://localhost:3001/timespan?start=${date1.toISOString()}&end=${date2.toISOString()}`)
            .then((response) => {
                console.log("response", response.data)
                setDailyVacationers(response.data);
            })
            .catch((error) => {
                console.error("There was a timespan get error!", error);
            })
    }

    return (
        <div  className={styles.mainView}>
            <h1>Holiday Picker</h1>
            <div>
                <form onSubmit={updateVacation} className={styles.form}>
                    <FormControl className={styles.nameSelectBox}>
                        <InputLabel>Choose your name</InputLabel>
                        <Select defaultValue={chosenVacationer ? chosenVacationer.name : ""}
                                value={chosenVacationer ? chosenVacationer.name : ""}
                                onChange={e => selectVacationer(e.target.value)}>
                            {vacationers.map((h) => (
                                    <MenuItem key={h.id} value={h.name}>{h.name}</MenuItem>
                                )
                            )}

                        </Select>
                    </FormControl>
                    {/*<Typography>*/}
                    {/*    Holiday season (accrued 1.4.{holidaySeason - 1} - 31.3.{holidaySeason})*/}
                    {/*</Typography>*/}
                    {/*<Select value={holidaySeason} onChange={e => setHolidaySeason(e.target.value)}>*/}
                    {/*    <MenuItem key={thisYear + 1} value={thisYear + 1}>{thisYear + 1}</MenuItem>*/}
                    {/*    <MenuItem key={thisYear} value={thisYear}>{thisYear}</MenuItem>*/}
                    {/*    <MenuItem key={thisYear - 1} value={thisYear - 1}>{thisYear - 1}</MenuItem>*/}
                    {/*</Select>*/}
                    {/*<Box className={styles.sliderBox}>*/}
                    {/*    <Typography>*/}
                    {/*        Holidays in season <b>{annualAmount}</b>*/}
                    {/*    </Typography>*/}
                    {/*    <Slider*/}
                    {/*        className={styles.slider}*/}
                    {/*        value={annualAmount}*/}
                    {/*        min={0}*/}
                    {/*        max={50}*/}
                    {/*        onChange={(e) => setAnnualAmount(e.target.value)}*/}
                    {/*    />*/}
                    {/*</Box>*/}
                    {/*{chosenVacationer &&*/}
                    {/*    <div className={}>*/}
                    {/*        FOUND {holidays.length} HOLIDAYS ({dayAmount} DAYS)*/}
                    {/*        OF WHICH {calculateUpcomingHolidays()[0]} ({calculateUpcomingHolidays()[1]} DAYS) ARE*/}
                    {/*        STILL*/}
                    {/*        COMING<br/>*/}
                    {/*        /!*HOLIDAYS LEFT {annualAmount - dayAmount}*!/*/}
                    {/*    </div>}*/}
                    <Button className={styles.extraMargin} variant="contained" color="primary"
                            disabled={!chosenVacationer}
                            onClick={handleOpenCalendar}>
                        Add a holiday
                    </Button>
                    <Modal className={styles.modal} open={openCalendar} onClose={handleCloseCalendar}>
                        <Box className={styles.box}>
                            <h2>Chosen dates:<br/>
                                {startDate && <>{startDate.getUTCDate()}.{startDate.getUTCMonth() + 1}.{startDate.getUTCFullYear()}</>}
                                {"  "} - {endDate && <>{endDate.getUTCDate()}.{endDate.getUTCMonth() + 1}.{endDate.getUTCFullYear()}</>}
                                <div>{endDate ? daysInDateRange(startDate, endDate) : "?"} {daysInDateRange(startDate, endDate) === 1 ? "day" : "days"}</div>
                            </h2>
                            <LimitSetter holidayToEdit={holidayToEdit} endDate={endDate} holidays={holidays}
                                         setAlertingDates={setAlertingDates}
                                         workerLimit={workerLimit}
                                         dailyVacationers={dailyVacationers}/>
                            <div>
                                <DatePicker
                                    locale="en"
                                    selected={startDate}
                                    onChange={onChange}
                                    selectsRange
                                    excludeDateIntervals={calendarDaysExcluded}
                                    startDate={startDate}
                                    endDate={endDate}
                                    minDate={!changingStartedSpace && today}
                                    dateFormat="dd.MM.yyyy"
                                    calendarStartDay={1}
                                    monthsShown={3}
                                    showWeekNumbers
                                    disabledKeyboardNavigation
                                    inline
                                    highlightDates={alertingDates.length > 0 && alertingDates.map(a => {
                                        return new Date(a[0])
                                    })}
                                />
                            </div>
                            <Dialog open={openRangeAlert} onClose={handleCloseRangeAlert}>
                                <DialogTitle>
                                    Time range you selected has full days!
                                </DialogTitle>
                                <DialogContent>
                                    Recheck your dates!
                                </DialogContent>
                            </Dialog>

                            <div className={styles.addHoliday}>
                                <TextField
                                    label="Description"
                                    variant="outlined"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}/>
                                {editingSpace ?
                                    <Button className={styles.buttonStyle}
                                            disabled={!endDate || alertingDates.length !== 0} onClick={confirmEdit}
                                            variant="contained">
                                        Edit a holiday
                                    </Button> :
                                    <Button className={styles.buttonStyle} disabled={!endDate || alertingDates.length !== 0} onClick={addHoliday}
                                            variant="contained">
                                        Add a holiday
                                    </Button>}
                            </div>
                            <Stack sx={{width: '100%'}} spacing={2}>

                                {alertingDates.length > 0 && <Alert severity="info">Choose new dates! Too many people on holiday!
                                        <ul>
                                        {alertingDates.map((daily, index) => (
                                            <li className={styles.alertingDates} key={index}>{new Date(daily[0]).toLocaleDateString("fi-FI")} ({daily[1]}) </li>
                                        ))}
                                        </ul>
                                    </Alert>}

                                {startDateErrorMessage && <Alert onClose={() => {
                                }}>Choose the start date!</Alert>}

                                {endDateErrorMessage && <Alert severity="info">Choose the end date!</Alert>}

                                {overlapErrorMessage && <Alert severity="warning">Dates overlap!</Alert>}

                                {daysInPastErrorMessage && <Alert severity="warning">
                                    Dates are in the past! At least end date must be upcoming.</Alert>}
                            </Stack>
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
                                                         className={styles.datesGroup}
                                            >
                                                <Button onClick={() => editHoliday(holidays.id)}
                                                        color={!holidays.edited ? "primary" : "secondary"}
                                                        className={styles.dates}>
                                                    {holidays.start.getUTCDate()}.{holidays.start.getUTCMonth() + 1}.{holidays.start.getUTCFullYear()} -{" "}
                                                    {holidays.end.getUTCDate()}.{holidays.end.getUTCMonth() + 1}.{holidays.end.getUTCFullYear()}
                                                    {" "} ({daysInDateRange(holidays.start, holidays.end)} days) {holidays.edited && "*"}
                                                </Button>
                                                <Button onClick={() => confirmDeletion(holidays.id)}
                                                        color={!holidays.edited ? "primary" : "secondary"}
                                                        endIcon={<ClearIcon/>}>Delete</Button>
                                            </ButtonGroup>
                                        ))
                                }
                                {showAllVacations === true &&
                                    holidays
                                        .sort((v1, v2) => v1.start - v2.start)
                                        .map((holidays, index) => (
                                            <ButtonGroup size="large" variant="outlined" key={holidays.id}
                                                         className={styles.datesGroup}
                                            >
                                                <Button onClick={() => editHoliday(holidays.id)}
                                                        color={!holidays.edited ? "primary" : "secondary"}
                                                        className={styles.dates} disabled={!holidays.upcoming}>
                                                    {holidays.start.getUTCDate()}.{holidays.start.getUTCMonth() + 1}.{holidays.start.getUTCFullYear()} -{" "}
                                                    {holidays.end.getUTCDate()}.{holidays.end.getUTCMonth() + 1}.{holidays.end.getUTCFullYear()}
                                                    {" "} ({daysInDateRange(holidays.start, holidays.end)} days)
                                                </Button>
                                                <Button onClick={() => confirmDeletion(holidays.id)}
                                                        color={!holidays.edited ? "primary" : "secondary"}
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
                        <Button onClick={() => setShowAllVacations(true)}>Show past vacations</Button>}
                    {showAllVacations && chosenVacationer !== "" && holidays.length !== 0 && calculateUpcomingHolidays()[0] !== holidays.length &&
                        <Button onClick={() => setShowAllVacations(false)}>Hide past vacations</Button>}

                    <AlertDialog openAlert={openEditAlert} handleCloseAlert={handleCloseEditAlert}
                                 handleAction={handleEdit}
                                 dialogTitle={"Edit holiday"}
                                 dialogContent={(holidayToEdit.start && startDate && endDate) && `Are you sure you want to edit the holiday from ${holidayToEdit.start.toLocaleDateString("fi-FI")}
                                   - ${holidayToEdit.end.toLocaleDateString("fi-FI")}  to ${startDate.toLocaleDateString("fi-FI")} - ${endDate.toLocaleDateString("fi-FI")} ?`}
                                 cancel={"No"} confirm={"Yes edit"}/>

                    <AlertDialog openAlert={openDeletionAlert} handleCloseAlert={handleCloseDeletionAlert}
                                 handleAction={handleDeletion}
                                 dialogTitle={"Delete holiday"}
                                 dialogContent={holidayToDelete.start && `Are you sure you want to delete the holiday ${holidayToDelete.start.toLocaleDateString("fi-FI")}
                                   - ${holidayToDelete.end.toLocaleDateString("fi-FI")} ?`}
                                 cancel={"No"} confirm={"Yes delete"}/>
                    <Button className={styles.extraMargin} type="submit"
                            variant="contained">
                        Save
                    </Button>
                </form>
            </div>
        </div>
    )
        ;
}
