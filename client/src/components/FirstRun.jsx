import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.png";
import Button from "./Button.jsx";

function FirstRun() {
    const [loading, setLoading] = useState(false);
    const [serverMessage, setServerMessage] = useState({});
    const [bootstrapData, setBootstrapData] = useState({
        username: "",
        name: "",
        email: "",
        password: "",
        repeatPassword: "",
        phone: "",
    });

    const navigate = useNavigate();

    useEffect(() => {
        const checkFirstRun = async () => {
            try {
                const response = await axios.get("/bootstrap");
                if (response.data.firstRun) {
                    return;
                }

                navigate("/login");
            } catch (e) {
                console.error(e);
            }
        }

        checkFirstRun().then(() => {
            console.log("First run check complete");
        });
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post("/bootstrap-create", bootstrapData);
            const data = response.data;
            setServerMessage(data);

            if(data.success) {
                navigate("/login");
            }
        } catch (e) {
            setServerMessage(e.response.data);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center w-screen h-screen bg-gray-100">
            <div className="flex flex-col gap-8 p-6 bg-white items-center shadow-md border rounded-lg w-fit md:w-1/2 lg:w-1/3">
                <div className="flex flex-row justify-center items-center">
                    <img src={logo} alt="logo" className="w-24 h-auto"/>
                </div>
                <div className="flex flex-col gap-4 items-center">
                    <h1 className="text-2xl font-bold text-center">Welcome to CCK Performance Measure System</h1>
                    <p>Please provide the following details to setup the platform. This account will be granted as Super Admin.</p>
                </div>
                <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        className="p-2 border border-neutral-300 rounded"
                        onChange={(e) => setBootstrapData({...bootstrapData, username: e.target.value})}
                    />
                    <input
                        type="text"
                        placeholder="Name"
                        className="p-2 border border-neutral-300 rounded"
                        onChange={(e) => setBootstrapData({...bootstrapData, name: e.target.value})}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        className="p-2 border border-neutral-300 rounded"
                        onChange={(e) => setBootstrapData({...bootstrapData, email: e.target.value})}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="p-2 border border-neutral-300 rounded"
                        onChange={(e) => setBootstrapData({...bootstrapData, password: e.target.value})}
                    />
                    <input
                        type="password"
                        placeholder="Repeat Password"
                        className="p-2 border border-neutral-300 rounded"
                        onChange={(e) => setBootstrapData({...bootstrapData, repeatPassword: e.target.value})}
                    />
                    <input
                        type="tel"
                        placeholder="Phone"
                        className="p-2 border border-neutral-300 rounded"
                        onChange={(e) => setBootstrapData({...bootstrapData, phone: e.target.value})}
                    />
                    <Button type={"submit"} disabled={loading}>
                        <div className="flex flex-row gap-2 justify-center">
                            {loading && <span className="material-icons animate-spin">sync</span>}
                            <p>Submit</p>
                        </div>
                    </Button>
                    <p className={`${serverMessage["success"]? "text-green-500" : "text-red-500"}`}>{serverMessage.message}</p>
                </form>
            </div>
        </div>
    );

}

export default FirstRun;