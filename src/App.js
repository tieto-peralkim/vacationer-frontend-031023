import {Link, Outlet} from "react-router-dom";
import Toolbar from "@mui/material/Toolbar";
import styles from "./App.module.css";
import {AppBar, Box, Drawer, IconButton, List, ListItem, ListItemIcon} from "@mui/material";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MenuIcon from '@mui/icons-material/Menu';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import SettingsIcon from '@mui/icons-material/Settings';
import Typography from "@mui/material/Typography";
import {useState} from "react";
import Brightness7Icon from '@mui/icons-material/Brightness7';

function App() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <AppBar>
                <Toolbar>
                    <IconButton
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <MenuIcon/>
                    </IconButton>
                    <Typography className={styles.headline} variant="h6">
                        Holidaypicker
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
                        <Link to="/picker">
                            <ListItem className={styles.navigation} button onClick={() => setIsOpen(!isOpen)}>
                                <ListItemIcon>
                                    <BeachAccessIcon/>
                                </ListItemIcon>
                                <div className={styles.navigationText}>Pick a holiday</div>
                            </ListItem>
                        </Link>
                        <Link to="/calendar">
                            <ListItem className={styles.navigation} button onClick={() => setIsOpen(!isOpen)}>
                                <ListItemIcon>
                                    <CalendarTodayIcon/>
                                </ListItemIcon>
                                <div className={styles.navigationText}>Calendar</div>
                            </ListItem>
                        </Link>
                        <Link to="/admin">
                            <ListItem className={styles.navigation} button onClick={() => setIsOpen(!isOpen)}>
                                <ListItemIcon>
                                    <SettingsIcon/>
                                </ListItemIcon>
                                <div className={styles.navigationText}>Admin</div>
                            </ListItem>
                        </Link>
                        <Link to="/combo">
                            <ListItem className={styles.navigation} button onClick={() => setIsOpen(!isOpen)}>
                                <ListItemIcon>
                                    <Brightness7Icon/>
                                </ListItemIcon>
                                <div className={styles.navigationText}>Combo</div>
                            </ListItem>
                        </Link>
                    </List>
                </Box>
            </Drawer>
            <div className={styles.outlet}>
                <Outlet/>
            </div>
        </>
    );
}

export default App;
