import { useState,useContext} from 'react';
import axios from 'axios';
import Button from "../Button.jsx";
import {PlatformContext} from "../Layout/PlatformLayout.jsx";


const ChangePassword = ({ onClose, onUpdateSuccess }) => {
    // Language Settings
    const languageMap = {
        English: {
            currentPassword: 'Current Password',
            newPassword: 'New Password',
            confirmNewPassword: 'Confirm New Password',
            saveChanges: "Save Changes",
            passwordsDoNotMatch: 'Passwords do not match',
            passwordChangedSuccessfully: 'Password changed successfully',
            failedToChangePassword: 'Failed to change password',

        },
        'Bahasa Melayu': {
            currentPassword: 'Kata Laluan Semasa',
            newPassword: 'Kata Laluan Baru',
            confirmNewPassword: 'Sahkan Kata Laluan Baru',
            saveChanges: "Simpan Perubahan",
            passwordsDoNotMatch: 'Kata laluan tidak sepadan',
            passwordChangedSuccessfully: 'Kata laluan berjaya ditukar',
            failedToChangePassword: 'Gagal menukar kata laluan',
        },
        '中文': {
            currentPassword: '当前密码',
            newPassword: '新密码',
            confirmNewPassword: '确认新密码',
            saveChanges: "保存更改",
            passwordsDoNotMatch: '密码不匹配',
            passwordChangedSuccessfully: '密码已成功更改',
            failedToChangePassword: '无法更改密码',
        },
    }

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const platformCtx = useContext(PlatformContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            platformCtx.setAlert({ type: 'error', message: languageMap[platformCtx.language].passwordsDoNotMatch });
            return;
        }

        try {
            const response = await axios.post('/change-password', {
                currentPassword,
                newPassword
            }, { withCredentials: true });

            if (response.data.success) {
                onUpdateSuccess();
                platformCtx.setAlert({ type: 'success', message: languageMap[platformCtx.language].passwordChangedSuccessfully });
            } else {
                platformCtx.setAlert({ type: 'error', message: response.data.message });
            }
        } catch (error) {
            console.error('Failed to change password:', error);
            platformCtx.setAlert({ type: 'error', message: languageMap[platformCtx.language].failedToChangePassword });
        }
    };

    return (
        <div>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                    <div className="flex flex-wrap gap-4">
                        <div className="w-full flex flex-col md:flex-1">
                            <label className="inline-block py-[7px] text-sm font-medium">
                                {languageMap[platformCtx.language].currentPassword}
                            </label>
                            <input
                                type="password"
                                className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                                value={currentPassword}
                                placeholder="Enter Current Password"
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="w-full flex flex-col md:flex-1">
                            <label className="inline-block py-[7px] text-sm font-medium">
                                {languageMap[platformCtx.language].newPassword}
                            </label>
                            <input
                                type="password"
                                className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                                value={newPassword}
                                placeholder="Enter New Password"
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="w-full flex flex-col md:flex-1">
                            <label className="inline-block py-[7px] text-sm font-medium">
                                {languageMap[platformCtx.language].confirmNewPassword}
                            </label>
                            <input
                                type="password"
                                className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                                value={confirmPassword}
                                placeholder="Re-Enter New Password"
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    {/* Save Changes Button */}
                    <div className="text-right font-medium">
                        <Button type="submit" colorType="danger">{languageMap[platformCtx.language].saveChanges}</Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ChangePassword;
