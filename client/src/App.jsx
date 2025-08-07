import { BrowserRouter as Router, Route, Navigate, useLocation, Routes as Switch } from 'react-router-dom';
import AuthenticationProvider, { AuthenticationContext } from "./components/Provider/AuthenticationProvider.jsx";
import Login from "./components/Login.jsx";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword.jsx";
import ResetPassword from './components/ForgotPassword/ResetPassword.jsx';
import { PlatformLayout } from "./components/Layout/PlatformLayout.jsx";
// Main
import Dashboard from "./components/Dashboard/Dashboard.jsx";
// Employees
import EmployeeList from "./components/EmployeeList/EmployeeList.jsx";
import Departments from "./components/Departments.jsx";
import Designations from "./components/Designations.jsx";
import JobGrades from "./components/JobGrades.jsx";
// KPIs
import PerformanceIndicator from './components/PerformanceIndicator.jsx';

import PerformanceAppraisal from './components/PerformanceAppraisal.jsx';
import ViewAppraisal from './components/ViewAppraisal.jsx';

import PerformanceEvaluation from './components/PerformanceEvaluation.jsx';

import PerformanceSurvey from './components/PerformanceSurvey.jsx';
import SurveyQuestionnaire from './components/SurveyQuestionnaire.jsx';
// Admin Settings
import RolesPermissions from './components/RolesPermissions/RolesPermissions.jsx';
import ApikeySettings from './components/Apikey-Settings.jsx';
// Profile
import Profile from './components/Profile/Profile.jsx';
// Settings
import Settings from './components/Settings.jsx';
import { PerformanceAppraisalProvider } from "./components/CreatePerformanceAppraisal.jsx";
import {useContext} from 'react';
import SurveyPreview from './components/SurveyPreview.jsx';
import SurveyResponseSheet from "./components/SurveyResponseSheet.jsx";
// Documentation
import Documentation from './components/Documentation/Documentation.jsx';
import Notifications from "./components/Notifications.jsx";
import PerformanceSurveyStats from "./components/PerformanceSurveyStats.jsx";
import FirstRun from "./components/FirstRun.jsx";

function App() {
    return (
        <AuthenticationProvider>
            <Router>
                <div className="bg-neutral-200 bg-opacity-50 overflow-x-hidden"> {/* Container with background color */}
                    <Switch>
                        <Route path="/" element={<PlatformLayout />}>
                            {/* Main */}
                            <Route path="dashboard" element={
                                <ProtectedRoute permission="dashboard">
                                    <Dashboard />
                                </ProtectedRoute>
                            }/>
                            <Route path="/notifications" element={<ProtectedRoute permission="dashboard">
                                <Notifications />
                            </ProtectedRoute>} />
                            {/* Employees */}
                            <Route path="employees-list" element={
                                <ProtectedRoute permission="employees_list">
                                    <EmployeeList />
                                </ProtectedRoute>
                            }/>
                            <Route path="departments" element={
                                <ProtectedRoute permission="department">
                                    <Departments />
                                </ProtectedRoute>
                            }/>
                            <Route path="designations" element={
                                <ProtectedRoute permission="designation">
                                    <Designations />
                                </ProtectedRoute>
                            }/>
                            <Route path="job-grades" element={
                                <ProtectedRoute permission="jobgrade">
                                    <JobGrades />
                                </ProtectedRoute>
                            }/>
                            {/* KPIs */}
                            <Route path="/" element={<PerformanceAppraisalProvider />}>
                                <Route path="performance-indicator" element={
                                    <ProtectedRoute permission="performance_indicator">
                                        <PerformanceIndicator />
                                    </ProtectedRoute>
                                }/>
                                {/* Appraisal */}
                                <Route path="performance-appraisal" element={
                                    <ProtectedRoute permission="performance_appraisal">
                                        <PerformanceAppraisal />
                                    </ProtectedRoute>
                                }/>
                                <Route path="view-appraisal/:id" element={
                                    <ProtectedRoute permission="view_appraisal">
                                        <ViewAppraisal />
                                    </ProtectedRoute>
                                }/>
                                <Route path="performance-evaluation/:id?" element={
                                    <PerformanceEvaluation />
                                }/>
                                {/* Survey */}
                                <Route path="performance-survey" element={
                                    <ProtectedRoute permission="performance-survey">
                                        <PerformanceSurvey />
                                    </ProtectedRoute>
                                }/>
                                <Route path="survey-questionnaire/:surveyId?" element={
                                    <ProtectedRoute permission="survey-questionnaire">
                                        <SurveyQuestionnaire />
                                    </ProtectedRoute>
                                }/>
                                <Route path="survey-preview" element={
                                    <ProtectedRoute permission="survey-preview">
                                        <SurveyPreview />
                                    </ProtectedRoute>
                                }/>
                                <Route path="survey-respond/:surveyId" element={<SurveyResponseSheet />} />
                                <Route path="performance-survey/stats/:surveyId" element={<PerformanceSurveyStats />} />
                            </Route>
                            {/* Settings */}
                            <Route path="roles-permissions" element={
                                <ProtectedRoute permission="roles-permissions">
                                    <RolesPermissions />
                                </ProtectedRoute>
                            }/>
                            <Route path="apikey-settings" element={
                                <ProtectedRoute permission="apikey_settings">
                                    <ApikeySettings />
                                </ProtectedRoute>
                            }/>
                            {/* Profile */}
                            <Route path="profile/:id?" element={
                                <Profile />
                            }/>
                            {/* Settings */}
                            <Route path="settings" element={
                                <Settings />
                            }/>
                            {/* Documentation */}
                            <Route path="/documentation" element={
                                <Documentation />
                            } />
                        </Route>
                        <Route path="/login" element={<Login />} />
                        <Route path="/respond" element={<SurveyResponseSheet />} />
                        <Route path="forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />
                        <Route path="/first-run" element={<FirstRun />} />
                    </Switch>
                </div>
            </Router>
        </AuthenticationProvider>
    )
}

const ProtectedRoute = ({ permission, children }) => {
    const { isAuthenticated, hasModule } = useContext(AuthenticationContext);
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default App
