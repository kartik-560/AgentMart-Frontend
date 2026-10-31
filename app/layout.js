import './globals.css';
import Sidebar from '../components/shared/Sidebar';
import Navbar from '../components/shared/Navbar';
import { SocketProvider } from '../context/SocketContext';
import { BusinessProvider } from '../context/BusinessContext';

export const metadata = {
  title: 'AgentMart - Autonomous B2B Marketplace',
  description: 'Multi-Agent Autonomous Procurement with Deterministic Trust Engine & Human-in-the-Loop Settlement',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 flex min-h-screen">
        <SocketProvider>
          <BusinessProvider>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
              <Navbar />
              <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
                {children}
              </main>
            </div>
          </BusinessProvider>
        </SocketProvider>
      </body>
    </html>
  );
}

