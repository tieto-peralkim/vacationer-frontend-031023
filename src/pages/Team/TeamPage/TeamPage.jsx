import {
    List,
    ListItem,
    Divider,
    ListItemText,
    Chip
} from "@mui/material";
import { useEffect, useState } from "react";
import styles from "../team.module.css";
import axios from "axios";
import ApiAlert from "../../../components/ApiAlert";
import * as React from 'react';
import { useOutletContext } from "react-router-dom";

export default function TeamForm({}) {
    const [teams, setTeams] = useState([]);
    const [user, setUser] = useOutletContext();
    const [vacationers, setVacationers] = useState([]);

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

    return (
        <>
            {APIError && <ApiAlert />}
            <div className={styles.content}>
                <List sx={{ width: '100%', maxWidth: 760, bgcolor: 'background.paper' }}>
                    {teams.map((team) => (
                        team.members.some( member => member['name'] === user.name ) ?
                        <a href="">
                        <ListItem alignItems="flex-start" className = {styles.listItem}>
                            <ListItemText
                            primary= {<p>
                                {team.title}
                            </p>}
                            secondary={
                                team.members.map((member) => (
                                    <Chip
                                        className={styles.memberChip}
                                        key={member.name}
                                        color="primary"
                                        label={member.name}
                                    />
                                ))
                            }
                            />
                        </ListItem>
                        </a>
                        :
                        <ListItem  className = {styles.listItemGreyed}>
                            <ListItemText
                            primary= {
                                <p className={styles.greyedTitle}>
                                    {team.title}
                                </p>}
                            secondary={
                                team.members.map((member) => (
                                    <Chip
                                        className={styles.memberChipGreyed}
                                        key={member.name}
                                        color="primary"
                                        label={member.name}
                                    />
                                ))
                            }
                            />
                        </ListItem>
                    ))}
                </List>
            </div>
        </>
    );
}
