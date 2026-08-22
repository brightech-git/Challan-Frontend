"use client";

import { useEffect, useState, useCallback } from "react";

import {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../../services/companyServices";

// =========================================================
// INPUT COMPONENT
// =========================================================

const InputField = ({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  placeholder,
}) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder || `Enter ${label}`}
        required={required}
        disabled={disabled}
        className={`
                      w-full
                      rounded-lg
                      border
                      border-gray-300
                      bg-white
                      px-3
                      py-2.5
                      text-sm
                      text-gray-900
                      outline-none
                      transition
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-100
                      disabled:cursor-not-allowed
                      disabled:bg-gray-100
                      disabled:text-gray-500
                  `}
      />
    </div>
  );
};

export default function CompanyPage() {
  // =========================================================
  // COMPANY LIST
  // =========================================================

  const [companies, setCompanies] = useState([]);

  // =========================================================
  // FORM STATE
  // =========================================================

  const [companyId, setCompanyId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState("");

  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [address3, setAddress3] = useState("");
  const [address4, setAddress4] = useState("");

  const [areaCode, setAreaCode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [localTaxNo, setLocalTaxNo] = useState("");
  const [cstNo, setCstNo] = useState("");
  const [tinNo, setTinNo] = useState("");
  const [panNo, setPanNo] = useState("");
  const [tanNo, setTanNo] = useState("");
  const [gstNo, setGstNo] = useState("");

  const [autoGenerator, setAutoGenerator] = useState("");
  const [costId, setCostId] = useState("");
  const [active, setActive] = useState("");

  const [displayOrder, setDisplayOrder] = useState("");
  const [shortKey, setShortKey] = useState("");
  const [userId, setUserId] = useState("");

  // =========================================================
  // EDIT STATE
  // =========================================================

  const [editId, setEditId] = useState(null);

  // =========================================================
  // LOADING STATES
  // =========================================================

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // =========================================================
  // GET ALL COMPANIES
  // =========================================================

  const loadCompanies = useCallback(async () => {
    try {
      await Promise.resolve();
      setLoading(true);

      const response = await getCompanies();

      console.log("GET companies response:", response);

      if (response?.success) {
        setCompanies(response.data || []);
      } else {
        setCompanies([]);

        throw new Error(response?.message || "Failed to load companies");
      }
    } catch (error) {
      console.error("loadCompanies error:", error);

      alert(error?.message || "Failed to load companies");
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================================================
  // LOAD COMPANIES WHEN PAGE OPENS
  // =========================================================

  useEffect(() => {
    (async () => {
      await loadCompanies();
    })();
  }, [loadCompanies]);

  // =========================================================
  // CONVERT EMPTY VALUES TO NULL
  // =========================================================

  const valueOrNull = (value) => {
    if (value === undefined || value === null || String(value).trim() === "") {
      return null;
    }

    return value;
  };

  // =========================================================
  // SAVE COMPANY
  // POST / PUT
  // =========================================================

  const saveCompany = async (e) => {
    e.preventDefault();

    // Basic validation
    // if (!companyId.trim()) {

    //     alert("Please enter Company ID");
    //     return;

    // }

    // if (!companyName.trim()) {

    //     alert("Please enter Company Name");
    //     return;

    // }

    // if (!companyType.trim()) {

    //     alert("Please enter Company Type");
    //     return;

    // }

    // =====================================================
    // REQUEST BODY
    // =====================================================

    const company = {
      companyId: companyId.trim(),

      companyName: companyName.trim(),

      companyType: companyType.trim(),

      address1: valueOrNull(address1),
      address2: valueOrNull(address2),
      address3: valueOrNull(address3),
      address4: valueOrNull(address4),

      areaCode: valueOrNull(areaCode),
      phone: valueOrNull(phone),
      email: valueOrNull(email),

      localTaxNo: valueOrNull(localTaxNo),
      cstNo: valueOrNull(cstNo),
      tinNo: valueOrNull(tinNo),
      panNo: valueOrNull(panNo),
      tanNo: valueOrNull(tanNo),
      gstNo: valueOrNull(gstNo),

      autoGenerator: valueOrNull(autoGenerator),
      costId: valueOrNull(costId),
      active: valueOrNull(active),

      displayOrder: valueOrNull(displayOrder),
      shortKey: valueOrNull(shortKey),
      userId: valueOrNull(userId),
    };

    console.log("Company request body:", company);

    try {
      setSaving(true);

      // =================================================
      // UPDATE
      // =================================================

      if (editId) {
        const response = await updateCompany(editId, company);

        console.log("Update company response:", response);

        alert(response?.message || "Company updated successfully");
      }

      // =================================================
      // CREATE
      // =================================================
      else {
        const response = await createCompany(company);

        console.log("Create company response:", response);

        alert(response?.message || "Company created successfully");
      }

      // =================================================
      // CLEAR FORM
      // =================================================

      clearForm();

      // =================================================
      // RELOAD LIST
      // =================================================

      await loadCompanies();
    } catch (error) {
      console.error("saveCompany error:", error);

      alert(error?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // EDIT COMPANY
  // =========================================================

  const handleEditCompany = (company) => {
    console.log("Editing company:", company);

    setEditId(company.companyId);

    setCompanyId(company.companyId || "");
    setCompanyName(company.companyName || "");
    setCompanyType(company.companyType || "");

    setAddress1(company.address1 || "");
    setAddress2(company.address2 || "");
    setAddress3(company.address3 || "");
    setAddress4(company.address4 || "");

    setAreaCode(company.areaCode || "");
    setPhone(company.phone || "");
    setEmail(company.email || "");

    setLocalTaxNo(company.localTaxNo || "");
    setCstNo(company.cstNo || "");
    setTinNo(company.tinNo || "");
    setPanNo(company.panNo || "");
    setTanNo(company.tanNo || "");
    setGstNo(company.gstNo || "");

    setAutoGenerator(company.autoGenerator || "");

    setCostId(company.costId || "");

    setActive(company.active ?? "");

    setDisplayOrder(company.displayOrder || "");

    setShortKey(company.shortKey || "");

    setUserId(company.userId || "");

    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // DELETE COMPANY
  // =========================================================

  const removeCompany = async (id) => {
    if (!id) {
      alert("Company ID is missing");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this company?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeleting(id);

      const response = await deleteCompany(id);

      console.log("Delete company response:", response);

      alert(response?.message || "Company deleted successfully");

      // If deleted company was being edited
      if (editId === id) {
        clearForm();
      }

      await loadCompanies();
    } catch (error) {
      console.error("removeCompany error:", error);

      alert(error?.message || "Failed to delete company");
    } finally {
      setDeleting(null);
    }
  };

  // =========================================================
  // CLEAR FORM
  // =========================================================

  const clearForm = () => {
    setCompanyId("");
    setCompanyName("");
    setCompanyType("");

    setAddress1("");
    setAddress2("");
    setAddress3("");
    setAddress4("");

    setAreaCode("");
    setPhone("");
    setEmail("");

    setLocalTaxNo("");
    setCstNo("");
    setTinNo("");
    setPanNo("");
    setTanNo("");
    setGstNo("");

    setAutoGenerator("");
    setCostId("");
    setActive("");

    setDisplayOrder("");
    setShortKey("");
    setUserId("");

    setEditId(null);
  };

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-8">
      {/* =================================================
                PAGE HEADER
            ================================================= */}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Company</h1>

        <p className="mt-1 text-sm text-gray-500">
          Create, update and manage companies
        </p>
      </div>

      {/* =================================================
                CREATE / UPDATE FORM
            ================================================= */}

      <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {editId ? "Update Company" : "Create Company"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {editId
                ? "Update the company details below."
                : "Enter the company details below."}
            </p>
          </div>

          {editId && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              Editing: {editId}
            </span>
          )}
        </div>

        <form onSubmit={saveCompany} className="space-y-8">
          {/* =================================================
                        BASIC INFORMATION
                    ================================================= */}

          <div>
            <h3 className="mb-4 border-b pb-2 text-sm font-semibold uppercase tracking-wide text-gray-700">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <InputField
                label="Company ID"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                required
                disabled={!!editId}
              />

              <InputField
                label="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />

              <InputField
                label="Company Type"
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value)}
                required
                placeholder="FROM"
              />
            </div>
          </div>

          {/* =================================================
                        ADDRESS
                    ================================================= */}

          <div>
            <h3 className="mb-4 border-b pb-2 text-sm font-semibold uppercase tracking-wide text-gray-700">
              Address
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="Address 1"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
              />

              <InputField
                label="Address 2"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
              />

              <InputField
                label="Address 3"
                value={address3}
                onChange={(e) => setAddress3(e.target.value)}
              />

              <InputField
                label="Address 4"
                value={address4}
                onChange={(e) => setAddress4(e.target.value)}
              />

              <InputField
                label="Area Code"
                value={areaCode}
                onChange={(e) => setAreaCode(e.target.value)}
              />
            </div>
          </div>

          {/* =================================================
                        CONTACT
                    ================================================= */}

          <div>
            <h3 className="mb-4 border-b pb-2 text-sm font-semibold uppercase tracking-wide text-gray-700">
              Contact Information
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <InputField
                label="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
              />

              <InputField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
            </div>
          </div>

          {/* =================================================
                        TAX INFORMATION
                    ================================================= */}

          <div>
            <h3 className="mb-4 border-b pb-2 text-sm font-semibold uppercase tracking-wide text-gray-700">
              Tax Information
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <InputField
                label="CST No"
                value={cstNo}
                onChange={(e) => setCstNo(e.target.value)}
              />

              <InputField
                label="Local Tax No"
                value={localTaxNo}
                onChange={(e) => setLocalTaxNo(e.target.value)}
              />

              <InputField
                label="TIN No"
                value={tinNo}
                onChange={(e) => setTinNo(e.target.value)}
              />

              <InputField
                label="PAN No"
                value={panNo}
                onChange={(e) => setPanNo(e.target.value)}
              />

              <InputField
                label="TAN No"
                value={tanNo}
                onChange={(e) => setTanNo(e.target.value)}
              />

              <InputField
                label="GST No"
                value={gstNo}
                onChange={(e) => setGstNo(e.target.value)}
              />
            </div>
          </div>

          {/* =================================================
                        SYSTEM INFORMATION
                    ================================================= */}

          <div>
            <h3 className="mb-4 border-b pb-2 text-sm font-semibold uppercase tracking-wide text-gray-700">
              System Information
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <InputField
                label="Cost ID"
                value={costId}
                onChange={(e) => setCostId(e.target.value)}
              />

              <InputField
                label="Auto Generator"
                value={autoGenerator}
                onChange={(e) => setAutoGenerator(e.target.value)}
              />

              <InputField
                label="Active"
                value={active}
                onChange={(e) => setActive(e.target.value)}
                placeholder="1 / 0"
              />

              <InputField
                label="Display Order"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                type="number"
              />

              <InputField
                label="Short Key"
                value={shortKey}
                onChange={(e) => setShortKey(e.target.value)}
              />

              <InputField
                label="User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
          </div>

          {/* =================================================
                        BUTTONS
                    ================================================= */}

          <div className="flex flex-wrap gap-3 border-t pt-5">
            <button
              type="submit"
              disabled={saving}
              className="
                                rounded-lg
                                bg-blue-600
                                px-6
                                py-2.5
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:bg-blue-700
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
            >
              {saving
                ? "Saving..."
                : editId
                  ? "Update Company"
                  : "Create Company"}
            </button>

            <button
              type="button"
              onClick={clearForm}
              disabled={saving}
              className="
                                rounded-lg
                                border
                                border-gray-300
                                bg-white
                                px-6
                                py-2.5
                                text-sm
                                font-semibold
                                text-gray-700
                                transition
                                hover:bg-gray-50
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
            >
              {editId ? "Cancel" : "Clear"}
            </button>
          </div>
        </form>
      </div>

      {/* =================================================
                COMPANY LIST
            ================================================= */}

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Company List</h2>

            <p className="mt-1 text-sm text-gray-500">
              {companies.length} company
              {companies.length !== 1 ? "ies" : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={loadCompanies}
            disabled={loading}
            className="
                            rounded-lg
                            border
                            border-gray-300
                            bg-white
                            px-4
                            py-2
                            text-sm
                            font-medium
                            text-gray-700
                            hover:bg-gray-50
                            disabled:opacity-50
                        "
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* =================================================
                    LOADING
                ================================================= */}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-sm text-gray-500">Loading companies...</div>
          </div>
        ) : companies.length === 0 ? (
          /* =================================================
                       EMPTY
                    ================================================= */

          <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center">
            <p className="font-medium text-gray-600">No companies found.</p>

            <p className="mt-1 text-sm text-gray-400">
              Create a company using the form above.
            </p>
          </div>
        ) : (
          /* =================================================
                       TABLE
                    ================================================= */

          <div className="overflow-x-auto">
            <table className="min-w-[2200px] w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-left text-sm font-semibold">
                    Company ID
                  </th>

                  <th className="border p-3 text-left text-sm font-semibold">
                    Company Name
                  </th>

                  <th className="border p-3 text-left text-sm font-semibold">
                    Company Type
                  </th>

                  <th className="border p-3 text-left text-sm font-semibold">
                    Address 1
                  </th>

                  <th className="border p-3 text-left text-sm font-semibold">
                    Address 2
                  </th>

                  <th className="border p-3 text-left text-sm font-semibold">
                    Address 3
                  </th>

                  <th className="border p-3 text-left text-sm font-semibold">
                    Address 4
                  </th>

                  <th className="border p-3 text-left text-sm font-semibold">
                    Area Code
                  </th>

                  <th className="border p-3 text-left text-sm font-semibold">
                    Phone
                  </th>

                  <th className="border p-3 text-left text-sm font-semibold">
                    Email
                  </th>

                  <th className="border p-3 text-left text-sm font-semibold">
                    CST No
                  </th>

                  <th className="border p-3 text-left text-sm font-semibold">
                    Local Tax No
                  </th>

                  <th className="border p-3 text-left text-sm font-semibold">
                    PAN No
                  </th>

                  <th className="border p-3 text-left text-sm font-semibold">
                    TIN No
                  </th>

                  <th className="border p-3 text-left text-sm font-semibold">
                    TAN No
                  </th>

                  <th className="border p-3 text-left text-sm font-semibold">
                    GST No
                  </th>

                  <th className="border p-3 text-left text-sm font-semibold">
                    Auto Generator
                  </th>

                  <th className="border p-3 text-left text-sm font-semibold">
                    Cost ID
                  </th>

                  <th className="border p-3 text-left text-sm font-semibold">
                    Active
                  </th>

                  <th className="border p-3 text-left text-sm font-semibold">
                    Display Order
                  </th>

                  <th className="border p-3 text-left text-sm font-semibold">
                    Short Key
                  </th>

                  <th className="border p-3 text-left text-sm font-semibold">
                    User ID
                  </th>

                  <th className="sticky right-0 border bg-gray-100 p-3 text-center text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {companies.map((company) => (
                  <tr key={company.companyId} className="hover:bg-gray-50">
                    <td className="border p-3 text-sm font-medium">
                      {company.companyId ?? "-"}
                    </td>

                    <td className="border p-3 text-sm">
                      {company.companyName ?? "-"}
                    </td>

                    <td className="border p-3 text-sm">
                      {company.companyType ?? "-"}
                    </td>

                    <td className="border p-3 text-sm">
                      {company.address1 ?? "-"}
                    </td>

                    <td className="border p-3 text-sm">
                      {company.address2 ?? "-"}
                    </td>

                    <td className="border p-3 text-sm">
                      {company.address3 ?? "-"}
                    </td>

                    <td className="border p-3 text-sm">
                      {company.address4 ?? "-"}
                    </td>

                    <td className="border p-3 text-sm">
                      {company.areaCode ?? "-"}
                    </td>

                    <td className="border p-3 text-sm">
                      {company.phone ?? "-"}
                    </td>

                    <td className="border p-3 text-sm">
                      {company.email ?? "-"}
                    </td>

                    <td className="border p-3 text-sm">
                      {company.cstNo ?? "-"}
                    </td>

                    <td className="border p-3 text-sm">
                      {company.localTaxNo ?? "-"}
                    </td>

                    <td className="border p-3 text-sm">
                      {company.panNo ?? "-"}
                    </td>

                    <td className="border p-3 text-sm">
                      {company.tinNo ?? "-"}
                    </td>

                    <td className="border p-3 text-sm">
                      {company.tanNo ?? "-"}
                    </td>

                    <td className="border p-3 text-sm">
                      {company.gstNo ?? "-"}
                    </td>

                    <td className="border p-3 text-sm">
                      {company.autoGenerator ?? "-"}
                    </td>

                    <td className="border p-3 text-sm">
                      {company.costId ?? "-"}
                    </td>

                    <td className="border p-3 text-sm">
                      {company.active ?? "-"}
                    </td>

                    <td className="border p-3 text-sm">
                      {company.displayOrder ?? "-"}
                    </td>

                    <td className="border p-3 text-sm">
                      {company.shortKey ?? "-"}
                    </td>

                    <td className="border p-3 text-sm">
                      {company.userId ?? "-"}
                    </td>

                    {/* =================================================
                                            ACTIONS
                                        ================================================= */}

                    <td className="sticky right-0 border bg-white p-3">
                      <div className="flex justify-center gap-2">
                        {/* EDIT */}

                        <button
                          type="button"
                          onClick={() => handleEditCompany(company)}
                          disabled={deleting === company.companyId}
                          className="
                                                        rounded-lg
                                                        bg-green-600
                                                        px-4
                                                        py-2
                                                        text-sm
                                                        font-medium
                                                        text-white
                                                        hover:bg-green-700
                                                        disabled:opacity-50
                                                    "
                        >
                          Edit
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() => removeCompany(company.companyId)}
                          disabled={deleting === company.companyId}
                          className="
                                                        rounded-lg
                                                        bg-red-600
                                                        px-4
                                                        py-2
                                                        text-sm
                                                        font-medium
                                                        text-white
                                                        hover:bg-red-700
                                                        disabled:cursor-not-allowed
                                                        disabled:opacity-50
                                                    "
                        >
                          {deleting === company.companyId
                            ? "Deleting..."
                            : "Delete"}
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
