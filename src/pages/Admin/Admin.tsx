import { useEffect, useState } from "react";
import axios from "axios";
import {
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from "@mui/material";
import styles from "./admin.module.css";
import AlertDialog from "../Dialogs/AlertDialog";
import { Navigate, useOutletContext } from "react-router-dom";
import { Vacationer } from "../../NavigationBar";

// TODO: add employee amount and minimum amount
export default function Admin() {
    const [selectedDeletedUser, setSelectedDeletedUser] = useState<Vacationer>({
        admin: false,
        calendarSettings: [
            {
                holidayColor: "",
                holidaySymbol: "",
                unConfirmedHolidayColor: "",
                unConfirmedHolidaySymbol: "",
                weekendColor: "",
                weekendHolidayColor: "",
            },
        ],
        createdAt: undefined,
        id: "",
        name: "",
        nameId: "",
        updatedAt: undefined,
        vacations: [{ comment: "", confirmed: false, end: "", start: "" }],
    });
    const [selectedDeletedTeam, setSelectedDeletedTeam] = useState<any>();
    const [openDeleteUserAlert, setOpenDeleteUserAlert] = useState(false);
    const [openChangeAdminAlert, setOpenChangeAdminAlert] = useState(false);
    const [adminStatus, setAdminStatus] = useState(false);

    const [deletedVacationers, setDeletedVacationers] = useState<any>();
    const [deletedTeams, setDeletedTeams] = useState<any>();
    const [selectedUser, setSelectedUser] = useState<any>();
    const [userCreated, setUserCreated] = useState(false);
    const [userNameError, setUserNameError] = useState(false);
    const [userCreationMessage, setUserCreationMessage] = useState("");

    const [vacationers, setVacationers] = useState([]);
    const [newUser, setNewUser] = useState("");
    const nameError = newUser.length < 3;

    const [user, setUser, updateUser, setUpdateUser, APIError, setAPIError] =
        useOutletContext();
    const [completedAction, setCompletedAction] = useState(false);
    const [openFinalDeleteUserAlert, setOpenFinalDeleteUserAlert] =
        useState(false);
    const [openFinalDeleteTeamAlert, setOpenFinalDeleteTeamAlert] =
        useState(false);
    const [openReturnUserAlert, setOpenReturnUserAlert] = useState(false);
    const [openReturnTeamAlert, setOpenReturnTeamAlert] = useState(false);
    const CREATE_TITLE = "Create user";

    const emptySelections = () => {
        setSelectedDeletedUser({
            admin: false,
            calendarSettings: [
                {
                    holidayColor: "",
                    holidaySymbol: "",
                    unConfirmedHolidayColor: "",
                    unConfirmedHolidaySymbol: "",
                    weekendColor: "",
                    weekendHolidayColor: "",
                },
            ],
            createdAt: undefined,
            id: "",
            name: "",
            nameId: "",
            updatedAt: undefined,
            vacations: [{ comment: "", confirmed: false, end: "", start: "" }],
        });
        setSelectedDeletedTeam({
            id: "",
            title: "",
            members: [
                {
                    name: "",
                    vacationerId: "",
                },
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        setSelectedUser("");
        setAdminStatus(false);
    };

    useEffect(() => {
        emptySelections();
        axios
            .get(`${process.env.REACT_APP_ADDRESS}/vacationers`, {
                withCredentials: true,
            })
            .then((response) => {
                setVacationers(response.data);
                console.log("vacationers", response.data);
            })
            .catch((error) => {
                console.error("There was a vacationers get error!", error);
                setAPIError(true);
            });

        Promise.all([
            axios.get(`${process.env.REACT_APP_ADDRESS}/vacationers/deleted`, {
                withCredentials: true,
            }),
            axios.get(`${process.env.REACT_APP_ADDRESS}/teams/deleted`, {
                withCredentials: true,
            }),
        ])
            .then((response) => {
                console.log(
                    "response.data",
                    response[0].data,
                    response[1].data
                );
                setDeletedVacationers(response[0].data);
                setDeletedTeams(response[1].data);
            })
            .catch((error) => {
                setAPIError(true);
                console.error(
                    "There was a get deleted vacationers/teams error!",
                    error
                );
            });
    }, [completedAction]);

    // For undeleting the user
    const returnUser = () => {
        axios
            .put(
                `${process.env.REACT_APP_ADDRESS}/vacationers/${selectedDeletedUser.id}/undelete`,
                {},
                { withCredentials: true }
            )
            .then((response) => {
                setOpenReturnUserAlert(false);
                console.log(response);
                setCompletedAction(!completedAction);
            })
            .catch((error) => {
                setAPIError(true);
                console.error("There was a return user error:", error);
            });
    };

    // For undeleting team
    const returnTeam = () => {
        axios
            .put(
                `${process.env.REACT_APP_ADDRESS}/teams/${selectedDeletedTeam.id}/undelete`,
                {},
                { withCredentials: true }
            )
            .then((response) => {
                setOpenReturnTeamAlert(false);
                console.log(response);
                setCompletedAction(!completedAction);
            })
            .catch((error) => {
                setAPIError(true);
                console.error("There was a return team error:", error);
            });
    };

    // For removing a user from the database
    const finalDeleteUser = () => {
        axios
            .delete(
                `${process.env.REACT_APP_ADDRESS}/vacationers/${selectedDeletedUser.id}`,
                { withCredentials: true }
            )
            .then((response) => {
                setOpenFinalDeleteUserAlert(false);
                console.log(response);
                setCompletedAction(!completedAction);
            })
            .catch((error) => {
                setAPIError(true);
                console.error("There was a final delete user error:", error);
            });
    };

    // For removing a team from the database
    const finalDeleteTeam = () => {
        console.log("deleting team", selectedDeletedTeam.title);
        axios
            .delete(
                `${process.env.REACT_APP_ADDRESS}/teams/${selectedDeletedTeam.id}`,
                { withCredentials: true }
            )
            .then((response) => {
                setOpenFinalDeleteTeamAlert(false);
                console.log(response);
                setCompletedAction(!completedAction);
            })
            .catch((error) => {
                console.error("There was a delete error:", error);
                setAPIError(true);
            });
    };

    const sendSlackMessage = () => {
        axios
            .get(`${process.env.REACT_APP_ADDRESS}/slackMessageSender`, {
                withCredentials: true,
            })
            .then((response) => {
                console.log(response.data);
            })
            .catch((error) => {
                console.error("There was a sendSlackMessage error!", error);
                setAPIError(true);
            });
    };

    const createUser = (e) => {
        e.preventDefault();
        if (!nameError) {
            const newVacationer = {
                name: newUser,
                nameId: newUser,
            };
            console.log("newVacationer", newVacationer);

            axios
                .post(
                    `${process.env.REACT_APP_ADDRESS}/vacationers`,
                    newVacationer,
                    { withCredentials: true }
                )
                .then((response) => {
                    console.log(response);
                    setUserCreated(true);
                    setCompletedAction(!completedAction);
                    setNewUser("");
                })
                .catch((error) => {
                    setAPIError(true);
                    console.error("There was a user creation error!", error);
                    setUserCreationMessage(error.response.data);
                });
        } else {
            setUserNameError(true);
        }
    };

    // For adding the user to the deleted list
    const deleteUser = () => {
        console.log("selected", selectedUser);
        axios
            .put(
                `${process.env.REACT_APP_ADDRESS}/vacationers/${selectedUser.id}/delete`,
                {},
                { withCredentials: true }
            )
            .then((response) => {
                setOpenDeleteUserAlert(false);
                console.log(response);
                removeUserFromTeams(selectedUser);
            })
            .catch((error) => {
                setAPIError(true);
                console.error("There was a delete user error!", error);
            });
    };

    const setAdminBoolean = () => {
        console.log("adminStatus", adminStatus);
        axios
            .patch(
                `${process.env.REACT_APP_ADDRESS}/vacationers/${selectedUser.id}/admin`,
                { adminRole: adminStatus },
                { withCredentials: true }
            )
            .then((response) => {
                setOpenChangeAdminAlert(false);
                console.log(response);
                setCompletedAction(!completedAction);
            })
            .catch((error) => {
                setAPIError(true);
                console.error("There was a set admin error!", error);
            });
    };

    const removeUserFromTeams = (removableUser) => {
        axios
            .put(
                `${process.env.REACT_APP_ADDRESS}/teams/members/all`,
                removableUser,
                { withCredentials: true }
            )
            .then(() => {
                setCompletedAction(!completedAction);
            })
            .catch((error) => {
                setAPIError(true);
                console.error(
                    "There was a delete user from all teams error!",
                    error
                );
            });
    };

    return user.admin ? (
        <>
            <div className={styles.content}>
                <div className={styles.borderedBox}>
                    <InputLabel>{CREATE_TITLE}</InputLabel>
                    <div>
                        <TextField
                            required
                            label="Username"
                            disabled={APIError}
                            variant="outlined"
                            error={nameError}
                            value={newUser}
                            helperText={
                                nameError &&
                                "Name must be at least 3 characters"
                            }
                            onChange={(e) => setNewUser(e.target.value)}
                        />
                        <div>
                            <Button
                                onClick={createUser}
                                variant="contained"
                                disabled={APIError}
                            >
                                {CREATE_TITLE}
                            </Button>
                        </div>
                    </div>
                    <div className={styles.nameSelectBox}>
                        <InputLabel>User list</InputLabel>
                        <FormControl>
                            <InputLabel>Choose user</InputLabel>
                            <Select
                                disabled={APIError}
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
                            <FormControl>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            disabled={!selectedUser}
                                            checked={
                                                selectedUser
                                                    ? selectedUser.admin
                                                    : false
                                            }
                                            onChange={(e) => {
                                                setAdminStatus(
                                                    e.target.checked
                                                );
                                                setOpenChangeAdminAlert(true);
                                            }}
                                        />
                                    }
                                    label={"Admin user"}
                                />
                            </FormControl>
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
                        </FormControl>
                    </div>
                </div>
                <div className={styles.borderedBox}>
                    <h3>User</h3>
                    <InputLabel>Deleted users list</InputLabel>
                    <div className={styles.topMargin}>
                        <FormControl>
                            <InputLabel>Choose user</InputLabel>
                            <Select
                                className={styles.nameSelectBox}
                                displayEmpty={true}
                                disabled={APIError}
                                onChange={(e) => {
                                    setSelectedDeletedUser(e);
                                }}
                            >
                                {deletedVacationers &&
                                    deletedVacationers.map((vacationer) => (
                                        <MenuItem
                                            key={vacationer.id}
                                            value={vacationer}
                                        >
                                            {vacationer.name}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                    </div>
                    <div className={styles.allButtons}>
                        <Button
                            color={"error"}
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
                <div className={styles.borderedBox}>
                    <h3>Team</h3>
                    <InputLabel>Deleted teams list</InputLabel>
                    <div className={styles.topMargin}>
                        <FormControl>
                            <InputLabel>Choose team</InputLabel>
                            <Select
                                disabled={APIError}
                                className={styles.nameSelectBox}
                                displayEmpty={true}
                                onChange={(e) => {
                                    setSelectedDeletedTeam(e.target.value);
                                }}
                            >
                                {deletedTeams &&
                                    deletedTeams.map((team) => (
                                        <MenuItem key={team.id} value={team}>
                                            {team.title}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                    </div>
                    <div className={styles.allButtons}>
                        <Button
                            color={"error"}
                            disabled={!selectedDeletedTeam}
                            onClick={() => {
                                setOpenFinalDeleteTeamAlert(true);
                            }}
                            variant={"contained"}
                        >
                            Delete team FOR GOOD!
                        </Button>
                        <Button
                            disabled={!selectedDeletedTeam}
                            onClick={() => {
                                setOpenReturnTeamAlert(true);
                            }}
                            variant={"contained"}
                        >
                            Return team
                        </Button>
                    </div>
                </div>
            </div>
            <div className={styles.content}>
                <div>
                    <Button
                        onClick={sendSlackMessage}
                        variant={"contained"}
                        disabled={APIError}
                    >
                        Send a test message to Slack!
                    </Button>
                </div>
            </div>
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
                openAlert={openFinalDeleteTeamAlert}
                handleCloseAlert={() => setOpenFinalDeleteTeamAlert(false)}
                handleAction={finalDeleteTeam}
                dialogTitle={"Delete team for good"}
                dialogContent={
                    selectedDeletedTeam &&
                    `Are you sure you want to delete the team ${selectedDeletedTeam.title} for good? THIS CAN NOT BE UN-DONE!`
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
                openAlert={openReturnTeamAlert}
                handleCloseAlert={() => setOpenReturnTeamAlert(false)}
                handleAction={returnTeam}
                dialogTitle={"Return the team"}
                dialogContent={
                    selectedDeletedTeam &&
                    `Are you sure you want to return the team ${selectedDeletedTeam.title}`
                }
                cancel={"No"}
                confirm={"Yes return"}
            />
            <AlertDialog
                openAlert={userCreated}
                handleAction={() => void 0}
                handleCloseAlert={() => setUserCreated(false)}
                dialogTitle={"Create user"}
                dialogContent={"User created!"}
                cancel={""}
                confirm={""}
            />
            <AlertDialog
                openAlert={userNameError}
                handleAction={() => void 0}
                handleCloseAlert={() => setUserNameError(false)}
                dialogTitle={"ERROR!"}
                dialogContent={
                    "This username is too short (less than 3 characters)!"
                }
                cancel={""}
                confirm={""}
            />
            <AlertDialog
                openAlert={userCreationMessage !== ""}
                handleCloseAlert={() => setUserCreationMessage("")}
                handleAction={() => void 0}
                dialogTitle={"API ERROR!"}
                dialogContent={userCreationMessage}
                cancel={""}
                confirm={""}
            />
            <AlertDialog
                openAlert={openChangeAdminAlert}
                handleCloseAlert={() => setOpenChangeAdminAlert(false)}
                handleAction={setAdminBoolean}
                dialogTitle={"Change admin rights"}
                dialogContent={
                    selectedUser &&
                    `Are you sure you want to change admin rights of the user ${selectedUser.name} ?`
                }
                cancel={"No"}
                confirm={"Yes change"}
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
        </>
    ) : (
        <Navigate to="/" />
    );
}
