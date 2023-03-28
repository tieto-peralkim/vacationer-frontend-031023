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
import ApiAlert from "../../../components/ApiAlert";
import styles from "../team.module.css";
import { useOutletContext } from "react-router-dom";
import Cookies from "js-cookie";

export default function TeamAdd({
    open,
    setOpenTeamAdd,
    teams,
    setTeams,
    completedAction,
    setCompletedAction,
}) {
    const [user, setUser, update, setUpdate] = useOutletContext();
    const [teamCreated, setTeamCreated] = useState(false);
    const [newTeam, setNewTeam] = useState([]);
    const [teamNameError, setTeamNameError] = useState(false);
    const [alreadyExistsError, setAlreadyExistsError] = useState(false);
    const nameError = newTeam.length < 3;
    const [APIError, setAPIError] = useState(false);
    const [initialMember, setInitialMember] = useState(user);
    const [result, setResult] = useState(null);

    let newTeamId;
    let team;

    const handleClose = () => {
        setResult(null);
        setOpenTeamAdd(false);
        setTeamNameError(false);
        setAlreadyExistsError(false)
        setNewTeam([])
    };

    useEffect(() => {
        setUpdate(!update);
        setAPIError(false);
    }, [completedAction]);

    const createTeam = (newTeam) => {
        //console.log(newTeam);

        setResult(null);
        if (!nameError) {
            let alreadyExists = false;
            teams.forEach((team) => {
                if (team.title === newTeam) {
                    alreadyExists = true;
                }
            });

            if (!alreadyExists) {
                let firstUser = { name: user.name, vacationerId: user.id };
                const teamToAdd = {
                    title: newTeam,
                    members: firstUser,
                };

                //console.log(teamToAdd);

                axios
                    .post(`${process.env.REACT_APP_ADDRESS}/teams`, teamToAdd, {
                        withCredentials: true,
                    })
                    .then((response) => {
                        setTeamCreated(true);
                        setCompletedAction(!completedAction);
                        setNewTeam([]);
                        team = response.data;
                    })
                    .finally(() => {
                        handleClose();
                    })
                    .catch((error) => {
                        console.error("There was a post error!", error);
                    });
            } else {
                setAlreadyExistsError(true);
            }
        } else {
            setTeamNameError(true);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            {APIError && <ApiAlert />}
            <DialogTitle color="primary">Create a new team</DialogTitle>
            <DialogContent className={styles.addTeamDialogContent}>
                <DialogContentText>
                    To create a new team, please provide a name for the team.
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
                        Create a new team
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
