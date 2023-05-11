import { Button, List, ListItem, ListItemIcon, TextField } from "@mui/material";
import styles from "./userform.module.css";
import AlertDialog from "../Dialogs/AlertDialog";
import axios from "axios";
import { useEffect, useState } from "react";
import ModifyDialog from "../Dialogs/ModifyDialog";
import BadgeIcon from "@mui/icons-material/Badge";
import GitHubIcon from "@mui/icons-material/GitHub";
import SecurityIcon from "@mui/icons-material/Security";
import UpdateIcon from "@mui/icons-material/Update";
import { CompactPicker } from "react-color";
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
    const [openSettingsSave, setOpenSettingsSave] = useState(false);

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
                    setOpenSettingsSave(true);
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
                    <>
                        <div className={styles.borderedBox}>
                            <h3>Profile</h3>
                            <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <BadgeIcon />
                                    </ListItemIcon>
                                    name: {user.name}
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <GitHubIcon />
                                    </ListItemIcon>
                                    nameId: {user.nameId}
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <SecurityIcon />
                                    </ListItemIcon>
                                    admin: {user.admin ? "yes" : "no"}
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <UpdateIcon />
                                    </ListItemIcon>
                                    user updated: {userUpdatedAt}
                                </ListItem>
                            </List>
                            <div className={styles.changeNameButton}>
                                <Button
                                    onClick={() => {
                                        setOpenModifyUserAlert(true);
                                    }}
                                    variant={"contained"}
                                >
                                    Change name
                                </Button>
                            </div>
                            {/*For revoking Github permissions*/}
                            {/*<a*/}
                            {/*    href={`${process.env.REACT_APP_ADDRESS}/checkAuthorization`}*/}
                            {/*    target={"_blank"}*/}
                            {/*>*/}
                            {/*    Github permissions of the app*/}
                            {/*</a>*/}
                        </div>
                        <div className={styles.borderedBox}>
                            <h3>Calendar settings</h3>
                            <div className={styles.colorPickers}>
                                <div>
                                    Holiday symbols
                                    <div className={styles.emojiHint}>
                                        Max length 2 char.
                                    </div>
                                    <div className={styles.emojiHint}>
                                        You can also copy-paste a short emoji
                                    </div>
                                    <div className={styles.rowFlex}>
                                        <TextField
                                            className={styles.holidaySymbolBox}
                                            label="Confirmed"
                                            variant="outlined"
                                            disabled={APIError}
                                            error={symbolNumberError}
                                            value={holidaySymbol}
                                            onChange={(e) => {
                                                setHolidaySymbol(
                                                    e.target.value
                                                );
                                            }}
                                            inputProps={{ maxLength: 2 }}
                                        />
                                        <TextField
                                            className={styles.holidaySymbolBox}
                                            label="Un-confirmed"
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
                                </div>
                                <div className={styles.rowFlex}>
                                    <div className={styles.columnFlex}>
                                        <b>Holiday color</b>
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
                                        <b>Unconfirmed holiday color</b>
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
                                        <b>Weekend color</b>
                                        <CompactPicker
                                            color={weekendColor}
                                            onChangeComplete={
                                                handleWeekendColorChange
                                            }
                                        />
                                    </div>
                                    <div className={styles.columnFlex}>
                                        <b>Weekend holiday color</b>
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
                    </>
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
                openAlert={openSettingsSave}
                handleAction={() => void 0}
                handleCloseAlert={() => setOpenSettingsSave(false)}
                dialogTitle={"Settings"}
                dialogContent={"Calendar settings saved"}
                cancel={""}
                confirm={""}
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
