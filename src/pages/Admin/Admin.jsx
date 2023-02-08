import { useEffect, useState } from "react";
import axios from "axios";
import {
    Alert,
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Slider,
    TextField,
} from "@mui/material";
import styles from "./admin.module.css";
import AlertDialog from "../Dialogs/AlertDialog";
import ApiAlert from "../../components/ApiAlert";

// TODO: add employee amount and minimum amount
export default function Admin() {
    const [APIError, setAPIError] = useState(false);
    const [selectedDeletedUser, setSelectedDeletedUser] = useState("");
    const [selectedDeletedTeam, setSelectedDeletedTeam] = useState("");
    const [openDeleteUserAlert, setOpenDeleteUserAlert] = useState(false);

    const [deletedVacationers, setDeletedVacationers] = useState([]);
    const [deletedTeams, setDeletedTeams] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [userCreated, setUserCreated] = useState(false);
    const [userNameError, setUserNameError] = useState(false);
    const [userCreationMessage, setUserCreationMessage] = useState("");

    const [vacationers, setVacationers] = useState([]);
    const [newUser, setNewUser] = useState("");
    const nameError = newUser.length < 3;

    // // CONTEXT
    // const [user, setUser] = useOutletContext();
    const [completedAction, setCompletedAction] = useState(false);
    const [openFinalDeleteUserAlert, setOpenFinalDeleteUserAlert] =
        useState(false);
    const [openFinalDeleteTeamAlert, setOpenFinalDeleteTeamAlert] =
        useState(false);
    const [openReturnUserAlert, setOpenReturnUserAlert] = useState(false);
    const [openReturnTeamAlert, setOpenReturnTeamAlert] = useState(false);
    const CREATE_TITLE = "Create user";

    const emptySelections = () => {
        setSelectedDeletedUser("");
        setSelectedDeletedTeam("");
    };

    useEffect(() => {
        emptySelections();
        axios
            .get(`${process.env.REACT_APP_ADDRESS}/vacationers`, {
                withCredentials: true,
            })
            .then((response) => {
                setAPIError(false);
                setVacationers(response.data);
                console.log("vacationers", response.data);
            })
            .catch((error) => {
                console.error("There was a vacationers get error!", error);
                if (!APIError) {
                    setAPIError(true);
                }
            });
    }, [completedAction]);

    // For returning the user to the user list
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
                console.error("There was a return user error:", error);
            });
    };

    // For returning the user to the user list
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
                console.error("There was a return team error:", error);
            });
    };

    // For removing the user from the database
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
                console.error("There was a final delete user error:", error);
            });
    };

    // For removing the team from the database
    const finalDeleteTeam = () => {
        console.log("deleting team", selectedDeletedTeam);
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
            });
    };

    useEffect(() => {
        emptySelections();
        Promise.all([
            axios.get(`${process.env.REACT_APP_ADDRESS}/vacationers/deleted`, {
                withCredentials: true,
            }),
            axios.get(`${process.env.REACT_APP_ADDRESS}/teams/deleted`, {
                withCredentials: true,
            }),
        ])
            .then((response) => {
                setAPIError(false);
                console.log(
                    "response.data",
                    response[0].data,
                    response[1].data
                );
                setDeletedVacationers(response[0].data);
                setDeletedTeams(response[1].data);
            })
            .catch((error) => {
                if (!APIError) {
                    setAPIError(true);
                }
                console.error("There was a vacationers get error!", error);
            });
    }, [completedAction]);

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
                if (!APIError) {
                    setAPIError(true);
                }
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
                console.error("There was a delete user error!", error);
            });
    };

    const removeUserFromTeams = (removableUser) => {
        axios
            .put(
                `${process.env.REACT_APP_ADDRESS}/teams/members/all`,
                removableUser,
                { withCredentials: true }
            )
            .then((response) => {
                setCompletedAction(!completedAction);
            })
            .catch((error) => {
                console.error(
                    "There was a delete user from all teams error!",
                    error
                );
            });
    };

    return (
        <>
            {APIError && <ApiAlert />}
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
                                value={selectedDeletedUser}
                                onChange={(e) => {
                                    setSelectedDeletedUser(e.target.value);
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
                                value={selectedDeletedTeam}
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
                handleCloseAlert={() => setUserCreated(false)}
                dialogTitle={"Create user"}
                dialogContent={"User created!"}
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
                openAlert={userCreationMessage !== ""}
                handleCloseAlert={() => setUserCreationMessage("")}
                dialogTitle={"API ERROR!"}
                dialogContent={userCreationMessage}
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
    );
}