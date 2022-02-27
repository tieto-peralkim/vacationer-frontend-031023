import { Link, Outlet } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import "./App.css";
import { CssBaseline } from "@mui/material";

function App() {
  return (
    <>
      <AppBar color="transparent" position="static">
        <CssBaseline />

        <Toolbar>
          <Typography variant="h5">Vacationer</Typography>
          <Link to="/" className="navigation">
            Home
          </Link>
          <Link to="/picker" className="navigation">
            Pick dates
          </Link>
          <Link to="/heat" className="navigation">
            Holiday heat
          </Link>
        </Toolbar>
      </AppBar>

      <Outlet />
    </>
  );
}

export default App;
