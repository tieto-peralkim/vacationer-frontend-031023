import {
    List,
    ListItem,
    Divider,
    ListItemText,
    Chip,
    Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import styles from "../team.module.css";
import axios from "axios";
import ApiAlert from "../../../components/ApiAlert";
import * as React from "react";
import { useOutletContext } from "react-router-dom";
import TeamAdd from "../TeamAdd/TeamAdd";
import TeamModify from "../TeamModify/TeamModify";

export default function TeamForm({}) {
    const [teams, setTeams] = useState([]);
    const [user, setUser] = useOutletContext();
    const [vacationers, setVacationers] = useState([]);

    const [openTeamAdd, setOpenTeamAdd] = useState(false);
    const [openTeamModify, setOpenTeamModify] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState("");

    const [completedAction, setCompletedAction] = useState(false);
    const [APIError, setAPIError] = useState(false);

    useEffect(() => {
        console.log("User:" + user.name);
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

    const handleClickOpenTeamAdd = () => {
        setOpenTeamAdd(true);
    };

    const handleClickOpenTeamModify = (team) => {
        //console.log(team);
        setSelectedTeam(team)
        setOpenTeamModify(true);
    };

    return (
        <>
            <TeamAdd 
                open={openTeamAdd} 
                setOpenTeamAdd={setOpenTeamAdd} 
                teams={teams}
                setTeams={setTeams}
            />
            <TeamModify
                open={openTeamModify}
                setOpenTeamModify={setOpenTeamModify}
                selectedTeam={selectedTeam}
                vacationers={vacationers}
                teams={teams}
                setTeams={setTeams}
                setVacationers={setVacationers}
                setSelectedTeam={setSelectedTeam}
            />
            {APIError && <ApiAlert />}
            <div className={styles.content}>
                <Button variant="outlined" onClick={handleClickOpenTeamAdd}>
                    Create new team
                </Button>
                <List
                    sx={{
                        width: "100%",
                        maxWidth: 760,
                        bgcolor: "background.paper",
                    }}
                >
                    {teams.map((team) =>
                        team.members.some(
                            (member) => member["name"] === user.name
                        ) ? (
                            <div className={styles.itemCont}>
                                <ListItem
                                    alignItems="flex-start"
                                    className={styles.listItem}
                                    onClick={() => {
                                        handleClickOpenTeamModify(team);
                                    }}
                                >
                                    <ListItemText
                                        primary={<p>{team.title}</p>}
                                        secondary={team.members.map(
                                            (member) => (
                                                <Chip
                                                    className={
                                                        styles.memberChip
                                                    }
                                                    key={member.name}
                                                    color="primary"
                                                    label={member.name}
                                                />
                                            )
                                        )}
                                    />
                                </ListItem>
                            </div>
                        ) : (
                            <ListItem className={styles.listItemGreyed}>
                                <ListItemText
                                    primary={
                                        <p className={styles.greyedTitle}>
                                            {team.title}
                                        </p>
                                    }
                                    secondary={team.members.map((member) => (
                                        <Chip
                                            className={styles.memberChipGreyed}
                                            key={member.name}
                                            color="primary"
                                            label={member.name}
                                        />
                                    ))}
                                />
                            </ListItem>
                        )
                    )}
                </List>
            </div>
        </>
    );
}
