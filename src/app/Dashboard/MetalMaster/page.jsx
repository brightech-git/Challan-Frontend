"use client";

import { useEffect, useState, useCallback } from "react";
import { getAllMetal, getByMetalId, updateMetal, createMetal } from "../../../services/metalServices";
import { FaEdit, FaTrash } from "react-icons/fa";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/metalmast`;

export default function MetalMaster() {

  const [metal, setMetal] = useState([]);
  const [loggeduserId, setLoggedUserId] = useState("");
  const [editMetalId, setEditMetalId] = useState("")

  const [formData, setFormData] = useState({
    metalId: "",
    metalName: "",
    active: "",
    tType: "",
  });


  const [message, setMessage] = useState("");
 
  useEffect(() => {
    const loggedUser = localStorage.getItem("user");
    const loggedUserData = loggedUser ? JSON.parse(loggedUser) : null;

    setLoggedUserId(loggedUserData?.userId || "");
  }, []);

  const loadMetal = useCallback(async () => {
    try {
      const response = await getAllMetal();
      setMetal(response?.data || response || []);
    } catch (error) {
      console.error("Error loading users:", error);
      setMessage("Failed to load users");
    }
  }, []);

  useEffect(() => {
    loadMetal();
  }, [loadMetal]);

  // Input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add user
  const handleAddMetal = async (e) => {
    e.preventDefault();
    const newMetal = {
      metalId: formData.metalId,
      metalName: formData.metalName,
      active: formData.active,
       tType: formData.tType,
    };

    try {
      if (editMetalId) {
        const response = await updateMetal(editMetalId, newMetal,loggeduserId);

        console.log("Update company response:", response);

        alert(response?.message || "metal updated successfully");
      }
      else {

        await createMetal(newMetal, loggeduserId);

        setMessage("Metal created successfully");


      } 
      resetForm();
      console.log("Retform Called",resetForm)
      loadMetal();
    }
    catch (error) {
      console.error("Error creating metal:", error);
      setMessage(error.message || "Failed to create metal");
    }
  };

  // Reset form
const resetForm = () => {
  setFormData({
    metalId: "",
    metalName: "",
    active: "",
    tType: "",
  });

  setEditMetalId("");
};

  const handleEdit = async (metalId) => {
    try {
      const response = await getByMetalId(metalId);


      const metal = response?.data || response;

      setEditMetalId(metal.metalId)

      console.log("Edit Get By Id", metal)

      setFormData({
        metalId: metal.metalId,
        metalName: metal.metalName,
        active: metal.active,
        tType: metal.tType,
      });

      console.log("editing metal", formData)

    } catch (error) {
      console.error("Error getting user:", error);
      setMessage("Failed to get user");
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <h1 className="mb-6 text-2xl font-bold">
        Metal Master
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        <div className="rounded-lg bg-white p-6 shadow">

          <h2 className="mb-4 text-xl font-semibold">
           {editMetalId ? "Edit Metal" : "Add Metal"}
          </h2>

          <form onSubmit={handleAddMetal}>

            <div className="mb-4">
              <label className="mb-1 block font-medium">
                MetalID
              </label>

              <input
                type="text"
                name="metalId"
                value={formData.metalId}
                onChange={handleChange}
                // disabled={editId !== null}
                className="w-full rounded border p-2"
              />
            </div>


            <div className="mb-4">
              <label className="mb-1 block font-medium">
                MetalName
              </label>

              <input
                type="text"
                name="metalName"
                value={formData.metalName}
                onChange={handleChange}
                className="w-full rounded border p-2"
                placeholder="Enter Metal Name"
              />
            </div>
            <div className="mb-4">
              <label className="mb-1 block font-medium">
                Active
              </label>

              <select
                name="active"
                value={formData.active}
                onChange={handleChange}
                className="w-full rounded border p-2"
              >
                <option value="">
                  Select Active
                </option>

                <option value="true">
                  Yes
                </option>

                <option value="false">
                  No
                </option>
              </select>
            </div>

            <div className="mb-4">
              <label className="mb-1 block font-medium">
                tType
              </label>

              <input
                type="text"
                name="tType"
                value={formData.tType}
                onChange={handleChange}
                className="w-full rounded border p-2"
                placeholder="Enter tType"
              />


            </div>

            <div className="flex gap-3">

              <button
                type="submit"
                className="rounded bg-blue-600 px-5 py-2 text-white"
              >
                Save
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded bg-gray-500 px-5 py-2 text-white"
              >
                Clear
              </button>

            </div>

            {message && (
              <p className="mt-4 rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                {message}
              </p>
            )}

          </form>
        </div>


        <div className="rounded-lg bg-white p-6 shadow">

          <div className="mb-4 flex items-center justify-between">

            <h2 className="text-xl font-semibold">
              MetalList
            </h2>

            {/* <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Searching...."
              className="rounded border p-2"
            /> */}

          </div>
          <div className="overflow-x-auto">

            <table className="w-full border-collapse border">

              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">
                    MetalID  </th>
                  <th className="border p-2">
                    MetalName  </th>
                  <th className="border p-2">
                    Active</th>
                  <th className="border p-2">
                    tType</th>
                  <th className="border p-2">
                    Action</th>
                </tr>
              </thead>

              <tbody>

                {metal.length === 0 ? (

                  <tr>
                    <td
                      colSpan="5"
                      className="border p-4 text-center"
                    >
                      No metals found
                    </td>
                  </tr>

                ) : (

                  metal.map((item) => (

                    <tr key={item.metalId}>

                      <td className="border p-2">
                        {item.metalId}
                      </td>

                      <td className="border p-2">
                        {item.metalName}
                      </td>

                      <td className="border p-2">
                        {item.active === "true"
                          ? "Yes"
                          : "No"}
                      </td>

                      <td className="border p-2">
                        {item.tType}
                      </td>


                      {/* =================================================
                                            ACTIONS
                                        ================================================= */}

                      <td className="sticky right-0 border bg-white p-3">
                        <div className="flex justify-center gap-2">
                          {/* EDIT */}

                          <button
                            type="button"
                            onClick={() => handleEdit(item.metalId)}
                          // disabled={deleting === metal.metalId}
                          //                        className="
                          //                               rounded-lg
                          //                               bg-green-600
                          //                               px-4
                          //                               py-2
                          //                               text-sm
                          //                               font-medium
                          //                               text-white
                          //                               hover:bg-green-700
                          //                               disabled:opacity-50
                          //                           "
                          >
                            <FaEdit size={14} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );


}