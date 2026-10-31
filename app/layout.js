import './globals.css';
import Sidebar from '../components/shared/Sidebar';
import Navbar from '../components/shared/Navbar';
import ToastBanner from '../components/shared/ToastBanner';
import { SocketProvider } from '../context/SocketContext';
import { BusinessProvider } from '../context/BusinessContext';
import { UIProvider } from '../context/UIContext';

export const metadata = {
  title: 'AgentMart - Autonomous B2B Multi-Agent Marketplace',
  description:
    'Multi-Agent Procurement Platform powered by Google Gemini API with Deterministic Safety Boundaries and Human-in-the-Loop Settlement',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 flex min-h-screen">
        <UIProvider>
          <SocketProvider>
            <BusinessProvider>
              <Sidebar />
              <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
                <Navbar />
                <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
                  {children}
                </main>
              </div>
              <ToastBanner />
            </BusinessProvider>
          </SocketProvider>
        </UIProvider>
      </body>
    </html>
  );
}
