import Button from "./Button.jsx";
import axios from "axios";
import {useEffect, useState} from "react";

function SetEmployeeComment({appraisalId, onSubmit}) {
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [appraisalData, setAppraisalData] = useState(null);

    async function handleSubmit() {
        setLoading(true);
        try {
            const response = await axios.post("/set-employee-comment", {
                performanceAppraisalId: appraisalId,
                comment
            });

            onSubmit?.(response.data);
            console.log("Submitted");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const getAppraisalData = async () => {
            setLoading(true);

            try {
                const response = await axios.get(`/get-appraisal-details/${appraisalId}`);

                setAppraisalData(response.data.appraisal);
                setComment(response.data.appraisal.employeeComment?.message || "");
            } catch (e) {
                console.error(e);
                onSubmit?.(e.response);
            } finally {
                setLoading(false);
            }
        }

        getAppraisalData().then(() => {
            console.log("Retrieved appraisal data");
        });
    }, []);

    const isCommentChanged = appraisalData?.employeeComment?.message !== comment || (!appraisalData?.employeeComment && comment.length > 0);

    return appraisalData && (
        <div className="flex flex-col gap-6">
            <p>Employee comment:</p>
            <textarea name="employeeComment" id="employeeComment" rows="10" className=" p-4 w-full bg-slate-200 rounded-md" onChange={(e) => setComment(e.target.value)} value={comment}>
                {comment}
            </textarea>
            <div className="flex flex-row">
                <Button onClick={() => isCommentChanged ? handleSubmit() : onSubmit?.()} disabled={loading}>{isCommentChanged ? "Submit" : "Close"}</Button>
            </div>
        </div>
    )
}

export default SetEmployeeComment;