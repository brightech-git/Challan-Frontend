"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {

    const router = useRouter();

    useEffect(() => {

        const login = localStorage.getItem("login");

        if (login !== "true") {
            router.push("/login");
        }

    }, []);

    const logout = () => {

        // localStorage.removeItem("login");

        router.push("/company");
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center">

            <h1 className="mb-4 text-4xl font-bold">
                Dashboard
            </h1>

            <p className="mb-4">
                Welcome to Dashboard
            </p>

            <button
                onClick={logout}
                className="rounded bg-red-500 px-6 py-2 text-white"
            >
                Logout
            </button>

        </div>
    );
}