import React from 'react';

const UserGuide = () => {
    return (
        <div className="space-y-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">User Guide for CCK Performance System</h2>
            
            <section>
                <h3 className="text-3xl font-semibold text-gray-800 mb-4">Table of Contents</h3>
                <ul className="list-decimal list-inside text-gray-700 space-y-2 pl-4">
                    <li><a href="#introduction" className="text-blue-600 hover:underline">Introduction</a></li>
                    <li><a href="#getting-started" className="text-blue-600 hover:underline">Getting Started</a></li>
                    <li><a href="#dashboard" className="text-blue-600 hover:underline">Dashboard</a></li>
                    <li><a href="#employees-list" className="text-blue-600 hover:underline">Employees List</a></li>
                    <li><a href="#departments" className="text-blue-600 hover:underline">Departments</a></li>
                    <li><a href="#designations" className="text-blue-600 hover:underline">Designations</a></li>
                    <li><a href="#job-grades" className="text-blue-600 hover:underline">Job Grades</a></li>
                    <li><a href="#performance-indicators" className="text-blue-600 hover:underline">Performance Indicators</a></li>
                    <li><a href="#performance-appraisal" className="text-blue-600 hover:underline">Performance Appraisal</a></li>
                    <li><a href="#performance-survey" className="text-blue-600 hover:underline">Performance Survey</a></li>
                    <li><a href="#profiles" className="text-blue-600 hover:underline">Profiles</a></li>
                    <li><a href="#troubleshooting" className="text-blue-600 hover:underline">Troubleshooting</a></li>
                    <li><a href="#faqs" className="text-blue-600 hover:underline">Frequently Asked Questions (FAQs)</a></li>
                    <li><a href="#support" className="text-blue-600 hover:underline">Support</a></li>
                </ul>
            </section>

            <section id="introduction">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Introduction</h3>
                <p className="text-lg text-gray-700">Welcome to the CCK Performance System! This user guide is designed to help you navigate and utilize the features of the website effectively. Whether you are managing employee profiles, appraisals, or performance indicators, this guide provides step-by-step instructions to ensure you can perform your tasks efficiently.</p>
            </section>

            <section id="getting-started">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Getting Started</h3>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Accessing the Website</h4>
                <p className="text-lg text-gray-700 mb-4">To access the CCK Performance System, open your web browser and go to [your website URL].</p>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Logging In</h4>
                <ol className="list-decimal list-inside text-gray-700 space-y-2 pl-4">
                    <li>Click on the "Login" button on the homepage.</li>
                    <li>Enter your username and password.</li>
                    <li>Click "Submit" to log in to your account.</li>
                    <li>If you do not have an account, please contact your system administrator for access.</li>
                </ol>
            </section>

            <section id="dashboard">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Dashboard</h3>
                <p className="text-lg text-gray-700 mb-4">Once logged in, you will be directed to the dashboard. The dashboard provides an overview of key metrics and quick access to different sections of the system.</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 pl-4">
                    <li>Employees: View total employees.</li>
                    <li>Departments: View total departments.</li>
                    <li>Designations: View total designations.</li>
                    <li>Job Grades: View total job grades.</li>
                    <li>Performance Indicators: View total performance indicators.</li>
                    <li>Performance Appraisals: View total performance appraisals.</li>
                </ul>
                <p className="text-lg text-gray-700 mt-4">Use the navigation menu to access specific sections like Employees List, Departments, Designations, Job Grades, Performance Indicators, Performance Appraisals, Performance Survey, and Profiles.</p>
            </section>

            <section id="employees-list">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Employees List</h3>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Viewing Employees</h4>
                <p className="text-lg text-gray-700 mb-4">Navigate to the "Employees List" section from the dashboard. View the list of employees and click on an employee to see detailed information.</p>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Adding and Editing Employees</h4>
                <ol className="list-decimal list-inside text-gray-700 space-y-2 pl-4">
                    <li>Click the "Add Employee" button in the Employees List section.</li>
                    <li>Fill in the employee details, including employee ID, name, email, phone, department, designation, job grade, and role.</li>
                    <li>Click "Save" to add the employee.</li>
                    <li>To edit an existing employee, click the "Edit" button next to the employee entry, update the necessary information, and save the changes.</li>
                </ol>
            </section>

            <section id="departments">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Departments</h3>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Viewing Departments</h4>
                <p className="text-lg text-gray-700 mb-4">Navigate to the "Departments" section from the dashboard. View the list of departments.</p>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Adding and Editing Departments</h4>
                <ol className="list-decimal list-inside text-gray-700 space-y-2 pl-4">
                    <li>Click the "Add Department" button in the Departments section.</li>
                    <li>Enter the department name and description.</li>
                    <li>Click "Save" to add the department.</li>
                    <li>To edit an existing department, click the "Edit" button next to the department entry, update the necessary information, and save the changes.</li>
                </ol>
            </section>

            <section id="designations">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Designations</h3>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Viewing Designations</h4>
                <p className="text-lg text-gray-700 mb-4">Navigate to the "Designations" section from the dashboard. View the list of designations.</p>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Adding and Editing Designations</h4>
                <ol className="list-decimal list-inside text-gray-700 space-y-2 pl-4">
                    <li>Click the "Add Designation" button in the Designations section.</li>
                    <li>Enter the designation name, associated department, and description.</li>
                    <li>Click "Save" to add the designation.</li>
                    <li>To edit an existing designation, click the "Edit" button next to the designation entry, update the necessary information, and save the changes.</li>
                </ol>
            </section>

            <section id="job-grades">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Job Grades</h3>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Viewing Job Grades</h4>
                <p className="text-lg text-gray-700 mb-4">Navigate to the "Job Grades" section from the dashboard. View the list of job grades.</p>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Adding and Editing Job Grades</h4>
                <ol className="list-decimal list-inside text-gray-700 space-y-2 pl-4">
                    <li>Click the "Add Job Grade" button in the Job Grades section.</li>
                    <li>Enter the job grade name and description.</li>
                    <li>Click "Save" to add the job grade.</li>
                    <li>To edit an existing job grade, click the "Edit" button next to the job grade entry, update the necessary information, and save the changes.</li>
                </ol>
            </section>

            <section id="performance-indicators">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Performance Indicators</h3>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Viewing Performance Indicators</h4>
                <p className="text-lg text-gray-700 mb-4">Navigate to the "Performance Indicators" section from the dashboard. View the list of performance indicators.</p>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Adding and Editing Performance Indicators</h4>
                <ol className="list-decimal list-inside text-gray-700 space-y-2 pl-4">
                    <li>Click the "Add Indicator" button in the Performance Indicators section.</li>
                    <li>Enter the indicator name, category, and associated designation.</li>
                    <li>Click "Save" to add the indicator.</li>
                    <li>To edit an existing indicator, click the "Edit" button next to the indicator, update the necessary information, and save the changes.</li>
                </ol>
            </section>

            <section id="performance-appraisal">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Performance Appraisal</h3>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Viewing Performance Appraisals</h4>
                <p className="text-lg text-gray-700 mb-4">Navigate to the "Performance Appraisals" section from the dashboard. View the list of performance appraisals and click on an appraisal to see detailed information.</p>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Adding and Editing Performance Appraisals</h4>
                <ol className="list-decimal list-inside text-gray-700 space-y-2 pl-4">
                    <li>Click the "Add Appraisal" button in the Performance Appraisals section.</li>
                    <li>Fill in the appraisal details, including employee ID, scores, and date.</li>
                    <li>Click "Save" to add the appraisal.</li>
                    <li>To edit an existing appraisal, click the "Edit" button next to the appraisal entry, update the necessary information, and save the changes.</li>
                </ol>
            </section>

            <section id="performance-survey">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Performance Survey</h3>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Viewing Performance Surveys</h4>
                <p className="text-lg text-gray-700 mb-4">Navigate to the "Performance Survey" section from the dashboard. View the list of performance surveys.</p>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Adding and Editing Performance Surveys</h4>
                <ol className="list-decimal list-inside text-gray-700 space-y-2 pl-4">
                    <li>Click the "Add Survey" button in the Performance Survey section.</li>
                    <li>Enter the survey name, description, and associated performance indicators.</li>
                    <li>Click "Save" to add the survey.</li>
                    <li>To edit an existing survey, click the "Edit" button next to the survey entry, update the necessary information, and save the changes.</li>
                </ol>
            </section>

            <section id="profiles">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Profiles</h3>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Viewing and Editing Profiles</h4>
                <p className="text-lg text-gray-700 mb-4">Navigate to the "Profiles" section from the dashboard. Select an employee profile to view detailed information.</p>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Changing Password</h4>
                <ol className="list-decimal list-inside text-gray-700 space-y-2 pl-4">
                    <li>In the profile view, click the "Change Password" button.</li>
                    <li>Enter your current password, new password, and confirm the new password.</li>
                    <li>Click "Submit" to update your password.</li>
                </ol>
            </section>

            <section id="troubleshooting">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Troubleshooting</h3>
                <p className="text-lg text-gray-700 mb-4">If you encounter any issues while using the CCK Performance System, please refer to the Troubleshooting section for common solutions. This section includes tips for resolving login problems, data entry errors, and more.</p>
            </section>

            <section id="faqs">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Frequently Asked Questions (FAQs)</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 pl-4">
                    <li>How do I reset my password?</li>
                    <li>How do I add a new employee profile?</li>
                    <li>How can I view my past appraisals?</li>
                    <li>For more FAQs, visit the FAQs page.</li>
                </ul>
            </section>

            <section id="support">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Support</h3>
                <p className="text-lg text-gray-700 mb-4">For further assistance, please contact our support team at [support email] or visit our Support page. Our team is here to help you with any questions or issues you may have.</p>
            </section>
        </div>
    );
};

export default UserGuide;
