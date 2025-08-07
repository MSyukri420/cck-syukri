import {AuthenticationContext} from "./Provider/AuthenticationProvider.jsx";
import {useContext, useEffect, useState} from "react";
import logo from "../assets/logo.png";
import Button from "./Button.jsx";
import "material-icons/iconfont/material-icons.css";
import {useLocation, useNavigate} from "react-router-dom";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function LoginPage() {
    const authenticationCtx = useContext(AuthenticationContext);
    const navigate = useNavigate();
    const query = useQuery();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState({});

    useEffect(() => {
        if(authenticationCtx.isAuthenticated) {

            if(query.has("redirect") && query.get("redirect") !== "/") {
                navigate(query.get("redirect"));
            } else {
                navigate("/dashboard");
            }
        }
    });

    function handleLogin() {
        authenticationCtx.login(email, password).then((data) => {
            if(data.success) {
                setMessage({type: "success", content: data.message});

                setTimeout(() => {
                    navigate("/dashboard");
                }, 2000);
            } else {
                setMessage({type: "error", content: data.message})
            }
        });
    }

    function handleForgotPassword() {
        navigate("/forgot-password", { state: { email } });
    }

    return (
        <div className="w-screen h-screen flex flex-col justify-center items-center">
            <div className="flex flex-col justify-center items-center border border-gray-300 rounded-lg gap-6 px-12 py-6 bg-white">
                <img src={logo} alt="logo" className="w-28 h-auto"/>
                <h1 className="text-2xl font-bold text-slate-700">Login</h1>
                <p className="text-lg text-slate-500">Login to access your dashboard</p>
                {message && <div className={`${message.type === "success" ? "text-green-500" : "text-red-500"}`}>{message.content}</div>}
                <div className="flex flex-col gap-2">
                    <p>Email</p>
                    <input type="email" placeholder="Email" className="p-2 border border-gray-300 rounded w-72" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                    <p>Password</p>
                    <input type="password" placeholder="Password" className="p-2 border border-gray-300 rounded w-72" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    <button className="text-right text-gray-500 text-opacity-80 text-xs font-medium" onClick={handleForgotPassword}>Forgot Password?</button>
                </div>
                <div>
                    <Button colorType={ authenticationCtx.loading? "secondary" : "primary"} onClick={handleLogin} disabled={authenticationCtx.loading}>
                        <div className="px-4 flex flex-row items-center justify-center gap-2">
                            <p className="font-medium">Login</p>
                            {authenticationCtx.loading && <span className="material-icons animate-spin text-xs">refresh</span>}
                        </div>
                    </Button>
                </div>
            </div>
        </div>
    );
}

function Login() {
    return (
        <LoginPage/>
    );
}

export default Login;