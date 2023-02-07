import { useNavigate } from "react-router-dom";

export default function LoginFailed() {
    return (
        <>
            <div>
                Login failed, try with other{" "}
                <a href={"https://github.com/"} target={"_blank"}>
                    Github user
                </a>
            </div>
        </>
    );
}
