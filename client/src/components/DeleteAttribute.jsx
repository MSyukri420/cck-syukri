import axios from "axios";
import Button from "./Button.jsx";
import { useContext } from "react";
import {PlatformContext} from "./Layout/PlatformLayout.jsx";

function DeleteAttribute({attributeId, attributeName, category, designation, onSubmit}) {

    const platformCtx = useContext(PlatformContext);
    const languageMap = {
        English: {
            deleteAttributeConfirmation: "Are you sure you want to delete this attribute?",
            name: "Name",
            categoryAssociated: "Category Associated",
            designationAssociated: "Designation Associated",
            delete: "Delete",
            "Know-How": "Know-How",
            "Problem-Solving": "Problem-Solving",
            "Accountability": "Accountability",
        },
        'Bahasa Melayu': {
            deleteAttributeConfirmation: "Adakah anda pasti ingin memadam atribut ini?",
            name: "Nama",
            categoryAssociated: "Kategori Bersekutu",
            designationAssociated: "Jawatan Berkaitan",
            delete: "Padam",
            "Know-How": "Pengetahuan",
            "Problem-Solving": "Penyelesaian Masalah",
            "Accountability": "Tanggungjawab",
        },
        '中文': {
            deleteAttributeConfirmation: "您确定要删除此属性吗？",
            name: "名称",
            categoryAssociated: "关联类别",
            designationAssociated: "关联职位",
            delete: "删除",
            "Know-How": "专业知识",
            "Problem-Solving": "解决问题",
            "Accountability": "责任心",
        }
    }

    async function deleteAttribute() {
        try {
            const response = await axios.post(`/attributes/delete`, {
                id: attributeId
            });

            const data = response.data;

            onSubmit?.(data);
        } catch (error) {
            console.error('Error deleting attribute:', error);
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-4">
                {/* Are you sure? */}
                <span className="w-32 h-32 inline-flex items-center justify-center bg-red-100 rounded-full">
                    <span className="material-symbols-outlined text-6xl text-red-500 text-opacity-80">warning</span>
                </span>
                <p className="mb-3 text-center text-2xl font-medium">{languageMap[platformCtx.language].deleteAttributeConfirmation}</p>
                {/* Attribute Name Input */}
                <div className="w-full">
                    <label htmlFor="attribute" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].name}:</label>
                    <input
                        type="text"
                        id="attribute" 
                        className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none" 
                        value={attributeName}
                        readOnly
                    />
                </div>
                {/* Category Associated Input */}
                <div className="w-full">
                    <label htmlFor="category" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].categoryAssociated}:</label>
                    <input
                        type="text"
                        id="category" 
                        className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none" 
                        value={languageMap[platformCtx.language][category]}
                        readOnly
                    />
                </div>
                {/* Designation Associated Input */}
                <div className="w-full">
                    <label htmlFor="designation" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].designationAssociated}:</label>
                    <input
                        type="text"
                        id="designation" 
                        className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none" 
                        value={designation}
                        readOnly
                    />
                </div>
            </div>
            {/* Delete Button */}
            <div className="text-right font-medium">
                <Button className="bg-red-500" onClick={deleteAttribute}>{languageMap[platformCtx.language].delete}</Button>
            </div>
        </div>
    )
}

export default DeleteAttribute;