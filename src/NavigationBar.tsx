import { Link, Outlet, useOutletContext } from "react-router-dom";
import Toolbar from "@mui/material/Toolbar";
import styles from "./NavigationBar.module.css";
import {
    AppBar,
    Box,
    CircularProgress,
    Dialog,
    DialogTitle,
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
import FiberNewIcon from "@mui/icons-material/FiberNew";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { PersonPin } from "@mui/icons-material";
import Login from "./pages/Login/Login";
import CustomAlert from "./components/CustomAlert";
import HelpIcon from "@mui/icons-material/Help";
import help from "./images/help.png";

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
    const [newUserWarning, setNewUserWarning] = useState(false);
    const [APIError, setAPIError] = useState(false);
    const loginAddress = `${process.env.REACT_APP_ADDRESS}/login`;
    const logoutAddress = `${process.env.REACT_APP_ADDRESS}/logout`;
    const [userName, setUserName] = useState("");
    const [showSpinner, setShowSpinner] = useState(true);
    const [open, setOpen] = useState(false);

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
            .then(() => {
                setShowSpinner(false);
            });
    }, []);

    useEffect(() => {
        console.log("Updating user!");
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
                        setUser(response.data[0]);
                    } else {
                        console.log("No user received");
                    }
                })
                .catch((error) => {
                    setAPIError(true);
                    console.error("There was a user get error:", error);
                })
                .then(() => {
                    setShowSpinner(false);
                });
        } else {
            console.log("No cookies!");
        }
    }, [newUserState]);

    const handleOpenHelp = () => {
        setOpen(true);
    };

    const handleCloseHelp = () => {
        setOpen(false);
    };

    return (
        <div>
            <AppBar position="sticky">
                <Toolbar>
                    <>
                        <IconButton onClick={() => setIsOpen(!isOpen)}>
                            <MenuIcon />
                        </IconButton>

                        <Typography className={styles.leftPart} variant="h6">
                            {APIError || !user ? (
                                <div>No user</div>
                            ) : (
                                <Link
                                    to="/profile"
                                    className={styles.loginTitle}
                                >
                                    <PersonPin className={styles.userIcon} />
                                    {user && user.name}
                                </Link>
                            )}
                            {newUserWarning && <FiberNewIcon />}
                        </Typography>
                        <Typography className={styles.rightPart} variant="h6">
                            {APIError || !user ? (
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
                    {window.location.pathname === "/" && user && (
                        <div
                            className={styles.helpIcon}
                            onClick={() => {
                                handleOpenHelp();
                            }}
                        >
                            <HelpIcon />
                            Help
                        </div>
                    )}
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
                            {user && user.admin && (
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
            )}
            <div className={styles.outlet}>
                {showSpinner && <CircularProgress />}
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
            </div>
            <Dialog
                open={open}
                fullWidth={true}
                maxWidth="lg"
                onClose={handleCloseHelp}
            >
                <img src={help} />
            </Dialog>
        </div>
    );
}

export function useOutletVariables() {
    return useOutletContext<ContextType>();
}

export default NavigationBar;
