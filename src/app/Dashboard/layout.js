import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <Header />

                <div className="fixed">
                    <Sidebar />
                </div>

                <main className="ml-64 p-6 min-h-screen">
                    {children}
                </main>
            </body>
        </html>
    );
}