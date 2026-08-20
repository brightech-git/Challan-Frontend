"use client";

import { useEffect, useState } from "react";

import {
    getCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
} from "../../services/companyServices";


export default function CompanyPage() {

    // Company list
    const [companies, setCompanies] = useState([]);

    // Form values
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");

    // Store editing company ID
    const [editId, setEditId] = useState(null);

    // Loading
    const [loading, setLoading] = useState(false);


    // --------------------------------
    // GET - VIEW COMPANIES
    // --------------------------------

    const loadCompanies = async () => {

        try {

            setLoading(true);

            const data = await getCompanies();

            setCompanies(data);
            

        } catch (error) {

            console.log(error);

            alert("Failed to load companies");

        } finally {

            setLoading(false);

        }
    };


    // Load companies when page opens
    useEffect(() => {

        loadCompanies();

    }, []);


    // --------------------------------
    // POST / PUT
    // --------------------------------

    const saveCompany = async (e) => {

        e.preventDefault();

        try {

            const company = {
                name: name,
                address: address,
                phone: phone,
            };


            // UPDATE
            if (editId) {

                await updateCompany(editId, company);

                alert("Company updated successfully");

            }

            // CREATE
            else {

                await createCompany(company);

                alert("Company created successfully");

            }


            // Clear form
            clearForm();

            // Reload companies
            loadCompanies();

        } catch (error) {

            console.log(error);

            alert("Something went wrong");

        }
    };


    // --------------------------------
    // EDIT
    // --------------------------------

    const editCompany = (company) => {

        setEditId(company.id);

        setName(company.name);

        setAddress(company.address);

        setPhone(company.phone);

    };


    // --------------------------------
    // DELETE
    // --------------------------------

    const removeCompany = async (id) => {

        const confirmDelete = confirm(
            "Are you sure you want to delete this company?"
        );

        if (!confirmDelete) {
            return;
        }


        try {

            await deleteCompany(id);

            alert("Company deleted successfully");

            loadCompanies();

        } catch (error) {

            console.log(error);

            alert("Failed to delete company");

        }
    };


    // --------------------------------
    // CLEAR FORM
    // --------------------------------

    const clearForm = () => {

        setName("");

        setAddress("");

        setPhone("");

        setEditId(null);

    };


    return (

        <div className="min-h-screen bg-gray-100 p-8">

            {/* PAGE TITLE */}

            <h1 className="mb-8 text-3xl font-bold">
                Company
            </h1>


            {/* -------------------------------- */}
            {/* CREATE / UPDATE FORM */}
            {/* -------------------------------- */}

            <div className="mb-8 rounded-lg bg-white p-6 shadow">

                <h2 className="mb-5 text-xl font-bold">

                    {editId
                        ? "Update Company"
                        : "Create Company"
                    }

                </h2>


                <form
                    onSubmit={saveCompany}
                    className="grid gap-4"
                >

                    {/* NAME */}

                    <input
                        type="text"
                        placeholder="Company Name"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        className="rounded border p-3"
                        required
                    />


                    {/* ADDRESS */}

                    <input
                        type="text"
                        placeholder="Address"
                        value={address}
                        onChange={(e) =>
                            setAddress(e.target.value)
                        }
                        className="rounded border p-3"
                        required
                    />


                    {/* PHONE */}

                    <input
                        type="text"
                        placeholder="Phone"
                        value={phone}
                        onChange={(e) =>
                            setPhone(e.target.value)
                        }
                        className="rounded border p-3"
                        required
                    />


                    {/* BUTTONS */}

                    <div className="flex gap-3">

                        <button
                            type="submit"
                            className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
                        >

                            {editId
                                ? "Update"
                                : "Create"
                            }

                        </button>


                        {editId && (

                            <button
                                type="button"
                                onClick={clearForm}
                                className="rounded bg-gray-500 px-6 py-2 text-white"
                            >
                                Cancel
                            </button>

                        )}

                    </div>

                </form>

            </div>


            {/* -------------------------------- */}
            {/* VIEW COMPANIES */}
            {/* -------------------------------- */}

            <div className="rounded-lg bg-white p-6 shadow">

                <h2 className="mb-5 text-xl font-bold">
                    Company List
                </h2>


                {loading ? (

                    <p>
                        Loading companies...
                    </p>

                ) : companies.length === 0 ? (

                    <p>
                        No companies found.
                    </p>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full border-collapse">

                            <thead>

                                <tr className="bg-gray-200">

                                    <th className="border p-3 text-left">
                                        ID
                                    </th>

                                    <th className="border p-3 text-left">
                                        Company Name
                                    </th>

                                    <th className="border p-3 text-left">
                                        Address
                                    </th>

                                    <th className="border p-3 text-left">
                                        Phone
                                    </th>

                                    <th className="border p-3 text-center">
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {companies.map((company) => (

                                    <tr key={company.id}>

                                        <td className="border p-3">
                                            {company.id}
                                        </td>

                                        <td className="border p-3">
                                            {company.name}
                                        </td>

                                        <td className="border p-3">
                                            {company.address}
                                        </td>

                                        <td className="border p-3">
                                            {company.phone}
                                        </td>

                                        <td className="border p-3">

                                            <div className="flex justify-center gap-2">

                                                {/* EDIT */}

                                                <button
                                                    onClick={() =>
                                                        editCompany(company)
                                                    }
                                                    className="rounded bg-green-600 px-4 py-2 text-white"
                                                >
                                                    Edit
                                                </button>


                                                {/* DELETE */}

                                                <button
                                                    onClick={() =>
                                                        removeCompany(company.id)
                                                    }
                                                    className="rounded bg-red-600 px-4 py-2 text-white"
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>

    );
}