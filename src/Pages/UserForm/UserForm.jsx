import {
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from "@mui/material";
import styles from "./userform.module.css";
import AlertDialog from "../Dialogs/AlertDialog";
import axios from "axios";
import { useEffect, useState } from "react";
import ModifyDialog from "../Dialogs/ModifyDialog";
import { CompactPicker } from "react-color";

export default function UserForm({}) {
    const DEFAULT_COLOURS = {
        holidayColor: "#73D8FF",
        unConfirmedHolidayColor: "#68CCCA",
        weekendColor: "#808080",
        weekendHolidayColor: "#CCCCCC",
    };
    const DEFAULT_SYMBOLS = ["X", "Y"];

    const [holidayColor, setHolidayColor] = useState(
        DEFAULT_COLOURS.holidayColor
    );
    const [unConfirmedHolidayColor, setUnConfirmedHolidayColor] = useState(
        DEFAULT_COLOURS.unConfirmedHolidayColor
    );
    const [weekendColor, setWeekendColor] = useState(
        DEFAULT_COLOURS.weekendColor
    );
    const [weekendHolidayColor, setWeekendHolidayColor] = useState(
        DEFAULT_COLOURS.weekendHolidayColor
    );
    const [holidaySymbol, setHolidaySymbol] = useState(DEFAULT_SYMBOLS[0]);
    const [unconfirmedHolidaySymbol, setUnconfirmedHolidaySymbol] = useState(
        DEFAULT_SYMBOLS[1]
    );

    const [vacationers, setVacationers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [completedAction, setCompletedAction] = useState(false);

    const [newUser, setNewUser] = useState("");
    const [userCreated, setUserCreated] = useState(false);
    const [userCreationMessage, setUserCreationMessage] = useState("");

    const [userNameError, setUserNameError] = useState(false);
    const [symbolAlarmError, setSymbolAlarmError] = useState(false);
    const [openDeleteUserAlert, setOpenDeleteUserAlert] = useState(false);

    const [openModifyUserAlert, setOpenModifyUserAlert] = useState(false);
    const nameError = newUser.length < 3;
    const symbolNumberError = !isNaN(holidaySymbol);
    const unconfirmedSymbolError = !isNaN(unconfirmedHolidaySymbol);

    const CREATE_TITLE = "Create user";
    const [openAPIError, setOpenAPIError] = useState(false);

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

    const emptySelections = () => {
        setSelectedUser("");
        setHolidayColor(DEFAULT_COLOURS.holidayColor);
        setUnConfirmedHolidayColor(DEFAULT_COLOURS.unConfirmedHolidayColor);
        setWeekendColor(DEFAULT_COLOURS.weekendColor);
        setWeekendHolidayColor(DEFAULT_COLOURS.weekendHolidayColor);
        setHolidaySymbol(DEFAULT_SYMBOLS[0]);
        setUnconfirmedHolidaySymbol(DEFAULT_SYMBOLS[1]);
    };

    const handleOpenAPIError = () => {
        setOpenAPIError(true);
    };
    const handleCloseAPIError = () => {
        setOpenAPIError(false);
    };

    useEffect(() => {
        emptySelections();
        axios
            .get(`${process.env.REACT_APP_ADDRESS}/vacationers`)
            .then((response) => {
                setVacationers(response.data);
                console.log("vacationers", response.data);
            })
            .catch((error) => {
                console.error("There was a vacationers get error!", error);
                if (!openAPIError) {
                    handleOpenAPIError();
                }
            });
    }, [completedAction]);

    useEffect(() => {
        console.log("valittuna", selectedUser);
        if (selectedUser && selectedUser.calendarSettings[0]) {
            setHolidayColor(selectedUser.calendarSettings[0].holidayColor);
            setUnConfirmedHolidayColor(
                selectedUser.calendarSettings[0].unConfirmedHolidayColor
            );
            setWeekendColor(selectedUser.calendarSettings[0].weekendColor);
            setWeekendHolidayColor(
                selectedUser.calendarSettings[0].weekendHolidayColor
            );
            setHolidaySymbol(selectedUser.calendarSettings[0].holidaySymbol);
            setUnconfirmedHolidaySymbol(
                selectedUser.calendarSettings[0].unConfirmedHolidaySymbol
            );
        }
    }, [selectedUser]);

    // For adding the user to the deleted list
    const deleteUser = () => {
        console.log("userID", selectedUser);
        axios
            .put(
                `${process.env.REACT_APP_ADDRESS}/vacationers/${selectedUser.id}/delete`
            )
            .then((response) => {
                setOpenDeleteUserAlert(false);
                console.log(response);
                removeUserFromTeams(selectedUser);
                setCompletedAction(!completedAction);
            })
            .catch((error) => {
                console.error("There was a delete user error!", error);
            });
    };

    const removeUserFromTeams = (removableUser) => {
        axios
            .put(
                `${process.env.REACT_APP_ADDRESS}/teams/members/all`,
                removableUser
            )
            .then((response) => {
                console.log("nyt response", response);
            })
            .catch((error) => {
                console.error(
                    "There was a delete user from all teams error!",
                    error
                );
            });
    };

    const changeUserName = (newName) => {
        console.log("selectedUser", selectedUser, "changeUserName", newName);
        if (newName.length >= 3) {
            axios
                .patch(
                    `${process.env.REACT_APP_ADDRESS}/vacationers/${selectedUser.id}`,
                    { newName: newName }
                )
                .then((response) => {
                    changeUserNameinTeams(selectedUser.id, newName);
                    console.log(response);
                    setOpenModifyUserAlert(false);
                })
                .catch((error) => {
                    console.error("There was a user name change error!", error);
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
                { newName: newName }
            )
            .then((response) => {
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
            console.log("kalenteriasetukset", changedCalendarSettings);
            axios
                .patch(
                    `${process.env.REACT_APP_ADDRESS}/vacationers/${selectedUser.id}/calendarSettings`,
                    { newCalendarSettings: changedCalendarSettings }
                )
                .then((response) => {
                    console.log(response);
                    setCompletedAction(!completedAction);
                })
                .catch((error) => {
                    console.error(
                        "There was a calendar settings change error!",
                        error
                    );
                });
        } else {
            setSymbolAlarmError(true);
        }
    };

    const createUser = (e) => {
        e.preventDefault();
        if (!nameError) {
            const newVacationer = {
                name: newUser,
                calendarSettings: [
                    {
                        holidayColor: DEFAULT_COLOURS.holidayColor,
                        unConfirmedHolidayColor:
                            DEFAULT_COLOURS.unConfirmedHolidayColor,
                        weekendColor: DEFAULT_COLOURS.weekendColor,
                        weekendHolidayColor:
                            DEFAULT_COLOURS.weekendHolidayColor,
                        holidaySymbol: DEFAULT_SYMBOLS[0],
                        unConfirmedHolidaySymbol: DEFAULT_SYMBOLS[1],
                    },
                ],
                deletedUser: false,
            };
            console.log("newVacationer", newVacationer);

            axios
                .post(
                    `${process.env.REACT_APP_ADDRESS}/vacationers`,
                    newVacationer
                )
                .then((response) => {
                    console.log(response);
                    setUserCreated(true);
                    setCompletedAction(!completedAction);
                    setNewUser("");
                })
                .catch((error) => {
                    console.error("There was a user creation error!", error);
                    setUserCreationMessage(error.response.data);
                });
        } else {
            setUserNameError(true);
        }
    };

    return (
        <>
            <div className={styles.content}>
                <div className={styles.borderedBox}>
                    <InputLabel>{CREATE_TITLE}</InputLabel>
                    <div>
                        <TextField
                            required
                            label="Username"
                            variant="outlined"
                            error={nameError}
                            value={newUser}
                            helperText={
                                nameError &&
                                "Name must be at least 3 characters"
                            }
                            onChange={(e) => setNewUser(e.target.value)}
                        />
                    </div>
                    <Button onClick={createUser} variant="contained">
                        {CREATE_TITLE}
                    </Button>
                </div>
                <div className={styles.borderedBox}>
                    <InputLabel>User list</InputLabel>
                    <FormControl>
                        <InputLabel>Choose user</InputLabel>
                        <Select
                            className={styles.nameSelectBox}
                            displayEmpty={true}
                            value={selectedUser}
                            onChange={(e) => {
                                setSelectedUser(e.target.value);
                            }}
                        >
                            {vacationers.map((vacationer) => (
                                <MenuItem
                                    key={vacationer.id}
                                    value={vacationer}
                                >
                                    {vacationer.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <div className={styles.allButtons}>
                        <Button
                            disabled={!selectedUser}
                            onClick={() => {
                                setOpenModifyUserAlert(true);
                            }}
                            variant={"contained"}
                        >
                            Change user's name
                        </Button>
                        <Button
                            disabled={!selectedUser}
                            onClick={() => {
                                setOpenDeleteUserAlert(true);
                            }}
                            variant={"contained"}
                            color={"error"}
                        >
                            Delete user
                        </Button>
                    </div>
                    <div className={styles.colorPickers}>
                        <div className={styles.rowFlex}>
                            <TextField
                                label="Holiday symbol"
                                variant="outlined"
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
                                value={unconfirmedHolidaySymbol}
                                onChange={(e) => {
                                    setUnconfirmedHolidaySymbol(e.target.value);
                                }}
                                inputProps={{ maxLength: 2 }}
                            />
                        </div>
                        <div className={styles.rowFlex}>
                            <div className={styles.columnFlex}>
                                <h4>Holiday color</h4>
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
                                <h4>Unconfirmed holiday color</h4>
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
                                <h4>Weekend color</h4>
                                <CompactPicker
                                    color={weekendColor}
                                    onChangeComplete={handleWeekendColorChange}
                                />
                            </div>
                            <div className={styles.columnFlex}>
                                <h4>Weekend holiday color</h4>
                                <CompactPicker
                                    color={weekendHolidayColor}
                                    onChangeComplete={
                                        handleWeekendHolidayColorChange
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    <Button
                        className={styles.belowButton}
                        disabled={!selectedUser}
                        onClick={updateCalendarSettings}
                        variant="contained"
                    >
                        Save Calendar settings
                    </Button>
                </div>
            </div>
            <ModifyDialog
                openAlert={openModifyUserAlert}
                handleCloseAlert={() => setOpenModifyUserAlert(false)}
                dialogTitle={"Modify user"}
                dialogContent={"Change name of user " + selectedUser.name}
                inputContent={selectedUser.name}
                handleAction={(name) => changeUserName(name)}
                cancel={"No"}
                confirm={"Yes change name"}
            />
            <AlertDialog
                openAlert={openDeleteUserAlert}
                handleCloseAlert={() => setOpenDeleteUserAlert(false)}
                handleAction={deleteUser}
                dialogTitle={"Delete user"}
                dialogContent={
                    selectedUser &&
                    `Are you sure you want to delete the user ${selectedUser.name} ?`
                }
                cancel={"No"}
                confirm={"Yes delete"}
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
            <AlertDialog
                openAlert={userCreated}
                handleCloseAlert={() => setUserCreated(false)}
                dialogTitle={"Create user"}
                dialogContent={"User created!"}
            />
            <AlertDialog
                openAlert={openAPIError}
                handleCloseAlert={handleCloseAPIError}
                handleAction={handleCloseAPIError}
                dialogTitle={"API Error"}
                dialogContent={"No connection to API, try again later"}
                confirm={"OK"}
            />
        </>
    );
}
