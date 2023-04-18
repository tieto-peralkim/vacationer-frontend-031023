import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import AlertDialog from "../../Dialogs/AlertDialog";
import axios from "axios";
import { useEffect, useState } from "react";
import styles from "../team.module.css";
import { useOutletContext } from "react-router-dom";

export default function TeamAdd({
    open,
    setOpenTeamAdd,
    teams,
    completedAction,
    setCompletedAction,
    openAPIError,
}) {
    const [user, setUser, updateUser, setUpdateuser, APIError, setAPIError] =
        useOutletContext();
    const [newTeam, setNewTeam] = useState([]);

    const [teamNameError, setTeamNameError] = useState(false);
    const [alreadyExistsError, setAlreadyExistsError] = useState(false);

    const nameError = newTeam.length < 3;

    const handleClose = () => {
        setOpenTeamAdd(false);
        setTeamNameError(false);
        setAlreadyExistsError(false);
        setNewTeam([]);
    };

    useEffect(() => {
        setUpdateuser(!updateUser);
    }, [completedAction]);

    const createTeam = (newTeam) => {
        if (!nameError) {
            let updatedTeams;

            Promise.all([
                axios.get(`${process.env.REACT_APP_ADDRESS}/teams/all`, {
                    withCredentials: true,
                }),
            ])
                .then((response) => {
                    updatedTeams = response[0].data;

                    let alreadyExists = false;

                    updatedTeams.forEach((team) => {
                        if (team.title === newTeam) {
                            alreadyExists = true;
                        }
                    });

                    if (!alreadyExists) {
                        let firstUser = {
                            name: user.name,
                            vacationerId: user.id,
                        };
                        // Set the user as a member of the new team
                        const teamToAdd = {
                            title: newTeam,
                            members: firstUser,
                        };

                        axios
                            .post(
                                `${process.env.REACT_APP_ADDRESS}/teams`,
                                teamToAdd,
                                {
                                    withCredentials: true,
                                }
                            )
                            .then((response) => {
                                setCompletedAction(!completedAction);
                                setNewTeam([]);
                            })
                            .catch((error) => {
                                openAPIError();
                                console.error("There was a post error!", error);
                            })
                            .finally(() => {
                                handleClose();
                            });
                    } else {
                        setAlreadyExistsError(true);
                    }
                })
                .catch((error) => {
                    console.error(
                        "There was a teams/total vacationers get error:",
                        error
                    );
                    openAPIError();
                });
        } else {
            setTeamNameError(true);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle color="primary">Create new team</DialogTitle>
            <DialogContent className={styles.addTeamDialogContent}>
                <DialogContentText>
                    Please provide name for the team.
                </DialogContentText>
                <div className={styles.teamAddTextField}>
                    <TextField
                        className={styles.teamAddTextField}
                        required
                        inputProps={{ minLength: 3 }}
                        label="Team name"
                        disabled={APIError}
                        variant="outlined"
                        value={newTeam}
                        helperText={
                            nameError && "Name must be at least 3 characters"
                        }
                        onChange={(e) => setNewTeam(e.target.value)}
                    />
                </div>
                <div className={styles.createButton}>
                    <Button
                        onClick={() => {
                            createTeam(newTeam);
                        }}
                        disabled={APIError}
                        variant={"contained"}
                    >
                        Create team
                    </Button>
                </div>
            </DialogContent>
            <DialogActions></DialogActions>

            <AlertDialog
                openAlert={teamNameError}
                handleCloseAlert={() => setTeamNameError(false)}
                dialogTitle={"ERROR!"}
                dialogContent={
                    "This team name is too short (less than 3 characters)!"
                }
            />

            <AlertDialog
                openAlert={alreadyExistsError}
                handleCloseAlert={() => setAlreadyExistsError(false)}
                dialogTitle={"ERROR!"}
                dialogContent={"This team name is already taken!"}
            />
        </Dialog>
    );
}
