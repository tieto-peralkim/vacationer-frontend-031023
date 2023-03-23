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

export default function TeamAdd({ open, setOpenTeamAdd, teams, setTeams }) {
    const [user, setUser] = useOutletContext();
    const [teamCreated, setTeamCreated] = useState(false);
    const [newTeam, setNewTeam] = useState([]);
    const [teamNameError, setTeamNameError] = useState(false);
    const nameError = newTeam.length < 3;
    const [APIError, setAPIError] = useState(false);
    const [initialMember, setInitialMember] = useState([user]);

    let newTeamId;
    let team

    const handleClose = () => {
        setOpenTeamAdd(false);
    };

    const createTeam = () => {
        if (!nameError) {
            const teamToAdd = {
                title: newTeam,
            };

            axios
                .post(`${process.env.REACT_APP_ADDRESS}/teams`, teamToAdd, {
                    withCredentials: true,
                })
                .then((response) => {
                    setTeamCreated(true);
                    newTeamId = response.data.id;
                    team = response.data
                    console.log(team);
                    
                    axios
                        .post(
                            `${process.env.REACT_APP_ADDRESS}/teams/${newTeamId}`,
                            initialMember,
                            { withCredentials: true }
                        )
                        .then((response) => {
                            console.log(response);
                            setTeams([...teams, response.data])
                            handleClose();
                        });
                })
                .catch((error) => {
                    console.error("There was a post error!", error);
                });
        } else {
            setTeamNameError(true);
        }
    };

    return (
        // TODO: Add current user to the newly created team
        // TODO: Update team list when new team is added

        <Dialog open={open} onClose={handleClose}>
            {APIError && <ApiAlert />}
            <DialogTitle color="primary">Create a new team</DialogTitle>
            <DialogContent className={styles.addTeamDialogContent}>
                <DialogContentText>
                    To create a new team, please provide a name for the team.
                </DialogContentText>
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

                <Button
                    onClick={() => {
                        createTeam();
                        //handleClose()
                    }}
                    disabled={APIError}
                    variant={"contained"}
                >
                    Create
                </Button>
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
        </Dialog>
    );
}
