import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from "../../assets/logo.png";
import Button from "../Button";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            alert("Please enter your email address.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/forgot-password', { email });
            if (response.data.success) {
                alert(response.data.message);
                navigate('/login'); // Adjust as necessary or show a confirmation page
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            console.error('Error sending forgot password request:', err);
            setError(err.response?.data?.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-screen h-screen flex flex-col justify-center items-center bg-gray-50">
            <div className="flex flex-col justify-center items-center border border-gray-300 rounded-lg gap-6 px-12 py-8 bg-white shadow-lg">
                <img src={logo} alt="logo" className="w-28 h-auto mb-4"/>
                <h1 className="text-2xl font-bold text-slate-700">Reset Your Password</h1>
                <p className="text-center text-slate-500 mb-4">Please enter your email address to receive a reset code.</p>
                
                <form className="w-full max-w-xs" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-2 mb-6">
                        <label htmlFor="email" className="sr-only">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email Address"
                            className="p-2 border border-gray-300 rounded w-full"
                            required
                        />
                    </div>
                    
                    <div className="text-center">
                        <Button colorType="danger" type="submit" disabled={loading}>
                            {loading ? (
                                <span className="px-4 flex items-center">
                                    <span className="material-symbols-outlined animate-spin mr-2">autorenew</span>
                                    <span className="font-medium">Sending...</span>
                                </span>
                            ) : (
                                <span className="px-4 flex items-center">
                                    <span className="font-medium">Send Reset Code</span>
                                </span>
                            )}
                        </Button>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
