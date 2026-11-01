import './globals.css';
import AppShell from '../components/shared/AppShell';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import { BusinessProvider } from '../context/BusinessContext';
import { UIProvider } from '../context/UIContext';

export const metadata = {
  title: 'AgentMart - Autonomous B2B Multi-Agent Marketplace',
  description:
    'Multi-Agent Procurement Platform with Deterministic Safety Boundaries and Human-in-the-Loop Settlement',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#faf7ee] text-[#172554] flex min-h-screen">
        <AuthProvider>
          <UIProvider>
            <SocketProvider>
              <BusinessProvider>
                <AppShell>{children}</AppShell>
              </BusinessProvider>
            </SocketProvider>
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
