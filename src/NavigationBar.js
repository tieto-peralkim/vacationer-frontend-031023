import { Link, Outlet, useLocation } from "react-router-dom";
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
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import SettingsIcon from "@mui/icons-material/Settings";
import GroupsIcon from "@mui/icons-material/Groups";
import DangerousIcon from "@mui/icons-material/Dangerous";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { PersonPin } from "@mui/icons-material";
import Login from "./pages/Login/Login";
import CustomAlert from "./components/CustomAlert";

function NavigationBar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState({});
    const [updateUser, setUpdateUser] = useState(false);
    const [deletedWarning, setDeletedWarning] = useState(false);
    const [newUserWarning, setNewUserWarning] = useState(false);
    const [APIError, setAPIError] = useState(false);
    const loginAddress = `${process.env.REACT_APP_ADDRESS}/login`;
    const logoutAddress = `${process.env.REACT_APP_ADDRESS}/logout`;
    const [userName, setUserName] = useState("");
    const [showSpinner, setShowSpinner] = useState(true);

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_ADDRESS}/checkStatus`)
            .then(() => {
                console.log("API OK");
            })
            .catch((error) => {
                setAPIError(true);
                console.error("API ERROR:", error);
            })
            .finally(() => {
                setShowSpinner(false);
            });
    }, []);

    useEffect(() => {
        // Get username from base64 value of the cookie
        if (Cookies.get("payload")) {
            let userJSON = JSON.parse(Cookies.get("payload").substring(2));
            let userToSearch = JSON.parse(atob(userJSON.payload)).username;
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
                        if (response.status === 201) {
                            console.log("luotu!");
                            setNewUserWarning(true);
                        }
                        if (response.data[0].deletedAt) {
                            setDeletedWarning(true);
                        } else {
                            setDeletedWarning(false);
                        }
                        setUser(response.data[0]);
                    } else {
                        console.log("No user received");
                    }
                })
                .catch((error) => {
                    setAPIError(true);
                    console.error("There was a user get error:", error);
                })
                .finally(() => {
                    setShowSpinner(false);
                });
        } else {
            console.log("No cookies!");
        }
    }, [updateUser]);

    return (
        <div>
            <AppBar position="sticky">
                <Toolbar>
                    <>
                        <IconButton onClick={() => setIsOpen(!isOpen)}>
                            <MenuIcon />
                        </IconButton>

                        <Typography className={styles.leftPart} variant="h7">
                            {deletedWarning && (
                                <>
                                    <DangerousIcon />
                                </>
                            )}
                            {!userName ? (
                                <div>No user</div>
                            ) : (
                                <Link
                                    to="/profile"
                                    className={styles.loginTitle}
                                >
                                    <PersonPin className={styles.userIcon} />
                                    {user.name}
                                </Link>
                            )}
                            {newUserWarning && <FiberNewIcon />}
                        </Typography>
                        <Typography className={styles.rightPart} variant="h7">
                            {!userName ? (
                                <a
                                    href={loginAddress}
                                    className={styles.loginTitle}
                                >
                                    Login
                                </a>
                            ) : (
                                <a
                                    href={logoutAddress}
                                    className={styles.loginTitle}
                                >
                                    Logout
                                </a>
                            )}
                        </Typography>
                    </>
                    <Typography className={styles.headline} variant="h5">
                        <Link to="/" className={styles.title}>
                            <BeachAccessIcon />
                            Vacationer
                        </Link>
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                anchor={"left"}
                open={isOpen}
                onClose={() => setIsOpen(!isOpen)}
            >
                <Box>
                    <List>
                        <Link to="/">
                            <ListItem
                                className={styles.navigation}
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
                        <Link to="/profile">
                            <ListItem
                                className={styles.navigation}
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
                        <Link to="/teams">
                            <ListItem
                                className={styles.navigation}
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
                        {user.admin && (
                            <Link to="/admin">
                                <ListItem
                                    className={styles.navigation}
                                    button
                                    onClick={() => setIsOpen(!isOpen)}
                                >
                                    <ListItemIcon>
                                        <SettingsIcon />
                                    </ListItemIcon>
                                    <div className={styles.navigationText}>
                                        Admin settings
                                    </div>
                                </ListItem>
                            </Link>
                        )}
                    </List>
                </Box>
            </Drawer>
            <div className={styles.outlet}>
                {showSpinner && <CircularProgress />}
                {APIError ? (
                    <CustomAlert text={"No connection to API"} />
                ) : (
                    <>
                        {!showSpinner && userName ? (
                            <Outlet
                                context={[
                                    user,
                                    setUser,
                                    updateUser,
                                    setUpdateUser,
                                    APIError,
                                    setAPIError,
                                ]}
                            />
                        ) : (
                            !showSpinner && <Login />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default NavigationBar;
