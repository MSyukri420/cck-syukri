import {useState, useRef, useContext} from 'react';
import Button from "../Button"; // Adjust the import path as necessary
import {PlatformContext} from "../Layout/PlatformLayout.jsx";

function CSVUploadForm({ onSubmit, actionType }) {
    // Language Settings
    const languageMap = {
        English: {
            selectFile: 'Please select a CSV file first.',
            fileShouldContain: 'The file should contain headers and follow the specified format:',
            requiredHeaders: 'Required Headers:',
            upload: 'Upload',
            username: "User's username",
            email: "User's email address",
            password: "User's password",
            role: "User's role within the organization",
            emailId: "User's email address (used for identification)",
            name: "User's full name",
            phone: "User's phone number",
            department: "User's department",
            designation: "User's designation",
            birthday: "User's birthday (format: DD/MM/YYYY)",
            address: "User's address",
            gender: "User's gender (Male, Female, Other)"
        },
        'Bahasa Melayu': {
            selectFile: 'Sila pilih fail CSV dahulu.',
            fileShouldContain: 'Fail harus mengandungi tajuk dan mengikut format yang ditentukan:',
            requiredHeaders: 'Tajuk yang Diperlukan:',
            upload: 'Muat Naik',
            username: "Nama pengguna",
            email: "Alamat emel pengguna",
            password: "Kata laluan pengguna",
            role: "Peranan pengguna dalam organisasi",
            emailId: "Alamat emel pengguna (digunakan untuk pengenalan)",
            name: "Nama penuh pengguna",
            phone: "Nombor telefon pengguna",
            department: "Jabatan pengguna",
            designation: "Jawatan pengguna",
            birthday: "Tarikh lahir pengguna (format: DD/MM/YYYY)",
            address: "Alamat pengguna",
            gender: "Jantina pengguna (Lelaki, Perempuan, Lain-lain)"
        },
        '中文': {
            selectFile: '请先选择CSV文件。',
            fileShouldContain: '文件应包含标题并遵循指定的格式:',
            requiredHeaders: '必需的标题:',
            upload: '上传',
            username: "用户的用户名",
            email: "用户的电子邮件地址",
            password: "用户的密码",
            role: "用户在组织中的角色",
            emailId: "用户的电子邮件地址（用于识别）",
            name: "用户的全名",
            phone: "用户的电话号码",
            department: "用户的部门",
            designation: "用户的职位",
            birthday: "用户的生日（格式：DD/MM/YYYY）",
            address: "用户的地址",
            gender: "用户的性别（男，女，其他）",
        }
    };

    const platformCtx = useContext(PlatformContext);
    const [csvFile, setCsvFile] = useState(null);
    const fileInputRef = useRef(null);
    const isAddAction = actionType === 'add';

    const handleFileChange = (e) => {
        setCsvFile(e.target.files[0]);  // Set the selected file into state
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!csvFile) {
            platformCtx.setAlert({ type: "error", message: languageMap[platformCtx.language].selectFile });
            return;
        }
        onSubmit(csvFile, actionType);  // Call the passed onSubmit function with the selected file and action type
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="text-sm text-gray-500">
                    <p className="mb-3">{languageMap[platformCtx.language].fileShouldContain}</p>
                    <div className="p-3 bg-gray-100 text-gray-800 rounded-md">
                        <p className="uppercase font-medium">{languageMap[platformCtx.language].requiredHeaders}</p>
                        <div>
                            {isAddAction ? (
                                <ul className="list-disc pl-5">
                                    <li><strong>username</strong> - {languageMap[platformCtx.language].username}</li>
                                    <li><strong>email</strong> - {languageMap[platformCtx.language].email}</li>
                                    <li><strong>password</strong> - {languageMap[platformCtx.language].password}</li>
                                    <li><strong>role</strong> - {languageMap[platformCtx.language].role}</li>
                                </ul>
                            ) : (
                                <ul className="list-disc pl-5">
                                    <li><strong>email</strong> - {languageMap[platformCtx.language].emailId}</li>
                                    <li><strong>name</strong> - {languageMap[platformCtx.language].name}</li>
                                    <li><strong>phone</strong> - {languageMap[platformCtx.language].phone}</li>
                                    <li><strong>department</strong> - {languageMap[platformCtx.language].department}</li>
                                    <li><strong>designation</strong> - {languageMap[platformCtx.language].designation}</li>
                                    <li><strong>birthday</strong> - {languageMap[platformCtx.language].birthday}</li>
                                    <li><strong>address</strong> - {languageMap[platformCtx.language].address}</li>
                                    <li><strong>gender</strong> - {languageMap[platformCtx.language].gender}</li>
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col">
                    {/* File Input */}
                    <div>
                        <label htmlFor="csvFile" className="block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].selectFile}</label>
                        <input
                            ref={fileInputRef}
                            id="csvFile"
                            type="file"
                            accept=".csv"
                            className="file-input"
                            onChange={handleFileChange}
                        />
                    </div>
                    {/* Submit Button */}
                    <div className="text-right">
                        <Button type="submit" className="font-medium">
                            {languageMap[platformCtx.language].upload}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
    
}

export default CSVUploadForm;
