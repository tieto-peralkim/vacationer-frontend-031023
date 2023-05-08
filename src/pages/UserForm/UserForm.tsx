import { Button, TextField } from "@mui/material";
import styles from "./userform.module.css";
import AlertDialog from "../Dialogs/AlertDialog";
import axios from "axios";
import { useEffect, useState } from "react";
import ModifyDialog from "../Dialogs/ModifyDialog";
import { CompactPicker } from "react-color";
import { useNavigate } from "react-router-dom";
import { useOutletVariables } from "../../NavigationBar";

export default function UserForm() {
    const minNameLength = 3;
    const maxNameLength = 12;
    const [holidayColor, setHolidayColor] = useState("");
    const [unConfirmedHolidayColor, setUnConfirmedHolidayColor] = useState("");
    const [weekendColor, setWeekendColor] = useState("");
    const [weekendHolidayColor, setWeekendHolidayColor] = useState("");
    const [holidaySymbol, setHolidaySymbol] = useState("");
    const [unconfirmedHolidaySymbol, setUnconfirmedHolidaySymbol] =
        useState("");

    const { user, APIError, setAPIError, newUserState, updateUser } =
        useOutletVariables();
    const [completedAction, setCompletedAction] = useState(false);

    const [userCreationMessage, setUserCreationMessage] = useState("");

    const [userNameError, setUserNameError] = useState(false);
    const [symbolAlarmError, setSymbolAlarmError] = useState(false);

    const [openModifyUserAlert, setOpenModifyUserAlert] = useState(false);
    const symbolNumberError =
        holidaySymbol.trim().length === 0 || !isNaN(Number(holidaySymbol));
    const unconfirmedSymbolError =
        unconfirmedHolidaySymbol.trim().length === 0 ||
        !isNaN(Number(unconfirmedHolidaySymbol));
    const [userUpdatedAt, setUserUpdatedAt] = useState("");

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
        updateUser(!newUserState);
        console.log("updating soon", user);
    }, [completedAction]);

    useEffect(() => {
        if (user && user.calendarSettings && user.updatedAt) {
            let date = new Date(user.updatedAt);
            console.log("date", date);
            let updateDate =
                date.toLocaleDateString("fi-FI") +
                " " +
                date.toLocaleTimeString("fi-FI");

            setUserUpdatedAt(updateDate);
            console.log("Calendar set", user.calendarSettings[0]);

            setHolidayColor(user.calendarSettings[0].holidayColor);
            setUnConfirmedHolidayColor(
                user.calendarSettings[0].unConfirmedHolidayColor
            );
            setWeekendColor(user.calendarSettings[0].weekendColor);
            setWeekendHolidayColor(
                user.calendarSettings[0].weekendHolidayColor
            );
            setHolidaySymbol(user.calendarSettings[0].holidaySymbol);
            setUnconfirmedHolidaySymbol(
                user.calendarSettings[0].unConfirmedHolidaySymbol
            );
        }
    }, [user]);

    const changeUserName = (newName) => {
        console.log("selectedUser", user, "changeUserName", newName);
        if (
            newName.length >= minNameLength &&
            newName.length <= maxNameLength
        ) {
            axios
                .patch(
                    `${process.env.REACT_APP_ADDRESS}/vacationers/${user.id}`,
                    { newName: newName },
                    { withCredentials: true }
                )
                .then((response) => {
                    changeUserNameinTeams(user.id, newName);
                    console.log(response);
                    setOpenModifyUserAlert(false);
                })
                .catch((error) => {
                    if (error.response.status === 409) {
                        setUserCreationMessage(error.response.data);
                    } else {
                        console.error(
                            "There was a user name change error!",
                            error
                        );
                        setAPIError(true);
                    }
                });
        } else {
            setUserNameError(true);
        }
    };

    const changeUserNameinTeams = (memberId, newName) => {
        console.log("changeUserNameinTeams", memberId, newName);
        axios
            .put(
                `${process.env.REACT_APP_ADDRESS}/teams/membername/${memberId}`,
                { newName: newName },
                { withCredentials: true }
            )
            .then(() => {
                setCompletedAction(!completedAction);
            })
            .catch((error) => {
                console.error(
                    "There was a put changeUserNameinTeams error!",
                    error
                );
                setAPIError(true);
            });
    };

    const resetColors = () => {
        setHolidayColor("#73D8FF");
        setUnConfirmedHolidayColor("#68CCCA");
        setWeekendColor("#808080");
        setWeekendHolidayColor("#CCCCCC");
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
                    console.log("updating calendar settings");
                    setCompletedAction(!completedAction);
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
            <div className={styles.content}>
                {user && user.name && (
                    <div className={styles.borderedBox}>
                        <div className={styles.allButtons}>
                            <Button
                                onClick={() => {
                                    setOpenModifyUserAlert(true);
                                }}
                                variant={"contained"}
                            >
                                {user.name}
                            </Button>
                        </div>
                        <div>
                            nameId: <i>{user.nameId}</i>
                        </div>
                        <div>
                            admin: <i>{user.admin ? "yes" : "no"}</i>
                        </div>
                        <div>
                            user updated: <i>{userUpdatedAt}</i>
                        </div>
                        <a
                            href={`${process.env.REACT_APP_ADDRESS}/checkAuthorization`}
                            target={"_blank"}
                        >
                            Check Github permissions of the app
                        </a>
                        <div className={styles.colorPickers}>
                            <div className={styles.rowFlex}>
                                <TextField
                                    label="Holiday symbol"
                                    variant="outlined"
                                    disabled={APIError}
                                    error={symbolNumberError}
                                    value={holidaySymbol}
                                    onChange={(e) => {
                                        setHolidaySymbol(e.target.value);
                                    }}
                                    inputProps={{ maxLength: 2 }}
                                />
                                <TextField
                                    label="Un-confirmed holiday symbol"
                                    error={unconfirmedSymbolError}
                                    variant="outlined"
                                    disabled={APIError}
                                    value={unconfirmedHolidaySymbol}
                                    onChange={(e) => {
                                        setUnconfirmedHolidaySymbol(
                                            e.target.value
                                        );
                                    }}
                                    inputProps={{ maxLength: 2 }}
                                />
                            </div>
                            <div className={styles.rowFlex}>
                                <div className={styles.columnFlex}>
                                    <h5>Holiday color</h5>
                                    <div>
                                        <CompactPicker
                                            color={holidayColor}
                                            onChangeComplete={
                                                handleHolidayColorChange
                                            }
                                        />
                                    </div>
                                </div>
                                <div className={styles.columnFlex}>
                                    <h5>Unconfirmed holiday color</h5>
                                    <CompactPicker
                                        color={unConfirmedHolidayColor}
                                        onChangeComplete={
                                            handleUnconfirmedHolidayColorChange
                                        }
                                    />
                                </div>
                            </div>
                            <div className={styles.rowFlex}>
                                <div className={styles.columnFlex}>
                                    <h5>Weekend color</h5>
                                    <CompactPicker
                                        color={weekendColor}
                                        onChangeComplete={
                                            handleWeekendColorChange
                                        }
                                    />
                                </div>
                                <div className={styles.columnFlex}>
                                    <h5>Weekend holiday color</h5>
                                    <CompactPicker
                                        color={weekendHolidayColor}
                                        onChangeComplete={
                                            handleWeekendHolidayColorChange
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.belowButton}>
                            <Button
                                disabled={!user}
                                onClick={resetColors}
                                variant="outlined"
                                color={"secondary"}
                            >
                                Reset Calendar colors
                            </Button>
                        </div>
                        <div className={styles.belowButton}>
                            <Button
                                disabled={!user}
                                onClick={updateCalendarSettings}
                                variant="contained"
                            >
                                Save Calendar settings
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            <ModifyDialog
                openAlert={openModifyUserAlert}
                handleCloseAlert={() => setOpenModifyUserAlert(false)}
                dialogTitle={"Modify user"}
                dialogContent={user && "Change name of user " + user.nameId}
                inputContent={user && user.name}
                handleAction={(name) => changeUserName(name)}
                cancel={"No"}
                confirm={"Yes change name"}
            />

            <AlertDialog
                openAlert={userCreationMessage !== ""}
                handleAction={() => void 0}
                handleCloseAlert={() => setUserCreationMessage("")}
                dialogTitle={"ERROR!"}
                dialogContent={userCreationMessage}
                cancel={""}
                confirm={""}
            />
            <AlertDialog
                openAlert={userNameError}
                handleAction={() => void 0}
                handleCloseAlert={() => setUserNameError(false)}
                dialogTitle={"ERROR!"}
                dialogContent={`This username is too short or long (should be ${minNameLength}-${maxNameLength} characters)!`}
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
        </>
    );
}
