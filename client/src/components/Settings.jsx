import React, { useState, useEffect, useContext } from 'react';
import {PlatformContext} from "./Layout/PlatformLayout.jsx";
import { ScreenSizeTracker } from "./ScreenSizeTracker.jsx";

const Settings = () => {
    // Page Header Handling
    const platformCtx = useContext(PlatformContext);
    const handleLanguageChange = (event) => {
        const newLanguage = event.target.value;
        platformCtx.setLanguage(newLanguage);
        localStorage.setItem('language', newLanguage);
    };
    useEffect(() => {
        const pageName = platformCtx.language === 'English' ? 'Settings' :
            platformCtx.language === 'Bahasa Melayu' ? 'Tetapan' :
                '设置';

        const homeName = platformCtx.language === 'English' ? 'Home' :
            platformCtx.language === 'Bahasa Melayu' ? 'Laman Utama' :
                '主菜单';

        platformCtx.setPage(pageName);
        platformCtx.setBreadcrumb([
            {name: homeName},
            {name: pageName, path: "/settings"}
        ]);
    }, [platformCtx.language]);

    return (
        <ScreenSizeTracker>
            {(screenWidth) => (
                <div>
                    {/* Card */}
                    <div className={`mb-[30px] bg-white border border-gray-200 rounded-md shadow-md`}>
                        {/* Card Body */}
                        <div className="p-[16px]">
                            <div className="px-[12px]">
                                <p>
                                    {platformCtx.language === 'English' ? 'Settings' :
                                        platformCtx.language === 'Bahasa Melayu' ? 'Tetapan' :
                                            '设置'}
                                </p>
                                {/* Grid */}
                                <div className="grid grid-cols-12 gap-x-8 gap-y-4">
                                    {/* Language Dropdown Button */}
                                    <div className="col-span-12 sm:col-span-6 lg:col-span-4">
                                        <label htmlFor="language"
                                               className="inline-block py-[7px] text-xs font-bold">
                                            {platformCtx.language === 'English' ? 'Language:' :
                                                platformCtx.language === 'Bahasa Melayu' ? 'Bahasa:' :
                                                    '语言:'}
                                        </label>
                                        <div className="w-full relative inline-flex items-center">
                                            <select id="language" onChange={handleLanguageChange}
                                                    value={platformCtx.language}
                                                    className="w-full appearance-none text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none">
                                                <option className="rounded">English</option>
                                                <option className="rounded">Bahasa Melayu</option>
                                                <option className="rounded">中文</option>
                                            </select>
                                            <svg
                                                className="absolute top-1/2 transform -translate-y-1/2 right-3 w-2.5 h-2.5 text-gray-400 pointer-events-none"
                                                aria-hidden="true" fill="none" viewBox="0 0 10 6"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                                      strokeWidth="2" d="m1 1 4 4 4-4"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ScreenSizeTracker>
    );
};

export default Settings;