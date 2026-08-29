"use client";

import { useEffect, useState, useCallback } from "react";

import {
    getAllChallanCreation,
    getByChallanCreationId,
    createChallanCreation,
    updateChallanCreation
} from "../../../services/challanCreationServices";

import { getCompanies } from "../../../services/companyServices";
import { getAllMetal } from "../../../services/metalServices";

import { FaSave, FaTimes, FaEdit } from "react-icons/fa";


const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/challanCreation`;

export default function ChallanCreation() {


    const [challanCreation, setchallanCreation] = useState([]);
    const [loggeduserId, setLoggedUserId] = useState("");
    const [editchallan, setEditchallan] = useState("");
    const [companies, setCompanies] = useState([]);
    const [metal, setMetal] = useState([]);
    const [loading, setLoading] = useState("");
    const todayDate = new Date().toISOString().split("T")[0];

    console.log(todayDate);


    const getCompanyData = async () => {
        try {
            await Promise.resolve();
            setLoading(true);

            const response = await getCompanies();

            console.log("GET companies response:", response);

            if (response?.success) {
                setCompanies(response.data || []);
            } else {
                setCompanies([]);

                throw new Error(
                    response?.message || "Failed to load companies"
                );
            }
        } catch (error) {
            console.error("loadCompanies error:", error);

            alert(error?.message || "Failed to load companies");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        getCompanyData();
    }, []);
    const getAllMetalData = async () => {
        try {
            await Promise.resolve();
            setLoading(true);

            const response = await getAllMetal();

            console.log("GET metal response:", response);

            if (response?.success) {
                setMetal(response.data || []);
            } else {
                setMetal([]);

                throw new Error(
                    response?.message || "Failed to load metal"
                );
            }
        } catch (error) {
            console.error(" load metal error:", error);

            alert(error?.message || "Failed to load metal");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        getAllMetalData();
    }, []);



    const [formData, setFormData] = useState({
        fromCompanyId: "",
        toCompanyId: "",
        tranDate: todayDate,
        metalId: "",
        description: "",
        grsWt: "",
        netWt: "",
        stnWt: "",
        calType: "grsWt",
        rate: "",
        value: "",
        cgstPer: "",
        sgstPer: "",
        igstPer: "",
        cgstAmt: "",
        sgstAmt: "",
        igstAmt: "",
        total: "",
        hsnCode: "",
    });
    const netWt =
        (Number(formData.grsWt || 0) -
        Number(formData.stnWt || 0)).toFixed(3);

    const TotalValueWithoutGST = (
        formData.calType === "grsWt"
            ? Number(formData.grsWt || 0) * Number(formData.rate || 0)
            : Number(netWt || 0) * Number(formData.rate || 0)
    ).toFixed(2);

    console.log("Net Weight:", netWt);
    console.log("Calc Type:", formData.calType);
    console.log("Rate:", formData.rate);
    console.log("Total Value Without GST:", TotalValueWithoutGST);

    const SGSTAmount = ((Number(formData.sgstPer) * Number(TotalValueWithoutGST)) / 100).toFixed(2)

    console.log("SGSTAmount", SGSTAmount);
    const CGSTAmount = ((Number(formData.cgstPer) * Number(TotalValueWithoutGST)) / 100).toFixed(2);

    console.log("CGSTAmount", CGSTAmount);

    const IGSTAmount = ((Number(formData.igstPer) * Number(TotalValueWithoutGST)) / 100).toFixed(2);

    console.log("IGSTAmount", IGSTAmount);

    const TotalValueWithGST = Number(
        Number(TotalValueWithoutGST || 0) +
        (
            Number(formData.igstPer || 0) > 0
                ? Number(IGSTAmount || 0)
                : Number(CGSTAmount || 0) + Number(SGSTAmount || 0)
        )).toFixed(2);

    console.log("Total value with GST", TotalValueWithGST)



    console.log(("Value Without GST:", TotalValueWithoutGST),
        ("CGST Amount:", CGSTAmount), ("SGST Amount:", SGSTAmount), ("IGST Amount:", IGSTAmount));

    const [message, setMessage] = useState("");

    useEffect(() => {
        const loggedUser = localStorage.getItem("user");
        const loggedUserData = loggedUser ? JSON.parse(loggedUser) : null;

        setLoggedUserId(loggedUserData?.userId || "");
    }, []);

    const loadchallan = useCallback(async () => {
        try {
            const response = await getAllChallanCreation();
            setchallanCreation(response?.data || response || []);
        } catch (error) {
            console.error("Error loading challan:", error);
            setMessage("Failed to load challan");
        }
    }, []);

    useEffect(() => {
        loadchallan();
    }, [loadchallan]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const handlechallan = async (e) => {
        e.preventDefault();

        const challan = {
            fromCompanyId: formData.fromCompanyId,
            toCompanyId: formData.toCompanyId,
            tranDate: formData.tranDate,
            metalId: formData.metalId,
            description: formData.description,

            grsWt: Number(formData.grsWt || 0),
            netWt: Number(netWt || 0),
            stnWt: Number(formData.stnWt || 0),

            calType: formData.calType.toUpperCase() ,
            rate: Number(formData.rate || 0),

            // Calculated values
            value: Number(TotalValueWithoutGST),

            cgstPer: Number(formData.cgstPer || 0),
            sgstPer: Number(formData.sgstPer || 0),
            igstPer: Number(formData.igstPer || 0),

            cgstAmt: Number(CGSTAmount),
            sgstAmt: Number(SGSTAmount),
            igstAmt: Number(IGSTAmount),

            total: Number(TotalValueWithGST),

            hsnCode: formData.hsnCode,
        };

        try {

            if (editchallan) {
                const response = await updateChallanCreation(editchallan, challan, loggeduserId);

                console.log("Update challan response:", response);

                alert(response?.message || "challan updated successfully");
            }
            else {

                await createChallanCreation(challan, loggeduserId);

                setMessage("challan created successfully");


            }
            resetForm();
            console.log("Retform Called", resetForm)
            loadchallan();
        }
        catch (error) {
            console.error("Error creating challan:", error);
            setMessage(error.message || "Failed to createchallan");
        }

    }
    // Reset form
    const resetForm = () => {
        setFormData({
            fromCompanyId: "",
            toCompanyId: "",
            tranDate: todayDate,
            metalId: "",
            description: "",
            grsWt: "",
            netWt: "",
            stnWt: "",
            calType: "",
            rate: "",
            value: "",
            cgstPer: "",
            sgstPer: "",
            igstPer: "",
            cgstAmt: "",
            sgstAmt: "",
            igstAmt: "",
            total: "",
            hsnCode: "",

        });

        setEditchallan("");
    };

    const handleEdit = async (challanId) => {
        try {
            const response = await getByChallanCreationId(challanId);

            const challan = response?.data || response;

            setEditchallan(challan.challanId)

            console.log("Edit Get By Id", challan)

            setFormData({
                fromCompanyId: challan.fromCompanyId,
                toCompanyId: challan.toCompanyId,
                tranDate: challan.tranDate,
                metalId: challan.metalId,
                description: challan.description,
                grsWt: challan.grsWt,
                netWt: challan.netWt,
                stnWt: challan.stnWt,
                calType: challan.calType,
                rate: challan.rate,
                value: challan.value,
                cgstPer: challan.cgstPer,
                sgstPer: challan.sgstPer,
                igstPer: challan.igstPer,
                cgstAmt: challan.cgstAmt,
                sgstAmt: challan.sgstAmt,
                igstAmt: challan.igstAmt,
                total: challan.total,
                hsnCode: challan.hsnCode,
            });

            console.log("editing challan", formData)

        } catch (error) {
            console.error("Error getting user:", error);
            setMessage("Failed to get user");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            <div className="mx-auto max-w-6xl rounded-lg bg-white p-6 shadow">

                <h1 className="mb-6 border-b pb-4 text-2xl font-bold">
                    {editchallan ? "Edit Challan" : "Create Challan"}
                </h1>

                <form onSubmit={handlechallan}>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                From Company
                            </label>

                            <select
                                name="fromCompanyId"
                                value={formData.fromCompanyId}
                                onChange={handleChange}
                                className="w-full rounded border px-3 py-2"
                            >
                                <option value="">Select From Company</option>

                                {companies.map((company) => (
                                    <option
                                        key={company.companyId}
                                        value={company.companyId}
                                    >
                                        {company.companyName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                To Company
                            </label>

                            <select
                                name="toCompanyId"
                                value={formData.toCompanyId}
                                onChange={handleChange}
                                className="w-full rounded border px-3 py-2"
                            >
                                <option value="">Select To Company</option>

                                {companies.map((company) => (
                                    <option
                                        key={company.companyId}
                                        value={company.companyId}
                                    >
                                        {company.companyName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                TranscationDate
                            </label>

                            <input
                                type="date"
                                name="tranDate"
                                value={formData.tranDate}
                                onChange={handleChange}
                                className="w-full rounded border px-3 py-2"
                            />
                        </div>

                    </div>
                    <h2 className="mb-4 mt-8 text-lg font-semibold">
                        Metal Details
                    </h2>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Metal ID
                            </label>


                            <select
                                name="metalId"
                                value={formData.metalId}
                                onChange={handleChange}
                                className="w-full rounded border px-3 py-2"
                            >
                                <option value="">Select Metal </option>

                                {metal.map((metal) => (
                                    <option
                                        key={metal.metalId}
                                        value={metal.metalId}
                                    >
                                        {metal.metalName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm font-medium">
                                Description
                            </label>

                            <input
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full rounded border px-3 py-2"
                                placeholder="Enter Description"
                            />
                        </div>

                    </div>
                    <h2 className="mb-4 mt-8 text-lg font-semibold">
                        Weight Details
                    </h2>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Gross Weight
                            </label>

                            <input
                                type="number"
                                step="any"
                                name="grsWt"
                                value={formData.grsWt || ""}
                                onChange={handleChange}
                                className="w-full rounded border px-3 py-2 disabled:bg-gray-100"
                            />
                        </div>


                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Stone Weight
                            </label>

                            <input
                                type="number"
                                step="any"
                                name="stnWt"
                                value={formData.stnWt}
                                onChange={handleChange}
                                className="w-full rounded border px-3 py-2 disabled:bg-gray-100"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Net Weight
                            </label>

                            <input
                                type="number"
                                step="any"
                                name="netWt"
                                value={netWt}
                                readOnly
                                className="w-full rounded border px-3 py-2 bg-gray-100"
                            />
                        </div>

                    </div>
                    <h2 className="mb-4 mt-8 text-lg font-semibold">
                        Rate Details
                    </h2>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">


                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Rate
                            </label>

                            <input
                                type="number"
                                step="any"
                                name="rate"
                                value={formData.rate}
                                onChange={handleChange}
                                className="w-full rounded border px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                CalcType
                            </label>

                            <select
                                type="number"
                                step="any"
                                name="calType"
                                value={formData.calType}
                                onChange={handleChange}
                                className="w-full rounded border px-3 py-2"
                            >
                                <option value="GRSWT">grsWt</option>
                                <option value="NETWT">netWt</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Value
                            </label>


                            <input
                                type="number"
                                step="any"
                                name="value"
                                value={TotalValueWithoutGST}
                                readOnly
                                className="w-full rounded border px-3 py-2 bg-gray-100"
                            />

                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                HSN Code
                            </label>

                            <input
                                type="text"
                                name="hsnCode"
                                value={formData.hsnCode}
                                onChange={handleChange}
                                className="w-full rounded border px-3 py-2"
                                placeholder="Enter HSN Code"
                            />
                        </div>



                    </div>


                    <h2 className="mb-4 mt-8 text-lg font-semibold">
                        GST Details
                    </h2>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                CGST %
                            </label>

                            <input
                                type="number"
                                step="any"
                                name="cgstPer"
                                value={formData.cgstPer}
                               disabled={Number(formData.igstPer || 0) > 0}
                                onChange={handleChange}
                                className="w-full rounded border px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                SGST %
                            </label>

                            <input
                                type="number"
                                step="any"
                                name="sgstPer"
                                value={formData.sgstPer}
                                disabled={Number(formData.igstPer || 0) > 0}
                                onChange={handleChange}
                                className="w-full rounded border px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                IGST %
                            </label>

                            <input
                                type="number"
                                step="any"
                                name="igstPer"
                                value={formData.igstPer}
                                disabled={Number(formData.cgstPer || 0) > 0 || Number(formData.sgstPer || 0) > 0}
                                onChange={handleChange}
                                className="w-full rounded border px-3 py-2"
                            />
                        </div>


                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                CGST Amount
                            </label>

                            <input
                                type="number"
                                step="any"
                                name="cgstAmt"
                                value={CGSTAmount}
                                className="w-full rounded border px-3 py-2"
                                disabled
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                SGST Amount
                            </label>

                            <input
                                type="number"
                                step="any"
                                name="sgstAmt"
                                value={SGSTAmount}
                                className="w-full rounded border px-3 py-2"
                                disabled
                            />

                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                IGST Amount
                            </label>

                            <input
                            
                                type="number"
                                step="any"
                                name="igstAmt"
                                value={IGSTAmount}
                                disabled={Number(formData.cgstPer || 0) > 0 || Number(formData.sgstPer || 0) > 0}
                                className="w-full rounded border px-3 py-2"

                            />

                        </div>




                    </div>
                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Total
                            </label>

                            <input
                                type="number"
                                step="any"
                                name="total"
                                value={TotalValueWithGST}
                                readOnly
                                className="w-full rounded border px-3 py-2 bg-gray-100"
                            />
                        </div>


                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    </div>
                    {/* <form onSubmit={handlechallan}></form> */}

                    <div className="mt-8 flex gap-3 border-t pt-5">

                        <button
                            type="submit"
                            className="flex items-center gap-2 rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                        >
                            <FaSave />
                        </button>

                        <button
                            type="button"
                            onClick={resetForm}
                            className="flex items-center gap-2 rounded bg-gray-500 px-5 py-2 text-white hover:bg-gray-600"
                        >
                            <FaTimes />
                            Clear
                        </button>

                    </div>

                    {message && (
                        <p className="mt-4 rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                            {message}
                        </p>
                    )}

                </form>

                <h2 className="mb-4 mt-10 border-b pb-4 text-xl font-semibold">
                    Challan List
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2">From Company</th>
                                <th className="border p-2">To Company</th>
                                <th className="border p-2">Tran Date</th>
                                <th className="border p-2">Metal ID</th>
                                <th className="border p-2">Total</th>
                                <th className="border p-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {challanCreation.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="border p-4 text-center">
                                        No challans found
                                    </td>
                                </tr>
                            ) : (
                                challanCreation.map((item) => (
                                    <tr key={item.challanId}>
                                        <td className="border p-2">{item.fromCompanyId}</td>
                                        <td className="border p-2">{item.toCompanyId}</td>
                                        <td className="border p-2">{item.tranDate}</td>
                                        <td className="border p-2">{item.metalId}</td>
                                        <td className="border p-2">{item.total}</td>
                                        <td className="border p-2">
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(item.challanId)}
                                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"

                                            >
                                                <FaEdit size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

            </div>

        </div>
    );
}


