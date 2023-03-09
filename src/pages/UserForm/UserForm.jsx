import { Button, TextField } from "@mui/material";
import styles from "./userform.module.css";
import AlertDialog from "../Dialogs/AlertDialog";
import axios from "axios";
import { useEffect, useState } from "react";
import ModifyDialog from "../Dialogs/ModifyDialog";
import { CompactPicker } from "react-color";
import { useNavigate, useOutletContext } from "react-router-dom";
import ApiAlert from "../../components/ApiAlert";

export default function UserForm({}) {
    let navigate = useNavigate();
    const [holidayColor, setHolidayColor] = useState("");
    const [unConfirmedHolidayColor, setUnConfirmedHolidayColor] = useState("");
    const [weekendColor, setWeekendColor] = useState("");
    const [weekendHolidayColor, setWeekendHolidayColor] = useState("");
    const [holidaySymbol, setHolidaySymbol] = useState("");
    const [unconfirmedHolidaySymbol, setUnconfirmedHolidaySymbol] =
        useState("");

    const [user, setUser, update, setUpdate] = useOutletContext();
    const [completedAction, setCompletedAction] = useState(false);

    const [userCreationMessage, setUserCreationMessage] = useState("");

    const [userNameError, setUserNameError] = useState(false);
    const [symbolAlarmError, setSymbolAlarmError] = useState(false);

    const [openModifyUserAlert, setOpenModifyUserAlert] = useState(false);
    const symbolNumberError = !isNaN(holidaySymbol);
    const unconfirmedSymbolError = !isNaN(unconfirmedHolidaySymbol);
    const [userUpdatedAt, setUserUpdatedAt] = useState();
    const [APIError, setAPIError] = useState(false);

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
        setUpdate(!update);
        setAPIError(false);
    }, [completedAction]);

    useEffect(() => {
        if (!user.name) {
            setAPIError(true);
        } else {
            setAPIError(false);
        }
        if (user && user.calendarSettings && user.updatedAt) {
            let date = new Date(user.updatedAt);
            console.log("date", date);
            let updateDate =
                date.toLocaleDateString("fi-FI") +
                " " +
                date.toLocaleTimeString("fi-FI");
            console.log("updateDate", updateDate);

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
        if (newName.length >= 3) {
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
                    console.error("There was a user name change error!", error);
                    if (!APIError) {
                        setAPIError(true);
                    }
                    setUserCreationMessage(error);
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
            });
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
                    console.log(response);
                    setCompletedAction(!completedAction);
                    navigate("/");
                })
                .catch((error) => {
                    if (!APIError) {
                        setAPIError(true);
                    }
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
            {APIError && <ApiAlert />}
            <div className={styles.content}>
                {user.name && (
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
                handleCloseAlert={() => setUserCreationMessage("")}
                dialogTitle={"API ERROR!"}
                dialogContent={userCreationMessage}
            />
            <AlertDialog
                openAlert={userNameError}
                handleCloseAlert={() => setUserNameError(false)}
                dialogTitle={"ERROR!"}
                dialogContent={
                    "This username is too short (less than 3 characters)!"
                }
            />
            <AlertDialog
                openAlert={symbolAlarmError}
                handleCloseAlert={() => setSymbolAlarmError(false)}
                dialogTitle={"ERROR!"}
                dialogContent={"Symbols can not be numbers!"}
            />
        </>
    );
}
