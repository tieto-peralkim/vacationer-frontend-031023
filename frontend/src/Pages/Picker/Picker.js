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
    TextField
} from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';
import VacationerNumber from "../Heat/Components/VacationerNumber";
import Apitester from "./Components/Apitester";

registerLocale("fi", fi);

export default function Picker() {
    const [name, setName] = useState("");
    const [comment, setComment] = useState("");
    const [vacationers, setVacationers] = useState([]);
    const [dateErrorMessage, setDateErrorMessage] = useState(false);
    const [overlapErrorMessage, setOverlapErrorMessage] = useState(false);

    // startDate is local date at noon UTC (just to set the calendar default)
    const [startDate, setStartDate] = useState(new Date());
    startDate.setUTCHours(12, 0, 0, 0);
    console.log("sd", startDate);
    const [endDate, setEndDate] = useState(null);
    const [openCalendar, setOpenCalendar] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);
    const [indexToDelete, setIndexToDelete] = useState()
    const [indexToEdit, setIndexToEdit] = useState()

    const [chosenVacationer, setChosenVacationer] = useState("")
    const [chosenId, setChosenId] = useState("")
    const [editingSpace, setEditingSpace] = useState(false);

    const [holidays, setHolidays] = useState([]);
    // const [datepickerHolidays, setDatepickerHolidays] = useState([]);

    const handleOpenCalendar = () => {
        console.log("holid", holidays)
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
        setHolidays((holidays) =>
            holidays.filter((_, i) => i !== indexToDelete)
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


    useEffect(() => {
        axios.get("http://localhost:3001/vacationers").then((response) => {
            setVacationers(response.data);
        });
    }, []);


    const updateVacation = (e) => {
        e.preventDefault();
        if (chosenId !== "") {
            const newVacation = {
                name: name,
                vacations: holidays,
            };
            console.log("NV", newVacation);
            console.log("Chosen", chosenId)

            axios
                .put(`http://localhost:3001/vacationers/${chosenId}`, newVacation)
                .then((response) => console.log(response))
                .catch((error) => {
                    console.error("There was a put error!", error);
                });
            resetDates();
            setHolidays([]);
            setName("");
            setChosenVacationer("")
            setChosenId("")
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
                comment: comment
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
    }

    const addHolidayEditSpace = () => {
        if (validateCalendar()) {
            let editedHoliday = {
                start: startDate,
                end: endDate,
                comment: comment
            };
            const copyHolidays = holidays.slice()
            copyHolidays[indexToEdit] = editedHoliday
            setHolidays(copyHolidays);

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
            setEditingSpace(false)
            console.log(holidays)
        }
    };


    const deleteHoliday = (index) => {
        setIndexToDelete(index);
        console.log("indexi", index)
        handleOpenAlert()
    };

    const editHoliday = (index) => {
        setIndexToEdit(index)
        console.log("iiii",holidays[index])
        setComment(holidays[index].comment)
        setStartDate(holidays[index].start)
        setEndDate(holidays[index].end)
        setOpenCalendar(true)
        setEditingSpace(true)
    }

    const setExcludedDates = (vacations) => {
        let pureVacations = [];
        for (let i = 0; i < vacations.length; i++) {
            let holidayObject = new Object()
            holidayObject.start = new Date(vacations[i].start)
            holidayObject.end = new Date(vacations[i].end)
            holidayObject.comment = vacations[i].comment
            pureVacations.push(holidayObject);
        }
        setHolidays(pureVacations)
        console.log("PV", pureVacations)
    }

    const selectVacationer = (name) => {
        console.log("vacationers", vacationers)
        for (let i = 0; i < vacationers.length; i++) {
            if (vacationers[i].name === name) {
                setChosenVacationer(vacationers[i])
                setChosenId(vacationers[i].id)
                console.log("vvv", vacationers[i].vacations)
                setExcludedDates(vacationers[i].vacations)
                setName(vacationers[i].name);
            }
        }
    };

    return (
        <div>
            <h1>Picker</h1>
            <h4>
                Today's {today.toLocaleDateString()}. getDay is {today.getUTCDay()}
            </h4>
            <h4>
                Next week {nextMonday.toISOString()} - {nextSunday.toISOString()}
            </h4>

            <Divider/>
            API test On vacation {nextMonday.getUTCDate()}.{nextMonday.getUTCMonth() + 1}.
            {nextMonday.getUTCFullYear()} - {nextSunday.getUTCDate()}.
            {nextSunday.getUTCMonth() + 1}.{nextSunday.getUTCFullYear()}
            : <Apitester start={nextMonday.toISOString()} end={nextSunday.toISOString()}/> colleague(s)
            <Divider/>
            <br/>
            <div>
                <form onSubmit={updateVacation} className={styles.form}>
                    <FormControl fullWidth>
                        <InputLabel>Choose your name</InputLabel>
                        <Select value="" onChange={e => selectVacationer(e.target.value)}>
                            {vacationers.map((h) => (
                                    <MenuItem key={h.id} value={h.name}>{h.name}</MenuItem>
                                )
                            )}

                        </Select>
                    </FormControl>
                    YOU ARE {chosenVacationer.name}
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
                            <h5><VacationerNumber vacationers={vacationers} startDate={startDate}
                                                  endDate={endDate}/> colleague(s) on holiday too</h5>
                            {/*<h6><Apitester start={startDate} end={endDate}/> APIn mukaan lomalla</h6>*/}
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
                            <TextField className={styles.extraMargin}
                                       label="Comment about the holiday"
                                       variant="outlined"
                                       defaultValue={comment}
                                       value={comment}
                                       onChange={(e) => setComment(e.target.value)}/>
                            {editingSpace ? <Button className={styles.addHoliday} onClick={addHolidayEditSpace} variant="contained">
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
                                {holidays.map((holidays, index) => (
                                    <ButtonGroup size="large" variant="outlined" key={index}
                                    >
                                        <Button onClick={() => editHoliday(index)}
                                                className={styles.dates}>
                                            {new Date(holidays.start).getUTCDate()}.{new Date(holidays.start).getUTCMonth() + 1}.{new Date(holidays.start).getUTCFullYear()} -{" "}
                                            {new Date(holidays.end).getUTCDate()}.{new Date(holidays.end).getUTCMonth() + 1}.{new Date(holidays.end).getUTCFullYear()}
                                        </Button>
                                        <Button onClick={() => deleteHoliday(index)}
                                                endIcon={<ClearIcon/>}>Delete</Button>
                                    </ButtonGroup>
                                ))}
                            </div>
                        </div>
                    )}
                    {chosenVacationer !== "" && holidays.length === 0 && <p>No vacation yet...</p>}
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
            <div>
                <ul>
                    {vacationers.map((holidayer) => (
                        <li key={holidayer.id}>
                            {holidayer.name ? (
                                <b>{holidayer.name}</b>
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
    )
        ;
}
