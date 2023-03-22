import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import NavigationBar from "./NavigationBar";
import reportWebVitals from "./reportWebVitals";
import Admin from "./pages/Admin/Admin";
import Combo from "./pages/Combo/Combo";
import UserForm from "./pages/UserForm/UserForm";
import TeamForm from "./pages/TeamForm/TeamForm";
import LoginFailed from "./pages/Login/LoginFailed";

ReactDOM.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<NavigationBar />}>
                <Route index element={<Combo />} />
                <Route path="profile" element={<UserForm />} />
                <Route path="teams" element={<TeamForm />} />
                <Route path="admin" element={<Admin />} />
                <Route path="loginFailed" element={<LoginFailed />} />
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
