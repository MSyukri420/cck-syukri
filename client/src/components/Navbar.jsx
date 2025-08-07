import React from 'react';

const NavBar = () => {
  return (
    <div className="w-full h-[60px] bg-red-500">
        <div className="w-[60px] h-full px-[5px] float-left">
            <a href="" className="w-[50px] h-full flex justify-center items-center">
                <img src="/images/cck-logo.png" alt="CCK Logo" className="w-[43.47px] h-[30px] bg-white rounded-full" />
            </a>
        </div>
        <a className="h-[60px] px-[10px] float-left inline-flex items-center">
            <span className="material-symbols-outlined  leading-[70px] text-white">
                menu
            </span>
        </a>
        <div className="mb-[0] px-[20px] py-[16px] float-left">
            <p className="text-xl text-white">CCK Performance Management</p>
        </div>
        <ul className="h-full relative float-right">
            <li className="h-full">
                <a href='' className="h-full px-[9px] space-x-1 inline-block leading-[60px] text-center float-right">
                    <span className="inline-block align-middle">
                        <img src="/images/cck-logo.png" alt="CCK Logo" className="w-[30px] h-[19.97px] bg-white rounded-full" />
                    </span>
                    <span className="inline-block text-white">admin</span>
                    <span className="material-symbols-outlined text-white align-middle">
                        expand_more
                    </span>
                </a>
            </li>
        </ul>
    </div>
  );
}

export default NavBar;
