import React, { useEffect, useState } from "react";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./picker.module.css";
import { useOutletVariables, Vacationer } from "../../NavigationBar";
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
    Tooltip,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import AlertDialog from "../Dialogs/AlertDialog";
import PickerModal from "./Components/PickerModal";
import { ExpandCircleDown } from "@mui/icons-material";
import PropTypes from "prop-types";

export interface Holiday {
    id: string;
    start: Date;
    end: Date;
    comment: string;
    confirmed: boolean;
}

function Picker({ save, setSave, allVacationers }) {
    // Max number of workers on holiday in a day
    const WORKER_LIMIT_DEFAULT = 100;
    //  Dates are in UTC time
    const today = new Date();
    today.setUTCHours(0, 0, 0);

    const { user, APIError, setAPIError } = useOutletVariables();

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [comment, setComment] = useState("");
    const [confirmed, setConfirmed] = useState(false);
    const [startDateErrorMessage, setStartDateErrorMessage] = useState(false);
    const [endDateErrorMessage, setEndDateErrorMessage] = useState(false);
    const [dailyVacationers, setDailyVacationers] = useState([]);
    const workerLimit = WORKER_LIMIT_DEFAULT;

    const [openCalendar, setOpenCalendar] = useState(false);
    const [openDeletionAlert, setOpenDeletionAlert] = useState(false);

    const [idToEdit, setIdToEdit] = useState();
    const [holidayToEdit, setHolidayToEdit] = useState({});
    const [holidayToDelete, setHolidayToDelete] = useState<Holiday>({
        id: "",
        start: new Date(),
        end: new Date(),
        comment: "",
        confirmed: false,
    });

    const [editingSpace, setEditingSpace] = useState(false);
    const [changingStartedSpace, setChangingStartedSpace] = useState(false);

    const [holidays, setHolidays] = useState([]);
    const [adminSpace, setAdminSpace] = useState(false);
    const [calendarDaysExcluded, setCalendarDaysExcluded] = useState([]);
    const [chosenVacationer, setChosenVacationer] =
        useState<Vacationer | null>();

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
        if (user && user.name) {
            setExcludedDates(user.vacations);
        }
        resetForm();
    }, [user]);

    useEffect(() => {
        if (!adminSpace) {
            resetForm();
            if (user && user.name) {
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
            })
            .catch((error) => {
                console.error("There was a delete holiday error!", error);
                setAPIError(true);
            });
        handleCloseDeletionAlert();
    };

    const editHoliday = (id) => {
        let editedItem = {
            start: new Date(),
            end: new Date(),
            comment: "",
            confirmed: false,
        };
        for (let i = 0; i < holidays.length; i++) {
            if (holidays[i].id === id) {
                editedItem = holidays[i];
            }
        }
        setHolidayToEdit(editedItem);
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
        const copyHolidays = JSON.parse(JSON.stringify(holidays));

        for (let i = 0; i < copyHolidays.length; i++) {
            const previousDate = new Date(copyHolidays[i].start);
            previousDate.setDate(previousDate.getDate() - 1);
            copyHolidays[i].start = previousDate;
            copyHolidays[i].end = new Date(copyHolidays[i].end);
        }
        if (id !== 0) {
            const filteredHolidays = copyHolidays.filter(
                (holidays) => holidays.id !== id
            );
            setCalendarDaysExcluded(filteredHolidays);
        } else {
            setCalendarDaysExcluded(copyHolidays);
        }
    };

    // Method for converting the date Strings to Dates
    const setExcludedDates = (vacations) => {
        const pureVacations = [];
        for (let i = 0; i < vacations.length; i++) {
            const holidayObject = {
                start: new Date(vacations[i].start),
                end: new Date(vacations[i].end),
                comment: vacations[i].comment,
                confirmed: vacations[i].confirmed,
                id: vacations[i]._id,
                upcoming: false,
            };

            if (holidayObject.start >= today || holidayObject.end >= today) {
                holidayObject.upcoming = true;
            }
            pureVacations.push(holidayObject);
        }
        setHolidays(pureVacations);
    };

    const selectVacationer = (name) => {
        if (allVacationers) {
            let vacationerFound;

            for (let i = 0; i < allVacationers.length; i++) {
                if (allVacationers[i].name === name) {
                    vacationerFound = allVacationers[i];
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
                    setExcludedDates(response.data.vacations);
                })
                .catch((error) => {
                    console.error("There was a vacationers get error:", error);
                    setAPIError(true);
                });
        }
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
                setDailyVacationers(response.data);
            })
            .catch((error) => {
                console.error("There was a timespan get error!", error);
                setAPIError(true);
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
        <Accordion className={styles.accordion} disabled={APIError}>
            <AccordionSummary
                sx={{ backgroundColor: "aliceblue" }}
                expandIcon={
                    <Tooltip title={"Show / hide your holiday list"}>
                        <ExpandCircleDown />
                    </Tooltip>
                }
            >
                <div className={styles.accordionSummaryElements}>
                    <div>
                        <h3>Your holidays</h3>
                    </div>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={user && !user.name}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCalendar();
                        }}
                    >
                        Add new holiday
                        {adminSpace && <> of {chosenVacationer.name} </>}
                    </Button>
                </div>
            </AccordionSummary>
            <Divider variant={"middle"} className={styles.accordionDivider} />
            <AccordionDetails className={styles.dropdown}>
                <ThemeProvider theme={theme}>
                    <div className={styles.content}>
                        <form className={styles.form}>
                            <div>
                                {user && user.admin && (
                                    <div className={styles.selectSection}>
                                        {(process.env.REACT_APP_ENVIRONMENT ===
                                            "local" ||
                                            process.env
                                                .REACT_APP_ENVIRONMENT ===
                                                "qa") && (
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
                                        )}
                                        {adminSpace && (
                                            <FormControl>
                                                <Select
                                                    className={styles.selectBox}
                                                    value={
                                                        chosenVacationer.name as ""
                                                    }
                                                    onChange={(e) =>
                                                        selectVacationer(
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    {allVacationers.map((h) => (
                                                        <MenuItem
                                                            key={h.id}
                                                            value={h.name}
                                                        >
                                                            {h.name}
                                                        </MenuItem>
                                                    ))}
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
                                setChangingStartedSpace={
                                    setChangingStartedSpace
                                }
                                setOpenCalendar={setOpenCalendar}
                                resetDates={resetDates}
                                save={save}
                                setSave={setSave}
                                calculatePerDay={calculatePerDay}
                            />
                        </form>
                        <div>
                            <Grid
                                container
                                rowSpacing={0.7}
                                columnSpacing={0.1}
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
                                                size="small"
                                                key={holiday.id}
                                            >
                                                <Tooltip title={"Edit holiday"}>
                                                    <Button
                                                        className={
                                                            styles.buttonStyle
                                                        }
                                                        onClick={() =>
                                                            editHoliday(
                                                                holiday.id
                                                            )
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
                                                </Tooltip>
                                                <Tooltip
                                                    title={"Delete holiday"}
                                                >
                                                    <Button
                                                        onClick={() =>
                                                            confirmDeletion(
                                                                holiday
                                                            )
                                                        }
                                                        color={"error"}
                                                        variant="contained"
                                                    >
                                                        <ClearIcon />
                                                    </Button>
                                                </Tooltip>
                                            </ButtonGroup>
                                        </Grid>
                                    ))}
                            </Grid>
                        </div>
                        {user && user.name && holidays.length === 0 && (
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

Picker.propTypes = {
    save: PropTypes.bool,
    setSave: PropTypes.func,
    allVacationers: PropTypes.array,
};

export default Picker;
