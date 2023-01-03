import { useEffect, useState } from "react";
import axios from "axios";
import {
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
import TeamForm from "../TeamForm/TeamForm";
import Typography from "@mui/material/Typography";
import UserForm from "../UserForm/UserForm";
import AlertDialog from "../Dialogs/AlertDialog";

// TODO: add employee amount and minimum amount
export default function Admin() {
    const [openAPIError, setOpenAPIError] = useState(false);
    const [selectedDeletedUser, setSelectedDeletedUser] = useState("");
    const [selectedDeletedTeam, setSelectedDeletedTeam] = useState("");
    const [deletedVacationers, setDeletedVacationers] = useState([]);
    const [deletedTeams, setDeletedTeams] = useState([]);

    const [completedAction, setCompletedAction] = useState(false);
    const [openFinalDeleteUserAlert, setOpenFinalDeleteUserAlert] =
        useState(false);
    const [openFinalDeleteTeamAlert, setOpenFinalDeleteTeamAlert] =
        useState(false);
    const [openReturnUserAlert, setOpenReturnUserAlert] = useState(false);
    const [openReturnTeamAlert, setOpenReturnTeamAlert] = useState(false);

    const emptySelections = () => {
        setSelectedDeletedUser("");
    };

    // For returning the user to the user list
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

    // For returning the user to the user list
    const returnTeam = () => {
        axios
            .put(
                `${process.env.REACT_APP_ADDRESS}/teams/${selectedDeletedTeam.id}/undelete`
            )
            .then((response) => {
                setOpenReturnTeamAlert(false);
                console.log(response);
                setCompletedAction(!completedAction);
            })
            .catch((error) => {
                console.error("There was a return team error!", error);
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

    // For removing the team from the database
    const finalDeleteTeam = () => {
        console.log("deleting team", selectedDeletedTeam);
        axios
            .delete(
                `${process.env.REACT_APP_ADDRESS}/teams/${selectedDeletedTeam.id}`
            )
            .then((response) => {
                setOpenFinalDeleteTeamAlert(false);
                console.log(response);
                setCompletedAction(!completedAction);
            })
            .catch((error) => {
                console.error("There was a delete error!", error);
            });
    };

    useEffect(() => {
        emptySelections();
        Promise.all([
            axios.get(
                `${process.env.REACT_APP_ADDRESS}/vacationers/deletedVacationers`
            ),
            axios.get(`${process.env.REACT_APP_ADDRESS}/teams/deletedTeams`),
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
                if (!openAPIError) {
                    handleOpenAPIError();
                }
                console.error("There was a vacationers get error!", error);
            });
    }, [completedAction]);

    const handleOpenAPIError = () => {
        setOpenAPIError(true);
    };
    const handleCloseAPIError = () => {
        setOpenAPIError(false);
    };

    const sendSlackMessage = () => {
        axios
            .get(`${process.env.REACT_APP_ADDRESS}/slackMessageSender`)
            .then((response) => {
                console.log(response.data);
            })
            .catch((error) => {
                console.error("There was a sendSlackMessage error!", error);
                handleOpenAPIError();
            });
    };

    return (
        <>
            <div className={styles.content}>
                <div className={styles.borderedBox}>
                    <h3>User</h3>
                    <InputLabel>Deleted users list</InputLabel>
                    <div className={styles.topMargin}>
                        <FormControl>
                            <InputLabel>Choose user</InputLabel>
                            <Select
                                className={styles.nameSelectBox}
                                displayEmpty={true}
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
            <h3>Test Slack</h3>
            <div>
                <Button onClick={sendSlackMessage} variant={"contained"}>
                    Send to Slack!
                </Button>
            </div>
            <AlertDialog
                openAlert={openAPIError}
                handleCloseAlert={handleCloseAPIError}
                handleAction={handleCloseAPIError}
                dialogTitle={"API Error"}
                dialogContent={"No connection to API, try again later"}
                confirm={"OK"}
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
        </>
    );
}
