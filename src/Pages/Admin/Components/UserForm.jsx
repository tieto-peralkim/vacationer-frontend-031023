import {
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from "@mui/material";
import styles from "../admin.module.css";
import AlertDialog from "../../Dialogs/AlertDialog";
import axios from "axios";
import { useEffect, useState } from "react";
import ModifyDialog from "../../Dialogs/ModifyDialog";
import { CompactPicker } from "react-color";

export default function UserForm({}) {
    const [holidayColor, setHolidayColor] = useState("#73D8FF");
    const [unConfirmedHolidayColor, setUnConfirmedHolidayColor] =
        useState("#68CCCA");
    const [weekendColor, setWeekendColor] = useState("#808080");
    const [weekendHolidayColor, setWeekendHolidayColor] = useState("#CCCCCC");
    const [holidaySymbol, setHolidaySymbol] = useState("X");
    const [unconfirmedHolidaySymbol, setUnconfirmedHolidaySymbol] =
        useState("Y");

    const [vacationers, setVacationers] = useState([]);
    const [deletedVacationers, setDeletedVacationers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedDeletedUser, setSelectedDeletedUser] = useState("");
    const [completedAction, setCompletedAction] = useState(false);

    const [newUser, setNewUser] = useState([]);
    const [userCreated, setUserCreated] = useState(false);
    const [userCreationMessage, setUserCreationMessage] = useState("");

    const [userNameError, setUserNameError] = useState(false);
    const [symbolAlarmError, setSymbolAlarmError] = useState(false);
    const [openDeleteUserAlert, setOpenDeleteUserAlert] = useState(false);
    const [openFinalDeleteUserAlert, setOpenFinalDeleteUserAlert] =
        useState(false);
    const [openReturnUserAlert, setOpenReturnUserAlert] = useState(false);

    const [openModifyUserAlert, setOpenModifyUserAlert] = useState(false);
    const nameError = newUser.length < 3;
    const symbolError = !isNaN(holidaySymbol);
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
        setSelectedDeletedUser("");
        setHolidayColor("");
        setUnConfirmedHolidayColor("");
        setWeekendColor("");
        setWeekendHolidayColor("");
        setHolidaySymbol("X");
        setUnconfirmedHolidaySymbol("Y");
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
                handleOpenAPIError();
            });
    }, [completedAction]);

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_ADDRESS}/vacationers/deletedUsers`)
            .then((response) => {
                setDeletedVacationers(response.data);
                console.log("deletedUsers", response.data);
            })
            .catch((error) => {
                console.error("There was a vacationers get error!", error);
                handleOpenAPIError();
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
                setCompletedAction(!completedAction);
                removeUserFromTeams(selectedUser);
            })
            .catch((error) => {
                console.error("There was a delete user error!", error);
            });
    };

    // For removing the user from the database
    const finalDeleteUser = () => {
        axios
            .delete(
                `${process.env.REACT_APP_ADDRESS}/vacationers/${selectedDeletedUser.id}`
            )
            .then((response) => {
                setOpenFinalDeleteUserAlert(false);
                console.log(response);
                setCompletedAction(!completedAction);
            })
            .catch((error) => {
                console.error("There was a final delete user error!", error);
            });
    };

    const returnUser = () => {
        axios
            .put(
                `${process.env.REACT_APP_ADDRESS}/vacationers/${selectedDeletedUser.id}/undelete`
            )
            .then((response) => {
                setOpenReturnUserAlert(false);
                console.log(response);
                setCompletedAction(!completedAction);
            })
            .catch((error) => {
                console.error("There was a return user error!", error);
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
        if (!symbolError && !unconfirmedSymbolError) {
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
                        holidayColor: "#73D8FF",
                        unConfirmedHolidayColor: "#64F3EA",
                        weekendColor: "#928F8F",
                        weekendHolidayColor: "#D8D8D8",
                        holidaySymbol: "X",
                        unConfirmedHolidaySymbol: "Y",
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
            console.log("Not valid, check!");
            setUserNameError(true);
        }
    };

    return (
        <>
            <div className={styles.content}>
                <div className={styles.borderedBox}>
                    <InputLabel className={styles.extraMargin}>
                        {CREATE_TITLE}
                    </InputLabel>
                    <TextField
                        style={{ display: "block" }}
                        className={styles.extraMargin}
                        required
                        label="Username"
                        variant="outlined"
                        error={nameError}
                        value={newUser}
                        helperText={
                            nameError && "Name must be at least 3 characters"
                        }
                        onChange={(e) => setNewUser(e.target.value)}
                    />
                    <Button onClick={createUser} variant="contained">
                        {CREATE_TITLE}
                    </Button>
                </div>
                <div className={styles.borderedBox}>
                    <InputLabel className={styles.extraMargin}>
                        User list
                    </InputLabel>
                    <FormControl className={styles.nameSelectBox}>
                        <InputLabel>Choose user</InputLabel>
                        <Select
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
                    <div className={styles.topMargin}>
                        <Button
                            className={styles.topButton}
                            disabled={!selectedUser}
                            onClick={() => {
                                setOpenModifyUserAlert(true);
                            }}
                            variant={"contained"}
                        >
                            Change user's name
                        </Button>
                        <Button
                            className={styles.topButton}
                            disabled={!selectedUser}
                            onClick={() => {
                                setOpenDeleteUserAlert(true);
                            }}
                            variant={"contained"}
                        >
                            Delete user!
                        </Button>
                    </div>
                    <div className={styles.bottomButton}>
                        <Button
                            disabled={!selectedUser}
                            onClick={updateCalendarSettings}
                            variant="contained"
                        >
                            Save Calendar settings
                        </Button>
                    </div>
                    <div className={styles.colorPickers}>
                        <div className={styles.rowFlex}>
                            <TextField
                                label="Holiday symbol"
                                variant="outlined"
                                error={symbolError}
                                value={holidaySymbol}
                                onChange={(e) => {
                                    setHolidaySymbol(e.target.value);
                                }}
                            />
                            <TextField
                                inputProps={{ pattern: "[a-z]{1,2}" }}
                                label="Un-confirmed holiday symbol"
                                error={unconfirmedSymbolError}
                                variant="outlined"
                                value={unconfirmedHolidaySymbol}
                                onChange={(e) => {
                                    setUnconfirmedHolidaySymbol(e.target.value);
                                }}
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
                </div>
                <div className={styles.borderedBox}>
                    <InputLabel className={styles.extraMargin}>
                        Deleted users list
                    </InputLabel>
                    <FormControl className={styles.nameSelectBox}>
                        <InputLabel>Choose user</InputLabel>
                        <Select
                            displayEmpty={true}
                            value={selectedDeletedUser}
                            onChange={(e) => {
                                setSelectedDeletedUser(e.target.value);
                            }}
                        >
                            {deletedVacationers.map((vacationer) => (
                                <MenuItem
                                    key={vacationer.id}
                                    value={vacationer}
                                >
                                    {vacationer.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        disabled={!selectedDeletedUser}
                        onClick={() => {
                            setOpenFinalDeleteUserAlert(true);
                        }}
                        variant={"contained"}
                    >
                        Delete user FOR GOOD!
                    </Button>
                    <Button
                        disabled={!selectedDeletedUser}
                        onClick={() => {
                            setOpenReturnUserAlert(true);
                        }}
                        variant={"contained"}
                    >
                        Return user
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
                openAlert={openFinalDeleteUserAlert}
                handleCloseAlert={() => setOpenFinalDeleteUserAlert(false)}
                handleAction={finalDeleteUser}
                dialogTitle={"Delete user for good"}
                dialogContent={
                    selectedDeletedUser &&
                    `Are you sure you want to delete the user ${selectedDeletedUser.name} for good? THIS CAN NOT BE UN-DONE!`
                }
                cancel={"No"}
                confirm={"Yes delete"}
            />
            <AlertDialog
                openAlert={openReturnUserAlert}
                handleCloseAlert={() => setOpenReturnUserAlert(false)}
                handleAction={returnUser}
                dialogTitle={"Return the user"}
                dialogContent={
                    selectedDeletedUser &&
                    `Are you sure you want to return the user ${selectedDeletedUser.name}`
                }
                cancel={"No"}
                confirm={"Yes return"}
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
