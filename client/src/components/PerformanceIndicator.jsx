import React, {useContext, useEffect, useRef, useState} from 'react';
import {PlatformContext} from "./Layout/PlatformLayout.jsx";
import Modal from "./Modal";
import Table from "./Table.jsx";
import axios from "axios";
import AddAttribute from "./AddAttribute.jsx";
import DeleteAttribute from "./DeleteAttribute.jsx";
import SearchQuery from "./SearchQuery.jsx";

const PerformanceIndicator = () => {
    const platformCtx = useContext(PlatformContext);
    const [attributes, setAttributes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Language Settings
    const languageMap = {
        English: {
            // Page Title
            performanceIndicator: "Performance Indicator",
            // Breadcrumbs
            breadcrumbHome: "Home",
            breadcrumbPerformanceIndicator: "Performance Indicator",
            // Search Input
            searchInput: "Performance Indicator",
            // Button
            addAttribute: "Add Attribute",
            // Table Header
            attributeName: "Attribute Name",
            category: "Category",
            designation: "Designation",
            action: "Action",
            deleteattribute: "Delete Attribute",
            weight: "Weight",
            department: "Department Related",
            "Know-How": "Know-How",
            "Problem-Solving": "Problem-Solving",
            "Accountability": "Accountability",
        },
        'Bahasa Melayu': {
            // Page Title
            performanceIndicator: "Penunjuk Prestasi",
            // Breadcrumbs
            breadcrumbHome: "Laman Utama",
            breadcrumbPerformanceIndicator: "Penunjuk Prestasi",
            // Search Input
            searchInput: "Penunjuk Prestasi",
            // Button
            addAttribute: "Tambah Atribut",
            // Table Header
            attributeName: "Atribut",
            category: "Kategori",
            designation: "Jawatan",
            action: "Tindakan",
            deleteattribute: "Padam Atribut",
            weight: "Berat Peratusan",
            department: "Berkaitan Dengan Jabatan",
            "Know-How": "Pengetahuan",
            "Problem-Solving": "Penyelesaian Masalah",
            "Accountability": "Tanggungjawab",
        },
        '中文': {
            // Page Title
            performanceIndicator: "绩效指标",
            // Breadcrumbs
            breadcrumbHome: "首页",
            breadcrumbPerformanceIndicator: "绩效指标",
            // Search Input
            searchInput: "绩效指标",
            // Button
            addAttribute: "添加属性",
            // Table Header
            attributeName: "属性",
            category: "类别",
            designation: "职位",
            action: "操作",
            deleteattribute: "删除属性",
            weight: "重量百分比",
            department: "部门相关",
            "Know-How": "专业知识",
            "Problem-Solving": "解决问题",
            "Accountability": "责任心",
        }
                    
    };

    useEffect(() => {
        platformCtx.setPage(languageMap[platformCtx.language].performanceIndicator);
        platformCtx.setBreadcrumb([
            {name: [languageMap[platformCtx.language].breadcrumbHome], path: "/"},
            {name: [languageMap[platformCtx.language].breadcrumbPerformanceIndicator], path: "/performance-indicator"}
        ]);
    }, []);

    // Modal Handling
    const [modalContent, setModalContent] = useState(null);
    const [modalTitle, setModalTitle] = useState("");
    const [searchQuery, setSearchQuery] = useState([]);
    const modalRef = useRef();
    const tableRef = useRef();
    
    const handleModalOpen = (title, content) => {
        setModalTitle(title);
        setModalContent(content);
        modalRef.current?.openModal();
    };

    const handleSubmit = (res) => {
        modalRef.current?.closeModal();

        if(res.success) {
            platformCtx.setAlert({type: "success", message: res.message});
        } else {
            platformCtx.setAlert({type: "error", message: res.message});
        }

        setLoading(true);
    }

    function handleSearchQuery(query) {
        setSearchQuery((prev) => {
            let newQuery = [...prev, query];

            let queryStr = newQuery.map(q => `${q.key}:${q.value}`).join(",");

            tableRef.current?.searchMultiple(queryStr);

            return newQuery;
        });
    }

    function handleDeleteQuery(index) {
        setSearchQuery((prev) => {
            let filtered = prev.filter((_, i) => i !== index);

            if(filtered.length === 0) {
                tableRef.current?.reset();
            } else {
                tableRef.current?.searchMultiple(filtered.map(q => `${q.key}:${q.value}`).join(","));
            }

            return filtered;
        });
    }

    useEffect(() => {
        const getAttributes = async () => {
            try {
                const response = await axios.get("/attributes");

                const data = response.data;

                setAttributes(data.attributes);
            } catch (e) {
                console.error(e);
            }
        }

        getAttributes().then(() => {
            console.log("Gotten attributes");
            setLoading(false);
        })
    }, [loading]);

    return (
        <div>
            {/* Page Header */}
            <div className="mb-[16px] flex items-center">
                <div className="ml-auto">
                    {/* Add Attribute Button */}
                    <button className="px-[12px] py-[6px] text-white bg-red-500 bg-opacity-80 rounded-md ring-1 ring-inset ring-red-400 shadow-sm" onClick={() => handleModalOpen("Add Attribute", <AddAttribute key={Math.random()} onSubmit={handleSubmit} />)}>
                        <span className="flex items-center">
                            <span className="material-symbols-outlined">add</span>
                            <span className="font-medium">{languageMap[platformCtx.language].addAttribute}</span>
                        </span>
                    </button>
                </div>
                {/* Modal Title */}
                <Modal ref={modalRef} title={modalTitle}>{modalContent}</Modal>
            </div>
            {/* Page Content */}
            <div className="flex flex-col gap-y-4">
                {/* Search Tool */}
                <div className="w-full">
                    <SearchQuery
                        selections={[
                            [languageMap[platformCtx.language].attributeName],
                            [languageMap[platformCtx.language].category],
                            [languageMap[platformCtx.language].designation],
                            [languageMap[platformCtx.language].department]
                        ]}
                        data={searchQuery}
                        onSaved={handleSearchQuery}
                        onDelete={handleDeleteQuery}
                    />
                </div>
                {/* Table */}
                <Table
                    ref={tableRef}
                    header={[
                        "#",
                        `${languageMap[platformCtx.language].attributeName}`,
                        `${languageMap[platformCtx.language].category}`,
                        `${languageMap[platformCtx.language].designation}`,
                        `${languageMap[platformCtx.language].department}`,
                        `${languageMap[platformCtx.language].action}`
                    ]}
                    data={attributes.map((attribute, index) => {
                        return [
                            index + 1,
                            attribute.name,
                            languageMap[platformCtx.language][attribute.category],
                            attribute.designation ? attribute.designation.name : "N/A",
                            attribute.designation && attribute.designation.department ? attribute.designation.department.departmentName : "N/A",
                            <div className="flex flex-row gap-4">
                                <span 
                                    className="material-icons cursor-pointer" 
                                    onClick={
                                        () => handleModalOpen(
                                            // View Attribute Modal Contents
                                            "View Attribute",
                                            <div className="flex flex-col gap-4 w-full">
                                                <div>
                                                    <p className="font-medium">{languageMap[platformCtx.language].attributeName}: {attribute.name}</p>
                                                    <p className="text-gray-500 text-opacity-80 text-sm">Sub-Attributes associated with current attribute</p>
                                                </div>
                                                <Table
                                                    simple
                                                    header={["#", `${languageMap[platformCtx.language].attributeName}`, `${languageMap[platformCtx.language].weight}`]}
                                                    data={attribute.subAttributes.map((subAttribute, index) => ([
                                                        index + 1,
                                                        subAttribute.name,
                                                        subAttribute.weight
                                                    ]))}
                                                />
                                            </div>
                                        )
                                    }>visibility</span>
                                <span 
                                    className="material-icons text-red-500 cursor-pointer" 
                                    onClick={
                                        () => handleModalOpen(languageMap[platformCtx.language].deleteattribute,
                                            <DeleteAttribute
                                                attributeId={attribute._id}
                                                attributeName={attribute.name}
                                                category={attribute.category}
                                                designation={attribute.designation ? attribute.designation.name : "N/A"}
                                                department={attribute.designation && attribute.designation.department ? attribute.designation.department.departmentName : "N/A"}
                                                onSubmit={handleSubmit}
                                            />
                                        )
                                    }
                                >delete</span>
                            </div>
                        ]
                    })}
                />
            </div>
        </div>
    );
};

export default PerformanceIndicator;