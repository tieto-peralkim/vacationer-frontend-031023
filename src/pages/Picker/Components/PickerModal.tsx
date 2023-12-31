import styles from "./pickermodal.module.css";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Modal,
    Stack,
    TextField,
} from "@mui/material";
import LimitSetter from "./LimitSetter";
import DatePicker from "react-datepicker";
import React, { useEffect, useState } from "react";
import AlertDialog from "../../Dialogs/AlertDialog";
import axios from "axios";
import { useOutletVariables } from "../../../NavigationBar";
import PropTypes from "prop-types";

function PickerModal({
    resetForm,
    openCalendar,
    chosenUser,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    holidayToEdit,
    holidays,
    workerLimit,
    dailyVacationers,
    setDailyVacationers,
    calendarDaysExcluded,
    editingSpace,
    setEditingSpace,
    changingStartedSpace,
    today,
    startDateErrorMessage,
    endDateErrorMessage,
    comment,
    setComment,
    confirmed,
    setConfirmed,
    idToEdit,
    setChangingStartedSpace,
    setOpenCalendar,
    resetDates,
    save,
    setSave,
    calculatePerDay,
}) {
    const { setAPIError } = useOutletVariables();
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

    const daysInDateRange = (firstDate, secondDate) => {
        const millisecondsDay = 24 * 60 * 60 * 1000;
        const daysInRange =
            Math.round(Math.abs((firstDate - secondDate) / millisecondsDay)) +
            1;
        return daysInRange;
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
            const newHoliday = {
                start: startDate,
                end: endDate,
                comment: comment.trim(),
                confirmed: confirmed,
            };
            axios
                .post(
                    `${process.env.REACT_APP_ADDRESS}/vacationers/${chosenUser.id}`,
                    newHoliday,
                    { withCredentials: true }
                )
                .then(() => {
                    resetDates();
                    handleCloseAddAlert();
                    handleCloseCalendar();
                    resetForm();
                    setSave(!save);
                })
                .catch((error) => {
                    console.error("There was a post new holiday error!", error);
                    setAPIError(true);
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

    // For DatePicker
    const onChange = (dates) => {
        setOverlapErrorMessage(false);
        const [start, end] = dates;

        if (start) {
            // Sethours needed for the DatePicker. If omitted, DatePicker shows wrong startdate
            start.setHours(12);
            // Holiday start time
            start.setUTCHours(12);

            setStartDate(start);
            setEndDate(null);
        }
        if (end) {
            // Holiday end time
            end.setUTCHours(12);
            setEndDate(end);
        }
        if (start !== null && end !== null) {
            calculatePerDay(start, end);
        }
    };

    const handleEdit = () => {
        const editedHoliday = {
            start: startDate,
            end: endDate,
            comment: comment.trim(),
            confirmed: confirmed,
            id: idToEdit,
        };
        axios
            .put(
                `${process.env.REACT_APP_ADDRESS}/vacationers/${chosenUser.id}/${idToEdit}`,
                editedHoliday,
                { withCredentials: true }
            )
            .then(() => {
                resetDates();
                handleCloseEditAlert();
                handleCloseCalendar();
                resetForm();
                setSave(!save);
            })
            .catch((error) => {
                console.error("There was a put error!", error);
                setAPIError(true);
            });
    };

    return (
        <>
            <Modal open={openCalendar} onClose={handleCloseCalendar}>
                <Box className={styles.pickerModalBox}>
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
                        endDate={endDate}
                        setAlertingDates={setAlertingDates}
                        workerLimit={workerLimit}
                        dailyVacationers={dailyVacationers}
                    />
                    <div className={styles.datePicker}>
                        <DatePicker
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
                                onChange={() => {
                                    setConfirmed(!confirmed);
                                }}
                                control={<Checkbox color="success" />}
                                label={"Confirmed holiday"}
                            />
                        </FormGroup>
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

PickerModal.propTypes = {
    resetForm: PropTypes.func,
    openCalendar: PropTypes.bool,
    chosenUser: PropTypes.object,
    startDate: PropTypes.object,
    setStartDate: PropTypes.func,
    endDate: PropTypes.object,
    setEndDate: PropTypes.func,
    holidayToEdit: PropTypes.object,
    holidays: PropTypes.array,
    workerLimit: PropTypes.number,
    dailyVacationers: PropTypes.array,
    setDailyVacationers: PropTypes.func,
    calendarDaysExcluded: PropTypes.array,
    editingSpace: PropTypes.bool,
    setEditingSpace: PropTypes.func,
    changingStartedSpace: PropTypes.bool,
    today: PropTypes.object,
    startDateErrorMessage: PropTypes.bool,
    endDateErrorMessage: PropTypes.bool,
    comment: PropTypes.string,
    setComment: PropTypes.func,
    confirmed: PropTypes.bool,
    setConfirmed: PropTypes.func,
    idToEdit: PropTypes.string,
    setChangingStartedSpace: PropTypes.func,
    setOpenCalendar: PropTypes.func,
    resetDates: PropTypes.func,
    save: PropTypes.bool,
    setSave: PropTypes.func,
    calculatePerDay: PropTypes.func,
};
export default PickerModal;
