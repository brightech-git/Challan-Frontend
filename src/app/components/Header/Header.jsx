"use client";
export default function Header() {
  return (
    <header
      style={{
        height: "64px",
        backgroundColor: "blue",
        borderBottom: "1px solid #e5e7eb",

        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",

        paddingLeft: "24px",
        paddingRight: "24px",

        position: "fixed",
        top: 0,
        left: 0,
        right: 0,

        zIndex: 1000,
      }}
    >
      <div>
        <h1
          style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "white",
            margin: 0,
          }}
        >
          CHALLAN PROJECT
        </h1>
      </div>
    </header>
  );
}