import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { SidebarContainer } from './components/layout/SidebarContainer';
import { Dashboard } from './pages/Dashboard';
import { ChatAssistant } from './pages/ChatAssistant';
import { PolicyLibrary } from './pages/PolicyLibrary';
import { FAQGenerator } from './pages/FAQGenerator';
import { Analytics } from './pages/Analytics';
import { AdminPanel } from './pages/AdminPanel';
import { Settings } from './pages/Settings';

function AppContent() {
  const { page } = useAppContext();

  const pages = {
    dashboard: <Dashboard />,
    chat: <ChatAssistant />,
    policies: <PolicyLibrary />,
    faq: <FAQGenerator />,
    analytics: <Analytics />,
    admin: <AdminPanel />,
    settings: <Settings />
  };

  return (
    <SidebarContainer>
      {pages[page] || <Dashboard />}
    </SidebarContainer>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
