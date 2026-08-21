"use client";

import { useEffect, useState } from "react";

import {
    getCompanies,
    createCompany,
    editCompany,
    updateCompany,
    deleteCompany,
} from "../../services/companyServices";


export default function CompanyPage() {

    // Company list
    const [companies, setCompanies] = useState([]);
    console.log("company data",companies)

    // Form values
    const [companyId, setcompanyId] = useState("");
    const [companyName, setcompanyName] = useState("");
    const [companyType, setcompanyType] = useState("");
    const [Address1, setAddress1] = useState("");
    const [Address2, setAddress2] = useState("");
    const [Address3, setAddress3] = useState("");
    const [Address4, setAddress4] = useState("");
    const [areaCode, setareaCode] = useState("");
    const [phone, setphone] = useState("");
    const [cstNo, setcstNo] = useState("");
    const [email, setemail] = useState("");
    const [localTaxNo, setlocalTaxNo] = useState("");
    const [panNo ,setpanNo] = useState("");
    const [tinNo, settinNo] = useState("");
    const [autoGenerator, setautoGenerator] = useState("");
    const [costId, setcostId] = useState("");
    const [active, setactive] = useState("");
    const [createdAt, setcreatedAt] = useState("");
    const [gstNo, setgstNo] = useState("");
    const [displayOrder, setdisplayOrder] = useState("");
    const [shortKey, setshortKey] = useState("");
    const [tanNo, settanNo] = useState("");
    const [upDated, setupDated] = useState("");
    const [upTime, setupTime] = useState("");
    const [updatedAt, setupdatedAt] = useState("");
    const [userId, setuserId] = useState("");
    

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

            setCompanies(data.data);
            

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

            const company = 
    {
      "companyId": "",
      "companyName": "",
      "companyType": "FROM",
      "Address1": null,
      "Address2": null,
      "Address3": null,
      "Address4": null,
      "areaCode": null,
      "phone": null,
      "costId": null,
      "email": null,
      "localTaxNo": null,
      "panNo": null,
      "tinNo": null,
      "costId":null,
      "active":null,
      "gstNo":null,
      "display":null,
      "shortKey":null,
      "tanNo":null,
    }




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

        setEditId(company.companyId);

        setcompanyName(company.companyName);

        setcompanyType(company.companyType);

        setAddress1(company.Address1);

        setAddress2(company.Address2);
        setAddress3(company.Address3);
        setAddress4(company.Address4);
        setareaCode(company.areaCode);
        setphone(company.phone);
        setcstNo(company.cstNo);
        setemail(company.email);
        setlocalTaxNo(company.localTaxNo);
        setpanNo(company.panNo);
        settinNo(company.tinNo);
        setautoGenerator(company.autoGenerator);
        setcostId(company.costId);
        setactive(company.active);
        setcreatedAt(company.createdAt);
        setgstNo(company.gstNo);
        setdisplayOrder(company.displayOrder);
        setshortKey(company.shortKey);
        settanNo(company.tanNo);
        setupDated(company.upDated);
        setupTime(company.upTime);
        setupdatedAt(company.updatedAt);
        setuserId(company.userId);


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

        setcompanyId("");
        setcompanyName("");
        setcompanyType("");
        setAddress1("");
        setAddress2("");
        setAddress3("");
        setAddress4("");
        setareaCode("");
        setphone("");
        setcstNo("");
        setemail("");
        setlocalTaxNo("");
        setpanNo("");
        settinNo("");
        setautoGenerator("");
        setcostId("");
        setactive("");
        setcreatedAt("");
        setgstNo("");
        setdisplayOrder("");
        setshortKey("");
        settanNo("");
        setupDated("");
        setupTime("");
        setupdatedAt("");
        setuserId("");
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
                >          {/* companyId */}

                    <input
                        type="text"
                        placeholder="CompanyId"
                        value={companyId}
                        onChange={(e) =>
                            setcompanyId(e.target.value)
                        }
                        className="rounded border p-3"
                        required
                    />


                    {/* companyNAME */}

                    <input
                        type="text"
                        placeholder="CompanyName"
                        value={companyName}
                        onChange={(e) =>
                            setcompanyName(e.target.value)
                        }
                        className="rounded border p-3"
                        required
                    />


                    {/* companyType */}

                    <input
                        type="text"
                        placeholder="companyType"
                        value={companyType}
                        onChange={(e) =>
                            setcompanyType(e.target.value)
                        }
                        className="rounded border p-3"
                        required
                    />
                    {/* companyAddress1 */}

                    <input
                        type="text"
                        placeholder="Address1"
                        value={Address1}
                        onChange={(e) =>
                            setAddress1(e.target.value)
                        }
                        className="rounded border p-3"
                        required
                    />
                    {/* companyAddress2 */}

                    <input
                        type="text"
                        placeholder="Address2"
                        value={Address2}
                        onChange={(e) =>
                            setAddress2(e.target.value)
                        }
                        className="rounded border p-3"
                        required
                    />
                    {/* companyAddress3 */}

                    <input
                        type="text"
                        placeholder="Address3"
                        value={Address3}
                        onChange={(e) =>
                            setAddress3(e.target.value)
                        }
                        className="rounded border p-3"
                        required
                    />
                    {/* companyAdress4*/}

                    <input
                        type="text"
                        placeholder="Address4"
                        value={Address4}
                        onChange={(e) =>
                            setAddress4(e.target.value)
                        }
                        className="rounded border p-3"
                        required
                    />
                    {/* companyareaCode */}

                    <input
                        type="text"
                        placeholder="areaCode"
                        value={areaCode}
                        onChange={(e) =>
                            setareaCode(e.target.value)
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
                    <input
                        type="text"
                        placeholder="cstNo"
                        value={cstNo}
                        onChange={(e) =>
                            setcstNo(e.target.value)
                        }
                        className="rounded border p-3"
                        required
                    />
                    <input
                        type="text"
                        placeholder="email"
                        value={email}
                        onChange={(e) =>
                            setemail(e.target.value)
                        }
                        className="rounded border p-3"
                        required
                    />
                    <input
                        type="text"
                        placeholder="localTaxNo"
                        value={localTaxNo}
                        onChange={(e) =>
                            setlocalTaxNo(e.target.value)
                        }
                        className="rounded border p-3"
                        required
                    />
                    <input
                        type="text"
                        placeholder="panNo"
                        value={panNo}
                        onChange={(e) =>
                            setpanNo(e.target.value)
                        }
                        className="rounded border p-3"
                        required
                    />
                    <input
                        type="text"
                        placeholder="tinNo"
                        value={tinNo}
                        onChange={(e) =>
                            settinNo(e.target.value)
                        }
                        className="rounded border p-3"
                        required
                    />
                    <input
                        type="text"
                        placeholder="autoGenerator"
                        value={autoGenerator}
                        onChange={(e) =>
                            setautoGenerator(e.target.value)
                        }
                        className="rounded border p-3"
                        required
                    />
                    <input
                        type="text"
                        placeholder="costId"
                        value={costId}
                        onChange={(e) =>
                            setcostId(e.target.value)
                        }
                        className="rounded border p-3"
                        required
                    />
                    <input
                        type="text"
                        placeholder="active"
                        value={active}
                        onChange={(e) =>
                            setactive(e.target.value)
                        }
                        className="rounded border p-3"
                        required
                    />
                    <input
                        type="text"
                        placeholder="createdAt"
                        value={createdAt}
                        onChange={(e) =>
                            setcreatedAt(e.target.value)
                        }
                        className="rounded border p-3"
                        required
                    />
                    <input
                        type="text"
                        placeholder="gstNo"
                        value={gstNo}
                        onChange={(e) =>
                            setgstNo(e.target.value)
                        }
                        className="rounded border p-3"
                        required
                    />
                    <input
                        type="text"
                        placeholder="displayOrder"
                        value={displayOrder}
                        onChange={(e) =>
                            setdisplayOrder(e.target.value)
                        }
                        className="rounded border p-3"
                        required
                    />
                    <input
                        type="text"
                        placeholder="shortKey"
                        value={shortKey}
                        onChange={(e) =>
                            setshortKey(e.target.value)
                        }
                        className="rounded border p-3"
                        required
                    />
                    <input
                        type="text"
                        placeholder="tanNo"
                        value={tanNo}
                        onChange={(e) =>
                            settanNo(e.target.value)
                        }
                        className="rounded border p-3"
                        required
                    />
                    <input
                        type="text"
                        placeholder="upDated"
                        value={upDated}
                        onChange={(e) =>
                            setupDated(e.target.value)
                        }
                        className="rounded border p-3"
                        required
                    />
                    <input
                        type="text"
                        placeholder="upTime"
                        value={upTime}
                        onChange={(e) =>
                            setupTime(e.target.value)
                        }
                        className="rounded border p-3"
                        required
                    />
                    <input
                        type="text"
                        placeholder="updatedAt"
                        value={updatedAt}
                        onChange={(e) =>
                            setupdatedAt(e.target.value)
                        }
                        className="rounded border p-3"
                        required
                    />
                    <input
                        type="text"
                        placeholder="userId"
                        value={userId}
                        onChange={(e) =>
                            setuserId(e.target.value)
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
                                       campanyID
                                    </th>

                                    <th className="border p-3 text-left">
                                        CompanyName
                                    </th>

                                    <th className="border p-3 text-left">
                                       campanyType
                                    </th>
                                    <th className="border p-3 text-left">
                                        Address1
                                    </th>
                                    <th className="border p-3 text-left">
                                        Address2
                                    </th>
                                    <th className="border p-3 text-left">
                                        Address3
                                    </th>
                                    <th className="border p-3 text-left">
                                        Address4
                                    </th>
                                    <th className="border p-3 text-left">
                                        areaCode
                                    </th>
                                    <th className="border p-3 text-left">
                                        phone
                                    </th>

                                    <th className="border p-3 text-left">
                                        cstNo
                                    </th>

                                    <th className="border p-3 text-center">
                                        email
                                    </th>
                                    <th className="border p-3 text-center">
                                        localTaxNo
                                    </th>
                                    <th className="border p-3 text-center">
                                        panNo
                                    </th>
                                    <th className="border p-3 text-center">
                                        tinNo
                                    </th>
                                    <th className="border p-3 text-center">
                                        autoGenerator
                                    </th>
                                    <th className="border p-3 text-center">
                                        costId
                                    </th>
                                    <th className="border p-3 text-center">
                                       active
                                    </th>
                                    <th className="border p-3 text-center">
                                        createdAt
                                    </th>
                                    <th className="border p-3 text-center">
                                       gstNo
                                    </th>
                                    <th className="border p-3 text-center">
                                        displayOrder
                                    </th>
                                    <th className="border p-3 text-center">
                                       shortKey
                                    </th>
                                    <th className="border p-3 text-center">
                                       tanNo
                                    </th>
                                    <th className="border p-3 text-center">
                                        upDated
                                    </th>
                                    <th className="border p-3 text-center">
                                       upTime
                                    </th>
                                    <th className="border p-3 text-center">
                                        updatedAt
                                    </th>
                                    <th className="border p-3 text-center">
                                       userId
                                    </th>

                                </tr>

                            </thead>


                            <tbody>
                            
                                {companies.map((company) => (
                                    

                                    <tr key={company.companyId}>
                                       <td> {company.companyId}
                                       </td>

                                        <td className="border p-3">
                                            {company.companyName}
                                        </td>
                                        <td className="border p-3">
                                            {company.companyType}

                                        </td>
                                        <td className="border p-3">
                                            {company.address1}
                                        </td>
                                        <td className="border p-3">
                                            {company.address2}
                                        </td>
                                        <td className="border p-3">
                                            {company.address3}
                                        </td>
                                        <td className="border p-3">
                                            {company.address4}
                                        </td>
                                        <td className="border p-3">
                                            {company.areaCode}
                                        </td>
                                        <td className="border p-3">
                                            {company.phone}
                                        </td>
                                        <td className="border p-3">

                                            {company.cstNo}
                                        </td>
                                        <td className="border p-3">
                                            {company.email}
                                        </td>
                                        <td className="border p-3">
                                            {company.localTaxNo}
                                        </td>
                                        <td className="border p-3">
                                            {company.panNo}
                                        </td>
                                        <td className="border p-3">
                                            {company.tinNO}
                                        </td>
                                        
                                        <td className="border p-3">
                                            {company.autoGenerator}
                                        </td>
                                        <td className="border p-3">
                                            {company.costId}
                                        </td>
                                        <td className="border p-3">
                                            {company.active}
                                        </td>
                                        <td className="border p-3">
                                            {company.createdAt}
                                        </td>
                                        <td className="border p-3">
                                            {company.gstNo}
                                        </td>
                                        <td className="border p-3">
                                            {company.displayOrder}
                                        </td>
                                        <td className="border p-3">
                                            {company.shortKey}
                                        </td>
                                        <td className="border p-3">
                                            {company.tanNo}
                                        </td>
                                        <td className="border p-3">
                                            {company.upDated}
                                        </td>
                                        <td className="border p-3">
                                            {company.upTime}
                                        </td>
                                        <td className="border p-3">
                                            {company.updatedAt}
                                        </td>
                                        <td className="border p-3">
                                            {company.userId}
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