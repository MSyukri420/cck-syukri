import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PlatformContext } from "../Layout/PlatformLayout.jsx";
import Button from "../Button.jsx";
import Table from "../Table.jsx";
import axios from "axios";
import Modal from "../Modal.jsx";
import EditEmployee from "./EditEmployee.jsx";
import ChangePassword from "./ChangePassword.jsx";
import ViewSurveyResponse from "../ViewSurveyResponse.jsx";
import { AuthenticationContext } from "../Provider/AuthenticationProvider.jsx";
import SetEmployeeComment from "../SetEmployeeComment.jsx";
import setEmployeeComment from "../SetEmployeeComment.jsx";
import modal from "../Modal.jsx";

const Profile = () => {
    const languageMap = {
        English: {
            appraisals: 'Appraisals',
            editProfile: 'Edit Profile',
            changePassword: 'Change Password',
            personalInformation: 'Personal Information',
            employeeInformation: 'Employee Information',
            employeeId: 'Employee ID',
            department: 'Department',
            designation: 'Designation',
            jobGrade: 'Job Grade',
            reportsTo: 'Reports to',
            accountCreated: 'Account Created',
            email: 'Email',
            phone: 'Phone',
            gender: 'Gender',
            username: 'Username',
            role: 'Role',
            home: 'Home',
            profile: 'Profile',
            male: 'Male',
            female: 'Female',
            other: 'Other',
            notAvailable: 'Not available',
            employeeName: 'Employee Name',
            knowHowProblemSolvingAccountability: 'Know How / Problem Solving / Accountability',
            totalScore: 'Total Score',
            appraisalDate: 'Appraisal Date',
            action: 'Action',
        },
        'Bahasa Melayu': {
            appraisals: 'Penilaian',
            editProfile: 'Edit Profil',
            changePassword: 'Tukar Kata Laluan',
            personalInformation: 'Maklumat Peribadi',
            employeeInformation: 'Maklumat Pekerja',
            employeeId: 'ID Pekerja',
            department: 'Jabatan',
            designation: 'Jawatan',
            jobGrade: 'Gred Jawatan',
            reportsTo: 'Melapor Kepada',
            accountCreated: 'Akaun Dicipta',
            email: 'Emel',
            phone: 'Telefon',
            gender: 'Jantina',
            username: 'Nama Pengguna',
            role: 'Peranan',
            home: 'Laman Utama',
            profile: 'Profil',
            male: 'Lelaki',
            female: 'Perempuan',
            other: 'Lain-lain',
            notAvailable: 'Tidak tersedia',
            employeeName: 'Nama Pekerja',
            knowHowProblemSolvingAccountability: 'Pengetahuan / Penyelesaian Masalah / Tanggungjawab',
            totalScore: 'Jumlah Skor',
            appraisalDate: 'Tarikh Penilaian',
            action: 'Tindakan',
        },
        '中文': {
            appraisals: '评估',
            editProfile: '编辑个人资料',
            changePassword: '更改密码',
            personalInformation: '个人信息',
            employeeInformation: '员工信息',
            employeeId: '员工编号',
            department: '部门',
            designation: '职位',
            jobGrade: '职级',
            reportsTo: '汇报给',
            accountCreated: '账户创建',
            email: '电子邮件',
            phone: '电话',
            gender: '性别',
            username: '用户名',
            role: '角色',
            home: '主页',
            profile: '个人资料',
            male: '男性',
            female: '女性',
            other: '其他',
            notAvailable: '不可用',
            employeeName: '员工姓名',
            knowHowProblemSolvingAccountability: '知识 / 问题解决 / 责任',
            totalScore: '总分',
            appraisalDate: '评估日期',
            action: '操作',
        }
    };

    const platformCtx = useContext(PlatformContext);
    const authCtx = useContext(AuthenticationContext);
    const { id } = useParams();

    const [appraisals, setAppraisals] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [key, setKey] = useState(0); // Key state for forcing re-render
    const editModalRef = useRef(null);
    const changePasswordModalRef = useRef(null);
    const taskModalRef = useRef(null);
    const commentModalRef = useRef(null);
    const [taskModalContent, setTaskModalContent] = useState(null);
    const [commentModalContent, setCommentModalContent] = useState(null);

    useEffect(() => {
        platformCtx.setPage(languageMap[platformCtx.language].profile);
        platformCtx.setBreadcrumb([
            { name: languageMap[platformCtx.language].home, path: "/" },
            { name: languageMap[platformCtx.language].profile, path: "/profile" }
        ]);
        fetchUserData().then(() => setIsLoading(false));
    }, [id, platformCtx.language]);

    const [activeTab, setActiveTab] = useState("appraisals");

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    const fetchUserData = async () => {
        setIsLoading(true);
        try {
            const endpoint = id ? `/profile/${id}` : '/profile';
            const response = await axios.get(endpoint, { withCredentials: true });
            const userData = response.data.userData;
            setUserData(userData);

            if (userData.employeeId) {
                await fetchAppraisals(userData.employeeId);
                await fetchCampaigns(userData._id);
            } else {
                setAppraisals([]);
            }
        } catch (error) {
            console.error('Failed to fetch profile data:', error);
            platformCtx.setAlert({ type: "danger", message: "Failed to load user data" });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCampaigns = async (employeeId) => {
        try {
            const endpoint = `/own-survey/${employeeId}`;
            const response = await axios.get(endpoint);
            setCampaigns(response.data.surveys);
        } catch (error) {
            console.error('Failed to fetch campaigns:', error);
            platformCtx.setAlert({ type: "danger", message: "Failed to load campaigns" });
        }
    }

    const fetchAppraisals = async (employeeId) => {
        try {
            const response = await axios.get(`/get-appraisals-list/${employeeId}`);
            setAppraisals(response.data.appraisals);
            setKey(prevKey => prevKey + 1); 
        } catch (error) {
            console.error('Failed to fetch appraisals:', error);
        }
    };

    const handleEditProfile = () => {
        editModalRef.current.openModal();
    };

    const handleChangePassword = () => {
        changePasswordModalRef.current.openModal();
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    const handleEmployeeComment = (appraisalId) => {
        setCommentModalContent(<SetEmployeeComment appraisalId={appraisalId} onSubmit={handleCommentSubmit}/>);
        commentModalRef.current.openModal();
    }

    function handleCommentSubmit(res) {
        commentModalRef.current.closeModal();

        if(res) {
            platformCtx.setAlert({type: res.success? "success" : "danger", message: res.message});
        }
    }

    return (
        <div>
            <Modal ref={commentModalRef} title={"Employee Comment"}>
                {commentModalContent}
            </Modal>
            <Modal ref={editModalRef} title={languageMap[platformCtx.language].editProfile}>
                {userData && (
                    <EditEmployee
                        employee={userData}
                        onClose={() => editModalRef.current.closeModal()}
                        onUpdateSuccess={() => {
                            fetchUserData();
                            editModalRef.current.closeModal();
                        }}
                    />
                )}
            </Modal>

            <Modal ref={changePasswordModalRef} title={languageMap[platformCtx.language].changePassword}>
                {userData && (
                    <ChangePassword
                        onClose={() => changePasswordModalRef.current.closeModal()}
                        onUpdateSuccess={() => changePasswordModalRef.current.closeModal()}
                    />
                )}
            </Modal>

            <Modal ref={taskModalRef} title="Preview Survey Response">
                {taskModalContent}
            </Modal>

            {!id && (
                <div className="mb-[10px] flex flex-wrap justify-end gap-4 font-medium">
                    <Button onClick={handleEditProfile}>{languageMap[platformCtx.language].editProfile}</Button>
                    <Button onClick={handleChangePassword}>{languageMap[platformCtx.language].changePassword}</Button>
                </div>
            )}

            {/* Employee Profile Information */}
            <div className="mb-[30px] p-6 bg-white ring-1 ring-gray-300 ring-inset rounded-md">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="flex flex-col justify-center items-center border-b xl:border-b-0 xl:border-r border-gray-200 pb-6 xl:pb-0">
                        {/* Employee Profile Image */}
                        <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-gray-300">
                            <img
                                src={`${axios.defaults.baseURL}/avatars/${userData.employeeId}`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="mt-4 text-center">
                            {/* Employee Name */}
                            <p className="text-2xl font-semibold">{userData?.name || "User"}</p>
                            {/* Employee ID */}
                            <p className="mt-2 text-gray-500 text-sm font-medium uppercase">{languageMap[platformCtx.language].employeeId}: {userData?.employeeId || languageMap[platformCtx.language].notAvailable}</p>
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-semibold mb-4">{languageMap[platformCtx.language].personalInformation}</h2>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500">{languageMap[platformCtx.language].email}</p>
                                    <p className="font-medium"><a href={`mailto:${userData?.email}`} className="text-blue-500">{userData?.email || languageMap[platformCtx.language].notAvailable}</a></p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{languageMap[platformCtx.language].phone}</p>
                                    <p className="font-medium">{userData?.phone ? <a href={`tel:${userData?.phone}`} className="text-blue-500 text-opacity-80">{userData?.phone}</a> : languageMap[platformCtx.language].notAvailable}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{languageMap[platformCtx.language].gender}</p>
                                    <p className="font-medium">{userData?.gender ? languageMap[platformCtx.language][userData.gender.toLowerCase()] : languageMap[platformCtx.language].notAvailable}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{languageMap[platformCtx.language].username}</p>
                                    <p className="font-medium">{userData?.username || languageMap[platformCtx.language].notAvailable}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{languageMap[platformCtx.language].role}</p>
                                    <p className="font-medium">{userData?.role?.name || languageMap[platformCtx.language].notAvailable}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{languageMap[platformCtx.language].accountCreated}</p>
                                    <p className="font-medium">
                                        {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString(
                                            platformCtx.language === 'English' ? 'en-US' :
                                                platformCtx.language === 'Bahasa Melayu' ? 'ms-MY' : 'zh-CN',
                                            {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            }
                                        ) : languageMap[platformCtx.language].notAvailable}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Employee Information */}
                        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-semibold mb-4">{languageMap[platformCtx.language].employeeInformation}</h2>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500">{languageMap[platformCtx.language].department}</p>
                                    <p className="font-medium">{userData?.department?.departmentName || languageMap[platformCtx.language].notAvailable}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{languageMap[platformCtx.language].designation}</p>
                                    <p className="font-medium">{userData?.designation?.name || languageMap[platformCtx.language].notAvailable}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{languageMap[platformCtx.language].jobGrade}</p>
                                    <p className="font-medium">{userData?.jobGrade?.jobGradeName ? `G${userData.jobGrade.jobGradeName}` : languageMap[platformCtx.language].notAvailable}</p>
                                </div>
                                {!userData?.designation?.isLead && (
                                    <div>
                                        <p className="text-sm text-gray-500">{languageMap[platformCtx.language].reportsTo}</p>
                                        <p className="font-medium">
                                            {userData?.reportsTo && userData?.reportsTo !== "Not Available"
                                                ? userData.reportsTo
                                                : languageMap[platformCtx.language].notAvailable}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-3 bg-white ring-1 ring-gray-300 ring-inset rounded-t-md">
                <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500">
                    <li className="mr-2">
                        <a href="#"
                            className={`inline-block p-4 ${activeTab === "appraisals" ? 'text-red-500 text-opacity-80 border-b-2 border-red-500 border-opacity-80' : 'hover:text-red-500 hover:text-opacity-80'}`}
                            onClick={(e) => { e.preventDefault(); handleTabClick("appraisals"); }}
                            aria-current={activeTab === "appraisals" ? "page" : undefined}>
                            {languageMap[platformCtx.language].appraisals}
                        </a>
                    </li>
                    <li className="mr-2">
                        <a href="#"
                            className={`inline-block p-4 ${activeTab === "tasks" ? 'text-red-500 text-opacity-80 border-b-2 border-red-500 border-opacity-80' : 'hover:text-red-500 hover:text-opacity-80'}`}
                            onClick={(e) => { e.preventDefault(); handleTabClick("tasks"); }}>
                            Tasks
                        </a>
                    </li>
                </ul>
            </div>

            {/* Tabs Content */}
            <div className="mb-3 relative flex flex-wrap bg-white ring-1 ring-gray-300 ring-inset overflow-x-auto rounded-b-md">
                {activeTab === "appraisals" && (
                    <div className="p-6 w-full">
                        <Table
                            key={key} // Add key to force re-render
                            header={[languageMap[platformCtx.language]['#'], languageMap[platformCtx.language].employeeId, languageMap[platformCtx.language].employeeName, languageMap[platformCtx.language].department, languageMap[platformCtx.language].designation, languageMap[platformCtx.language].knowHowProblemSolvingAccountability, languageMap[platformCtx.language].totalScore, languageMap[platformCtx.language].appraisalDate, languageMap[platformCtx.language].action]}
                            data={appraisals.length > 0 ? appraisals.map((appraisal, index) => [
                                index + 1,
                                appraisal.employeeDetails?.employeeId || languageMap[platformCtx.language].notAvailable,
                                appraisal.employeeDetails?.name || languageMap[platformCtx.language].notAvailable,
                                appraisal.employeeDetails?.department || languageMap[platformCtx.language].notAvailable,
                                appraisal.employeeDetails?.designation || languageMap[platformCtx.language].notAvailable,
                                [
                                    `${appraisal.stats?.knowHow?.percentageScore || 0}%`,
                                    `${appraisal.stats?.problemSolving?.percentageScore || 0}%`,
                                    `${appraisal.stats?.accountability?.percentageScore || 0}%`,
                                ].join(" / "),
                                `${appraisal.stats?.totalScore || 0}% (${appraisal.stats?.grade || languageMap[platformCtx.language].notAvailable})`,
                                new Date(appraisal.appraisalDate).toLocaleString("en-my", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                }),
                                <div className="flex flex-row gap-4 text-sm">
                                    <Link to={`/view-appraisal/${appraisal._id}`} className="text-blue-500"><span className="material-icons text-black">visibility</span></Link>
                                    {(!id || authCtx.hasPermission("performance_appraisal")) && <span className="material-icons" onClick={() => handleEmployeeComment(appraisal._id)}>comment</span>}
                                </div>
                            ]) : []}
                        />
                    </div>
                )}
                {activeTab === "tasks" && (
                    <div className="p-6 w-full">
                        <Table header={["#", "Task", "Deadline", "Progress", "Action"]}
                            data={campaigns.map((campaign, index) => {
                                return [
                                    index + 1,
                                    campaign.campaignName,
                                    new Date(campaign.campaignEndDate).toLocaleDateString("en-my", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "numeric",
                                        minute: "numeric"
                                    }),
                                    <span className={`py-2 px-6 inline-flex justify-center items-center ${campaign.completed? "bg-green-500" : "bg-red-500"} bg-opacity-80 text-white font-medium rounded-full`}>
                                        <span>{campaign.completed? "complete" : "incomplete"}</span>
                                    </span>,
                                    <div className="flex flex-row gap-2">
                                        {!campaign.completed && !id && (<Link to={`/survey-respond/${campaign._id}`}>
                                            <span className="material-icons cursor-pointer">edit_note</span>
                                        </Link>)}
                                        {campaign.completed && (!id || authCtx.hasPermission("survey")) && (<>
                                            <span onClick={() => {
                                                setTaskModalContent(<ViewSurveyResponse
                                                    surveyResponseId={campaign.responseId}/>);
                                                taskModalRef.current.openModal();
                                            }} className="material-icons cursor-pointer text-black">visibility</span>
                                            <Link to={`${axios.defaults.baseURL}/survey-response/${campaign.responseId}/print`} target="_blank">
                                                <span className="material-icons text-black">print</span>
                                            </Link>
                                        </>)}
                                    </div>
                                ];

                            })}/>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
