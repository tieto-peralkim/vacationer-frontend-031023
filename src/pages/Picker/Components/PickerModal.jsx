import styles from "./pickermodal.module.css";
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
import { useEffect, useState } from "react";
import AlertDialog from "../../Dialogs/AlertDialog";
import axios from "axios";

export default function PickerModal({
    resetForm,
    openCalendar,
    chosenUser,
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
    save,
    setSave,
    handleOpenAPIError,
    calculatePerDay,
}) {
    const [alertingDates, setAlertingDates] = useState([]);
    const [openEditAlert, setOpenEditAlert] = useState(false);
    const [openAddAlert, setOpenAddAlert] = useState(false);
    const [tooManyWarning, setTooManyWarning] = useState(false);

    const [warningStartDate, setWarningStartDate] = useState(new Date());
    const [warningEndDate, setWarningEndDate] = useState(new Date());
    const [overlapErrorMessage, setOverlapErrorMessage] = useState(false);

    const handleCloseCalendar = () => {
        setOpenCalendar(false);
        setEditingSpace(false);
        setChangingStartedSpace(false);
        setOverlapErrorMessage(false);
        setDailyVacationers([]);
        setComment("");
        setConfirmed(false);
        resetDates();
        setTooManyWarning(false);
    };

    const disabledConditions =
        !endDate || alertingDates.length !== 0 || overlapErrorMessage;

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

    useEffect(() => {
        if (alertingDates.length > 0) {
            setWarningStartDate(startDate);
            setWarningEndDate(endDate);
            resetDates();
            setTooManyWarning(true);
        }
    }, [alertingDates]);

    // When endDate has been chosen
    useEffect(() => {
        console.log("chosenUser", chosenUser);
        if (calendarDatesOverlap()) {
            setOverlapErrorMessage(true);
        }
    }, [endDate]);

    // When startDate has been chosen
    useEffect(() => {
        if (startDate !== null) {
            setTooManyWarning(false);
        }
    }, [startDate]);

    const addHoliday = () => {
        if (!overlapErrorMessage) {
            let newHoliday = {
                start: startDate,
                end: endDate,
                comment: comment,
                confirmed: confirmed,
            };
            console.log("newHoliday", newHoliday);
            axios
                .post(
                    `${process.env.REACT_APP_ADDRESS}/vacationers/${chosenUser.id}`,
                    newHoliday,
                    { withCredentials: true }
                )
                .then((response) => {
                    console.log(response);
                    resetDates();
                    handleCloseAddAlert();
                    handleCloseCalendar();
                    resetForm();
                    setSave(!save);
                })
                .catch((error) => {
                    console.error("There was a post new holiday error!", error);

                    handleOpenAPIError();
                });
        }
    };

    const confirmEdit = () => {
        if (!overlapErrorMessage) {
            handleOpenEditAlert();
        }
    };
    const confirmAdd = () => {
        if (!overlapErrorMessage) {
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
                `${process.env.REACT_APP_ADDRESS}/vacationers/${chosenUser.id}/${idToEdit}`,
                editedHoliday,
                { withCredentials: true }
            )
            .then((response) => {
                console.log(response);
                resetDates();
                handleCloseEditAlert();
                handleCloseCalendar();
                resetForm();
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
                    <div>
                        <Stack spacing={1} direction="row">
                            {!tooManyWarning ? (
                                <Alert
                                    severity="success"
                                    className={styles.topAlert}
                                >
                                    Holiday dates:{"  "}
                                    {startDate && (
                                        <>
                                            {startDate.getUTCDate()}.
                                            {startDate.getUTCMonth() + 1}.
                                            {startDate.getUTCFullYear()}
                                            {"  "} -{" "}
                                        </>
                                    )}
                                    {endDate && (
                                        <>
                                            {endDate.getUTCDate()}.
                                            {endDate.getUTCMonth() + 1}.
                                            {endDate.getUTCFullYear()}
                                            {", "}
                                            {daysInDateRange(
                                                startDate,
                                                endDate
                                            )}{" "}
                                            {daysInDateRange(
                                                startDate,
                                                endDate
                                            ) === 1
                                                ? "day"
                                                : "days"}
                                        </>
                                    )}
                                </Alert>
                            ) : (
                                <Alert
                                    severity="warning"
                                    className={styles.topAlert}
                                >
                                    Too many vacationers{" "}
                                    {warningStartDate.getUTCDate()}.
                                    {warningStartDate.getUTCMonth() + 1}.
                                    {warningStartDate.getUTCFullYear()} -{" "}
                                    {warningEndDate.getUTCDate()}.
                                    {warningEndDate.getUTCMonth() + 1}.
                                    {warningEndDate.getUTCFullYear()}!
                                    <ul>
                                        {/*{alertingDates.map((daily, index) => (*/}
                                        {/*    <li*/}
                                        {/*        className={styles.alertingDates}*/}
                                        {/*        key={index}*/}
                                        {/*    >*/}
                                        {/*        {new Date(*/}
                                        {/*            daily[0]*/}
                                        {/*        ).toLocaleDateString("fi-FI")}{" "}*/}
                                        {/*        ({daily[1]}){" "}*/}
                                        {/*    </li>*/}
                                        {/*))}*/}
                                    </ul>
                                </Alert>
                            )}
                        </Stack>
                    </div>
                    <Stack spacing={1} direction="row">
                        {startDateErrorMessage ? (
                            <Alert
                                severity="warning"
                                className={styles.bottomAlert}
                            >
                                Pick start date
                            </Alert>
                        ) : (
                            <Alert
                                severity="success"
                                className={styles.bottomAlert}
                            >
                                Start date
                            </Alert>
                        )}

                        {endDateErrorMessage ? (
                            <Alert
                                severity="warning"
                                className={styles.bottomAlert}
                            >
                                Pick end date
                            </Alert>
                        ) : (
                            <Alert
                                severity="success"
                                className={styles.bottomAlert}
                            >
                                End date
                            </Alert>
                        )}

                        {overlapErrorMessage ? (
                            <Alert
                                severity="warning"
                                className={styles.bottomAlert}
                            >
                                Dates overlap
                            </Alert>
                        ) : (
                            <Alert
                                severity="success"
                                className={styles.bottomAlert}
                            >
                                Dates ok!
                            </Alert>
                        )}
                    </Stack>
                    <LimitSetter
                        holidayToEdit={holidayToEdit}
                        endDate={endDate}
                        holidays={holidays}
                        setAlertingDates={setAlertingDates}
                        workerLimit={workerLimit}
                        dailyVacationers={dailyVacationers}
                    />
                    <div className={styles.datePicker}>
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
                            monthsShown={2}
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

                    <div className={styles.rowStyle}>
                        <TextField
                            className={styles.comment}
                            label="Holiday comment"
                            variant="filled"
                            value={comment}
                            disabled={disabledConditions}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <FormGroup>
                            <FormControlLabel
                                checked={confirmed}
                                disabled={disabledConditions}
                                onChange={(e) => {
                                    setConfirmed(!confirmed);
                                }}
                                control={<Checkbox color="success" />}
                                label={"Confirmed holiday"}
                            />
                        </FormGroup>
                    </div>
                    <div className={styles.buttonStyle}>
                        {editingSpace ? (
                            <Button
                                disabled={disabledConditions}
                                onClick={confirmEdit}
                                variant="contained"
                            >
                                Edit a holiday
                            </Button>
                        ) : (
                            <Button
                                disabled={
                                    !endDate ||
                                    alertingDates.length !== 0 ||
                                    overlapErrorMessage
                                }
                                onClick={confirmAdd}
                                variant="contained"
                            >
                                Add a holiday
                            </Button>
                        )}
                    </div>
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
