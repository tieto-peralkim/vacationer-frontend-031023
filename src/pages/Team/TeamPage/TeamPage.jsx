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

export default function TeamPage({}) {
    const [teams, setTeams] = useState([]);
    const [user, setUser, update, setUpdate] = useOutletContext();
    const [vacationers, setVacationers] = useState([]);

    const [openTeamAdd, setOpenTeamAdd] = useState(false);
    const [openTeamModify, setOpenTeamModify] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState("");

    const [completedAction, setCompletedAction] = useState(false);
    const [APIError, setAPIError] = useState(false);

    // Fetch team and vacationer data whenever team or completedAction changes
    useEffect(() => {
        let updatedTeams;
        axios
            .get(`${process.env.REACT_APP_ADDRESS}/teams`, {
                withCredentials: true,
            })
            .then((response) => {
                updatedTeams = response.data;
                setAPIError(false);
                setTeams(response.data);
            })
            .catch((error) => {
                console.error("There was a teams get error:", error);
                if (!APIError) {
                    setAPIError(true);
                }
            })
            .finally(() => {
                if (selectedTeam) {
                    updatedTeams.forEach((team) => {
                        if (team.id === selectedTeam.id) {
                            setSelectedTeam(team);
                        }
                    });
                }
            });
        axios
            .get(`${process.env.REACT_APP_ADDRESS}/vacationers/total`, {
                withCredentials: true,
            })
            .then((response) => {
                setAPIError(false);
                setVacationers(response.data);
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
        setSelectedTeam(team);
        setOpenTeamModify(true);
    };

    return (
        <>
            <TeamAdd
                open={openTeamAdd}
                setOpenTeamAdd={setOpenTeamAdd}
                teams={teams}
                completedAction={completedAction}
                setCompletedAction={setCompletedAction}
            />
            <TeamModify
                open={openTeamModify}
                setOpenTeamModify={setOpenTeamModify}
                selectedTeam={selectedTeam}
                vacationers={vacationers}
                teams={teams}
                completedAction={completedAction}
                setCompletedAction={setCompletedAction}
            />
            {APIError && <ApiAlert />}
            <div className={styles.content}>
                <Button
                    variant="outlined"
                    onClick={handleClickOpenTeamAdd}
                    className={styles.createTeamButton}
                >
                    Create a new team
                </Button>
                <List
                    key={"key"}
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
                            <div className={styles.itemCont} key={team.id}>
                                <ListItem
                                    key={team.id}
                                    alignItems="flex-start"
                                    className={styles.listItem}
                                    onClick={() => {
                                        handleClickOpenTeamModify(team);
                                    }}
                                >
                                    <ListItemText
                                        key={team.id}
                                        primary={<p>{team.title}</p>}
                                        secondary={team.members.map(
                                            (member) => (
                                                <Chip
                                                    className={
                                                        styles.memberChip
                                                    }
                                                    key={member.vacationerId}
                                                    color="primary"
                                                    label={member.name}
                                                />
                                            )
                                        )}
                                    />
                                </ListItem>
                            </div>
                        ) : (
                            <ListItem
                                className={styles.listItemGreyed}
                                key={team.id}
                            >
                                <ListItemText
                                    disableTypography={true}
                                    key={team.id}
                                    primary={
                                        <p className={styles.greyedTitle}>
                                            {team.title}
                                        </p>
                                    }
                                    secondary={team.members.map((member) => (
                                        <Chip
                                            className={styles.memberChipGreyed}
                                            key={member.vacationerId}
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
