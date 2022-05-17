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
                        Vacationer
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
                                <div className={styles.navigationText}>Picker</div>
                            </ListItem>
                        </Link>
                        <Link to="/panorama">
                            <ListItem className={styles.navigation} button onClick={() => setIsOpen(!isOpen)}>
                                <ListItemIcon>
                                    <CalendarTodayIcon/>
                                </ListItemIcon>
                                <div className={styles.navigationText}>Panorama</div>
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
                        {/*<Link to="/heat">*/}
                        {/*    <ListItem className={styles.navigation} button onClick={() => setIsOpen(!isOpen)}>*/}
                        {/*        <ListItemIcon>*/}
                        {/*            <BeachAccessIcon/>*/}
                        {/*        </ListItemIcon>*/}
                        {/*        <div className={styles.navigationText}>Heat</div>*/}
                        {/*    </ListItem>*/}
                        {/*</Link>*/}
                    </List>
                </Box>
            </Drawer>
            <div className={styles.outlet}>
                <Outlet/>
            </div>

            {/*<AppBar color="transparent" position="static">*/}

            {/*    <Toolbar>*/}
            {/*        <Typography variant="h5" className="appName">Vacation App</Typography>*/}
            {/*        <Link to="/picker" className="navigation">*/}
            {/*            Picker*/}
            {/*        </Link>*/}
            {/*        <Link to="/panorama" className="navigation">*/}
            {/*            Panorama*/}
            {/*        </Link>*/}
            {/*        /!*<Link to="/heat" className="navigation">*!/*/}
            {/*        /!*  Holiday heat*!/*/}
            {/*        /!*</Link>*!/*/}
            {/*        <Link to="/admin" className="navigation">*/}
            {/*            Admin*/}
            {/*        </Link>*/}
            {/*    </Toolbar>*/}
            {/*</AppBar>*/}

            {/*<Outlet/>*/}
        </>
    );
}

export default App;
