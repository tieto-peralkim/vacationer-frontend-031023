import { Link, Outlet } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import "./App.css";

function App() {
  return (
    <>
      <AppBar color="transparent" position="static">

        <Toolbar>
          <Typography variant="h5">Vacationer</Typography>
          <Link to="/" className="navigation">
            Home
          </Link>
          <Link to="/picker" className="navigation">
            Picker
          </Link>
          <Link to="/heat" className="navigation">
            Holiday heat
          </Link>
          <Link to="/admin" className="navigation">
            Admin
          </Link>
        </Toolbar>
      </AppBar>

      <Outlet />
    </>
  );
}

export default App;
