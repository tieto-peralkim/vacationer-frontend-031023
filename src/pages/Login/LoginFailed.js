import styles from "./login.module.css";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function LoginFailed() {
    const navigate = useNavigate();

    const goToLogin = () => {
        navigate("/");
    };

    return (
        <>
            <div>
                <div className={styles.content}>
                    <h2>Login Failed</h2>
                    <Button
                        color={"primary"}
                        variant={"contained"}
                        onClick={goToLogin}
                    >
                        Back to login
                    </Button>
                </div>
            </div>
        </>
    );
}
