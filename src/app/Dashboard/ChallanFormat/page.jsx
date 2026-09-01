"use client";

import { useEffect, useState, useCallback } from "react";

import {
    getAllChallanFormat,
    getByIdChallanFormat,
} from "../../../services/challanFormatService";

import { getAllChallanCreation } from "../../../services/challanCreationServices";
import { FaPrint } from "react-icons/fa";


export default function ChallanFormat() {

    const [challanFormat, setchallanFormat] = useState([]);
    const [loggeduserId, setLoggedUserId] = useState("");
    const [editprinter, setEditprinter] = useState("");
    const [challanCreation, setchallanCreation] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [formData, setFormData] = useState({
        challanForm: "",
        challanTable: "",
    });

    const handlePrint = (item) => {
    console.log("Printing challan:", item);

    window.print();
};

    const getAllChallanCreation = useCallback(async () => {
        try {
            const response = await getAllChallanCreation();

            console.log("API Response:", response);

            const data = response?.data || response || [];

            console.log("Data to set:", data);

             setchallanCreation(data);
        } catch  {
            
            setMessage("Failed to load challanCreation");
        }
    }, []);

    useEffect(() => {
        getAllChallanCreation();
    }, [getAllChallanCreation]);

    useEffect(() => {
        console.log("Updated ChallanCreation:", challanCreation);
    }, [challanCreation]);


    const getAllChallanFormat = useCallback(async () => {
    try {
        const response = await getAllChallanFormat();

        console.log("API Response:", response);

        const data = response?.data || response || [];

        console.log("Data to set:", data);

         setFormData(data);
    } catch {

        setMessage("Failed to load ChallanFormat");
    }
}, []);

useEffect(() => { getAllChallanFormat();
}, [getAllChallanFormat]);

useEffect(() => {
    console.log("Updated ChallanFormat:", ChallanFormat);
}, [ChallanFormat]);

const getByIdChallanFormat = async (id) => {
    try {
        console.log("Getting getByIdChallanFormat:", id);

        const response = await getByIdChallanFormat(id);

        console.log("getByIdChallanFormat API Response:", response);

        const data = response?.data || response || {};

        console.log(" Data to set:", data);

        setFormData(data);

    } catch{
    
        setMessage("Failed to load ChallanFormat");
    }
};


    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    // Save / Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
            challanForm: formData.challanForm,
            challanTable: formData.challanTable,
        };
        console.log("Form Data:", data);
    };

    const resetForm = () => {
        setFormData({
            challanForm: "",
            challanTable: "",
        });
    };

    return (
        <div className="p-9">
            <h1 className="mb-6 text-2xl font-bold">
                Challan Format
            </h1>
            
                <div className="rounded-lg border bg-white p-6 shadow">

                    <h2 className="mb-4 text-xl font-semibold">
                        Existing Challan Formats
                    </h2>

                    {loading ? (
                        <p>Loading...</p>
                    ) : challanCreation.length === 0 ? (
                        <p className="text-gray-500">
                            No Challan Creation found
                        </p>
                    ) : (
                        <div className="overflow-x-auto">

                            <table className="w-full border-collapse border">

                                <thead>
                                    <tr>
                                        <th className="border p-2">
                                            Action
                                        </th>
                                         <th className="border p-2">
                                            FromCompanyId
                                        </th>
                                         <th className="border p-2">
                                             FromCompanyName
                                        </th>
                                         <th className="border p-2">
                                            ToCompanyId
                                        </th>
                                         <th className="border p-2">
                                             ToCompanyName
                                        </th>
                                         <th className="border p-2">
                                            TransData
                                           </th>
                                         <th className="border p-2">
                                            MetalId
                                        </th>
                                         <th className="border p-2">
                                            MetalName
                                        </th>
                                         <th className="border p-2">
                                            Description
                                        </th>
                                         <th className="border p-2">
                                            GrsWt
                                        </th>
                                         <th className="border p-2">
                                            SntWt
                                        </th>
                                         <th className="border p-2">
                                            NetWt
                                        </th>
                                
                                         <th className="border p-2">
                                            Rate
                                        </th>

                                        <th className="border p-2">
                                           CallType
                                        </th>

                                        <th className="border p-2">
                                            Value
                                        </th>
                                        <th className="border p-2">
                                            HsnCode
                                        </th>
                                        <th className="border p-2">
                                            CgstPer
                                        </th>
                                        <th className="border p-2">
                                            SgstPer
                                        </th>
                                        <th className="border p-2">
                                            IgstPer
                                        </th>
                                        <th className="border p-2">
                                            CgstAmount
                                        </th>
                                        <th className="border p-2">
                                               SgstAmount
                                        </th>
                                        <th className="border p-2">
                                               IgstAmount
                                        </th>
                                        <th className="border p-2">
                                               Total
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {challanCreation.length === 0 ? (
                                        <tr>
                                            <td colSpan="2" className="border p-4 text-center">
                                                No challans found
                                            </td>
                                        </tr>
                                    ) : (
                                        challanCreation.map((item) => (
                                            <tr key={item.id}>


                                                <td className="border p-2">
                                                    {item.fromCompanyId}
                                                </td>
                                                <td className="border p-2">
                                                    {item.fromCompanyName}
                                                </td>
                                                <td className="border p-2">
                                                    {item.toCompanyId}
                                                </td>
                                                <td className="border p-2">
                                                    {item.toCompanyName}
                                                                                                      
                                                </td>
                                                <td className="border p-2">
                                                    {item.tranDate}
                                                </td>
                                                <td className="border p-2">
                                                    {item.metalId}
                                                </td>
                                                <td className="border p-2">
                                                    {item.metalName}
                                                </td>
                                                <td className="border p-2">
                                                    {item.description}
                                                </td>
                                                <td className="border p-2">
                                                    {item.grsWt}
                                                </td>
                                                <td className="border p-2">
                                                    {item.sntWt}
                                                </td>
                                                <td className="border p-2">
                                                    {item.netWt}
                                                </td>

                                                <td className="border p-2">
                                                    {item.rate}
                                                </td>
                                                <td className="border p-2">
                                                    {item.calType}
                                                </td>
                                                <td className="border p-2">
                                                    {item.value}
                                                </td>
                                                <td className="border p-2">
                                                    {item.hsnCode}
                                                </td>
                                                <td className="border p-2">
                                                    {item.cgstPer}
                                                </td>
                                                <td className="border p-2">
                                                    {item.sgstPer}
                                                </td>
                                                <td className="border p-2">
                                                    {item.igstPer}
                                                </td>
                                                <td className="border p-2">
                                                    {item.cgstAmount}
                                                </td>
                                                <td className="border p-2">
                                                    {item.sgstAmount}
                                                </td>
                                                <td className="border p-2">
                                                    {item.igstAmount}
                                                </td>
                                                <td className="border p-2">
                                                    {item.total}
                                                </td>
                                                 <td className="border p-2 text-center">
                                                    {item.Action}
                                               <button
                                                type="button"
                                                onClick={() => handlePrint(item.id)}
                                                className="text-blue-600 hover:text-blue-800"
                                                
                                                >
                                               <FaPrint />
                                              </button>
                                             </td>

                                                
                                            </tr>
                                        ))
                                    )}
                                </tbody>

                            </table>

                        </div>
                    )}

                </div>


        </div>
    );
}