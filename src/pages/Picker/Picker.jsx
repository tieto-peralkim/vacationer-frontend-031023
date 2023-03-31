import { useEffect, useState } from "react";
import axios from "axios";
import { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./picker.module.css";

import fi from "date-fns/locale/fi";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    ButtonGroup,
    Checkbox,
    createTheme,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    MenuItem,
    Select,
    ThemeProvider,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import AlertDialog from "../Dialogs/AlertDialog";
import PickerModal from "./Components/PickerModal";
import { ExpandCircleDown } from "@mui/icons-material";

registerLocale("fi", fi);

export default function Picker({
    user,
    save,
    setSave,
    vacationersAmount,
    APIError,
    handleOpenAPIError,
    handleCloseAPIError,
    shortenLongNames,
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
    const [adminSpace, setAdminSpace] = useState(false);
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

    const theme = createTheme({
        breakpoints: {
            values: {
                xs: 400,
                sm: 575,
                md: 800,
                lg: 1100,
                xl: 1500,
            },
        },
    });

    useEffect(() => {
        setChosenVacationer(user);
    }, []);

    useEffect(() => {
        if (user.name) {
            setExcludedDates(user.vacations);
        }
        resetForm();
    }, [user]);

    useEffect(() => {
        if (!adminSpace) {
            resetForm();
            if (user.name) {
                setExcludedDates(user.vacations);
            }
        }
    }, [adminSpace]);

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
        // set existing holiday dates to be excluded in DatePicker
        setCalendarDaysExcluded(holidays);
    }, [holidays]);

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
        if (adminSpace) {
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
                if (APIError) {
                    handleCloseAPIError();
                }
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
        if (vacationersAmount) {
            let vacationerFound;

            for (let i = 0; i < vacationersAmount.length; i++) {
                if (vacationersAmount[i].name === name) {
                    vacationerFound = vacationersAmount[i];
                    console.log("vacationerFound", vacationerFound);
                    break;
                }
            }
            axios
                .get(
                    `${process.env.REACT_APP_ADDRESS}/vacationers/${vacationerFound.id}`,
                    {
                        withCredentials: true,
                    }
                )
                .then((response) => {
                    setChosenVacationer(response.data);
                    console.log("response on", response.data);
                    setExcludedDates(response.data.vacations);
                    if (APIError) {
                        handleCloseAPIError();
                    }
                })
                .catch((error) => {
                    console.error("There was a vacationers get error:", error);
                    handleOpenAPIError();
                });
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
                if (APIError) {
                    handleCloseAPIError();
                }
            })
            .catch((error) => {
                console.error("There was a timespan get error!", error);
                handleOpenAPIError();
            });
    };

    const startAndEndTimeJSX = (holiday) => {
        return (
            <>
                {holiday.start.getUTCDate()}.{holiday.start.getUTCMonth() + 1}.
                {holiday.start.getUTCFullYear()} - {holiday.end.getUTCDate()}.
                {holiday.end.getUTCMonth() + 1}.{holiday.end.getUTCFullYear()}
            </>
        );
    };

    return (
        <Accordion className={styles.accordion}>
            <AccordionSummary
                sx={{
                    bgcolor: "lightblue",
                }}
                expandIcon={<ExpandCircleDown />}
            >
                <div className={styles.dropdownSummary}>
                    <div className={styles.dropdownText}>
                        <h3>Your holidays</h3>
                    </div>
                    <Button
                        className={styles.dropdownButton}
                        variant="contained"
                        color="primary"
                        disabled={!user.name}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCalendar();
                        }}
                    >
                        Add new holiday
                        {adminSpace && (
                            <> of {shortenLongNames(chosenVacationer.name)} </>
                        )}
                    </Button>
                </div>
            </AccordionSummary>
            <Divider className={styles.divider} />
            <AccordionDetails className={styles.dropdown}>
                <ThemeProvider theme={theme}>
                    <div className={styles.content}>
                        <form className={styles.form}>
                            <div>
                                {user.admin && (
                                    <div className={styles.selectSection}>
                                        <FormControl>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={adminSpace}
                                                        onChange={() => {
                                                            setAdminSpace(
                                                                !adminSpace
                                                            );
                                                        }}
                                                    />
                                                }
                                                label={"ADMIN: Select user"}
                                            />
                                        </FormControl>
                                        {adminSpace && (
                                            <FormControl>
                                                <Select
                                                    className={styles.selectBox}
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
                                                    onChange={(e) =>
                                                        selectVacationer(
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    {vacationersAmount.map(
                                                        (h) => (
                                                            <MenuItem
                                                                key={h.id}
                                                                value={h.name}
                                                            >
                                                                {h.name}
                                                            </MenuItem>
                                                        )
                                                    )}
                                                </Select>
                                            </FormControl>
                                        )}
                                    </div>
                                )}
                            </div>
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
                                setChangingStartedSpace={
                                    setChangingStartedSpace
                                }
                                setOpenCalendar={setOpenCalendar}
                                resetDates={resetDates}
                                save={save}
                                setSave={setSave}
                                APIError={APIError}
                                handleOpenAPIError={handleOpenAPIError}
                                handleCloseAPIError={handleCloseAPIError}
                                calculatePerDay={calculatePerDay}
                            />
                        </form>
                        <div className={styles.rightSide}>
                            <Grid
                                container
                                rowSpacing={0.7}
                                columnSpacing={0.5}
                                direction="row"
                                justifyContent="flex-start"
                            >
                                {holidays
                                    .sort((v1, v2) => v1.start - v2.start)
                                    .map((holiday) => (
                                        <Grid
                                            item
                                            xl={2}
                                            lg={3}
                                            md={4}
                                            sm={6}
                                            xs={12}
                                            key={holiday.id}
                                        >
                                            <ButtonGroup
                                                className={styles.buttonGroup}
                                                size="medium"
                                                key={holiday.id}
                                            >
                                                <Button
                                                    className={
                                                        styles.buttonStyle
                                                    }
                                                    onClick={() =>
                                                        editHoliday(holiday.id)
                                                    }
                                                    color="info"
                                                    variant={
                                                        holiday.confirmed
                                                            ? "contained"
                                                            : "outlined"
                                                    }
                                                >
                                                    {startAndEndTimeJSX(
                                                        holiday
                                                    )}
                                                </Button>
                                                <Button
                                                    onClick={() =>
                                                        confirmDeletion(holiday)
                                                    }
                                                    color={"error"}
                                                    variant="contained"
                                                >
                                                    <ClearIcon />
                                                </Button>
                                            </ButtonGroup>
                                        </Grid>
                                    ))}
                            </Grid>
                        </div>
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
                        <div className={styles.marginTop}>
                            <span className={styles.confirmedBox}>
                                Confirmed
                            </span>
                            <span className={styles.unconfirmedBox}>
                                Unconfirmed
                            </span>
                        </div>
                    </div>
                </ThemeProvider>
            </AccordionDetails>
        </Accordion>
    );
}
