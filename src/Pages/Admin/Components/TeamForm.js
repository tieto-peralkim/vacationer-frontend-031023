import {Alert, Button, Chip, FormControl, InputLabel, MenuItem, Select, TextField,} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import {useEffect, useState} from "react";
import styles from "../admin.module.css";
import axios from "axios";
import AlertDialog from "../../Dialogs/AlertDialog";
import ModifyDialog from "../../Dialogs/ModifyDialog";

export default function TeamForm({emptySelections, selectedTeam, setSelectedTeam, selectedMember, setSelectedMember, setCompletedAction, completedAction, vacationers, teams}) {

    const [deletableMember, setDeletableMember] = useState("");
    const [newTeam, setNewTeam] = useState([]);
    const [isEmpty, setIsEmpty] = useState(true);
    const [memberExistsError, setMemberExistsError] = useState(false);
    const [openDeleteTeamAlert, setOpenDeleteTeamAlert] = useState(false)
    const [openModifyTeamAlert, setOpenModifyTeamAlert] = useState(false)
    const [openDeleteMemberAlert, setOpenDeleteMemberAlert] = useState(false)
    const TITLE = "Create team";

    const addToTeam = (newMember, team) => {
        console.log("newMember", newMember, "team", team);
        let isDuplicate = false;
        for (let i = 0; i < team.members.length; i++) {
            console.log(i, team.members[i].vacationerId, newMember.id)
            if (team.members[i].vacationerId === newMember.id) {
                isDuplicate = true
                break;
            }
        }

        if (!isDuplicate) {
            axios
                .post(`${process.env.REACT_APP_ADDRESS}/teams/${team.id}`, newMember)
                .then((response) => {
                    emptySelections();
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
    }
    const createTeam = (teamName) => {
        console.log("createTeam", teamName);
        const teamToAdd = {
            title: teamName
        };

        axios
            .post(`${process.env.REACT_APP_ADDRESS}/teams`, teamToAdd)
            .then((response) => {
                emptySelections();
                console.log(response);
                setCompletedAction(!completedAction);
            })
            .catch((error) => {
                console.error("There was a post error!", error);
            });
        setNewTeam("");
    }

    const changeTeamName = (newName) => {
        axios
            .patch(`${process.env.REACT_APP_ADDRESS}/teams/${selectedTeam.id}`, {"newName": newName})
            .then((response) => {
                console.log(response);
                setCompletedAction(!completedAction);
                setOpenModifyTeamAlert(false);
                emptySelections();
            })
            .catch((error) => {
                console.error("There was a put new name error!", error);
            });
    }

    const deleteMember = () => {
        console.log("deleting member", deletableMember)

        axios
            .put(`${process.env.REACT_APP_ADDRESS}/teams/members/${selectedTeam.id}`, deletableMember)
            .then((response) => {
                console.log(response);
                setDeletableMember("");
                setCompletedAction(!completedAction);
                setOpenDeleteMemberAlert(false);
                emptySelections();
            })
            .catch((error) => {
                console.error("There was a delete member error!", error);
            });
    }

    const deleteTeam = () => {
        console.log("deleting team", selectedTeam)
        axios
            .delete(`${process.env.REACT_APP_ADDRESS}/teams/${selectedTeam.id}`)
            .then((response) => {
                console.log(response);
                emptySelections();
                setCompletedAction(!completedAction);
                setOpenDeleteTeamAlert(false);
            })
            .catch((error) => {
                console.error("There was a delete error!", error);
            });
    }

    useEffect(() => {
        if (selectedTeam !== "" && selectedMember !== "") {
            setIsEmpty(false);
        }
        setMemberExistsError(false);
    }, [selectedTeam, selectedMember]);




    return (
        <>
            <div className={styles.content}>
                <div className={styles.borderedBox}>

                    <InputLabel className={styles.extraMargin}>{TITLE}</InputLabel>
                    <TextField
                        style={{display: "block"}}
                        className={styles.extraMargin}
                        required
                        label="Team"
                        variant="outlined"
                        error={false}
                        value={newTeam}
                        helperText={""}
                        onChange={(e) => setNewTeam(e.target.value)}/>
                    <Button className={styles.extraMargin} style={{display: "block"}} onClick={e => {
                        createTeam(newTeam);
                    }
                    } variant={"contained"}>
                        {TITLE}
                    </Button>
                </div>
                <div className={styles.borderedBox}>
                    <InputLabel className={styles.extraMargin}>Team list</InputLabel>
                    <FormControl className={styles.nameSelectBox}>
                        <InputLabel>Choose team</InputLabel>
                        <Select
                            displayEmpty={true}
                            value={selectedTeam}
                            onChange={e => {
                                setSelectedTeam(e.target.value);
                            }
                            }>
                            {teams.map((team) => (
                                    <MenuItem key={team.id} value={team}>{team.title}</MenuItem>
                                )
                            )}
                        </Select>
                    </FormControl>
                    <Button disabled={!selectedTeam} onClick={() => {
                        setOpenModifyTeamAlert(true);
                    }
                    } variant={"contained"}>Modify team</Button>
                    <Button disabled={!selectedTeam} onClick={() => {
                        setOpenDeleteTeamAlert(true);
                    }
                    } variant={"contained"}>
                        Delete team!
                    </Button>
                    <div className={styles.extraMargin}>
                        Members: {selectedTeam &&
                        selectedTeam.members
                            // some sorting?
                            // .sort((v1, v2) => v1.name - v2.name)
                            .map(member => (
                                <Chip key={member.vacationerId} label={member.name} onDelete={() => {
                                    setOpenDeleteMemberAlert(true);
                                    setDeletableMember(member);
                                }} deleteIcon={<DeleteIcon/>}/>
                            ))}
                    </div>
                    <div><FormControl className={styles.nameSelectBox}>
                        <InputLabel>Add new team member</InputLabel>
                        <Select
                            value={selectedMember}
                            onChange={e => {
                                setSelectedMember(e.target.value)
                            }}>
                            {vacationers.map((vacationer) => (
                                    <MenuItem key={vacationer.id} value={vacationer}>{vacationer.name}</MenuItem>
                                )
                            )}

                        </Select>
                    </FormControl>
                        <div className={styles.extraMargin}>
                            <Button disabled={isEmpty} onClick={e => {
                                addToTeam(selectedMember, selectedTeam);
                            }
                            } variant={"contained"}>
                                Add to team!
                            </Button>
                        </div>
                    </div>
                    {memberExistsError && <Alert severity="warning">{selectedMember.name} is already a member in the
                        team {selectedTeam.title}!</Alert>}
                </div>
            </div>


            <ModifyDialog openAlert={openModifyTeamAlert} handleCloseAlert={() => setOpenModifyTeamAlert(false)}
                          dialogTitle={"Modify team"}
                          dialogContent={"Change name of team " + selectedTeam.title}
                          inputContent={selectedTeam.title}
                          handleAction={(name) => changeTeamName(name)}
                          cancel={"No"} confirm={"Yes change name"}/>
            <AlertDialog openAlert={openDeleteTeamAlert} handleCloseAlert={() => setOpenDeleteTeamAlert(false)}
                         handleAction={deleteTeam}
                         dialogTitle={"Delete team"}
                         dialogContent={selectedTeam && `Are you sure you want to delete the team ${selectedTeam.title} ?`}
                         cancel={"No"} confirm={"Yes delete"}/>
            <AlertDialog openAlert={openDeleteMemberAlert} handleCloseAlert={() => setOpenDeleteMemberAlert(false)}
                         handleAction={deleteMember}
                         dialogTitle={"Delete member"}
                         dialogContent={deletableMember && `Are you sure you want to delete the member ${deletableMember.name} from team ${selectedTeam.title} ?`}
                         cancel={"No"} confirm={"Yes delete"}/>
        </>
    )
}