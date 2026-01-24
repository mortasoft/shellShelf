import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
// ... imports

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <Router>
      <ThemeProvider>
        <DialogProvider>
          <ToastProvider>
            <MatrixRain />
            <div className="flex min-h-screen bg-background/80 text-white transition-colors duration-300">
              <Sidebar
                isCollapsed={isSidebarCollapsed}
                toggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              />
              <main className={`flex-1 p-8 overflow-y-auto z-10 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                <Routes>
                  <Route path="/" element={<Commands />} />
                  <Route path="/scripts" element={<ScriptsPage />} />
                  <Route path="/instructions" element={<InstructionsPage />} />
                </Routes>
              </main>
            </div>
          </ToastProvider>
        </DialogProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
