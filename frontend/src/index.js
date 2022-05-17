import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import "./index.css";
import App from "./App";
import Picker from "./Pages/Picker/Picker";
import Panorama from "./Pages/Panorama/Panorama"
import Heat from "./Pages/Heat/Heat";
import reportWebVitals from "./reportWebVitals";
import Admin from "./Pages/Admin/Admin";

ReactDOM.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<App/>}>
                <Route path="picker" element={<Picker/>}/>
                <Route path="panorama" element={<Panorama/>}/>
                {/*<Route path="heat" element={<Heat/>}/>*/}
                <Route path="admin" element={<Admin />}/>
                <Route
                    path="*"
                    element={
                        <main>
                            <p>Check the address!</p>
                        </main>
                    }
                />
            </Route>
        </Routes>
    </BrowserRouter>,
    document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
