import { useEffect, useState } from "react";
import axios from "axios";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
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
import { Navigate } from "react-router-dom";
import { useOutletVariables, Vacationer } from "../../NavigationBar";
import { Team } from "../Team/TeamPage/TeamPage";

// TODO: add employee amount and minimum amount
export default function Admin() {
    const minNameLength = 3;
    const maxNameLength = 12;
    const [selectedDeletedUser, setSelectedDeletedUser] =
        useState<Vacationer | null>(null);
    const [selectedDeletedTeam, setSelectedDeletedTeam] = useState<Team | null>(
        null
    );
    const [openDeleteUserAlert, setOpenDeleteUserAlert] = useState(false);
    const [openSendSlackAlert, setOpenSendSlackAlert] = useState(false);
    const [openChangeAdminAlert, setOpenChangeAdminAlert] = useState(false);
    const [adminStatus, setAdminStatus] = useState(false);

    const isProdVersion = process.env.REACT_APP_ENVIRONMENT === "PROD";
    const [deletedVacationers, setDeletedVacationers] = useState<any>();
    const [deletedTeams, setDeletedTeams] = useState<any>();
    const [selectedUser, setSelectedUser] = useState<any>();
    const [userCreated, setUserCreated] = useState(false);
    const [userNameError, setUserNameError] = useState(false);
    const [userCreationMessage, setUserCreationMessage] = useState("");

    const [vacationers, setVacationers] = useState([]);
    const [newUser, setNewUser] = useState("");
    const nameError =
        newUser.length < minNameLength || newUser.length > maxNameLength;

    const { user, APIError, setAPIError } = useOutletVariables();
    const [completedAction, setCompletedAction] = useState(false);
    const [openFinalDeleteUserAlert, setOpenFinalDeleteUserAlert] =
        useState(false);
    const [openFinalDeleteTeamAlert, setOpenFinalDeleteTeamAlert] =
        useState(false);
    const [openReturnUserAlert, setOpenReturnUserAlert] = useState(false);
    const [openReturnTeamAlert, setOpenReturnTeamAlert] = useState(false);
    const createTitle = "Create user";

    const emptySelections = () => {
        setSelectedDeletedUser(null);
        setSelectedDeletedTeam(null);
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
            })
            .catch((error) => {
                console.error("There was a vacationers get error!", error);
                setAPIError(true);
            });

        axios
            .get(`${process.env.REACT_APP_ADDRESS}/vacationers/deleted`, {
                withCredentials: true,
            })
            .then((response) => {
                setDeletedVacationers(response.data);
                return axios.get(
                    `${process.env.REACT_APP_ADDRESS}/teams/deleted`,
                    {
                        withCredentials: true,
                    }
                );
            })
            .then((response) => {
                setDeletedTeams(response.data);
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
            .then(() => {
                setOpenReturnTeamAlert(false);
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
            .then(() => {
                setOpenFinalDeleteUserAlert(false);
                setCompletedAction(!completedAction);
            })
            .catch((error) => {
                setAPIError(true);
                console.error("There was a final delete user error:", error);
            });
    };

    // For removing a team from the database
    const finalDeleteTeam = () => {
        axios
            .delete(
                `${process.env.REACT_APP_ADDRESS}/teams/${selectedDeletedTeam.id}`,
                { withCredentials: true }
            )
            .then((response) => {
                setOpenFinalDeleteTeamAlert(false);
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
            .then(() => {
                setOpenSendSlackAlert(false);
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

            axios
                .post(
                    `${process.env.REACT_APP_ADDRESS}/vacationers`,
                    newVacationer,
                    { withCredentials: true }
                )
                .then((response) => {
                    setUserCreated(true);
                    setCompletedAction(!completedAction);
                    setNewUser("");
                })
                .catch((error) => {
                    console.error("There was a user creation error!", error);

                    if (error.response) {
                        setUserCreationMessage(error.response.data);
                    } else {
                        setAPIError(true);
                    }
                });
        } else {
            setUserNameError(true);
        }
    };

    // For adding the user to the deleted list
    const deleteUser = () => {
        axios
            .put(
                `${process.env.REACT_APP_ADDRESS}/vacationers/${selectedUser.id}/delete`,
                {},
                { withCredentials: true }
            )
            .then((response) => {
                setOpenDeleteUserAlert(false);
                removeUserFromTeams(selectedUser);
            })
            .catch((error) => {
                setAPIError(true);
                console.error("There was a delete user error!", error);
            });
    };

    const setAdminBoolean = () => {
        axios
            .patch(
                `${process.env.REACT_APP_ADDRESS}/vacationers/${selectedUser.id}/admin`,
                { adminRole: adminStatus },
                { withCredentials: true }
            )
            .then(() => {
                setOpenChangeAdminAlert(false);
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

    return user && user.admin ? (
        <div className={styles.content}>
            <div className={styles.instructionBox}>
                <h3>Welcome to the admin page.</h3>
                <p>
                    Once user or team is deleted, they are moved to "deleted
                    lists". Deleted lists can be seen on this page in User and
                    Team box. One month from deletion they are removed
                    automatically from the database.
                </p>
                <p>On this page you can:</p>
                <ul>
                    <li>Add users (only on QA and local)</li>
                    <li>Delete users = add user to "deleted list".</li>
                    <li>Add and remove users admin rights</li>
                    <li>Return users and teams from "deleted lists"</li>
                    <li>
                        Remove users and teams from database = removing from
                        "deleted lists"
                    </li>
                    <li>Send Slack test messages on QA and local.</li>
                </ul>
                <p>Admins can also:</p>
                <ul>
                    <li>
                        On main page: Add, edit and remove vacations of all the
                        users (on QA and local). Go to your holidays and select
                        checkbox on Admin button. Then you can select user.
                    </li>
                    <li>On team page: Edit and delete all teams</li>
                </ul>
            </div>
            <div className={styles.borderedBoxes}>
                <div className={styles.borderedBox}>
                    <InputLabel>{createTitle}</InputLabel>
                    <div>
                        <TextField
                            required
                            label="Username"
                            disabled={APIError || isProdVersion}
                            variant="outlined"
                            value={newUser}
                            helperText={
                                nameError &&
                                `Name must be ${minNameLength}-${maxNameLength} characters`
                            }
                            onChange={(e) => setNewUser(e.target.value)}
                        />
                        <div>
                            <Button
                                onClick={createUser}
                                variant="contained"
                                disabled={APIError || isProdVersion}
                            >
                                {createTitle}
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
                                onChange={(e: any) => {
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
                    <InputLabel>Deleted list</InputLabel>
                    <div className={styles.topMargin}>
                        <FormControl>
                            <InputLabel>Choose user</InputLabel>
                            <Select
                                className={styles.nameSelectBox}
                                displayEmpty={true}
                                disabled={APIError}
                                onChange={(e: any) => {
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
                    <InputLabel>Deleted list</InputLabel>
                    <div className={styles.topMargin}>
                        <FormControl>
                            <InputLabel>Choose team</InputLabel>
                            <Select
                                disabled={APIError}
                                className={styles.nameSelectBox}
                                onChange={(e: any) => {
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
            <div className={styles.slackBox}>
                <Accordion>
                    <AccordionSummary>Slack test message</AccordionSummary>
                    <AccordionDetails>
                        <p>
                            Sends a test message to Slack channel 'vacationer'.
                        </p>
                        <p>DON'T SPAM!</p>
                        <Button
                            onClick={() => setOpenSendSlackAlert(true)}
                            variant={"contained"}
                            disabled={APIError || isProdVersion}
                        >
                            Send test message to Slack!
                        </Button>
                    </AccordionDetails>
                </Accordion>
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
                dialogContent={`This username is not between ${minNameLength}-${maxNameLength} characters`}
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
            <AlertDialog
                openAlert={openSendSlackAlert}
                handleCloseAlert={() => setOpenSendSlackAlert(false)}
                handleAction={sendSlackMessage}
                dialogTitle={"Slack test message"}
                dialogContent={`Are you sure you want to send a Slack test message?`}
                cancel={"No"}
                confirm={"Yes"}
            />
        </div>
    ) : (
        <Navigate to="/" />
    );
}
