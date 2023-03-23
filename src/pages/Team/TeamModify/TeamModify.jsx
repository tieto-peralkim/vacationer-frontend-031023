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
import {
    Alert,
    Checkbox,
    Chip,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
} from "@mui/material";

export default function TeamModify({
    open,
    setOpenTeamModify,
    selectedTeam,
    vacationers,
    teams,
    setTeams,
    setVacationers,
    setSelectedTeam,
}) {
    const [completedAction, setCompletedAction] = useState(false);
    const [user, setUser] = useOutletContext();
    const [newTeam, setNewTeam] = useState([]);
    const [teamNameError, setTeamNameError] = useState(false);
    const nameError = newTeam.length < 3;
    const [APIError, setAPIError] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [isEmpty, setIsEmpty] = useState(true);
    const [memberExistsError, setMemberExistsError] = useState(false);

    console.log(selectedTeam);

    const handleClose = () => {
        setOpenTeamModify(false);
    };

    const handleChange = (event) => {
        const {
            target: { value },
        } = event;
        // console.log(value)
        setSelectedMembers(
            typeof value === "string" ? value.split(",") : value
        );
    };

    const addToTeam = (newMembers, team) => {
        console.log("newMembers: ", newMembers, "team", team);
        let isDuplicate = false;

        team.members.forEach((teamMember) => {
            newMembers.forEach((newMember) => {
                if (teamMember.vacationerId === newMember.vacationerId) {
                    isDuplicate = true;
                }
            });
        });

        if (!isDuplicate) {
            axios
                .post(
                    `${process.env.REACT_APP_ADDRESS}/teams/${team.id}`,
                    newMembers,
                    { withCredentials: true }
                )
                .then((response) => {
                    const index = teams.findIndex((el) => el.id === team.id);
                    teams[index] = response.data;
                    setTeams(teams);
                    setVacationers(vacationers);
                    // console.log(index);
                    // console.log(teams);
                    setSelectedTeam(response.data);
                    setSelectedMembers([]);
                    setCompletedAction(!completedAction);
                    setIsEmpty(true);
                    setMemberExistsError(false);
                })
                .catch((error) => {
                    setSelectedMembers([]);
                    console.error("There was a team put error!", error);
                });
        } else {
            setIsEmpty(true);
            setSelectedMembers([]);
            setMemberExistsError(true);
        }
    };

    useEffect(() => {
        if (selectedTeam !== "" && selectedMembers.length > 0) {
            setIsEmpty(false);
        }
        setMemberExistsError(false);
    }, [selectedTeam, selectedMembers]);

    return (
        <Dialog open={open} onClose={handleClose}>
            {APIError && <ApiAlert />}
            <DialogTitle color="primary">
                Modify team{" "}
                <p className={styles.teamName}>{selectedTeam.title}</p>
            </DialogTitle>
            <DialogContent className={styles.addTeamDialogContent}>
                <DialogContentText>
                    Here you can add / remove members to the team, change the
                    teams name or delete the team.
                </DialogContentText>
                <TextField
                    className={styles.teamAddTextField}
                    required
                    inputProps={{ minLength: 3 }}
                    label="Change team name"
                    disabled={APIError}
                    variant="outlined"
                    value={newTeam}
                    helperText={"New name for the team."}
                    onChange={(e) => setNewTeam(e.target.value)}
                />

                <div className={styles.topMargin}>
                    <FormControl sx={{ width: "50%", mt: 1 }}>
                        <InputLabel>Add new team member</InputLabel>
                        <Select
                            className={styles.nameSelectBox}
                            value={selectedMembers}
                            multiple
                            onChange={handleChange}
                            renderValue={(selected) => "..."}
                            //disabled={APIError || !selectedTeam}
                        >
                            {vacationers
                                .filter(
                                    (vacationer) =>
                                        !selectedTeam?.members?.some(
                                            (member) =>
                                                member.name === vacationer.name
                                        )
                                )
                                .map(
                                    (
                                        vacationer // Filter out names that already exists in selected team
                                    ) => (
                                        <MenuItem
                                            key={vacationer.id}
                                            value={vacationer}
                                        >
                                            <Checkbox
                                                checked={
                                                    selectedMembers.indexOf(
                                                        vacationer
                                                    ) > -1
                                                }
                                            />
                                            {vacationer.name}
                                        </MenuItem>
                                    )
                                )}
                        </Select>
                    </FormControl>
                    <div>
                        <InputLabel>Members to add: </InputLabel>
                        {selectedMembers.map((member) => (
                            <Chip
                                key={member.vacationerId}
                                label={member.name}
                            />
                        ))}
                    </div>
                    <div>
                        <Button
                            className={styles.addButton}
                            disabled={isEmpty}
                            onClick={(e) => {
                                addToTeam(selectedMembers, selectedTeam);
                            }}
                            variant={"contained"}
                        >
                            Add to team!
                        </Button>
                    </div>
                </div>

                {/* <Button
                    onClick={() => {
                        createTeam();
                        handleClose()
                    }}
                    disabled={APIError}
                    variant={"contained"}
                >
                    Create
                </Button> */}
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
