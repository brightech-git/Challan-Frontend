
"use client";

import { useEffect, useState, useCallback } from "react";
import { getAll,createUser,getUserById } from "../../../services/authServices";

export default function UserMaster() {
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    userId: "",
    name: "",
    password: "",
    createdBy: "",
  });

  const [editingUserId, setEditingUserId] = useState(null);
  const [message, setMessage] = useState("");

  // Get all users
  const loadUsers = useCallback(async () => {
    try {
      const response = await getAll();

      setUsers(response?.data || response || []);
    } catch (error) {
      console.error("Error loading users:", error);
      setMessage("Failed to load users");
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add user
  const handleAddUser = async (e) => {
    e.preventDefault();

    try {
      const newUser = {
        userId: formData.userId,
        name: formData.name,
        password: formData.password,
        createdBy: formData.createdBy,
      };

      await createUser(newUser);

      setMessage("User created successfully");

      resetForm();
      loadUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      setMessage("Failed to create user");
    }
  };

  // Edit user
  const handleEdit = async (userId) => {
    try {
      const response = await getUserById(userId);

      const user = response?.data || response;

      setFormData({
        userId: user.userId || "",
        name: user.name || "",
        password: user.password || "",
        createdBy: user.createdBy || "",
      });

      setEditingUserId(userId);
      setMessage("");
    } catch (error) {
      console.error("Error getting user:", error);
      setMessage("Failed to get user");
    }
  };

  // Update user
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const updatedUser = {
        userId: formData.userId,
        name: formData.name,
        password: formData.password,
        createdAt: formData.createdAt,
        createdBy: formData.createdBy,
        updatedAt: new Date().toISOString(),
      };

      await addlogin(formData.userId, updatedUser);

      setMessage("User updated successfully");

      resetForm();
      loadUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      setMessage("Failed to update user");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      userId: "",
      name: "",
      password: "",
      createdBy: "",
    });

    setEditingUserId(null);
  };

  return (
    <>
      <div className="user-page">
        <div className="user-container">

          {/* LEFT SIDE - USER LIST */}
          <div className="user-list">
            <div className="list-header">
              <h2>Existing Users</h2>
              <span className="user-count">
                {users.length} Users
              </span>
            </div>

            {users.length === 0 ? (
              <div className="empty-message">
                <p>No users available.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Name</th>
                      <th>Created By</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr key={user.userId}>
                        <td>{user.userId}</td>
                        <td>{user.name}</td>
                        <td>{user.createdBy}</td>

                        <td>
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(user.userId)
                            }
                            className="edit-button"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* RIGHT SIDE - FORM */}
          <div className="user-form">
            <div className="form-header">
              <h2>
                {editingUserId
                  ? "Edit User"
                  : "Create User"}
              </h2>

              <p>
                {editingUserId
                  ? "Update user information"
                  : "Enter user information"}
              </p>
            </div>

            <form
              onSubmit={
                editingUserId
                  ? handleUpdate
                  : handleAddUser
              }
            >

              <div className="form-group">
                <label>User ID</label>

                <input
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  disabled={!!editingUserId}
                  required
                  placeholder="Enter User ID"
                />
              </div>

              <div className="form-group">
                <label>Name</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter Name"
                />
              </div>

              <div className="form-group">
                <label>Password</label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!editingUserId}
                  placeholder="Enter Password"
                />
              </div>

              <div className="form-group">
                <label>Created By</label>

                <input
                  type="text"
                  name="createdBy"
                  value={formData.createdBy}
                  onChange={handleChange}
                  placeholder="Enter Created By"
                />
              </div>

              <div className="button-group">

                <button
                  type="submit"
                  className="primary-button"
                >
                  {editingUserId
                    ? "Update User"
                    : "Create User"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="clear-button"
                >
                  Clear
                </button>

              </div>
            </form>

            {message && (
              <p className="message">
                {message}
              </p>
            )}
          </div>

        </div>
      </div>

      {/* =========================================
          INTERNAL CSS
      ========================================= */}

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .user-page {
          min-height: 100vh;
          background: #f5f7fb;
          padding: 40px 30px;
          font-family: Arial, Helvetica, sans-serif;
        }

        .user-container {
          width: 100%;
          max-width: 1250px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 25px;
          align-items: start;
        }

        /* ================================
           USER LIST
        ================================= */

        .user-list {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .list-header h2 {
          margin: 0;
          font-size: 23px;
          color: #111827;
          font-weight: 700;
        }

        .user-count {
          background: #eff6ff;
          color: #2563eb;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }

        .empty-message {
          padding: 50px 20px;
          text-align: center;
          color: #6b7280;
        }

        /* ================================
           TABLE
        ================================= */

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 550px;
        }

        th {
          background: #f8fafc;
          color: #374151;
          padding: 14px;
          text-align: left;
          font-size: 13px;
          font-weight: 700;
          border-bottom: 2px solid #e5e7eb;
        }

        td {
          padding: 14px;
          color: #4b5563;
          font-size: 14px;
          border-bottom: 1px solid #e5e7eb;
        }

        tbody tr {
          transition: 0.2s;
        }

        tbody tr:hover {
          background: #f9fafb;
        }

        /* ================================
           EDIT BUTTON
        ================================= */

        .edit-button {
          border: none;
          background: #2563eb;
          color: white;
          padding: 8px 17px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }

        .edit-button:hover {
          background: #1d4ed8;
        }

        /* ================================
           FORM
        ================================= */

        .user-form {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 28px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
        }

        .form-header {
          margin-bottom: 25px;
          padding-bottom: 18px;
          border-bottom: 1px solid #e5e7eb;
        }

        .form-header h2 {
          margin: 0 0 6px;
          font-size: 23px;
          color: #111827;
        }

        .form-header p {
          margin: 0;
          color: #6b7280;
          font-size: 13px;
        }

        /* ================================
           INPUTS
        ================================= */

        .form-group {
          margin-bottom: 18px;
        }

        .form-group label {
          display: block;
          margin-bottom: 7px;
          color: #374151;
          font-size: 14px;
          font-weight: 600;
        }

        .form-group input {
          width: 100%;
          height: 43px;
          padding: 0 13px;
          border: 1px solid #d1d5db;
          border-radius: 7px;
          background: white;
          color: #111827;
          font-size: 14px;
          outline: none;
          transition: 0.2s;
        }

        .form-group input::placeholder {
          color: #9ca3af;
        }

        .form-group input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }

        .form-group input:disabled {
          background: #f3f4f6;
          color: #6b7280;
          cursor: not-allowed;
        }

        /* ================================
           BUTTONS
        ================================= */

        .button-group {
          display: flex;
          gap: 12px;
          margin-top: 25px;
        }

        .button-group button {
          flex: 1;
          height: 43px;
          border-radius: 7px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }

        .primary-button {
          border: none;
          background: #2563eb;
          color: white;
        }

        .primary-button:hover {
          background: #1d4ed8;
        }

        .clear-button {
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .clear-button:hover {
          background: #f3f4f6;
        }

        /* ================================
           MESSAGE
        ================================= */

        .message {
          margin-top: 18px;
          padding: 12px 14px;
          border-radius: 7px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1d4ed8;
          font-size: 14px;
          font-weight: 500;
        }

        /* ================================
           RESPONSIVE
        ================================= */

        @media (max-width: 900px) {
          .user-container {
            grid-template-columns: 1fr;
          }

          .user-list {
            order: 2;
          }

          .user-form {
            order: 1;
          }
        }

        @media (max-width: 600px) {
          .user-page {
            padding: 20px 12px;
          }

          .user-list,
          .user-form {
            padding: 18px;
          }

          .list-header {
            align-items: flex-start;
            gap: 10px;
            flex-direction: column;
          }

          .button-group {
            flex-direction: column;
          }

          .button-group button {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}