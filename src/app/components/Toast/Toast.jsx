"use client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useEffect } from "react";
import {Sidebar } from "react";
import{login} from "react";
import{logout} from "react";
export default function Toast({
  message,
  type = "successfully vaild",
  onClose,
}) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const isSuccess = type === "successfully vaild";

  return (
    <div
      className={`toast-container ${
        isSuccess ? "toast-success" : "toast-error"
      }`}
    >
      <div className="toast-icon">
        {isSuccess ? <FaCheckCircle /> : <FaTimesCircle />}
      </div>

      <div className="toast-content">
        <strong>
          {isSuccess ? "Success" : "Error"}
        </strong>

        <p>{message}</p>
      </div>

      <button
        type="button"
        className="toast-close"
        onClick={onClose}
      >
        <FaTimes />
      </button>

      <style jsx>{`
        .toast-container {
          position: fixed;
          right: 25px;
          bottom: 25px;
          z-index: 9999;

          min-width: 320px;
          max-width: 420px;

          display: flex;
          align-items: center;
          gap: 12px;

          padding: 14px 16px;

          border-radius: 10px;

          box-shadow:
            0 10px 25px rgba(0, 0, 0, 0.15);

          animation: slideIn 0.3s ease;
        }

        .toast-success {
          background: #ecfdf5;
          border: 1px solid #86efac;
          color: #166534;
        }

        .toast-error {
          background: #fef2f2;
          border: 1px solid #fca5a5;
          color: #991b1b;
        }

        .toast-icon {
          font-size: 22px;
          display: flex;
          align-items: center;
        }

        .toast-content {
          flex: 1;
        }

        .toast-content strong {
          display: block;
          font-size: 14px;
          margin-bottom: 2px;
        }

        .toast-content p {
          margin: 0;
          font-size: 13px;
        }

        .toast-close {
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 14px;
          opacity: 0.7;
          padding: 5px;
        }

        .toast-close:hover {
          opacity: 1;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }

          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (max-width: 500px) {
          .toast-container {
            left: 15px;
            right: 15px;
            bottom: 15px;
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
}