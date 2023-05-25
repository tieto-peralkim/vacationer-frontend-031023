import styles from "./calendarsettings.module.css";
import {
    Button,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    TextField,
    Tooltip,
} from "@mui/material";
import { SliderPicker } from "react-color";
import axios from "axios";
import { useEffect, useState } from "react";
import { useOutletVariables } from "../../../NavigationBar";
import AlertDialog from "../../Dialogs/AlertDialog";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";

export default function CalendarSettings({
    changesDoneWarning,
    setChangesDoneWarning,
    setSettingsOpen,
    columnHeight,
    setColumnHeight,
    holidaySymbol,
    setHolidaySymbol,
    unconfirmedHolidaySymbol,
    setUnconfirmedHolidaySymbol,
    holidayColor,
    setHolidayColor,
    unConfirmedHolidayColor,
    setUnConfirmedHolidayColor,
    weekendColor,
    setWeekendColor,
    weekendHolidayColor,
    setWeekendHolidayColor,
}) {
    const { user, APIError, setAPIError, newUserState, updateUser } =
        useOutletVariables();
    const [openSettingsSave, setOpenSettingsSave] = useState(false);
    const [symbolAlarmError, setSymbolAlarmError] = useState(false);
    const [notSavedError, setNotSavedError] = useState(false);

    const symbolNumberError =
        holidaySymbol.trim().length === 0 || !isNaN(Number(holidaySymbol));
    const unconfirmedSymbolError =
        unconfirmedHolidaySymbol.trim().length === 0 ||
        !isNaN(Number(unconfirmedHolidaySymbol));

    const resetColors = () => {
        setHolidayColor("#73D8FF");
        setUnConfirmedHolidayColor("#68CCCA");
        setWeekendColor("#808080");
        setWeekendHolidayColor("#CCCCCC");
    };

    const handleHolidayColorChange = (color) => {
        setHolidayColor(color.hex);
    };

    const handleUnconfirmedHolidayColorChange = (color) => {
        setUnConfirmedHolidayColor(color.hex);
    };

    const handleWeekendColorChange = (color) => {
        setWeekendColor(color.hex);
    };

    const handleWeekendHolidayColorChange = (color) => {
        setWeekendHolidayColor(color.hex);
    };

    useEffect(() => {
        if (
            holidaySymbol !== user.calendarSettings[0].holidaySymbol ||
            unconfirmedHolidaySymbol !==
                user.calendarSettings[0].unConfirmedHolidaySymbol ||
            holidayColor !== user.calendarSettings[0].holidayColor ||
            unConfirmedHolidayColor !==
                user.calendarSettings[0].unConfirmedHolidayColor ||
            weekendColor !== user.calendarSettings[0].weekendColor ||
            weekendHolidayColor !== user.calendarSettings[0].weekendHolidayColor
        ) {
            setChangesDoneWarning(true);
        } else {
            setChangesDoneWarning(false);
        }
    }, [
        holidaySymbol,
        unconfirmedHolidaySymbol,
        holidayColor,
        unConfirmedHolidayColor,
        weekendColor,
        weekendHolidayColor,
    ]);

    const changeCalendarHeight = (e: any) => {
        setColumnHeight(e.target.value);
    };

    const updateCalendarSettings = () => {
        if (!symbolNumberError && !unconfirmedSymbolError) {
            let changedCalendarSettings = {
                holidaySymbol: holidaySymbol,
                unConfirmedHolidaySymbol: unconfirmedHolidaySymbol,
                holidayColor: holidayColor,
                unConfirmedHolidayColor: unConfirmedHolidayColor,
                weekendColor: weekendColor,
                weekendHolidayColor: weekendHolidayColor,
            };
            // Todo: For creation of multiple calendar settings
            // let newCalendarSettings = {
            //     holidaySymbol: holidaySymbol,
            //     unConfirmedHolidaySymbol: unconfirmedHolidaySymbol,
            //     holidayColor: holidayColor,
            //     unConfirmedHolidayColor: unConfirmedHolidayColor,
            //     weekendColor: weekendColor,
            //     weekendHolidayColor: weekendHolidayColor,
            // };
            axios
                .patch(
                    `${process.env.REACT_APP_ADDRESS}/vacationers/${user.id}/calendarSettings`,
                    { newCalendarSettings: changedCalendarSettings },
                    { withCredentials: true }
                )
                // Todo: For creation of multiple calendar settings
                // .post(
                //     `${process.env.REACT_APP_ADDRESS}/vacationers/${user.id}/calendarSettings`,
                //     newCalendarSettings,
                //     { withCredentials: true }
                // )
                .then((response) => {
                    updateUser(!newUserState);
                    setOpenSettingsSave(true);
                    setChangesDoneWarning(false);
                })
                .catch((error) => {
                    setAPIError(true);
                    console.error(
                        "There was a calendar settings change error!",
                        error
                    );
                });
        } else {
            setSymbolAlarmError(true);
        }
    };

    return (
        <>
            <Button
                onClick={() => {
                    if (!changesDoneWarning) {
                        setSettingsOpen(false);
                    } else {
                        setNotSavedError(true);
                    }
                }}
                size={"small"}
            >
                <CloseIcon />
            </Button>
            <div className={styles.content}>
                <div className={styles.topRow}>
                    <div>
                        <Tooltip
                            title={"You can also copy-paste a short emoji"}
                        >
                            <b>Holiday symbols</b>
                        </Tooltip>
                        <div className={styles.rowFlex}>
                            <TextField
                                className={styles.symbolFields}
                                label="Confirmed"
                                variant="outlined"
                                size={"small"}
                                disabled={APIError}
                                error={symbolNumberError}
                                value={holidaySymbol}
                                onChange={(e) => {
                                    setHolidaySymbol(e.target.value);
                                }}
                                inputProps={{ maxLength: 2 }}
                            />
                            <TextField
                                className={styles.symbolFields}
                                label="Un-confirmed"
                                variant="outlined"
                                size={"small"}
                                disabled={APIError}
                                error={unconfirmedSymbolError}
                                value={unconfirmedHolidaySymbol}
                                onChange={(e) => {
                                    setUnconfirmedHolidaySymbol(e.target.value);
                                }}
                                inputProps={{ maxLength: 2 }}
                            />
                        </div>
                    </div>
                    <FormControl>
                        <b>Calendar height</b>
                        <RadioGroup
                            row
                            value={columnHeight}
                            onChange={changeCalendarHeight}
                        >
                            <FormControlLabel
                                value="1"
                                control={
                                    <Radio
                                        sx={{
                                            "& .MuiSvgIcon-root": {
                                                fontSize: 16,
                                            },
                                        }}
                                    />
                                }
                                label={
                                    <Typography sx={{ fontSize: "10px" }}>
                                        Low
                                    </Typography>
                                }
                            />
                            <FormControlLabel
                                value="1.5"
                                control={
                                    <Radio
                                        sx={{
                                            "& .MuiSvgIcon-root": {
                                                fontSize: 16,
                                            },
                                        }}
                                    />
                                }
                                label={
                                    <Typography sx={{ fontSize: "10px" }}>
                                        Normal
                                    </Typography>
                                }
                            />
                            <FormControlLabel
                                value="2"
                                control={
                                    <Radio
                                        sx={{
                                            "& .MuiSvgIcon-root": {
                                                fontSize: 16,
                                            },
                                        }}
                                    />
                                }
                                label={
                                    <Typography sx={{ fontSize: "10px" }}>
                                        High
                                    </Typography>
                                }
                            />
                        </RadioGroup>
                    </FormControl>
                </div>
                <div className={styles.colorPickers}>
                    <div className={styles.rowFlex}>
                        <div className={styles.columnFlex}>
                            <b>Holiday</b>
                            <SliderPicker
                                color={holidayColor}
                                onChangeComplete={handleHolidayColorChange}
                            />
                        </div>
                        <div className={styles.columnFlex}>
                            <b>Unconfirmed holiday</b>
                            <SliderPicker
                                color={unConfirmedHolidayColor}
                                onChangeComplete={
                                    handleUnconfirmedHolidayColorChange
                                }
                            />
                        </div>

                        <div className={styles.columnFlex}>
                            <b>Weekend</b>
                            <SliderPicker
                                color={weekendColor}
                                onChangeComplete={handleWeekendColorChange}
                            />
                        </div>
                        <div className={styles.columnFlex}>
                            <b>Weekend holiday</b>
                            <SliderPicker
                                color={weekendHolidayColor}
                                onChangeComplete={
                                    handleWeekendHolidayColorChange
                                }
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.buttons}>
                    <Button
                        disabled={!user}
                        onClick={resetColors}
                        variant="outlined"
                        color={"secondary"}
                        size={"small"}
                    >
                        Reset colors
                    </Button>
                    <Button
                        disabled={!user || !changesDoneWarning}
                        onClick={updateCalendarSettings}
                        variant="contained"
                        size={"small"}
                    >
                        Save Calendar settings
                    </Button>
                </div>
                <AlertDialog
                    openAlert={openSettingsSave}
                    handleAction={() => void 0}
                    handleCloseAlert={() => {
                        setOpenSettingsSave(false);
                        setSettingsOpen(false);
                    }}
                    dialogTitle={"Settings"}
                    dialogContent={"Calendar settings saved"}
                    cancel={""}
                    confirm={""}
                />
                <AlertDialog
                    handleAction={() => void 0}
                    openAlert={symbolAlarmError}
                    handleCloseAlert={() => setSymbolAlarmError(false)}
                    dialogTitle={"ERROR!"}
                    dialogContent={"Symbols can not be numbers or empty!"}
                    cancel={""}
                    confirm={""}
                />
                <AlertDialog
                    handleAction={() => void 0}
                    openAlert={notSavedError}
                    handleCloseAlert={() => {
                        setSettingsOpen(false);
                        setNotSavedError(false);
                    }}
                    dialogTitle={"Warning!"}
                    dialogContent={"Calendar settings not saved yet!"}
                    cancel={""}
                    confirm={""}
                />
            </div>
        </>
    );
}
