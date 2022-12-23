import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import App from "./App";
import Picker from "./Pages/Picker/Picker";
import Calendar from "./Pages/Calendar/Calendar";
import reportWebVitals from "./reportWebVitals";
import Admin from "./Pages/Admin/Admin";
import Combo from "./Pages/Combo/Combo";

ReactDOM.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<App />}>
                {/* Combo solution */}
                {/*<Route path="picker" element={<Picker />} />*/}
                {/*<Route path="calendar" element={<Calendar />} />*/}
                <Route path="admin" element={<Admin />} />
                <Route path="combo" element={<Combo />} />
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
