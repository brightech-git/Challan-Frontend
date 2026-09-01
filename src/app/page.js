"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {

    const router = useRouter();

    useEffect(() => {
      localStorage.clear();
        const login = localStorage.getItem("login");
        if (login !== "true") {
            router.replace("/LoginScreen");
        } else {
            router.replace("/Dashboard");
        }
    }, [router]);

    return null;
}
<style jsx>{`
        .dashboard {
          min-height: 100vh;
          padding: 30px;
          background-color: #f5f7fb;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }

        .dashboard h1 {
          font-size: 32px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 10px;
        }

        .dashboard p {
          font-size: 16px;
          color: #6b7280;
        }

        @media (max-width: 600px) {
          .dashboard {
            padding: 15px;
          }

          .dashboard h1 {
            font-size: 26px;
          }
        }
      `}</style>
    