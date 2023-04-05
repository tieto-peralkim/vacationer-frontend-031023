import { List, ListItem, ListItemText, Chip, Button } from "@mui/material";
import { useEffect, useState } from "react";
import styles from "../team.module.css";
import axios from "axios";
import * as React from "react";
import { useOutletContext } from "react-router-dom";
import TeamAdd from "../TeamAdd/TeamAdd";
import TeamModify from "../TeamModify/TeamModify";
import Typography from "@mui/material/Typography";

export default function TeamPage() {
    const [teams, setTeams] = useState([]);
    const [user, setUser, updateUser, setupdateUser, APIError, setAPIError] =
        useOutletContext();
    const [vacationers, setVacationers] = useState([]);

    const [openTeamAdd, setOpenTeamAdd] = useState(false);
    const [openTeamModify, setOpenTeamModify] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState("");

    const [completedAction, setCompletedAction] = useState(false);

    const openAPIError = () => {
        setAPIError(true);
    };

    useEffect(() => {
        let updatedTeams;
        Promise.all([
            axios.get(`${process.env.REACT_APP_ADDRESS}/teams`, {
                withCredentials: true,
            }),
            axios.get(`${process.env.REACT_APP_ADDRESS}/vacationers/total`, {
                withCredentials: true,
            }),
        ])
            .then((response) => {
                updatedTeams = response[0].data;
                setTeams(updatedTeams);
                setVacationers(response[1].data);
            })
            .catch((error) => {
                console.error(
                    "There was a teams/total vacationers get error:",
                    error
                );
                openAPIError();
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
                openAPIError={openAPIError}
            />
            <TeamModify
                open={openTeamModify}
                setOpenTeamModify={setOpenTeamModify}
                selectedTeam={selectedTeam}
                vacationers={vacationers}
                teams={teams}
                completedAction={completedAction}
                setCompletedAction={setCompletedAction}
                openAPIError={openAPIError}
            />
            {user.name && (
                <div className={styles.content}>
                    <Button
                        variant="outlined"
                        onClick={handleClickOpenTeamAdd}
                        className={styles.createTeamButton}
                    >
                        Create new team
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
                            ) || user.admin ? (
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
                                            disableTypography
                                            key={team.id}
                                            primary={
                                                <Typography
                                                    className={styles.teamName}
                                                >
                                                    {team.title}
                                                </Typography>
                                            }
                                            secondary={team.members.map(
                                                (member) => (
                                                    <Chip
                                                        className={
                                                            styles.memberChip
                                                        }
                                                        key={
                                                            member.vacationerId
                                                        }
                                                        color="primary"
                                                        label={member.name}
                                                    />
                                                )
                                            )}
                                        />
                                    </ListItem>
                                </div>
                            ) : (
                                <div key={team.id}>
                                    <ListItem
                                        className={styles.listItemGreyed}
                                        key={team.id}
                                    >
                                        <ListItemText
                                            key={team.id}
                                            disableTypography
                                            primary={
                                                <Typography
                                                    className={styles.teamName}
                                                >
                                                    {team.title}
                                                </Typography>
                                            }
                                            className={styles.greyedTitle}
                                            secondary={team.members.map(
                                                (member) => (
                                                    <Chip
                                                        className={
                                                            styles.memberChipGreyed
                                                        }
                                                        key={
                                                            member.vacationerId
                                                        }
                                                        color="primary"
                                                        label={member.name}
                                                    />
                                                )
                                            )}
                                        />
                                    </ListItem>
                                </div>
                            )
                        )}
                    </List>
                </div>
            )}
        </>
    );
}
