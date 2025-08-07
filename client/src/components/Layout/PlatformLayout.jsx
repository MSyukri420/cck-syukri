import logo from "../../assets/logo.png";
import {useState, useEffect, createContext, useContext} from "react";
import {createPortal} from "react-dom";
import "material-icons/iconfont/material-icons.css";
import Dropdown from "../Dropdown.jsx";
import Breadcrumb from "../Breadcrumb.jsx";
import Alert from "../Alert.jsx";
import {Link, Outlet, useLocation, useNavigate} from "react-router-dom";
import {AuthenticationContext} from "../Provider/AuthenticationProvider.jsx";
import { ScreenSizeTracker } from '../ScreenSizeTracker.jsx';
import Notifications from "../Notifications.jsx";
import axios from "axios";

export const PlatformContext = createContext({
    currentTime: new Date(),
    currentPage: "",
    breadcrumbs: [],
    alerts: [],
    loading: false,
    hasUnreadNotifications: false,
    refreshNotifications: () => {},
    setLoading: () => {},
    setPage: () => {},
    setAlert: () => {},
    deleteAlert: () => {},
    setBreadcrumb: () => {},
    language: "English",
    setLanguage: () => {},
    dateFormat: "en-my",
    setDateFormat: () => {}
});


const NavigationLink = ({to, icon, title, active}) => {
    const platformContext = useContext(PlatformContext);

    const getTitle = () => {
        switch (platformContext.language) {
            case 'English':
                return title;
            case 'Bahasa Melayu':
                if (title === 'Dashboard') {
                    return 'Papan Pemuka';
                }
                if (title === 'Employees List') {
                    return 'Senarai Pekerja';
                }
                if (title === 'Departments') {
                    return 'Jabatan';
                }
                if (title === 'Designations') {
                    return 'Jawatan';
                }
                if (title === 'Job Grades') {
                    return 'Gred Jawatan';
                }
                if (title === 'Performance Indicator') {
                    return 'Penunjuk Prestasi';
                }
                if (title === 'Performance Appraisal') {
                    return 'Penilaian Prestasi';
                }
                if (title === 'Performance Survey') {
                    return 'Soal Selidik Prestasi';
                }
                if (title === 'Roles Based Access Control') {
                    return 'Kawalan Akses Berdasarkan Peranan';
                }
                if (title === 'API Key Settings') {
                    return 'Tetapan Kunci API';
                }
                if (title === 'Documentation') {
                    return 'Dokumentasi';
                }                
                return title;
            case '中文':
                if (title === 'Dashboard') {
                    return '仪表板';
                }
                if (title === 'Employees List') {
                    return '员工名单';
                }
                if (title === 'Departments') {
                    return '部门';
                }
                if (title === 'Designations') {
                    return '指定';
                }
                if (title === 'Job Grades') {
                    return '工作等级';
                }
                if (title === 'Performance Indicator') {
                    return '绩效指标';
                }
                if (title === 'Performance Appraisal') {
                    return '绩效评估';
                }
                if (title === 'Performance Survey') {
                    return '绩效调查';
                }
                if (title === 'Roles Based Access Control') {
                    return '基于角色的访问控制';
                }
                if (title === 'API Key Settings') {
                    return 'API密钥设置';
                }
                if (title === 'Documentation') {
                    return '文档';
                }                
                return title;
            default:
                return title;
        }
    }

    return (
        <Link to={to} className="py-2 pl-2 flex flex-row gap-x-4 items-center cursor-pointer text-gray-500 hover:bg-slate-700 hover:bg-opacity-80 hover:rounded-lg aria-checked:text-red-500 aria-checked:text-opacity-80" aria-checked={active}>
            <span className="material-icons">{icon}</span>
            <p className="text-sm font-medium">{getTitle()}</p>
        </Link>
    )
}

// -- Header --
// Receive the `setIsClicked` prop from parent component to store value
export const PlatformHeader = ({ setIsClicked }) => {
    const platformContext = useContext(PlatformContext);
    const authenticationCtx = useContext(AuthenticationContext);
    const { user, isAuthenticated } = authenticationCtx;
    const navigate = useNavigate();
    const platformCtx = useContext(PlatformContext);

    function handleLogout() {
        authenticationCtx.logout().then(() => {
            platformContext.setAlert({type: "success", message: "Logged out successfully"});
            navigate("/login");
        });
    }

    const getFormattedDate = () => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
        let languageCode;
        switch (platformContext.language) {
            case 'English':
                languageCode = 'en-US';
                break;
            case 'Bahasa Melayu':
                languageCode = 'ms-MY';
                break;
            case '中文':
                languageCode = 'zh-CN';
                break;
            default:
                languageCode = 'en-US';
        }
        return platformContext.currentTime.toLocaleString(languageCode, options);
    }

    // Handle Expand SideNavbar Button
    const handleClick = () => {
        setIsClicked(prevState => !prevState);
    };

    const [isExpand, setIsExpand] = useState(false);

    // Handle Expand Header Profile
    const handleExpand = () => {
        setIsExpand(prevState => !prevState);
    };

    const userName = user?.name || "User";

    return (
        <ScreenSizeTracker>
            {screenWidth => (
                <div>
                    {screenWidth >= 1024 ? (
                        // Maximized Screen Header
                        <div className="flex flex-col">
                        <header className="p-3 fixed top-0 left-0 right-0 z-10 flex flex-row justify-between items-center bg-red-500">
                            <div className="flex flex-row items-center gap-4">
                                <img src={logo} alt="logo" className="w-12 h-auto"/>
                                <button onClick={handleClick}>
                                    <span
                                        className="material-icons px-2 py-1 text-white text-xl hover:bg-white hover:bg-opacity-20 rounded-full">sort</span>
                                </button>    
                                <p className="text-white font-medium text-lg">CCK Performance Measure System</p>
                            </div>
                            <div className="flex flex-row gap-4 items-center">
                                <p className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-white text-sm">{getFormattedDate()}</p>
                                <div className="w-36">
                                    <Dropdown header={
                                        <div className="flex flex-row items-center gap-4">
                                            <img
                                                src={`${axios.defaults.baseURL}/avatars/${user.employeeId}`}
                                                alt="avatar" className="rounded-full object-cover w-8 h-8"/>
                                            <p className="text-white text-sm font-medium">{userName}</p>
                                            <button onClick={handleExpand}>
                                                {!isExpand ? (
                                                    <span
                                                        className="material-icons text-white text-lg">expand_more</span>
                                                ) : (
                                                    <span
                                                        className="material-icons text-white text-lg">expand_less</span>
                                                )}
                                            </button>
                                        </div>
                                    }>
                                        <div className="flex flex-col gap-2">
                                            <Link to="/profile"
                                                  className="text-left w-full py-2 px-4 hover:bg-red-200">
                                                {platformCtx.language === 'English' ? 'Profile' :
                                                    platformCtx.language === 'Bahasa Melayu' ? 'Profil' :
                                                        '个人资料'}
                                            </Link>
                                            <Link to="/settings"
                                                  className="text-left w-full py-2 px-4 hover:bg-red-200">
                                                {platformCtx.language === 'English' ? 'Settings' :
                                                    platformCtx.language === 'Bahasa Melayu' ? 'Tetapan' :
                                                        '设置'}
                                            </Link>
                                            <button className="text-left w-full py-2 px-4 hover:bg-red-200"
                                                    onClick={handleLogout}>
                                                {platformCtx.language === 'English' ? 'Logout' :
                                                    platformCtx.language === 'Bahasa Melayu' ? 'Log keluar' :
                                                        '登出'}
                                            </button>
                                        </div>
                                    </Dropdown>
                                </div>
                            </div>
                        </header>
                            {platformContext.loading && <div
                                className="w-full h-16 bg-gradient-to-l from-red-950 to-red-300 animate-pulse"></div>}
                        </div>
                    ) : (
                        // Minimized Screen Header
                        <header className="fixed top-0 left-0 right-0 z-10 flex flex-col bg-red-500">
                            <div className="px-6 py-3 flex flex-row justify-between items-center">
                                <button onClick={handleClick}>
                                    <span
                                        className="material-icons px-2 py-1 text-white text-xl hover:bg-white hover:bg-opacity-20 rounded-full">sort</span>
                                </button>
                                <img src={logo} alt="logo" className="w-12 h-auto"/>
                                <div className="flex flex-row gap-4">
                                    <div>
                                        <Dropdown header={
                                            <div className="flex flex-row gap-4 justify-end">
                                                <img
                                                    src={`${axios.defaults.baseURL}/avatars/${user.employeeId}`}
                                                    alt="avatar" className="rounded-full object-cover w-8 h-8"/>
                                                <button onClick={handleExpand}>
                                                {!isExpand ? (
                                                        <span
                                                            className="material-icons text-white text-lg">expand_more</span>
                                                    ) : (
                                                        <span
                                                            className="material-icons text-white text-lg">expand_less</span>
                                                    )}
                                                </button>
                                            </div>
                                        }>
                                            <div className="flex flex-col gap-2">
                                                <Link to="/profile"
                                                      className="text-left w-full py-2 px-4 hover:bg-red-200">
                                                    {platformCtx.language === 'English' ? 'Profile' :
                                                        platformCtx.language === 'Bahasa Melayu' ? 'Profil' :
                                                            '个人资料'}
                                                </Link>
                                                <Link to="/settings"
                                                      className="text-left w-full py-2 px-4 hover:bg-red-200">
                                                    {platformCtx.language === 'English' ? 'Settings' :
                                                        platformCtx.language === 'Bahasa Melayu' ? 'Tetapan' :
                                                             '设置'}
                                                </Link>
                                                <button className="text-left w-full py-2 px-4 hover:bg-red-200"
                                                        onClick={handleLogout}>
                                                    {platformCtx.language === 'English' ? 'Logout' :
                                                        platformCtx.language === 'Bahasa Melayu' ? 'Log keluar' :
                                                            '登出'}
                                                </button>
                                            </div>
                                        </Dropdown>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 flex justify-end bg-white bg-opacity-20">
                                <p className="px-2 py-1 text-white text-sm">{platformContext.currentTime.toLocaleString(platformContext.dateFormat, {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                    hour: "numeric",
                                    minute: "numeric",
                                    second: "numeric"
                                })}</p>
                            </div>
                        </header>
                    )}
                </div>
            )}
        </ScreenSizeTracker>
    );
}

// -- Side Navigation Bar --
// Receive the `isClicked` prop from parent component to obtain and manage the sidenav based on its value
export const PlatformNavbar = ({isClicked }) => {
    const platformContext = useContext(PlatformContext);
    const { isAuthenticated, hasModule } = useContext(AuthenticationContext);

    return (
        <ScreenSizeTracker>
            {screenWidth => (
                <div>
                    {screenWidth > 1024 ? (
                        !isClicked ? (
                            // Expanded SideBar
                            <nav className="w-64 h-full p-6 fixed top-[60px] left-0 z-10 flex flex-col gap-6 bg-slate-800 text-white"
                                style={{
                                    maxHeight: 'calc(100vh - 60px)',
                                    overflowY: 'auto',
                                    scrollbarWidth: 'none'
                                }}
                            >
                                <div className="flex flex-col gap-4">
                                    {isAuthenticated && hasModule('dashboard') && (
                                        <>
                                            <p className="text-sm font-medium">Main</p>
                                            <NavigationLink to="/dashboard" icon="dashboard" title="Dashboard" active={platformContext.currentPage.toLowerCase() === "dashboard"} />
                                            <NavigationLink to="/notifications" icon={platformContext.hasUnreadNotifications? "notifications_active" : "notifications"} title="Notifications" active={platformContext.currentPage.toLowerCase() === "notifications"} />
                                        </>
                                    )}
                                </div>
                                <div className="flex flex-col gap-4">
                                    {isAuthenticated && hasModule('employees_list', 'department', 'designation', 'jobgrade') && (
                                        <p className="text-sm font-medium">Employees</p>
                                    )}
                                    {isAuthenticated && hasModule('employees_list') && (
                                        <NavigationLink to="/employees-list" icon="groups_2" title="Employees List" active={platformContext.currentPage.toLowerCase() === "employees list"} />
                                    )}
                                    {isAuthenticated && hasModule('department') && (
                                        <NavigationLink to="/departments" icon="domain" title="Departments" active={platformContext.currentPage.toLowerCase() === "departments"} />
                                    )}
                                    {isAuthenticated && hasModule('designation') && (
                                        <NavigationLink to="/designations" icon="badge" title="Designations" active={platformContext.currentPage.toLowerCase() === "designations"} />
                                    )}
                                    {isAuthenticated && hasModule('jobgrade') && (
                                        <NavigationLink to="/job-grades" icon="leaderboard" title="Job Grades" active={platformContext.currentPage.toLowerCase() === "job grades"} />
                                    )}
                                </div>
                                <div className="flex flex-col gap-4">
                                    {isAuthenticated && hasModule('performance_indicator', 'performance_appraisal') && (
                                        <p className="text-sm font-medium">KPIs</p>
                                    )}
                                    {isAuthenticated && hasModule('performance_indicator') && (
                                        <NavigationLink to="/performance-indicator" icon="assignment_add" title="Performance Indicator" active={platformContext.currentPage.toLowerCase() === "performance indicator"} />
                                    )}
                                    {isAuthenticated && hasModule('performance_appraisal') && (
                                        <NavigationLink to="/performance-appraisal" icon="assignment_ind" title="Performance Appraisal" active={platformContext.currentPage.toLowerCase() === "performance appraisal"} />
                                    )}
                                    {isAuthenticated && hasModule('survey') && (
                                        <NavigationLink to="/performance-survey" icon="description" title="Performance Survey" active={platformContext.currentPage.toLowerCase() === "performance survey"} />
                                    )}
                                </div>
                                <div className="flex flex-col gap-4">
                                    {isAuthenticated && hasModule('setting', 'ApiKey') && (
                                        <p className="text-sm font-medium">Settings</p>
                                    )}
                                    {isAuthenticated && hasModule('setting') && (
                                        <NavigationLink to="/roles-permissions" icon="settings" title="Roles Based Access Control" active={platformContext.currentPage.toLowerCase() === "roles based access control"} />
                                    )}
                                    {isAuthenticated && hasModule('ApiKey') && (
                                        <NavigationLink to="/apikey-settings" icon="vpn_key" title="API Key Settings" active={platformContext.currentPage.toLowerCase() === "apikey settings"} />
                                    )}
                                </div>
                            </nav>
                        ) : (
                            // Contracted SideBar
                            <nav className="w-28 h-full px-2 py-6 fixed top-[60px] left-0 z-10 flex flex-col gap-6 bg-slate-800 text-white"
                                style={{
                                    maxHeight: 'calc(100vh - 60px)',
                                    overflowY: 'auto',
                                    scrollbarWidth: 'none'
                                }}
                            >
                                <div className="flex flex-col gap-4">
                                    {isAuthenticated && hasModule('dashboard') && (
                                        <p className="text-sm font-medium">Main</p>
                                    )}
                                    {isAuthenticated && hasModule('dashboard') && (<>
                                        <NavigationLink to="/dashboard" icon="dashboard" className="text-2xl" active={platformContext.currentPage.toLowerCase() === "dashboard"}/>
                                        <NavigationLink to="/notifications" icon="notifications" className="text-2xl" active={platformContext.currentPage.toLowerCase() === "notifications"}/>
                                    </>)}
                                </div>
                                <div className="flex flex-col gap-4">
                                    {isAuthenticated && hasModule('employees_list', 'department', 'designation', 'jobgrade') && (
                                        <p className="text-sm font-medium">Employees</p>
                                    )}
                                    {isAuthenticated && hasModule('employees_list') && (
                                        <NavigationLink to="/employees-list" icon="groups_2" active={platformContext.currentPage.toLowerCase() === "employees list"}/>
                                    )}
                                    {isAuthenticated && hasModule('department') && (
                                        <NavigationLink to="/departments" icon="domain" active={platformContext.currentPage.toLowerCase() === "departments"}/>
                                    )}
                                    {isAuthenticated && hasModule('designation') && (
                                        <NavigationLink to="/designations" icon="badge" active={platformContext.currentPage.toLowerCase() === "designations"}/>
                                    )}
                                    {isAuthenticated && hasModule('jobgrade') && (
                                        <NavigationLink to="/job-grades" icon="leaderboard" active={platformContext.currentPage.toLowerCase() === "job grades"}/>
                                    )}
                                </div>
                                <div className="flex flex-col gap-4">
                                    {isAuthenticated && hasModule('performance_indicator', 'performance_appraisal') && (
                                        <p className="text-sm font-medium">KPIs</p>
                                    )}
                                    {isAuthenticated && hasModule('performance_indicator') && (
                                        <NavigationLink to="/performance-indicator" icon="assignment_add" active={platformContext.currentPage.toLowerCase() === "performance indicator"}/>
                                    )}
                                    {isAuthenticated && hasModule('performance_appraisal') && (
                                        <NavigationLink to="/performance-appraisal" icon="assignment_ind" active={platformContext.currentPage.toLowerCase() === "performance appraisal"}/>
                                    )}
                                    {isAuthenticated && hasModule('survey') && (
                                        <NavigationLink to="/performance-survey" icon="description" active={platformContext.currentPage.toLowerCase() === "performance survey"}/>

                                    )}
                                </div>
                                <div className="flex flex-col gap-4">
                                    {isAuthenticated && hasModule('setting', 'ApiKey') && (
                                        <p className="text-sm font-medium">Settings</p>
                                    )}
                                    {isAuthenticated && hasModule('setting') && (
                                        <NavigationLink to="/roles-permissions" icon="settings" active={platformContext.currentPage.toLowerCase() === "roles based access control"}/>
                                    )}
                                    {isAuthenticated && hasModule('ApiKey') && (
                                        <NavigationLink to="/apikey-settings" icon="vpn_key" active={platformContext.currentPage.toLowerCase() === "apikey settings"}/>
                                    )}
                                </div>
                            </nav>
                        )
                    ) : (
                        // Mobile Sidebar
                        isClicked && (
                            <nav className="w-64 h-full p-6 fixed top-[60px] left-0 z-10 flex flex-col gap-6 bg-slate-800 text-white"
                            style={{
                                maxHeight: 'calc(100vh - 60px)',
                                overflowY: 'auto',
                                scrollbarWidth: 'none'
                            }}
                        >
                            <div className="flex flex-col gap-4">
                                {isAuthenticated && hasModule('dashboard') && (
                                    <p className="text-sm font-medium">Main</p>
                                )}
                                {isAuthenticated && hasModule('dashboard') && (
                                    <>
                                        <NavigationLink to="/dashboard" icon="dashboard" title="Dashboard" active={platformContext.currentPage.toLowerCase() === "dashboard"}/>
                                        <NavigationLink to="/notifications" icon={platformContext.hasUnreadNotifications? "notifications_active" : "notifications"} title="Notifications" active={platformContext.currentPage.toLowerCase() === "notifications"} />
                                    </>
                                )}
                            </div>
                            <div className="flex flex-col gap-4">
                                {isAuthenticated && hasModule('employees_list', 'department', 'designation', 'jobgrade') && (
                                    <p className="text-sm font-medium">Employees</p>
                                )}
                                {isAuthenticated && hasModule('employees_list') && (
                                    <NavigationLink to="/employees-list" icon="groups_2" title="Employees List" active={platformContext.currentPage.toLowerCase() === "employees list"}/>
                                )}
                                {isAuthenticated && hasModule('department') && (
                                    <NavigationLink to="/departments" icon="domain" title="Departments" active={platformContext.currentPage.toLowerCase() === "departments"}/>
                                )}
                                {isAuthenticated && hasModule('designation') && (
                                    <NavigationLink to="/designations" icon="badge" title="Designations" active={platformContext.currentPage.toLowerCase() === "designations"}/>
                                )}
                                {isAuthenticated && hasModule('jobgrade') && (
                                    <NavigationLink to="/job-grades" icon="leaderboard" title="Job Grades" active={platformContext.currentPage.toLowerCase() === "job grades"}/>
                                )}
                            </div>
                            <div className="flex flex-col gap-4">
                                {isAuthenticated && hasModule('performance_indicator', 'performance_appraisal') && (
                                    <p className="text-sm font-medium">KPIs</p>
                                )}
                                {isAuthenticated && hasModule('performance_indicator') && (
                                    <NavigationLink to="/performance-indicator" icon="assignment_add" title="Performance Indicator" active={platformContext.currentPage.toLowerCase() === "performance indicator"}/>
                                )}
                                {isAuthenticated && hasModule('performance_appraisal') && (
                                    <NavigationLink to="/performance-appraisal" icon="assignment_ind" title="Performance Appraisal" active={platformContext.currentPage.toLowerCase() === "performance appraisal"}/>
                                )}
                                {isAuthenticated && hasModule('survey') && (
                                    <NavigationLink to="/performance-survey" icon="description" title="Performance Survey" active={platformContext.currentPage.toLowerCase() === "performance survey"}/>
                                )}
                                {isAuthenticated && hasModule('ApiKey')&& (
                                    <NavigationLink to="/apikey-settings" icon="vpn_key" title="API Key Settings" active={platformContext.currentPage.toLowerCase() === "apikey settings"}/>
                                )}
                            </div>
                            <div className="flex flex-col gap-4">
                                {isAuthenticated && hasModule('setting', 'ApiKey') && (
                                    <p className="text-sm font-medium">Settings</p>
                                )}
                                {isAuthenticated && hasModule('setting') && (
                                    <NavigationLink to="/roles-permissions" icon="settings" title="Roles Based Access Control" active={platformContext.currentPage.toLowerCase() === "roles based access control"}/>
                                )}
                                {isAuthenticated && hasModule('ApiKey') && (
                                    <NavigationLink to="/apikey-settings" icon="vpn_key" title="API Key Settings" active={platformContext.currentPage.toLowerCase() === "apikey settings"}/>
                                )}
                            </div>
                        </nav>
                        )
                    )} 
                </div>
            )}
        </ScreenSizeTracker>
    );
}

export const PlatformAlert = ({message, index}) => {
    const {alerts, deleteAlert} = useContext(PlatformContext);

    return createPortal(
        <div className="fixed z-[99] p-2 bottom-10 md:right-10 sm:right-0 flex flex-col items-end gap-4">
            {alerts.map((alert, index) => {
                return (<Alert
                    key={`alert-${index}`}
                    type={alert.type}
                    index={index}
                    onClose={() => deleteAlert(alert.alertId)}>
                    {alert.message}
                </Alert>)
            })}
        </div>
    , document.body)
}

export const PlatformPageHeader = () => {
    const platformContext = useContext(PlatformContext);

    return (
        <div>
            <h1 className="font-medium text-xl">{platformContext.currentPage}</h1>
            <Breadcrumb path={platformContext.breadcrumbs}/>
        </div>
    )
}

export const PlatformLayout = ({children}) => {
    // Manage button in `PlatformHeader` to check whether it has been clicked or not
    const [isClicked, setIsClicked] = useState(false);

    return (
        <ScreenSizeTracker>
            {(screenWidth) => ( // Make sure to handle `screenWidth` properly
                <PlatformLayoutProvider>
                    <PlatformAlert />
                        <div className="flex flex-col h-screen w-screen relative">
                            {/* Passing `isClicked` state and `setIsClicked` functions as props to `PlatformHeader` */}
                            <PlatformHeader isClicked={isClicked} setIsClicked={setIsClicked} />
                            <div className="flex flex-row h-full relative">
                                {/* Passing `isClicked` state as a prop to `PlatformNavbar` */}
                                <PlatformNavbar isClicked={isClicked} />
                                <div className={`h-full absolute flex flex-col flex-1 p-6 gap-2 ${screenWidth > 1024 && !isClicked && "top-[60px] left-[256px] right-0"} ${screenWidth > 1024 && isClicked && "top-[60px] left-[96px] right-0"} ${screenWidth < 1024 && !isClicked ? "top-[80px] left-[0px] right-0" : "left-[0px] right-0"}`}>
                                    <PlatformPageHeader />
                                    <div className="flex flex-col gap-4 pt-4 mb-12">
                                        <Outlet />
                                        {children}
                                        {/* Dimmed background */}
                                        {screenWidth <= 1024 && isClicked && (
                                            <div className="fixed inset-0 overflow-hidden bg-gray-500 opacity-50 cursor-pointer" onClick={() => setIsClicked(!isClicked)}></div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                </PlatformLayoutProvider>
            )}
        </ScreenSizeTracker>
    )
}

export const PlatformLayoutProvider = ({children}) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [currentPage, setCurrentPage] = useState("");
    const [breadcrumbs, setBreadcrumbs] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(false);
    const authenticationCtx = useContext(AuthenticationContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [dateFormat, setDateFormat] = useState(localStorage.getItem('dateFormat') || "en-my");
    const [language, setLanguage] = useState(localStorage.getItem('language') || "English");
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const timeout = setInterval(() => {
            setAlerts((prevState) => {
                let newState = [...prevState];

                newState.forEach((alert, index) => {
                    // By their alertId, remove the alert after 5 seconds
                    if(Date.now() - alert.alertId > 5000) {
                        newState.splice(index, 1);
                    }
                });

                return newState;
            });
        }, 1000);

        return () => clearInterval(timeout);
    }, []);

    function handlePageChange(page) {
        setCurrentPage(page);
    }

    function handleAlert(message) {
        let uid = Date.now();

        const alert = {
            ...message,
            alertId: uid
        }

        setAlerts((prevState) => {
            return [...prevState, alert];
        });
    }

    function deleteAlert(uid) {
        setAlerts((prevState) => {
            let newState = [...prevState];

            newState = newState.filter((alert) => alert.alertId !== uid);

            return newState;
        });
    }

    function handleBreadcrumb(path) {
        setBreadcrumbs(path);
    }

    function refreshNotifications() {
        axios.get("/notifications")
            .then(response => {
                setHasUnreadNotifications(response.data.notifications.some(notification => !notification.read));
            })
            .catch(error => {
                console.error("Error fetching notifications:", error);
            });
    }


    useEffect(() => {
        authenticationCtx.update().then(() => {
            if(!authenticationCtx.isAuthenticated) {
                // Get url path
                let currentPath = location.pathname;

                navigate(`/login?redirect=${currentPath}`);
            }
        });
    }, [currentPage]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get("/notifications");
                setHasUnreadNotifications(response.data.notifications.some(notification => !notification.read));
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        }

        fetchNotifications().then(() => {
            console.log("Notifications fetched successfully");
        });
    }, []);

    const ctx = {
        currentTime,
        currentPage,
        breadcrumbs,
        alerts,
        loading,
        setPage: handlePageChange,
        setAlert: handleAlert,
        setLoading,
        deleteAlert,
        setBreadcrumb: handleBreadcrumb,
        language,
        setLanguage,
        dateFormat,
        setDateFormat,
        hasUnreadNotifications,
        refreshNotifications
    }

    return (
        <PlatformContext.Provider value={ctx}>
            {children}
        </PlatformContext.Provider>
    )
}