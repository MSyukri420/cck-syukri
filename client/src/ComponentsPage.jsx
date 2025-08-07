import Alert from "./components/Alert";
import Breadcrumb from "./components/Breadcrumb";
import Button from "./components/Button";
import Card from "./components/Card";
import Dropdown from "./components/Dropdown";
import Progressbar from "./components/Progressbar";
import Tab from "./components/Tab";
import Modal from "./components/Modal";
import React from "react";

function ComponentsPage() {
    const [modalContent, setModalContent] = React.useState(null);
    const modalRef = React.useRef();

    function handleModalOpen(content) {
        setModalContent(content);
        modalRef.current?.openModal();
    }

    return (
        <div className="flex flex-col p-6 gap-4 w-screen h-screen">
            <h1 className="font-medium text-2xl">Components</h1>
            <h2 className="font-medium text-xl py-2">Alerts</h2>
            <Alert type={"primary"}>This is a message alert.</Alert>
            <Alert type={"secondary"}>This is a message alert.</Alert>
            <Alert type={"success"}>This is a message alert.</Alert>
            <Alert type={"danger"}>This is a message alert.</Alert>
            <Alert type={"warning"}>This is a message alert.</Alert>
            <Alert type={"info"}>This is a message alert.</Alert>
            <Alert type={"light"}>This is a message alert.</Alert>
            <Alert type={"dark"}>This is a message alert.</Alert>
            <h2 className="font-medium text-xl py-2">Breadcrumb</h2>
            <Breadcrumb path={[
                {name: "Home", path: "/"},
                {name: "Components", path: "/components"},
            ]}/>
            <Breadcrumb path={[
                {name: "Home", path: "/"},
                {name: "Components", path: "/components"},
                {name: "Breadcrumb", path: "/components/Breadcrumb"},
            ]}/>
            <h2 className="font-medium text-xl py-2">Button</h2>
            <div className="flex flex-row justify-evenly h-12 gap-2">
                <Button colorType={"primary"}>Primary</Button>
                <Button colorType={"secondary"}>Secondary</Button>
                <Button colorType={"success"}>Success</Button>
                <Button colorType={"danger"}>Danger</Button>
                <Button colorType={"warning"}>Warning</Button>
                <Button colorType={"info"}>Info</Button>
                <Button colorType={"light"}>Light</Button>
                <Button colorType={"dark"}>Dark</Button>
            </div>
            <div className="flex flex-row justify-evenly h-10 gap-2">
                <Button colorType={""}><p className="text-sm">Primary</p></Button>
                <Button colorType={"secondary"}><p className="text-sm">Secondary</p></Button>
                <Button colorType={"success"}><p className="text-sm">Success</p></Button>
                <Button colorType={"danger"}><p className="text-sm">Danger</p></Button>
                <Button colorType={"warning"}><p className="text-sm">Warning</p></Button>
                <Button colorType={"info"}><p className="text-sm">Info</p></Button>
                <Button colorType={"light"}><p className="text-sm">Light</p></Button>
                <Button colorType={"dark"}><p className="text-sm">Dark</p></Button>
            </div>
            <h2 className="font-medium text-xl py-2">Card</h2>
            <div className="flex flex-row gap-2">
                <div className="w-72">
                    <Card>
                        <div className="flex flex-col gap-2 p-6">
                            <h1 className="font-medium text-xl">Card Title</h1>
                            <p>This is a card component.</p>
                            <hr className="my-2"/>
                            <div className="flex flex-row gap-4">
                                <div className="w-40">
                                    <Button colorType={"primary"}>Alright</Button>
                                </div>
                                <div className="w-40">
                                    <Button colorType={"danger"}>Close</Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="grow">
                    <Card>
                        <div className="flex flex-col gap-2 p-6">
                            <h1 className="font-medium text-xl">Card Title</h1>
                            <p>This is a long card component.</p>
                            <hr className="my-2"/>
                            <div className="flex flex-row gap-4">
                                <div className="w-40">
                                    <Button colorType={"primary"}>Alright</Button>
                                </div>
                                <div className="w-40">
                                    <Button colorType={"danger"}>Close</Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
            <h2 className="font-medium text-xl py-2">Dropdowns</h2>
            <div className="w-48">
                <Dropdown header={
                    <div className="flex flex-row gap-2 shrink">
                        <span>Dropdown with text</span>
                    </div>
                }>
                    <div className="flex flex-col p-4">
                        <p>Action</p>
                        <p>Another action</p>
                        <p>Something else here</p>
                    </div>
                </Dropdown>
            </div>
            <div className="flex flex-row gap-2 justify-evenly">
                <Dropdown header={
                    <Button colorType={"primary"}>Dropdown with button</Button>
                }>
                    <div className="flex flex-col p-4">
                        <p>Action</p>
                        <p>Another action</p>
                        <p>Something else here</p>
                    </div>
                </Dropdown>
                <Dropdown header={
                    <Button colorType={"secondary"}>Dropdown with button</Button>
                }>
                    <div className="flex flex-col p-4">
                        <p>Action</p>
                        <p>Another action</p>
                        <p>Something else here</p>
                    </div>
                </Dropdown>
                <Dropdown header={
                    <Button colorType={"success"}>Dropdown with button</Button>
                }>
                    <div className="flex flex-col p-4">
                        <p>Action</p>
                        <p>Another action</p>
                        <p>Something else here</p>
                    </div>
                </Dropdown>
            </div>
            <h2 className="font-medium text-xl py-2">Progress Bar</h2>
            <div className="flex flex-col gap-2">
                <Progressbar type="primary" percentage={45}/>
                <Progressbar type="secondary" percentage={60}/>
                <Progressbar type="success" percentage={75}/>
                <Progressbar type="danger" percentage={90}/>
                <Progressbar type="warning" percentage={30}/>
                <Progressbar type="info" percentage={50}/>
                <Progressbar type="light" percentage={20}/>
                <Progressbar type="dark" percentage={10}/>
            </div>
            <h2 className="font-medium text-xl py-2">Tab</h2>
            <Tab
                tabs={["Tab 1", "Tab 2", "Tab 3"]}
                activeTabIndex={0}
                body={[
                    <div className="flex flex-col gap-2">
                        <h1 className="font-medium text-xl">Tab 1</h1>
                        <p>This is tab 1 content.</p>
                        <p>Enter input here</p>
                        <input type="text" className="border border-gray-300 p-2 rounded"/>
                    </div>,
                    <div>Tab 2 content</div>,
                    <div>Tab 3 content</div>,
                ]}
            />
            <h2 className="font-medium text-xl py-2">Modal</h2>
            <div className="flex flex-row gap-2">
                <div className="w-32">
                    <Button colorType={"primary"} onClick={() => handleModalOpen(
                        <div className="flex flex-col gap-2 p-6 bg-white">
                            <p>This is a modal component.</p>
                            <hr className="my-2"/>
                            <div className="flex flex-row gap-4">
                                <div className="w-40">
                                    <Button colorType={"primary"}>Alright</Button>
                                </div>
                                <div className="w-40">
                                    <Button colorType={"danger"} onClick={() => modalRef.current?.closeModal()}>Close</Button>
                                </div>
                            </div>
                        </div>
                    )}>Open Modal</Button>
                </div>
                <div className="w-32">
                    <Button colorType={"danger"} onClick={() => handleModalOpen(
                        <div className="flex flex-col gap-2 p-6 bg-white">
                            <p>This is a danger modal component.</p>
                            <hr className="my-2"/>
                            <div className="flex flex-row gap-4">
                                <div className="w-40">
                                    <Button colorType={"primary"}>Alright</Button>
                                </div>
                                <div className="w-40">
                                    <Button colorType={"danger"} onClick={() => modalRef.current?.closeModal()}>Close</Button>
                                </div>
                            </div>
                        </div>
                    )}>Open Modal</Button>
                </div>
            </div>
            <Modal ref={modalRef} title="Modal Title">{modalContent}</Modal>
        </div>
    );
}

export default ComponentsPage;