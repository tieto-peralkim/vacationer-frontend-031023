import { Navigate } from "react-router-dom";
import React from "react";

export default function LoginFailed() {
    const loginFailed = { loginFailed: true };
    return (
        <>
            <Navigate to={"/"} state={loginFailed} />
        </>
    );
}
