import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from "../../assets/logo.png";
import Button from "../Button";

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(`/reset-password/${token}`, {
                password
            });

            if (response.data.success) {
                alert('Your password has been reset successfully!');
                navigate('/login');
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            console.error('Error resetting password:', err);
            setError('Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-screen h-screen flex flex-col justify-center items-center bg-gray-50">
            <div className="flex flex-col justify-center items-center border border-gray-300 rounded-lg gap-6 px-12 py-8 bg-white shadow-lg">
                <img src={logo} alt="logo" className="w-28 h-auto mb-4"/>
                <h1 className="text-2xl font-bold text-slate-700">Reset Your Password</h1>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <form className="w-full max-w-xs" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-2 mb-4">
                        <label htmlFor="password" className="sr-only">New Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="New Password"
                            className="p-2 border border-gray-300 rounded w-full"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2 mb-6">
                        <label htmlFor="confirmPassword" className="sr-only">Confirm New Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm New Password"
                            className="p-2 border border-gray-300 rounded w-full"
                            required
                        />
                    </div>
                    <div className="text-center">
                        <Button colorType="danger" type="submit" disabled={loading}>
                            {loading ? (
                                <span className="px-4 flex items-center">
                                    <span className="material-symbols-outlined animate-spin mr-2">autorenew</span>
                                    <span className="font-medium">Resetting...</span>
                                </span>
                            ) : (
                                <span className="px-4 flex items-center">
                                    <span className="font-medium">Reset Password</span>
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
