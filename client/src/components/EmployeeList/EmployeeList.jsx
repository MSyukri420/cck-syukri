import { useState, useEffect, useContext, useMemo, useRef } from 'react';
import Table from "../Table.jsx";
import {PlatformContext} from "../Layout/PlatformLayout.jsx";
import {AuthenticationContext} from "../Provider/AuthenticationProvider.jsx";
import Button from "../Button.jsx";
import Modal from "../Modal.jsx";
import AddEmployee from "./AddEmployee.jsx";
import EditEmployee from "./EditEmployee.jsx";
import CSVUploadForm from './CSVUploadForm';
import axios from "axios";
import ActionMenu from './ActionMenu';

const EmployeeList = () => {
    // Language Settings
    const languageMap = {
        English: {
            uploadError: 'Please upload a CSV file.',
            processSuccess: 'CSV data successfully processed!',
            processError: 'Failed to process CSV file.',
            unknownError: 'Unknown error occurred',
            deleteSuccess: 'Employee with ID {0} deleted successfully.',
            deleteFailed: 'Failed to delete employee with ID {0}.',
            deleteError: 'An error occurred while trying to delete the employee with ID {0}.',
            no: 'No',
            employeeId: 'Employee ID',
            username: 'Username',
            fullName: 'Full Name',
            email: 'Email',
            phone: 'Phone',
            department: 'Department',
            designation: 'Designation',
            role: 'Role',
            jobGrade: 'Job Grade',
            action: 'Action'
        },
        'Bahasa Melayu': {
            uploadError: 'Sila muat naik fail CSV.',
            processSuccess: 'Data CSV berjaya diproses!',
            processError: 'Gagal memproses fail CSV.',
            unknownError: 'Ralat tidak diketahui berlaku',
            deleteSuccess: 'Pekerja dengan ID {0} berjaya dihapuskan.',
            deleteFailed: 'Gagal menghapuskan pekerja dengan ID {0}.',
            deleteError: 'Kesilapan berlaku semasa cuba menghapuskan pekerja dengan ID {0}.',
            no: 'No',
            employeeId: 'ID Pekerja',
            username: 'Nama Pengguna',
            fullName: 'Nama Penuh',
            email: 'Emel',
            phone: 'Telefon',
            department: 'Jabatan',
            designation: 'Jawatan',
            role: 'Peranan',
            jobGrade: 'Gred Kerja',
            action: 'Tindakan'
        },
        '中文': {
            uploadError: '请上传CSV文件。',
            processSuccess: 'CSV数据成功处理！',
            processError: '处理CSV文件失败。',
            unknownError: '发生未知错误',
            deleteSuccess: '成功删除ID为{0}的员工。',
            deleteFailed: '删除ID为{0}的员工失败。',
            deleteError: '尝试删除ID为{0}的员工时发生错误。',
            no: '编号',
            employeeId: '员工ID',
            username: '用户名',
            fullName: '全名',
            email: '电子邮件',
            phone: '电话',
            department: '部门',
            designation: '职位',
            role: '角色',
            jobGrade: '工作等级',
            action: '操作'
        }
    };

    const [employees, setEmployees] = useState([]);
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [searchFilters, setSearchFilters] = useState({
        employeeId: '',
        fullName: '',
        role: '',
        department: ''
    });
    
    // Modal Handling
    const modalRef = useRef(null);
    const [modalContent, setModalContent] = useState(null);
    const [modalTitle, setModalTitle] = useState(null);

    const platformCtx = useContext(PlatformContext);

    // Page Header
    useEffect(() => {
        const pageName = platformCtx.language === 'English' ? 'Employees List' :
            platformCtx.language === 'Bahasa Melayu' ? 'Senarai Pekerja':
                '员工列表';

        const homeName = platformCtx.language === 'English' ? 'Home' :
            platformCtx.language === 'Bahasa Melayu' ? 'Laman Utama' :
                '主页';

        platformCtx.setPage(pageName);
        platformCtx.setBreadcrumb([
            {name: homeName},
            {name: pageName, path: "/employees-list"}
        ]);

        fetchData();

    }, [platformCtx.language]);

    const fetchData = async () => {
        try {
            const response = await axios.get("/employees-list");
            const data = response.data;
    
            setEmployees(data.employees);
            setRoles(data.roles);
            setDepartments(data.departments);
        } catch (error) {
            console.error('Error fetching data:', error);
            platformCtx.setAlert({
                type: "error",
                message: "Failed to load data. Please try again."
            });
        }
    };

    const handleDelete = (employee) => {
        handleModalOpen(
            <DeleteConfirmation
                employee={employee}
                onDelete={() => deleteEmployee(employee.employeeId)}
            />,
            platformCtx.language === 'English' ? "Delete Employee" :
                platformCtx.language === 'Bahasa Melayu' ? 'Padam Pekerja' :
                    '删除员工'
        );
    };

    const handleEdit = (employee) => {
        setModalContent(
            <EditEmployee
                key={Math.random()}
                employee={employee}
                onClose={() => modalRef.current.closeModal()}
                onUpdateSuccess={fetchData}
            />
        );
        setModalTitle(
            platformCtx.language === 'English' ? "Edit Employee" :
                platformCtx.language === 'Bahasa Melayu' ? 'Edit Pekerja' :
                    '编辑员工'
        );
        modalRef.current.openModal();
    };

    const handleCSVSubmit = async (csvFile, actionType) => {
        if (!csvFile) {
            platformCtx.setAlert({ type: "error", message: languageMap[platformCtx.language].uploadError });
            return;
        }
    
        const formData = new FormData();
        formData.append("csvfile", csvFile);
    
        const endpoint = actionType === 'update' ? "/update-users-csv" : "/add-user-csv";
    
        try {
            const response = await axios.post(`${endpoint}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.data.success) {
                response.data.messages.forEach(message => {
                    platformCtx.setAlert({ type: "success", message: message });
                });
            }
            if (response.data.errors && response.data.errors.length > 0) {
                response.data.errors.forEach(error => {
                    platformCtx.setAlert({ type: "error", message: error });
                });
            }
            fetchData();
            modalRef.current.closeModal();
        } catch (error) {
            let message = languageMap[platformCtx.language].processError;
            if (error.response && error.response.data && error.response.data.errors) {
                message = error.response.data.errors.join("; ");
            } else if (error.response && error.response.data && error.response.data.message) {
                message = error.response.data.message;
            } else {
                console.error('Error uploading CSV:', error);
            }
            platformCtx.setAlert({ type: "error", message });
            fetchData();
        }
    };
    

    const handleModalOpen = (content, title) => {
        setModalContent(() => content);
        setModalTitle(title);
        modalRef.current?.openModal();
    };

    const deleteEmployee = async (employeeId) => {
        try {
            const response = await axios.post(`/delete-user`, { employeeId }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status === 200) {
                platformCtx.setAlert({ type: "success", message: languageMap[platformCtx.language].deleteSuccess.replace('{0}', employeeId) });
                fetchData();
            } else {
                console.error(languageMap[platformCtx.language].deleteFailed.replace('{0}', employeeId));
                platformCtx.setAlert({ type: "error", message: languageMap[platformCtx.language].deleteFailed.replace('{0}', employeeId) });
            }
        } catch (error) {
            console.error(languageMap[platformCtx.language].deleteError.replace('{0}', employeeId), error);
            platformCtx.setAlert({ type: "error", message: languageMap[platformCtx.language].deleteError.replace('{0}', employeeId) });
        } finally {
            modalRef.current.closeModal();
        }
    };

    const filteredEmployees = useMemo(() => {
        return employees.filter(employee => (
            (employee.employeeId || '').toLowerCase().includes(searchFilters.employeeId.toLowerCase()) &&
            (employee.name || '').toLowerCase().includes(searchFilters.fullName.toLowerCase()) &&
            (employee.role?.name || '').toLowerCase().includes(searchFilters.role.toLowerCase()) &&
            (employee.department?.departmentName || '').toLowerCase().includes(searchFilters.department.toLowerCase())
        ));
    }, [employees, searchFilters]);

    function handleSearchChange(event) {
        const { name, value } = event.target;
        setSearchFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    }

    function DeleteConfirmation({ employee, onDelete }) {
        const platformCtx = useContext(PlatformContext);
        return (
            <div className="flex flex-col gap-6">
                <p>{platformCtx.language === 'English' ? 'Are you sure you want to delete this employee?' :
                    platformCtx.language === 'Bahasa Melayu' ? 'Adakah anda pasti ingin memadam pekerja ini?' :
                        '您确定要删除此员工吗？'}</p>
                <div className="flex flex-col gap-2 rounded-md bg-slate-100 p-6 text-sm">
                    <p><strong>{platformCtx.language === 'English' ? 'Employee ID :' :
                        platformCtx.language === 'Bahasa Melayu' ? 'ID Pekerja :' :
                            '员工ID：'}</strong> {employee.employeeId}</p>
                    <p><strong>{platformCtx.language === 'English' ? 'Full Name :' :
                        platformCtx.language === 'Bahasa Melayu' ? 'Nama Penuh :' :
                            '全名：'}</strong> {employee.name}</p>
                    <p><strong>{platformCtx.language === 'English' ? 'Department :' :
                        platformCtx.language === 'Bahasa Melayu' ? 'Jabatan :' :
                            '部门：'}</strong> {employee.department?.departmentName}</p>
                    <p><strong>{platformCtx.language === 'English' ? 'Designation :' :
                        platformCtx.language === 'Bahasa Melayu' ? 'Jawatan :' :
                            '职位：'}</strong> {employee.designation?.name}</p>
                    <p><strong>{platformCtx.language === 'English' ? 'Role :' :
                        platformCtx.language === 'Bahasa Melayu' ? 'Peranan :' :
                            '角色：'}</strong> {employee.role?.name}</p>
                </div>
                <Button className="bg-red-500" onClick={onDelete}>{platformCtx.language === 'English' ? 'Delete' :
                    platformCtx.language === 'Bahasa Melayu' ? 'Padam' :
                        '删除'}</Button>
            </div>
        );
    }

    function openModal(title, content) {
        setModalTitle(title);
        setModalContent(content);

        modalRef.current.openModal();
    }

    const { isAuthenticated, hasPermission } = useContext(AuthenticationContext);

    return (
        <div>
            {/* Modal Preset */}
            <Modal ref={modalRef} title={modalTitle}>
                {modalContent}
            </Modal>
            <div className="mb-4">
                <div className="mb-4 flex justify-end">
                    {/* Add Employee Button */}
                    {isAuthenticated && hasPermission('add_form') && (
                        <Button colorType="danger" onClick={() => openModal(
                            platformCtx.language === 'English' ? "Add Employee" 
                            : platformCtx.language === 'Bahasa Melayu' ? 'Tambah Pekerja' 
                            : '添加员工',
                            <AddEmployee key={Math.random()} onUpdateSuccess={fetchData} onSubmit={() => modalRef.current.closeModal()}/>)}
                        >
                        <span className="flex items-center">
                            <span className="material-symbols-outlined">add</span>
                            <span className="font-medium">
                                {
                                    platformCtx.language === 'English' ? "Add Employee"
                                    : platformCtx.language === 'Bahasa Melayu' ? 'Tambah Pekerja'
                                    : '添加员工'
                                }
                            </span>
                        </span>
                        </Button>
                    )}
                </div>
                <div className="flex flex-wrap justify-end gap-4">  
                    {/* Add via CSV Button */}
                    {isAuthenticated && hasPermission('add_csv') && (
                        <Button colorType="danger" onClick={() => {
                            setModalContent(
                                <CSVUploadForm 
                                    onSubmit={handleCSVSubmit}
                                    title={ platformCtx.language === 'English' ? "Add Employees via CSV" : platformCtx.language === 'Bahasa Melayu' ? 'Tambah Pekerja melalui CSV' : '通过CSV添加员工'} 
                                    actionType="add"
                                />
                            );
                            setModalTitle(
                                platformCtx.language === 'English' ? "Add Employees via CSV" 
                                : platformCtx.language === 'Bahasa Melayu' ? 'Tambah Pekerja melalui CSV' 
                                : '通过CSV添加员工'
                            );
                            modalRef.current.openModal();
                        }}>
                            <span className="flex items-center">
                                <span className="material-symbols-outlined">file_upload</span>
                                <span className="font-medium">
                                    {
                                        platformCtx.language === 'English' ? "Add via CSV" 
                                        : platformCtx.language === 'Bahasa Melayu' ? 'Tambah melalui CSV' 
                                        : '通过CSV添加'
                                    }
                                </span>
                            </span>
                        </Button>
                    )}
                    {/* Update via CSV Button */}
                    {isAuthenticated && hasPermission('update_csv') && (
                        <Button colorType="danger" onClick={() => {
                            setModalContent(
                                <CSVUploadForm 
                                    onSubmit={handleCSVSubmit}
                                    title=
                                    {
                                        platformCtx.language === 'English' ? "Update Employees via CSV" 
                                        : platformCtx.language === 'Bahasa Melayu' ? 'Kemaskini Pekerja melalui CSV' 
                                        : '通过CSV更新员工'
                                    }
                                    actionType="update"
                                />
                            );
                            setModalTitle(
                                platformCtx.language === 'English' ? "Update Employees via CSV" 
                                : platformCtx.language === 'Bahasa Melayu' ? 'Kemaskini Pekerja melalui CSV' 
                                : '通过CSV更新员工'
                            );
                            modalRef.current.openModal();
                        }}>
                            <span className="flex items-center">
                                <span className="material-symbols-outlined">update</span>
                                <span className="font-medium">
                                    {
                                        platformCtx.language === 'English' ? "Update via CSV" 
                                        : platformCtx.language === 'Bahasa Melayu' ? 'Kemaskini melalui CSV' 
                                        : '通过CSV更新'
                                    }
                                </span>
                            </span>
                        </Button>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Search by Employee ID Input */}
                <input 
                    type="text" 
                    name="employeeId"
                    className="w-full appearance-none text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                    placeholder={
                        platformCtx.language === 'English' ? "Search by Employee ID" 
                        : platformCtx.language === 'Bahasa Melayu' ? 'Cari mengikut ID Pekerja' 
                        : '按员工ID搜索'
                    }
                    onChange={handleSearchChange}
                    value={searchFilters.employeeId}
                />
                {/* Search by Full Name Input */}
                <input 
                    type="text" 
                    name="fullName"
                    className="w-full appearance-none text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                    placeholder={
                        platformCtx.language === 'English' ? "Search by Full Name" 
                        : platformCtx.language === 'Bahasa Melayu' ? 'Cari mengikut Nama Penuh' 
                        : '按全名搜索'
                    }
                    onChange={handleSearchChange} 
                    value={searchFilters.fullName}
                />
                {/* Search by Employee ID Dropdown */}
                <select 
                    name="role"
                    className="w-full appearance-none text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                    onChange={handleSearchChange} 
                    value={searchFilters.role}
                >
                    <option value="">
                        {platformCtx.language === 'English' ? "Filter by Role" 
                        : platformCtx.language === 'Bahasa Melayu' ? 'Tapis mengikut Peranan' 
                        : '按角色筛选'}
                    </option>
                    {roles.map(role => (
                        <option key={role._id} value={role.name}>{role.name}</option>
                    ))}
                </select>
                {/* Search by Department Dropdown */}
                <select 
                    name="department"
                    className="w-full appearance-none text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                    onChange={handleSearchChange} 
                    value={searchFilters.department}
                >
                    <option value="">
                        {platformCtx.language === 'English' ? "Filter by Department" 
                        : platformCtx.language === 'Bahasa Melayu' ? 'Tapis mengikut Jabatan' 
                        : '按部门筛选'}
                    </option>
                    {departments.map(department => (
                        <option key={department._id} value={department.departmentName}>{department.departmentName}</option>
                    ))}
                </select>
            </div>
            {/* Table */}
            <Table
                header={[
                    languageMap[platformCtx.language].no,
                    languageMap[platformCtx.language].employeeId,
                    languageMap[platformCtx.language].username,
                    languageMap[platformCtx.language].fullName,
                    languageMap[platformCtx.language].email,
                    languageMap[platformCtx.language].phone,
                    languageMap[platformCtx.language].department,
                    languageMap[platformCtx.language].designation,
                    languageMap[platformCtx.language].role,
                    languageMap[platformCtx.language].jobGrade,
                    languageMap[platformCtx.language].action
                ]}
                data={filteredEmployees.map((employee, index) => ([
                    index + 1,
                    employee.employeeId,
                    employee.username,
                    employee.name,
                    employee.email,
                    employee.phone,
                    employee.department?.departmentName,
                    employee.designation?.name,
                    employee.role?.name,
                    employee.jobGrade?.jobGradeName ? `G${employee.jobGrade?.jobGradeName}` : "",
                    <ActionMenu
                        employeeId={employee.employeeId}
                        employee={employee}
                        onEdit={() => handleEdit(employee)}
                        onDelete={() => handleDelete(employee)}
                    />
                ]))}
            />
        </div>
    );
};

export default EmployeeList;