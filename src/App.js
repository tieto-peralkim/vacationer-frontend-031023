import { Link, Outlet } from "react-router-dom";
import Toolbar from "@mui/material/Toolbar";
import styles from "./App.module.css";
import {
    AppBar,
    Box,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import MenuIcon from "@mui/icons-material/Menu";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import SettingsIcon from "@mui/icons-material/Settings";
import DangerousIcon from "@mui/icons-material/Dangerous";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";

function App() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState({});
    const [update, setUpdate] = useState(false);
    const [deletedWarning, setDeletedWarning] = useState(false);
    const [newUserWarning, setNewUserWarning] = useState(false);

    const logoutAddress = `${process.env.REACT_APP_ADDRESS}/logout`;

    useEffect(() => {
        // Get username from base64 value of the cookie
        if (Cookies.get("payload")) {
            let userJSON = JSON.parse(Cookies.get("payload").substring(2));
            let userName = JSON.parse(atob(userJSON.payload)).username;
            console.log("userName", userName);

            axios
                .get(
                    `${process.env.REACT_APP_ADDRESS}/vacationers/getById/${userName}`,
                    {
                        withCredentials: true,
                    }
                )
                .then((response) => {
                    if (response.data) {
                        console.log("response.data", response.data);
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
                    console.error("There was a user get error:", error);
                });
        }
    }, [update]);

    return (
        <div>
            <AppBar position="sticky">
                <Toolbar>
                    <IconButton onClick={() => setIsOpen(!isOpen)}>
                        <MenuIcon />
                    </IconButton>
                    <Typography className={styles.leftPart} variant="h6">
                        {deletedWarning && (
                            <>
                                <DangerousIcon />
                            </>
                        )}
                        {!user.name ? (
                            <div>No user</div>
                        ) : (
                            <Link to="/settings" className={styles.loginTitle}>
                                {user.name}
                            </Link>
                        )}
                        {newUserWarning && <FiberNewIcon />}
                    </Typography>
                    <Typography className={styles.rightPart} variant="h6">
                        {!user.name ? (
                            <a
                                href={`${process.env.REACT_APP_ADDRESS}/auth`}
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
                    <Typography className={styles.headline} variant="h6">
                        <Link to="/" className={styles.title}>
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
                                    Picker
                                </div>
                            </ListItem>
                        </Link>
                        <Link to="/settings">
                            <ListItem
                                className={styles.navigation}
                                button
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                <ListItemIcon>
                                    <PersonIcon />
                                </ListItemIcon>
                                <div className={styles.navigationText}>
                                    Settings
                                </div>
                            </ListItem>
                        </Link>
                        <Link to="/team">
                            <ListItem
                                className={styles.navigation}
                                button
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                <ListItemIcon>
                                    <WorkspacesIcon />
                                </ListItemIcon>
                                <div className={styles.navigationText}>
                                    Team
                                </div>
                            </ListItem>
                        </Link>
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
                    </List>
                </Box>
            </Drawer>
            <div className={styles.outlet}>
                <Outlet context={[user, setUser, update, setUpdate]} />
            </div>
        </div>
    );
}

export default App;
