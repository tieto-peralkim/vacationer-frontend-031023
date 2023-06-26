import styles from "./calendarsettings.module.css";
import {
    Box,
    Button,
    FormControl,
    NativeSelect,
    Slider,
    TextField,
    Tooltip,
} from "@mui/material";
import { CompactPicker } from "react-color";
import axios from "axios";
import { useEffect, useState } from "react";
import { useOutletVariables } from "../../../NavigationBar";
import AlertDialog from "../../Dialogs/AlertDialog";
import CloseIcon from "@mui/icons-material/Close";
import * as React from "react";

export default function CalendarSettings(props) {
    const {
        changesDoneWarning,
        setChangesDoneWarning,
        setSettingsOpen,
        rowHeight,
        setRowHeight,
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
        symbolFontColor,
        setSymbolFontColor,
        defaultColors,
        defaultRowHeight,
    } = props;
    const { user, APIError, setAPIError, newUserState, updateUser } =
        useOutletVariables();
    const [openSettingsSave, setOpenSettingsSave] = useState(false);
    const [symbolAlarmError, setSymbolAlarmError] = useState(false);
    const [notSavedError, setNotSavedError] = useState(false);

    const paletteNames = [
        "holiday",
        "unconfirmed-holiday",
        "weekend",
        "weekend-holiday",
        "symbol-color",
    ];
    const [colorPalette, setColorPalette] = useState(paletteNames[0]);
    const [colorToPick, setColorToPick] = useState(holidayColor);
    const symbolNumberError =
        holidaySymbol.trim().length === 0 || !isNaN(Number(holidaySymbol));
    const unconfirmedSymbolError =
        unconfirmedHolidaySymbol.trim().length === 0 ||
        !isNaN(Number(unconfirmedHolidaySymbol));

    const resetColors = () => {
        setColorToPick(defaultColors["holidayColor"]);
        setColorPalette(paletteNames[0]);
        setHolidayColor(defaultColors["holidayColor"]);
        setUnConfirmedHolidayColor(defaultColors["unConfirmedHolidayColor"]);
        setWeekendColor(defaultColors["weekendColor"]);
        setWeekendHolidayColor(defaultColors["weekendHolidayColor"]);
        setSymbolFontColor(defaultColors["symbolFontColor"]);
    };

    useEffect(() => {
        if (
            user.calendarSettings[0].symbolFontColor &&
            symbolFontColor !== user.calendarSettings[0].symbolFontColor
        ) {
            setChangesDoneWarning(true);
            return;
        } else if (
            !user.calendarSettings[0].symbolFontColor &&
            symbolFontColor !== defaultColors["symbolFontColor"]
        ) {
            setChangesDoneWarning(true);
            return;
        }

        if (
            user.calendarSettings[0].rowHeight &&
            rowHeight !== user.calendarSettings[0].rowHeight
        ) {
            setChangesDoneWarning(true);
            return;
        } else if (
            !user.calendarSettings[0].rowHeight &&
            rowHeight !== defaultRowHeight
        ) {
            setChangesDoneWarning(true);
            return;
        }

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
            return;
        }
        setChangesDoneWarning(false);
        return;
    }, [
        holidaySymbol,
        unconfirmedHolidaySymbol,
        holidayColor,
        unConfirmedHolidayColor,
        weekendColor,
        weekendHolidayColor,
        symbolFontColor,
        rowHeight,
    ]);

    const changeCalendarHeight = (e: any) => {
        setRowHeight(e.target.value);
    };

    const selectColorPalette = (event) => {
        setColorPalette(event.target.value);
        switch (event.target.value) {
            case paletteNames[0]:
                setColorToPick(holidayColor);
                break;
            case paletteNames[1]:
                setColorToPick(unConfirmedHolidayColor);
                break;
            case paletteNames[2]:
                setColorToPick(weekendColor);
                break;
            case paletteNames[3]:
                setColorToPick(weekendHolidayColor);
                break;
            case paletteNames[4]:
                setColorToPick(symbolFontColor);
                break;
        }
    };

    const doColorChange = (color) => {
        setColorToPick(color.hex);
        switch (colorPalette) {
            case paletteNames[0]:
                setHolidayColor(color.hex);
                break;
            case paletteNames[1]:
                setUnConfirmedHolidayColor(color.hex);
                break;
            case paletteNames[2]:
                setWeekendColor(color.hex);
                break;
            case paletteNames[3]:
                setWeekendHolidayColor(color.hex);
                break;
            case paletteNames[4]:
                setSymbolFontColor(color.hex);
                break;
        }
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
                symbolFontColor: symbolFontColor,
                rowHeight: rowHeight,
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
                .then(() => {
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

    const resetSettings = () => {
        setHolidaySymbol(user.calendarSettings[0].holidaySymbol);
        setUnconfirmedHolidaySymbol(
            user.calendarSettings[0].unConfirmedHolidaySymbol
        );
        setHolidayColor(user.calendarSettings[0].holidayColor);
        setUnConfirmedHolidayColor(
            user.calendarSettings[0].unConfirmedHolidayColor
        );
        setWeekendColor(user.calendarSettings[0].weekendColor);
        setWeekendHolidayColor(user.calendarSettings[0].weekendHolidayColor);
        setSymbolFontColor(user.calendarSettings[0].symbolFontColor);
        setRowHeight(user.calendarSettings[0].rowHeight);
    };

    return (
        <div>
            <Button
                variant={"contained"}
                size={"small"}
                onClick={() => {
                    if (!changesDoneWarning) {
                        setSettingsOpen(false);
                    } else {
                        setNotSavedError(true);
                    }
                }}
            >
                <CloseIcon />
            </Button>
            <div className={styles.content}>
                <div className={styles.topRow}>
                    <div>
                        <b>Holiday symbols</b>
                        <div>You can also copy-paste a short emoji</div>
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
                    <Box className={styles.rowHeightBox}>
                        <b>Row height: {rowHeight}</b>
                        <Slider
                            size={"medium"}
                            value={rowHeight}
                            step={1}
                            marks
                            min={1}
                            max={3}
                            onChange={changeCalendarHeight}
                        />
                    </Box>
                </div>
                <div>
                    <div className={styles.lowRow}>
                        <FormControl>
                            <b>Colors</b>
                            <NativeSelect
                                value={colorPalette as ""}
                                onChange={selectColorPalette}
                                className={styles.selectComponent}
                            >
                                <option key={0} value={paletteNames[0]}>
                                    Weekday holiday (Confirmed)
                                </option>
                                <option key={1} value={paletteNames[1]}>
                                    Weekday holiday (Unconfirmed)
                                </option>
                                <option key={2} value={paletteNames[2]}>
                                    Weekend / public holiday
                                </option>
                                <option key={3} value={paletteNames[3]}>
                                    Holiday on weekend / public holiday
                                </option>
                                <option key={4} value={paletteNames[4]}>
                                    Holiday symbol font
                                </option>
                            </NativeSelect>
                        </FormControl>
                        <div className={styles.colorPicker}>
                            <CompactPicker
                                color={colorToPick as string}
                                onChangeComplete={doColorChange}
                            />
                        </div>
                    </div>
                    <div className={styles.buttons}>
                        <Button
                            disabled={!user || !changesDoneWarning}
                            onClick={updateCalendarSettings}
                            variant="contained"
                            size={"small"}
                        >
                            Save Calendar settings
                        </Button>
                        <Tooltip
                            title={"Reset all colors to default values"}
                            placement={"bottom"}
                        >
                            <Button
                                disabled={!user}
                                onClick={resetColors}
                                variant="outlined"
                                color={"secondary"}
                                size={"small"}
                            >
                                Set to default colors
                            </Button>
                        </Tooltip>
                    </div>
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
                    handleAction={() => {
                        updateCalendarSettings();
                        setSettingsOpen(false);
                    }}
                    openAlert={notSavedError}
                    handleCloseAlert={() => {
                        setSettingsOpen(false);
                        resetSettings();
                        setChangesDoneWarning(false);
                    }}
                    dialogTitle={"Warning!"}
                    dialogContent={"Do you want to save the settings?"}
                    cancel={"No"}
                    confirm={"Yes"}
                />
            </div>
        </div>
    );
}
