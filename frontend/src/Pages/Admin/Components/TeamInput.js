import {Alert, Button, ButtonGroup, FormControl, InputLabel, MenuItem, Select, TextField} from "@mui/material";
import {useEffect, useState} from "react";
import styles from "../admin.module.css";
import axios from "axios";

export default function TeamInput() {

    const [selectedMember, setSelectedMember] = useState("");
    const [selectedTeam, setSelectedTeam] = useState("");
    const [newTeam, setNewTeam] = useState([]);
    const [vacationers, setVacationers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [save, setSave] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);
    const [memberExistsError, setMemberExistsError] = useState(false);

    const selectMember = (memberName) => {
        for (let i = 0; i < vacationers.length; i++) {
            if (vacationers[i].name === memberName) {
                setSelectedMember(vacationers[i])
                console.log("teams", vacationers[i])
            }
        }
    }

    const emptySelections = () => {
        setSelectedMember("");
        setSelectedTeam("");
    }

    const selectTeam = (title) => {
        for (let i = 0; i < teams.length; i++) {
            if (teams[i].title === title) {
                setSelectedTeam(teams[i])
                console.log("teams", teams[i])
                break;
            }
        }
    }

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
                .put(`http://localhost:3001/teams/${team.id}`, newMember)
                .then((response) => {
                    emptySelections();
                    setSave(!save);
                    setIsEmpty(true);
                    setMemberExistsError(false);
                })
                .catch((error) => {
                    console.error("There was a team put error!", error);
                });
        }
        else {
            setMemberExistsError(true);
        }
    }
    const createTeam = (teamName) => {
        console.log("team luodaan", teamName);
        const teamToAdd = {
            title: teamName
        };

        axios
            .post("http://localhost:3001/teams", teamToAdd)
            .then((response) => {
                console.log(response);
                setSave(!save);
            })
            .catch((error) => {
                console.error("There was a post error!", error);
            });
        setNewTeam("");
    }

    useEffect(() => {
        if (selectedTeam !== "" && selectedMember !== ""){
            setIsEmpty(false);
        }
        setMemberExistsError(false);
    }, [selectedTeam, selectedMember]);

    useEffect(() => {
        axios
            .get("http://localhost:3001/vacationers")
            .then((response) => {
                setVacationers(response.data);
                console.log("vacationers", response.data);
            })
            .catch((error) => {
                console.log("There was a get error!", error)
            });
    }, []);

    useEffect(() => {
        axios
            .get("http://localhost:3001/teams")
            .then((response) => {
                setTeams(response.data);
            })
            .catch((error) => {
                console.log("There was a get error!", error)
            });
    }, [save]);


    return (
        <>
            <InputLabel>Add new member to a team</InputLabel>
            <div className={styles.extraMargin}>
                <FormControl className={styles.nameSelectBox}>
                    <InputLabel>Choose team</InputLabel>
                    <Select
                        value={selectedTeam ? selectedTeam.title : ""}
                        onChange={e => selectTeam(e.target.value)}>
                        {teams.map((team) => (
                                <MenuItem key={team.id} value={team.title}>{team.title}</MenuItem>
                            )
                        )}

                    </Select>
                </FormControl>
            </div>
            {selectedTeam &&
                selectedTeam.members
                    // .sort((v1, v2) => v1.start - v2.start)
                    .map(member => (
                        <p>{member.name}</p>
                ))}
            <div className={styles.extraMargin}>
                <FormControl className={styles.nameSelectBox}>
                    <InputLabel>Choose team member</InputLabel>
                    <Select
                        value={selectedMember ? selectedMember.name : ""}
                        onChange={e => selectMember(e.target.value)}>
                        {vacationers.map((vacationer) => (
                                <MenuItem key={vacationer.id} value={vacationer.name}>{vacationer.name}</MenuItem>
                            )
                        )}

                    </Select>
                </FormControl>
            </div>
            <Button disabled={isEmpty} onClick={e => {
                addToTeam(selectedMember, selectedTeam);
            }
            } variant={"contained"}>
                Add to team!
            </Button>
            { memberExistsError && <Alert severity="warning">{selectedMember.name} is already a member in the team {selectedTeam.title}!</Alert>}
            <InputLabel className={styles.extraMargin}>Add new team</InputLabel>
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
            <Button onClick={e => {
                createTeam(newTeam);
            }
            } variant={"contained"}>
                Create team!
            </Button>
        </>
    )
}