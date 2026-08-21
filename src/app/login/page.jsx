"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const login = async (e) => {
        e.preventDefault();

        if (username === "ADMIN" && password === "123456") {
            localStorage.setItem("login", "true");

            router.push("/");
        } else {
            alert("Invalid username or password");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center">

            <form
                onSubmit={login}
                className="w-96 rounded-lg bg-white p-6 shadow"
            >

                <h1 className="mb-6 text-center text-3xl font-bold">
                    Login
                </h1>

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mb-4 w-full rounded border p-2"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mb-4 w-full rounded border p-2"
                />

                <button
                    type="submit"
                    className="w-full rounded bg-blue-500 p-2 text-white"
                >
                    Login
                    
                </button>

            </form>

        </div>
    );
}