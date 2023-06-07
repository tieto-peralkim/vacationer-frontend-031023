import { Button, List, ListItem, ListItemIcon, Tooltip } from "@mui/material";
import styles from "./profile.module.css";
import AlertDialog from "../Dialogs/AlertDialog";
import axios from "axios";
import { useEffect, useState } from "react";
import ModifyDialog from "../Dialogs/ModifyDialog";
import BadgeIcon from "@mui/icons-material/Badge";
import GitHubIcon from "@mui/icons-material/GitHub";
import SecurityIcon from "@mui/icons-material/Security";
import UpdateIcon from "@mui/icons-material/Update";
import { useOutletVariables } from "../../NavigationBar";

export default function Profile() {
    const minNameLength = 3;
    const maxNameLength = 12;

    const { user, setAPIError, newUserState, updateUser } =
        useOutletVariables();
    const [completedAction, setCompletedAction] = useState(false);
    const [userCreationMessage, setUserCreationMessage] = useState("");
    const [userNameError, setUserNameError] = useState(false);
    const [openModifyUserAlert, setOpenModifyUserAlert] = useState(false);
    const [userUpdatedAt, setUserUpdatedAt] = useState("");
    const [teams, setTeams] = useState([]);
    const [upcomingHolidays, setUpcomingHolidays] = useState(0);
    const [pastHolidays, setPastHolidays] = useState(0);

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_ADDRESS}/teams`, {
                withCredentials: true,
            })
            .then((response) => {
                setTeams(
                    response.data.filter((x) =>
                        x.members.some((c) => c.name == user.name)
                    )
                );
            })
            .catch((error) => {
                console.error("There was a teams get error:", error);
            });
    }, [user]);

    useEffect(() => {
        updateUser(!newUserState);
    }, [completedAction]);

    useEffect(() => {
        if (user && user.updatedAt) {
            let date = new Date(user.updatedAt);
            let updateDate =
                date.toLocaleDateString("fi-FI") +
                " " +
                date.toLocaleTimeString("fi-FI");

            setUserUpdatedAt(updateDate);
        }
    }, [user]);

    const changeUserName = (newName) => {
        if (
            newName.trim().length >= minNameLength &&
            newName.trim().length <= maxNameLength
        ) {
            axios
                .patch(
                    `${process.env.REACT_APP_ADDRESS}/vacationers/${user.id}`,
                    { newName: newName.trim() },
                    { withCredentials: true }
                )
                .then(() => {
                    changeUserNameinTeams(user.id, newName);
                    setOpenModifyUserAlert(false);
                })
                .catch((error) => {
                    if (error.response.status === 409) {
                        setUserCreationMessage(error.response.data);
                    } else {
                        console.error(
                            "There was a user name change error!",
                            error
                        );
                        setAPIError(true);
                    }
                });
        } else {
            setUserNameError(true);
        }
    };

    const changeUserNameinTeams = (memberId, newName) => {
        axios
            .put(
                `${process.env.REACT_APP_ADDRESS}/teams/membername/${memberId}`,
                { newName: newName },
                { withCredentials: true }
            )
            .then(() => {
                setCompletedAction(!completedAction);
            })
            .catch((error) => {
                console.error(
                    "There was a put changeUserNameinTeams error!",
                    error
                );
                setAPIError(true);
            });
    };

    useEffect(() => {
        let upcoming = 0;
        if (user != undefined) {
            user.vacations.forEach((vacation) => {
                if (new Date(vacation.start) >= new Date()) {
                    upcoming++;
                }
            });
            setUpcomingHolidays(upcoming);
            setPastHolidays(user.vacations.length - upcoming);
        }
    }, [user]);

    return (
        <>
            <div className={styles.viewDivider}>
                <div className={styles.content}>
                    {user && user.name && (
                        <>
                            <div
                                className={styles.borderedBoxProfile}
                                id={styles.nonScrollableBox}
                            >
                                <h3>Profile</h3>
                                <List>
                                    <Tooltip
                                        title={"Name"}
                                        placement={"top-start"}
                                    >
                                        <ListItem id={styles.infoItem}>
                                            <ListItemIcon>
                                                <BadgeIcon />
                                            </ListItemIcon>
                                            {user.name}
                                        </ListItem>
                                    </Tooltip>
                                    <Tooltip
                                        title={"Github account"}
                                        placement={"top-start"}
                                    >
                                        <ListItem>
                                            <ListItemIcon>
                                                <GitHubIcon />
                                            </ListItemIcon>
                                            {user.nameId}
                                        </ListItem>
                                    </Tooltip>
                                    <Tooltip
                                        title={"User status"}
                                        placement={"top-start"}
                                    >
                                        <ListItem>
                                            <ListItemIcon>
                                                <SecurityIcon />
                                            </ListItemIcon>
                                            {user.admin ? "Admin" : "User"}
                                        </ListItem>
                                    </Tooltip>
                                    <Tooltip
                                        title={"User updated"}
                                        placement={"top-start"}
                                    >
                                        <ListItem>
                                            <ListItemIcon>
                                                <UpdateIcon />
                                            </ListItemIcon>
                                            {userUpdatedAt}
                                        </ListItem>
                                    </Tooltip>
                                </List>

                                <div className={styles.changeNameButton}>
                                    <Button
                                        onClick={() => {
                                            setOpenModifyUserAlert(true);
                                        }}
                                        variant={"contained"}
                                    >
                                        Change name
                                    </Button>
                                </div>
                                {/*For revoking Github permissions*/}
                                {/*<a*/}
                                {/*    href={`${process.env.REACT_APP_ADDRESS}/checkAuthorization`}*/}
                                {/*    target={"_blank"}*/}
                                {/*>*/}
                                {/*    Github permissions of the app*/}
                                {/*</a>*/}
                            </div>

                            <div
                                className={styles.borderedBoxProfile}
                                id={styles.scrollableBox}
                            >
                                <h3>My Teams</h3>
                                <div className={styles.scrollableList}>
                                    <List>
                                        {teams.map((team) => (
                                            <ListItem>
                                                <div
                                                    className={styles.listItem}
                                                >
                                                    {team.title}
                                                </div>
                                            </ListItem>
                                        ))}
                                    </List>
                                </div>
                            </div>

                            <div
                                className={styles.borderedBoxProfile}
                                id={styles.scrollableBox}
                            >
                                <h3>Holiday History</h3>
                                <div className={styles.scrollableList}>
                                    <List>
                                        {user.vacations
                                            .sort((a, b) =>
                                                a.start < b.start ? 1 : -1
                                            )
                                            .map((vacation) => (
                                                <ListItem>
                                                    {new Date(vacation.start) >=
                                                    new Date() ? (
                                                        <div
                                                            className={
                                                                styles.listItem
                                                            }
                                                        >
                                                            {vacation.start.slice(
                                                                0,
                                                                10
                                                            ) +
                                                                " - " +
                                                                vacation.end.slice(
                                                                    0,
                                                                    10
                                                                )}
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className={
                                                                styles.listItemGreyed
                                                            }
                                                        >
                                                            {vacation.start.slice(
                                                                0,
                                                                10
                                                            ) +
                                                                " - " +
                                                                vacation.end.slice(
                                                                    0,
                                                                    10
                                                                )}
                                                        </div>
                                                    )}
                                                </ListItem>
                                            ))}
                                    </List>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <div className={styles.profileStats}>
                    <div></div>
                    <div id={styles.teamsStats}>
                        <p>Teams: {teams.length}</p>
                    </div>
                    <div id={styles.holidayStats}>
                        <p>Upcoming: {upcomingHolidays}</p>
                        <p>Past: {pastHolidays}</p>
                    </div>
                </div>
            </div>
            <ModifyDialog
                openAlert={openModifyUserAlert}
                handleCloseAlert={() => setOpenModifyUserAlert(false)}
                dialogTitle={"Modify user"}
                dialogContent={user && "Change name of user " + user.nameId}
                inputContent={user && user.name}
                handleAction={(name) => changeUserName(name)}
                cancel={"No"}
                confirm={"Yes change name"}
            />

            <AlertDialog
                openAlert={userCreationMessage !== ""}
                handleAction={() => void 0}
                handleCloseAlert={() => setUserCreationMessage("")}
                dialogTitle={"ERROR!"}
                dialogContent={userCreationMessage}
                cancel={""}
                confirm={""}
            />
            <AlertDialog
                openAlert={userNameError}
                handleAction={() => void 0}
                handleCloseAlert={() => setUserNameError(false)}
                dialogTitle={"ERROR!"}
                dialogContent={`This username is too short or long (should be ${minNameLength}-${maxNameLength} characters)!`}
                cancel={""}
                confirm={""}
            />
        </>
    );
}
