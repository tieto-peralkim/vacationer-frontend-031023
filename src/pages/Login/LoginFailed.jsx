import { Navigate } from "react-router-dom";

export default function LoginFailed() {
    const loginFailed = { loginFailed: true };
    return (
        <>
            <Navigate to={"/"} state={loginFailed} />
        </>
    );
}
