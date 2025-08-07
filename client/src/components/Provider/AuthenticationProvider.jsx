import {useEffect, useState, createContext} from "react";
import axios from "axios";

export const AuthenticationContext = createContext({
    user: {},
    loading: false,
    isAuthenticated: false,
    permissions: [],
    hasModule: () => false,
    hasPermission: () => false,
    update: () => {},
    login: () => {},
    logout: () => {},
});

const AuthenticationProvider = ({children}) => {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [modules, setModules] = useState([]);
    const [permissions, setPermissions] = useState([]);

    const getUser = async () => {
        try {
            const response = await axios.get("/profiles",);

            const data = response.data;

            setUser(data["userData"]);
            setIsAuthenticated(true);
            setLoading(false);
            const moduleSet = new Set(data.userData.role.permissions.map(permission => permission.module));
            setModules(Array.from(moduleSet));
            const permissionSet = new Set(data.userData.role.permissions.map(permission => permission.name));
            setPermissions(Array.from(permissionSet));

        } catch (e) {
            setUser({});
            setIsAuthenticated(false);
            setLoading(false);
            setModules([]);
            setPermissions([]);
        }
    }

    const update = async () => {
        setLoading(true);
    }

    useEffect(() => {
        getUser().then(() => {
            console.log("Got user data");
        });
    }, [loading]);

    useEffect(() => {
        const checkFirstRun = async () => {
            try {
                const response = await axios.get("/bootstrap");
                if (response.data.firstRun && window.location.pathname !== "/first-run") {
                    window.location.href = "/first-run";
                }
            } catch (e) {
                console.error(e);
            }
        }

        checkFirstRun().then(() => {
            console.log("First run check complete");
        });
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post("/login", {
                email,
                password
            });

            const data = response.data;

            if(data.success) {
                setLoading(true);
            }

            return data;
        } catch (e) {
            console.error(e);
        }
    }

    const logout = async () => {
        try {
            const response = await axios.get(
                "/logout"
            );

            const data = response.data;

            setIsAuthenticated(() => false);
            setUser(() => {});
            setModules([]);

            return data;
        } catch (e) {
            console.error(e);
        }
    }

    const hasModule = (requiredModules) => {
        if (!modules.length) return false;
        if (typeof requiredModules === 'string') {
            return modules.includes(requiredModules);
        }
        return requiredModules.some(module => modules.includes(module));
    };

    const hasPermission = (...requiredPermissions) => {
        if (!permissions.length) return false;
        return requiredPermissions.some(permission => permissions.includes(permission));
    };
    

    const ctx = {
        user,
        loading,
        isAuthenticated,
        permissions,
        update,
        login,
        logout,
        hasModule,
        hasPermission,
    }

    return (
        <AuthenticationContext.Provider value={ctx}>
            {children}
        </AuthenticationContext.Provider>
    );
}

export default AuthenticationProvider;