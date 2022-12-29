import styles from "../picker.module.css";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    FormGroup,
    Modal,
    Stack,
    TextField,
} from "@mui/material";
import LimitSetter from "./LimitSetter";
import DatePicker from "react-datepicker";
import { useState } from "react";
import AlertDialog from "../../Dialogs/AlertDialog";
import axios from "axios";
import st from "react-datepicker";

export default function PickerModal({
    openCalendar,
    chosenVacationer,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    daysInDateRange,
    holidayToEdit,
    holidays,
    workerLimit,
    dailyVacationers,
    setDailyVacationers,
    calendarDaysExcluded,
    editingSpace,
    changingStartedSpace,
    today,
    comment,
    setComment,
    confirmed,
    setConfirmed,
    startDateErrorMessage,
    endDateErrorMessage,
    idToEdit,
    setHolidays,
    setChangingStartedSpace,
    setEditingSpace,
    setOpenCalendar,
    resetDates,
    resetForm,
    save,
    setSave,
    handleOpenAPIError,
    calculatePerDay,
}) {
    const [alertingDates, setAlertingDates] = useState([]);
    const [openEditAlert, setOpenEditAlert] = useState(false);
    const [openAddAlert, setOpenAddAlert] = useState(false);
    const [overlapErrorMessage, setOverlapErrorMessage] = useState(false);
    const [openRangeAlert, setOpenRangeAlert] = useState(false);

    const handleCloseCalendar = () => {
        setOpenCalendar(false);
        setEditingSpace(false);
        setChangingStartedSpace(false);
        setOverlapErrorMessage(false);
        setDailyVacationers([]);
        setComment("");
        setConfirmed(false);
        resetDates();
    };

    const handleOpenAddAlert = () => {
        setOpenAddAlert(true);
    };
    const handleCloseAddAlert = () => {
        setOpenAddAlert(false);
    };

    const handleOpenEditAlert = () => {
        setOpenEditAlert(true);
    };
    const handleCloseEditAlert = () => {
        setOpenEditAlert(false);
    };
    const handleCloseRangeAlert = () => {
        setOpenRangeAlert(false);
        resetDates();
    };

    const calendarDatesOverlap = () => {
        if (editingSpace) {
            let holidaysWithoutEditableHoliday = [];
            holidaysWithoutEditableHoliday = holidays.filter(
                (holidays) => holidays.id !== idToEdit
            );

            for (let i = 0; i < holidaysWithoutEditableHoliday.length; i++) {
                if (
                    startDate <= holidaysWithoutEditableHoliday[i].start &&
                    endDate >= holidaysWithoutEditableHoliday[i].end
                ) {
                    return true;
                }
            }
            return false;
        } else {
            for (let i = 0; i < holidays.length; i++) {
                if (
                    startDate <= holidays[i].start &&
                    endDate >= holidays[i].end
                ) {
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
            setOpenRangeAlert(true);
            return false;
        } else if (endDate === null) {
            return false;
        } else {
            return true;
        }
    };

    const addHoliday = () => {
        if (validateCalendar()) {
            let newHoliday = {
                start: startDate,
                end: endDate,
                comment: comment,
                confirmed: confirmed,
            };
            console.log("newHoliday", newHoliday);
            axios
                .post(
                    `${process.env.REACT_APP_ADDRESS}/vacationers/${chosenVacationer.id}`,
                    newHoliday
                )
                .then((response) => {
                    console.log(response);
                    resetForm();
                    resetDates();
                    handleCloseAddAlert();
                    handleCloseCalendar();
                    setSave(!save);
                })
                .catch((error) => {
                    console.error("There was a post new holiday error!", error);
                    handleOpenAPIError();
                });
        }
    };

    const confirmEdit = () => {
        if (validateCalendar()) {
            handleOpenEditAlert();
        }
    };
    const confirmAdd = () => {
        if (validateCalendar()) {
            handleOpenAddAlert();
        }
    };

    const onChange = (dates) => {
        setOverlapErrorMessage(false);
        const [start, end] = dates;

        console.log("start1", start, end);

        setStartDate(start);
        start.setHours(15);
        start.setUTCHours(0);

        setEndDate(end);
        console.log("start2", start, end);
        if (start !== null && end !== null) {
            calculatePerDay(start, end);
        }
    };

    const handleEdit = () => {
        let editedHoliday = {
            start: startDate,
            end: endDate,
            comment: comment,
            confirmed: confirmed,
            id: idToEdit,
        };
        axios
            .put(
                `${process.env.REACT_APP_ADDRESS}/vacationers/${chosenVacationer.id}/${idToEdit}`,
                editedHoliday
            )
            .then((response) => {
                console.log(response);
                resetForm();
                resetDates();
                handleCloseEditAlert();
                handleCloseCalendar();
                setSave(!save);
            })
            .catch((error) => {
                console.error("There was a put error!", error);
                handleOpenAPIError();
            });
    };

    return (
        <>
            <Modal
                className={styles.modal}
                open={openCalendar}
                onClose={handleCloseCalendar}
            >
                <Box className={styles.box}>
                    <h2>
                        Chosen dates:
                        <br />
                        {startDate && (
                            <>
                                {startDate.getUTCDate()}.
                                {startDate.getUTCMonth() + 1}.
                                {startDate.getUTCFullYear()}
                            </>
                        )}
                        {"  "} -{" "}
                        {endDate && (
                            <>
                                {endDate.getUTCDate()}.
                                {endDate.getUTCMonth() + 1}.
                                {endDate.getUTCFullYear()}
                            </>
                        )}
                        <div>
                            {endDate
                                ? daysInDateRange(startDate, endDate)
                                : "?"}{" "}
                            {daysInDateRange(startDate, endDate) === 1
                                ? "day"
                                : "days"}
                        </div>
                    </h2>
                    <LimitSetter
                        holidayToEdit={holidayToEdit}
                        endDate={endDate}
                        holidays={holidays}
                        setAlertingDates={setAlertingDates}
                        workerLimit={workerLimit}
                        dailyVacationers={dailyVacationers}
                    />
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
                            isClearable
                            highlightDates={
                                alertingDates.length > 0 &&
                                alertingDates.map((a) => {
                                    return new Date(a[0]);
                                })
                            }
                        />
                    </div>
                    <Dialog
                        open={openRangeAlert}
                        onClose={handleCloseRangeAlert}
                    >
                        <DialogTitle>
                            Time range you selected has full days!
                        </DialogTitle>
                        <DialogContent>Recheck your dates!</DialogContent>
                    </Dialog>

                    <div className={styles.addHoliday}>
                        <TextField
                            className={styles.comment}
                            label="Holiday comment"
                            variant="filled"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <FormGroup>
                            <FormControlLabel
                                checked={confirmed}
                                onChange={(e) => {
                                    setConfirmed(!confirmed);
                                }}
                                control={<Checkbox color="success" />}
                                label={"Confirmed holiday"}
                            />
                        </FormGroup>
                        {editingSpace ? (
                            <Button
                                className={styles.buttonStyle}
                                disabled={
                                    !endDate || alertingDates.length !== 0
                                }
                                onClick={confirmEdit}
                                variant="contained"
                            >
                                Edit a holiday
                            </Button>
                        ) : (
                            <Button
                                className={styles.buttonStyle}
                                disabled={
                                    !endDate || alertingDates.length !== 0
                                }
                                onClick={confirmAdd}
                                variant="contained"
                            >
                                Add a holiday
                            </Button>
                        )}
                    </div>
                    <Stack sx={{ width: "100%" }} spacing={2}>
                        {alertingDates.length > 0 && (
                            <Alert severity="info">
                                Choose new dates! Too many people on holiday!
                                <ul>
                                    {alertingDates.map((daily, index) => (
                                        <li
                                            className={styles.alertingDates}
                                            key={index}
                                        >
                                            {new Date(
                                                daily[0]
                                            ).toLocaleDateString("fi-FI")}{" "}
                                            ({daily[1]}){" "}
                                        </li>
                                    ))}
                                </ul>
                            </Alert>
                        )}

                        {startDateErrorMessage && (
                            <Alert severity="info">
                                Choose the start date!
                            </Alert>
                        )}

                        {endDateErrorMessage && (
                            <Alert severity="info">Choose the end date!</Alert>
                        )}

                        {overlapErrorMessage && (
                            <Alert severity="warning">Dates overlap!</Alert>
                        )}
                    </Stack>
                </Box>
            </Modal>
            <AlertDialog
                openAlert={openEditAlert}
                handleCloseAlert={handleCloseEditAlert}
                handleAction={handleEdit}
                dialogTitle={"Edit holiday"}
                dialogContent={
                    holidayToEdit.start &&
                    startDate &&
                    endDate &&
                    `Are you sure you want to edit the holiday from ${holidayToEdit.start.toLocaleDateString(
                        "fi-FI"
                    )}
                                   - ${holidayToEdit.end.toLocaleDateString(
                                       "fi-FI"
                                   )}  to ${startDate.toLocaleDateString(
                        "fi-FI"
                    )} - ${endDate.toLocaleDateString("fi-FI")} ?`
                }
                cancel={"No"}
                confirm={"Yes edit"}
            />

            <AlertDialog
                openAlert={openAddAlert}
                handleCloseAlert={handleCloseAddAlert}
                handleAction={addHoliday}
                dialogTitle={"Add a holiday"}
                dialogContent={
                    startDate &&
                    endDate &&
                    `Are you sure you want to add the holiday ${startDate.toLocaleDateString(
                        "fi-FI"
                    )}
                                   - ${endDate.toLocaleDateString("fi-FI")}?`
                }
                cancel={"No"}
                confirm={"Yes add"}
            />
        </>
    );
}
