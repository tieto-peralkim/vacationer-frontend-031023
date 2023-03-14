import {
    Alert,
    Button,
    Checkbox,
    Chip,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";
import styles from "./teamform.module.css";
import axios from "axios";
import AlertDialog from "../Dialogs/AlertDialog";
import ModifyDialog from "../Dialogs/ModifyDialog";
import { useOutletContext } from "react-router-dom";
import ApiAlert from "../../components/ApiAlert";

export default function TeamForm({}) {
    const CREATE_TITLE = "Create team";

    const [teams, setTeams] = useState([]);
    const [vacationers, setVacationers] = useState([]);
    const [user, setUser, update, setUpdate] = useOutletContext();

    const [selectedTeam, setSelectedTeam] = useState("");
    const [selectedMember, setSelectedMember] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [deletableMember, setDeletableMember] = useState("");

    const [completedAction, setCompletedAction] = useState(false);
    const [APIError, setAPIError] = useState(false);

    const [newTeam, setNewTeam] = useState([]);
    const [isEmpty, setIsEmpty] = useState(true);
    const [memberExistsError, setMemberExistsError] = useState(false);
    const [openDeleteTeamAlert, setOpenDeleteTeamAlert] = useState(false);
    const [openModifyTeamAlert, setOpenModifyTeamAlert] = useState(false);
    const [openDeleteMemberAlert, setOpenDeleteMemberAlert] = useState(false);
    const [teamCreated, setTeamCreated] = useState(false);
    const [teamNameError, setTeamNameError] = useState(false);
    const nameError = newTeam.length < 3;

    useEffect(() => {
        emptySelections();
        axios
            .get(`${process.env.REACT_APP_ADDRESS}/teams`, {
                withCredentials: true,
            })
            .then((response) => {
                setAPIError(false);
                setTeams(response.data);
                console.log("teams", response.data);
            })
            .catch((error) => {
                console.error("There was a teams get error:", error);
                if (!APIError) {
                    setAPIError(true);
                }
            });
        axios
            .get(`${process.env.REACT_APP_ADDRESS}/vacationers/total`, {
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

    const emptySelections = () => {
        setSelectedMember("");
        setSelectedTeam("");
        setSelectedMembers([]);
    };

    const handleChange = (event) => {
        const {
          target: { value },
        } = event;
        // console.log(value)
        setSelectedMembers(
          typeof value === 'string' ? value.split(',') : value
        )
    };

    const addToTeam = (newMembers, team) => {
        console.log("newMembers: ", newMembers, "team", team);
        let isDuplicate = false;

        team.members.forEach(teamMember => {
            newMembers.forEach(newMember => {
                if (teamMember.vacationerId === newMember.id) {
                    isDuplicate = true
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
                    setCompletedAction(!completedAction);
                    setIsEmpty(true);
                    setMemberExistsError(false);
                })
                .catch((error) => {
                    console.error("There was a team put error!", error);
                });
        } else {
            setMemberExistsError(true);
        }
    };
    const createTeam = () => {
        if (!nameError) {
            console.log("createTeam", newTeam);
            const teamToAdd = {
                title: newTeam,
            };

            axios
                .post(`${process.env.REACT_APP_ADDRESS}/teams`, teamToAdd, {
                    withCredentials: true,
                })
                .then((response) => {
                    setTeamCreated(true);
                    console.log(response);
                    setCompletedAction(!completedAction);
                })
                .catch((error) => {
                    console.error("There was a post error!", error);
                })
                .finally(() => setNewTeam(""));
        } else {
            setTeamNameError(true);
        }
    };

    const changeTeamName = (newName) => {
        axios
            .patch(
                `${process.env.REACT_APP_ADDRESS}/teams/${selectedTeam.id}`,
                {
                    newName: newName,
                },
                { withCredentials: true }
            )
            .then((response) => {
                console.log(response);
                setCompletedAction(!completedAction);
                setOpenModifyTeamAlert(false);
            })
            .catch((error) => {
                console.error("There was a put new name error!", error);
            });
    };

    const deleteMember = () => {
        console.log("deleting member", deletableMember);

        axios
            .put(
                `${process.env.REACT_APP_ADDRESS}/teams/members/${selectedTeam.id}`,
                deletableMember,
                { withCredentials: true }
            )
            .then((response) => {
                console.log(response);
                setDeletableMember("");
                setCompletedAction(!completedAction);
                setOpenDeleteMemberAlert(false);
            })
            .catch((error) => {
                console.error("There was a delete member error!", error);
            });
    };

    // For adding the team to the deleted list
    const deleteTeam = () => {
        console.log("deleting team", selectedTeam);
        axios
            .put(
                `${process.env.REACT_APP_ADDRESS}/teams/${selectedTeam.id}/delete`,
                {},
                { withCredentials: true }
            )
            .then((response) => {
                console.log(response);
                setCompletedAction(!completedAction);
                setOpenDeleteTeamAlert(false);
            })
            .catch((error) => {
                console.error("There was a delete error!", error);
            });
    };

    useEffect(() => {
        if (selectedTeam !== "" && selectedMembers.length > 1) {
            setIsEmpty(false);
        }
        setMemberExistsError(false);
    }, [selectedTeam, selectedMembers]);

    return (
        <>
            {APIError && <ApiAlert />}
            <div className={styles.content}>
                {user.name && (
                    <>
                        {/* Add minimum amount of workers for team (LimitSetter -> workerlimit
                <div>Worker limit</div>*/}
                        <div className={styles.borderedBox}>
                            <InputLabel>{CREATE_TITLE}</InputLabel>
                            <div className={styles.topMargin}>
                                <TextField
                                    required
                                    inputProps={{ minLength: 3 }}
                                    label="Team name"
                                    variant="outlined"
                                    error={nameError}
                                    disabled={APIError}
                                    value={newTeam}
                                    helperText={
                                        nameError &&
                                        "Name must be at least 3 characters"
                                    }
                                    onChange={(e) => setNewTeam(e.target.value)}
                                />
                            </div>
                            <div className={styles.topMargin}>
                                <Button
                                    disabled={APIError}
                                    onClick={() => {
                                        createTeam();
                                    }}
                                    variant={"contained"}
                                >
                                    {CREATE_TITLE}
                                </Button>
                            </div>
                        </div>
                        <div className={styles.borderedBox}>
                            <InputLabel>Team list</InputLabel>
                            <div className={styles.topMargin}>
                                <FormControl>
                                    <InputLabel>Choose team</InputLabel>
                                    <Select
                                        className={styles.nameSelectBox}
                                        displayEmpty={true}
                                        value={selectedTeam}
                                        onChange={(e) => {
                                            setSelectedTeam(e.target.value);
                                        }}
                                        disabled={APIError}
                                    >
                                        {teams.map((team) => (
                                            <MenuItem
                                                key={team.id}
                                                value={team}
                                            >
                                                {team.title}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>
                            <div className={styles.allButtons}>
                                <Button
                                    disabled={!selectedTeam}
                                    onClick={() => {
                                        setOpenModifyTeamAlert(true);
                                    }}
                                    variant={"contained"}
                                >
                                    Change team name
                                </Button>
                                <Button
                                    disabled={!selectedTeam}
                                    onClick={() => {
                                        setOpenDeleteTeamAlert(true);
                                    }}
                                    variant={"contained"}
                                    color={"error"}
                                >
                                    Delete team
                                </Button>
                            </div>
                            <div>
                                <InputLabel>Members: </InputLabel>
                                {selectedTeam &&
                                    selectedTeam.members
                                        // some sorting?
                                        // .sort((v1, v2) => v1.name - v2.name)
                                        .map((member) => (
                                            <Chip
                                                key={member.vacationerId}
                                                label={member.name}
                                                onDelete={() => {
                                                    setOpenDeleteMemberAlert(
                                                        true
                                                    );
                                                    setDeletableMember(member);
                                                }}
                                                deleteIcon={<DeleteIcon />}
                                            />
                                        ))}
                            </div>
                            <div className={styles.topMargin}>
                                <FormControl sx={{ width: "50%", mt: 1 }}>
                                    <InputLabel>Add new team member</InputLabel>
                                    <Select
                                        className={styles.nameSelectBox}
                                        value={selectedMembers}
                                        multiple
                                        onChange={handleChange}
                                        renderValue={(selected) => "..."}
                                        disabled={APIError || !selectedTeam}
                                    >
                                        {vacationers.map((vacationer) => (
                                            <MenuItem
                                                key={vacationer.id}
                                                value={vacationer}
                                            >
                                                <Checkbox checked={selectedMembers.indexOf(vacationer) > -1} />
                                                {vacationer.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <div>
                                <InputLabel>Members to add: </InputLabel>
                                {selectedMembers
                                        .map((member) => (
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
                                            addToTeam(
                                                selectedMembers,
                                                selectedTeam
                                            );
                                        }}
                                        variant={"contained"}
                                    >
                                        Add to team!
                                    </Button>
                                </div>
                            </div>
                            {memberExistsError && (
                                <Alert severity="warning">
                                    {selectedMember.name} is already a member in
                                    the team {selectedTeam.title}!
                                </Alert>
                            )}
                        </div>
                    </>
                )}
            </div>

            <ModifyDialog
                openAlert={openModifyTeamAlert}
                handleCloseAlert={() => setOpenModifyTeamAlert(false)}
                dialogTitle={"Modify team"}
                dialogContent={"Change name of team " + selectedTeam.title}
                inputContent={selectedTeam.title}
                handleAction={(name) => changeTeamName(name)}
                cancel={"No"}
                confirm={"Yes change name"}
            />
            <AlertDialog
                openAlert={openDeleteTeamAlert}
                handleCloseAlert={() => setOpenDeleteTeamAlert(false)}
                handleAction={deleteTeam}
                dialogTitle={"Delete team"}
                dialogContent={
                    selectedTeam &&
                    `Are you sure you want to delete the team ${selectedTeam.title} ?`
                }
                cancel={"No"}
                confirm={"Yes delete"}
            />
            <AlertDialog
                openAlert={openDeleteMemberAlert}
                handleCloseAlert={() => setOpenDeleteMemberAlert(false)}
                handleAction={deleteMember}
                dialogTitle={"Delete member"}
                dialogContent={
                    deletableMember &&
                    `Are you sure you want to delete the member ${deletableMember.name} from team ${selectedTeam.title} ?`
                }
                cancel={"No"}
                confirm={"Yes delete"}
            />
            <AlertDialog
                openAlert={teamCreated}
                handleCloseAlert={() => setTeamCreated(false)}
                dialogTitle={"Create team"}
                dialogContent={"Team created!"}
            />
            <AlertDialog
                openAlert={teamNameError}
                handleCloseAlert={() => setTeamNameError(false)}
                dialogTitle={"ERROR!"}
                dialogContent={
                    "This team name is too short (less than 3 characters)!"
                }
            />
        </>
    );
}
