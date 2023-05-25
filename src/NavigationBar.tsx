import { Link, Outlet, useOutletContext } from "react-router-dom";
import Toolbar from "@mui/material/Toolbar";
import styles from "./NavigationBar.module.css";
import {
    AppBar,
    Box,
    CircularProgress,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    Tooltip,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import SettingsIcon from "@mui/icons-material/Settings";
import GroupsIcon from "@mui/icons-material/Groups";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { PersonPin } from "@mui/icons-material";
import Login from "./pages/Login/Login";
import CustomAlert from "./components/CustomAlert";
import { Buffer } from "buffer";

export interface Vacationer {
    id: string;
    name: string;
    nameId: string;
    vacations: [
        {
            start: string;
            end: string;
            comment: string;
            confirmed: boolean;
        }
    ];
    admin: boolean;
    calendarSettings: [
        {
            holidayColor: string;
            unConfirmedHolidayColor: string;
            weekendColor: string;
            weekendHolidayColor: string;
            holidaySymbol: string;
            unConfirmedHolidaySymbol: string;
        }
    ];
    createdAt: Date;
    updatedAt: Date;
}

type ContextType = {
    user: Vacationer | null;
    APIError: boolean | null;
    setAPIError: (APIError: boolean) => void;
    // Values are used to update the user with updateUser(!newUserState)
    newUserState: boolean;
    updateUser: (boolean) => void;
};

function NavigationBar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<Vacationer | null>();
    // state for updating user
    const [newUserState, setNewUserState] = useState(false);
    const [APIError, setAPIError] = useState(false);
    const loginAddress = `${process.env.REACT_APP_ADDRESS}/login`;
    const logoutAddress = `${process.env.REACT_APP_ADDRESS}/logout`;
    const [userName, setUserName] = useState("");
    const [showSpinner, setShowSpinner] = useState(true);
    // const [open, setOpen] = useState(false);
    const [newUserWarning, setNewUserWarning] = useState(false);
    const [deletedUserWarning, setDeletedUserWarning] = useState(false);

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_ADDRESS}/checkStatus`)
            .catch((error) => {
                setAPIError(true);
                console.error("API ERROR:", error);
            })
            .then(() => {
                setShowSpinner(false);
            });
    }, []);

    useEffect(() => {
        // Get username from base64 value of the cookie
        if (Cookies.get("payload")) {
            let userJSON = JSON.parse(Cookies.get("payload").substring(2));
            let userToSearch = JSON.parse(
                Buffer.from(userJSON.payload, "base64").toString()
            ).username;
            setUserName(userToSearch);

            axios
                .get(
                    `${process.env.REACT_APP_ADDRESS}/vacationers/getById/${userToSearch}`,
                    {
                        withCredentials: true,
                    }
                )
                .then((response) => {
                    setAPIError(false);
                    if (response.data) {
                        let fetchedUser = response.data[0];
                        setUser(fetchedUser);
                        let creationTime = new Date(fetchedUser.createdAt);

                        let yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);

                        if (creationTime > yesterday) {
                            setNewUserWarning(true);
                        } else {
                            setNewUserWarning(false);
                        }
                        if (fetchedUser.deletedAt) {
                            setDeletedUserWarning(true);
                        } else {
                            setDeletedUserWarning(false);
                        }
                    }
                })
                .catch((error) => {
                    setAPIError(true);
                    console.error("There was a user get error:", error);
                })
                .then(() => {
                    setShowSpinner(false);
                });
        }
    }, [newUserState]);

    return (
        <div className={styles.wholePage}>
            <AppBar position="sticky">
                <Toolbar>
                    <IconButton onClick={() => setIsOpen(!isOpen)}>
                        <Tooltip
                            title={"Profile settings, create and edit teams"}
                        >
                            <MenuIcon />
                        </Tooltip>
                    </IconButton>
                    <>
                        <Tooltip title={"Profile settings"}>
                            <Typography
                                variant="h6"
                                className={styles.profileTitle}
                            >
                                {APIError || !user ? (
                                    <div>No user</div>
                                ) : (
                                    <Link
                                        to="/profile"
                                        className={styles.linkTitle}
                                    >
                                        <PersonPin
                                            className={styles.userIcon}
                                        />
                                        {user && user.name}
                                        {newUserWarning && (
                                            <FiberNewIcon
                                                className={
                                                    styles.newOrDeletedIcon
                                                }
                                            />
                                        )}
                                        {deletedUserWarning && (
                                            <DeleteForeverIcon
                                                className={
                                                    styles.newOrDeletedIcon
                                                }
                                            />
                                        )}
                                    </Link>
                                )}
                            </Typography>
                        </Tooltip>
                        <Typography variant="h6" className={styles.signInTitle}>
                            {APIError || !user ? (
                                <a
                                    href={loginAddress}
                                    className={styles.linkTitle}
                                >
                                    Login
                                </a>
                            ) : (
                                <a
                                    href={logoutAddress}
                                    className={styles.linkTitle}
                                >
                                    Logout
                                </a>
                            )}
                        </Typography>
                    </>
                    <Typography variant="h5">
                        <Link to="/" className={styles.vacationerTitle}>
                            <BeachAccessIcon />
                            Vacationer
                        </Link>
                    </Typography>
                </Toolbar>
            </AppBar>
            {!APIError && user && (
                <Drawer
                    anchor={"left"}
                    open={isOpen}
                    onClose={() => setIsOpen(!isOpen)}
                >
                    <Box>
                        <List>
                            <Link to="/" className={styles.navigation}>
                                <ListItem
                                    button
                                    onClick={() => setIsOpen(!isOpen)}
                                >
                                    <ListItemIcon>
                                        <BeachAccessIcon />
                                    </ListItemIcon>
                                    <div className={styles.navigationText}>
                                        Calendar
                                    </div>
                                </ListItem>
                            </Link>
                            <Link to="/profile" className={styles.navigation}>
                                <ListItem
                                    button
                                    onClick={() => setIsOpen(!isOpen)}
                                >
                                    <ListItemIcon>
                                        <PersonIcon />
                                    </ListItemIcon>
                                    <div className={styles.navigationText}>
                                        Profile
                                    </div>
                                </ListItem>
                            </Link>
                            <Link to="/teams" className={styles.navigation}>
                                <ListItem
                                    button
                                    onClick={() => setIsOpen(!isOpen)}
                                >
                                    <ListItemIcon>
                                        <GroupsIcon />
                                    </ListItemIcon>
                                    <div className={styles.navigationText}>
                                        Teams
                                    </div>
                                </ListItem>
                            </Link>
                            {user && user.admin && (
                                <Link to="/admin" className={styles.navigation}>
                                    <ListItem
                                        button
                                        onClick={() => setIsOpen(!isOpen)}
                                    >
                                        <ListItemIcon>
                                            <SettingsIcon />
                                        </ListItemIcon>
                                        <div className={styles.navigationText}>
                                            Admin
                                        </div>
                                    </ListItem>
                                </Link>
                            )}
                        </List>
                    </Box>
                </Drawer>
            )}
            <div className={styles.outlet}>
                {showSpinner && <CircularProgress />}
                {deletedUserWarning && !user.admin ? (
                    <CustomAlert
                        text={"Your user has been deleted, contact admin"}
                    />
                ) : (
                    <>
                        {APIError ? (
                            <CustomAlert text={"No connection to API"} />
                        ) : (
                            <>
                                {!showSpinner && userName ? (
                                    <Outlet
                                        context={{
                                            user,
                                            APIError,
                                            setAPIError,
                                            newUserState,
                                            updateUser: setNewUserState,
                                        }}
                                    />
                                ) : (
                                    !showSpinner && <Login />
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
            <footer className={styles.footer}>
                <div className={styles.footerElements}>
                    <div>
                        <a
                            className={styles.bugLink}
                            href={
                                "https://github.com/orgs/tieto-cem/projects/2/views/1"
                            }
                            target={"_blank"}
                        >
                            Report bugs / ideas
                        </a>
                    </div>
                    <div>Version: {process.env.REACT_APP_VERSION}</div>

                    <div className={styles.footerRight}>
                        Built by Tietoevry Cloud Digital Operations
                    </div>
                </div>
            </footer>
        </div>
    );
}

export function useOutletVariables() {
    return useOutletContext<ContextType>();
}

export default NavigationBar;
