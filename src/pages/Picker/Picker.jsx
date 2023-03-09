import { useEffect, useState } from "react";
import axios from "axios";
import { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./picker.module.css";

import fi from "date-fns/locale/fi";
import {
    Box,
    Button,
    ButtonGroup,
    Checkbox,
    Chip,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Slider,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import AlertDialog from "../Dialogs/AlertDialog";
import PickerModal from "./Components/PickerModal";
import Typography from "@mui/material/Typography";

registerLocale("fi", fi);

export default function Picker({
    user,
    save,
    setSave,
    setUpdate,
    vacationers,
    setVacationers,
    handleOpenAPIError,
    APIError,
}) {
    // Max number of workers on holiday in a day
    const WORKER_LIMIT_DEFAULT = 100;
    const NUMBER_OF_SHOWN_DEFAULT = 2;
    //  Dates are in UTC time
    const today = new Date();
    today.setUTCHours(0, 0, 0);

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [comment, setComment] = useState("");
    const [confirmed, setConfirmed] = useState(false);
    const [startDateErrorMessage, setStartDateErrorMessage] = useState(false);
    const [endDateErrorMessage, setEndDateErrorMessage] = useState(false);
    const [showPastVacations, setShowPastVacations] = useState(
        NUMBER_OF_SHOWN_DEFAULT
    );
    const [dailyVacationers, setDailyVacationers] = useState([]);
    const [showHolidays, setShowHolidays] = useState(2);
    const [workerLimit, setWorkerLimit] = useState(WORKER_LIMIT_DEFAULT);

    const [openCalendar, setOpenCalendar] = useState(false);
    const [openDeletionAlert, setOpenDeletionAlert] = useState(false);

    const [idToEdit, setIdToEdit] = useState();
    const [holidayToEdit, setHolidayToEdit] = useState({});
    const [holidayToDelete, setHolidayToDelete] = useState({});

    const [editingSpace, setEditingSpace] = useState(false);
    const [changingStartedSpace, setChangingStartedSpace] = useState(false);

    const [holidays, setHolidays] = useState([]);
    const [adminspace, setAdminspace] = useState(false);
    const [calendarDaysExcluded, setCalendarDaysExcluded] = useState([]);
    const [chosenVacationer, setChosenVacationer] = useState("");

    const handleOpenCalendar = () => {
        setOpenCalendar(true);
        updateExcludedDates(0);
    };

    const handleOpenDeletionAlert = () => {
        setOpenDeletionAlert(true);
    };
    const handleCloseDeletionAlert = () => {
        setOpenDeletionAlert(false);
        resetDates();
    };

    useEffect(() => {
        if (user.name) {
            setShowPastVacations(NUMBER_OF_SHOWN_DEFAULT);
            setExcludedDates(user.vacations);
        }
        resetForm();
    }, [user]);

    useEffect(() => {
        if (!adminspace) {
            resetForm();
            if (user.name) {
                setExcludedDates(user.vacations);
            }
        }
    }, [adminspace]);

    useEffect(() => {
        if (endDate === null) {
            setEndDateErrorMessage(true);
        } else {
            setEndDateErrorMessage(false);
        }
    }, [endDate]);

    useEffect(() => {
        if (startDate === null) {
            setStartDateErrorMessage(true);
        } else {
            setStartDateErrorMessage(false);
        }
    }, [startDate]);

    useEffect(() => {
        console.log("user Picker", user);

        // set existing holiday dates to be excluded in DatePicker
        setCalendarDaysExcluded(holidays);
    }, [holidays]);

    useEffect(() => {
        if (holidays.length - showPastVacations >= 0) {
            setShowHolidays(holidays.length - showPastVacations);
            console.log(
                "slice",
                holidays.length - showPastVacations,
                holidays.length
            );
        } else {
            setShowHolidays(0);
        }
    }, [holidays, showPastVacations]);

    const resetDates = () => {
        setStartDate(null);
        setEndDate(null);
    };

    const resetForm = () => {
        setChosenVacationer(user);
    };

    const confirmDeletion = (holiday) => {
        console.log("confirmDeletion: id", holiday);
        setHolidayToDelete(holiday);
        handleOpenDeletionAlert();
    };

    const deleteHoliday = () => {
        let vacationer = user;

        // If deleting someone else's holiday
        if (adminspace) {
            vacationer = chosenVacationer;
        }
        axios
            .delete(
                `${process.env.REACT_APP_ADDRESS}/vacationers/${vacationer.id}/${holidayToDelete.id}`,
                { withCredentials: true }
            )
            .then(() => {
                setSave(!save);
                resetForm();
                resetDates();
            })
            .catch((error) => {
                console.error("There was a delete holiday error!", error);
                handleOpenAPIError();
            })
            .finally(() => {
                handleCloseDeletionAlert();
            });
    };

    const editHoliday = (id) => {
        let editedItem = 0;
        for (let i = 0; i < holidays.length; i++) {
            if (holidays[i].id === id) {
                editedItem = holidays[i];
            }
        }
        setHolidayToEdit(editedItem);

        console.log("editHoliday", holidays, calendarDaysExcluded);

        updateExcludedDates(id);
        setComment(editedItem.comment);
        setConfirmed(editedItem.confirmed);
        setStartDate(editedItem.start);
        setEndDate(editedItem.end);
        calculatePerDay(editedItem.start, editedItem.end);
        setIdToEdit(id);

        if (editedItem.start < today && editedItem.end >= today) {
            setChangingStartedSpace(true);
        }
        setEditingSpace(true);
        setOpenCalendar(true);
    };

    // UI Method for adding the extra day before holiday. Because Datepicker exclusion does not include the 1st day of date range
    const updateExcludedDates = (id) => {
        let copyHolidays = JSON.parse(JSON.stringify(holidays));

        for (let i = 0; i < copyHolidays.length; i++) {
            let previousDate = new Date(copyHolidays[i].start);
            previousDate.setDate(previousDate.getDate() - 1);
            copyHolidays[i].start = previousDate;
            copyHolidays[i].end = new Date(copyHolidays[i].end);
        }
        if (id !== 0) {
            let filteredHolidays = copyHolidays.filter(
                (holidays) => holidays.id !== id
            );
            setCalendarDaysExcluded(filteredHolidays);
        } else {
            setCalendarDaysExcluded(copyHolidays);
        }
    };

    // Method for converting the date Strings to Dates
    const setExcludedDates = (vacations) => {
        let pureVacations = [];
        for (let i = 0; i < vacations.length; i++) {
            let holidayObject = {};
            holidayObject.start = new Date(vacations[i].start);
            holidayObject.end = new Date(vacations[i].end);
            holidayObject.comment = vacations[i].comment;
            holidayObject.confirmed = vacations[i].confirmed;
            holidayObject.id = vacations[i]._id;

            if (holidayObject.start >= today || holidayObject.end >= today) {
                holidayObject.upcoming = true;
            } else {
                holidayObject.upcoming = false;
            }
            pureVacations.push(holidayObject);
        }
        setHolidays(pureVacations);
    };

    const calculateUpcomingHolidays = () => {
        let numberOfUpcomingHolidays = 0;
        let numberOfDays = 0;
        for (let i = 0; i < holidays.length; i++) {
            if (holidays[i].upcoming) {
                numberOfUpcomingHolidays++;
                numberOfDays += daysInDateRange(
                    holidays[i].start,
                    holidays[i].end
                );
            }
        }
        return [numberOfUpcomingHolidays, numberOfDays];
    };

    const selectVacationer = (name) => {
        setShowPastVacations(NUMBER_OF_SHOWN_DEFAULT);
        for (let i = 0; i < vacationers.length; i++) {
            if (vacationers[i].name === name) {
                setChosenVacationer(vacationers[i]);
                console.log("selectVacationer", vacationers[i].vacations);
                setExcludedDates(vacationers[i].vacations);
                break;
            }
        }
    };

    const daysInDateRange = (firstDate, secondDate) => {
        let millisecondsDay = 24 * 60 * 60 * 1000;
        let daysInRange =
            Math.round(Math.abs((firstDate - secondDate) / millisecondsDay)) +
            1;
        return daysInRange;
    };

    const calculatePerDay = (date1, date2) => {
        axios
            .get(
                `${
                    process.env.REACT_APP_ADDRESS
                }/timespan?start=${date1.toISOString()}&end=${date2.toISOString()}`,
                { withCredentials: true }
            )
            .then((response) => {
                console.log("setDailyVacationers", response.data);
                setDailyVacationers(response.data);
            })
            .catch((error) => {
                console.error("There was a timespan get error!", error);
                handleOpenAPIError();
            });
    };

    const startAndEndTimeJSX = (holiday) => {
        if (
            holiday.start.getDate() === holiday.end.getDate() &&
            holiday.start.getMonth() === holiday.end.getMonth() &&
            holiday.start.getYear() === holiday.end.getYear()
        ) {
            return (
                <>
                    {holiday.start.getUTCDate()}.
                    {holiday.start.getUTCMonth() + 1}.
                    {holiday.start.getUTCFullYear()} (
                    {daysInDateRange(holiday.start, holiday.end)} day)
                </>
            );
        } else {
            return (
                <>
                    {holiday.start.getUTCDate()}.
                    {holiday.start.getUTCMonth() + 1}.
                    {holiday.start.getUTCFullYear()} -{" "}
                    {holiday.end.getUTCDate()}.{holiday.end.getUTCMonth() + 1}.
                    {holiday.end.getUTCFullYear()} (
                    {daysInDateRange(holiday.start, holiday.end)} days)
                </>
            );
        }
    };

    return (
        <div className={styles.mainView}>
            <div>
                <form className={styles.form}>
                    {/*For admin user*/}
                    {user.admin && (
                        <FormControl>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={adminspace}
                                        onChange={() => {
                                            setAdminspace(!adminspace);
                                        }}
                                    />
                                }
                                label={"ADMIN: Select another user"}
                            />
                        </FormControl>
                    )}
                    {adminspace && (
                        <FormControl className={styles.nameSelectBox}>
                            <Select
                                defaultValue={
                                    chosenVacationer.name
                                        ? chosenVacationer.name
                                        : ""
                                }
                                value={
                                    chosenVacationer.name
                                        ? chosenVacationer.name
                                        : ""
                                }
                                disabled={!adminspace}
                                onChange={(e) =>
                                    selectVacationer(e.target.value)
                                }
                            >
                                {vacationers.map((h) => (
                                    <MenuItem key={h.id} value={h.name}>
                                        {h.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    <Button
                        className={styles.extraMargin}
                        variant="contained"
                        color="primary"
                        disabled={!user.name}
                        onClick={() => {
                            handleOpenCalendar();
                        }}
                    >
                        Add a holiday for {chosenVacationer.name}
                    </Button>
                    <PickerModal
                        resetForm={resetForm}
                        openCalendar={openCalendar}
                        chosenUser={chosenVacationer}
                        startDate={startDate}
                        setStartDate={setStartDate}
                        endDate={endDate}
                        setEndDate={setEndDate}
                        daysInDateRange={daysInDateRange}
                        holidayToEdit={holidayToEdit}
                        holidays={holidays}
                        workerLimit={workerLimit}
                        dailyVacationers={dailyVacationers}
                        setDailyVacationers={setDailyVacationers}
                        calendarDaysExcluded={calendarDaysExcluded}
                        editingSpace={editingSpace}
                        setEditingSpace={setEditingSpace}
                        changingStartedSpace={changingStartedSpace}
                        today={today}
                        startDateErrorMessage={startDateErrorMessage}
                        endDateErrorMessage={endDateErrorMessage}
                        comment={comment}
                        setComment={setComment}
                        confirmed={confirmed}
                        setConfirmed={setConfirmed}
                        idToEdit={idToEdit}
                        setHolidays={setHolidays}
                        setChangingStartedSpace={setChangingStartedSpace}
                        setOpenCalendar={setOpenCalendar}
                        resetDates={resetDates}
                        save={save}
                        setSave={setSave}
                        handleOpenAPIError={handleOpenAPIError}
                        calculatePerDay={calculatePerDay}
                    />
                    {holidays.length > 0 && (
                        <>
                            <div>
                                {holidays.length > NUMBER_OF_SHOWN_DEFAULT && (
                                    <div className={styles.marginTop}>
                                        <Typography>
                                            Showing newest {showPastVacations}{" "}
                                            holidays
                                        </Typography>
                                        <Slider
                                            className={styles.marginTop}
                                            value={showPastVacations}
                                            min={1}
                                            max={holidays.length}
                                            valueLabelDisplay={"on"}
                                            onChange={(e) =>
                                                setShowPastVacations(
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                )}
                                <div className={styles.holidays}>
                                    {holidays
                                        .sort((v1, v2) => v1.start - v2.start)
                                        .slice(showHolidays, holidays.length)
                                        .map((holiday) => (
                                            <ButtonGroup
                                                size="large"
                                                variant="outlined"
                                                key={holiday.id}
                                                className={styles.datesGroup}
                                            >
                                                <Button
                                                    onClick={() =>
                                                        editHoliday(holiday.id)
                                                    }
                                                    color={"primary"}
                                                    className={styles.dates}
                                                    disabled={!holiday.upcoming}
                                                >
                                                    {startAndEndTimeJSX(
                                                        holiday
                                                    )}
                                                </Button>
                                                <Button
                                                    onClick={() =>
                                                        confirmDeletion(holiday)
                                                    }
                                                    color={"primary"}
                                                    disabled={!holiday.upcoming}
                                                    endIcon={<ClearIcon />}
                                                >
                                                    Delete
                                                </Button>
                                            </ButtonGroup>
                                        ))}
                                </div>
                            </div>
                        </>
                    )}
                    {user.name && holidays.length === 0 && (
                        <p>No vacations...</p>
                    )}
                    <AlertDialog
                        openAlert={openDeletionAlert}
                        handleCloseAlert={handleCloseDeletionAlert}
                        handleAction={deleteHoliday}
                        dialogTitle={"Delete holiday"}
                        dialogContent={
                            holidayToDelete.start &&
                            `Are you sure you want to delete the holiday ${holidayToDelete.start.toLocaleDateString(
                                "fi-FI"
                            )}
                                   - ${holidayToDelete.end.toLocaleDateString(
                                       "fi-FI"
                                   )} ?`
                        }
                        cancel={"No"}
                        confirm={"Yes delete"}
                    />
                </form>
            </div>
        </div>
    );
}
