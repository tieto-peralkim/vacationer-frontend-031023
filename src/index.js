import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import Admin from "./Pages/Admin/Admin";
import Combo from "./Pages/Combo/Combo";
import UserForm from "./Pages/UserForm/UserForm";
import TeamForm from "./Pages/TeamForm/TeamForm";

ReactDOM.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<App />}>
                <Route index element={<Combo />} />
                <Route path="user" element={<UserForm />} />
                <Route path="team" element={<TeamForm />} />
                <Route path="admin" element={<Admin />} />
                <Route path="*" element={<Combo />} />
            </Route>
        </Routes>
    </BrowserRouter>,
    document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
