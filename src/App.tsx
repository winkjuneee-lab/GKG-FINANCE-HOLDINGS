import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToHash from './components/ScrollToHash';
import Home from './pages/Home';
import Portal from './pages/Portal';
import AdminPortal from './pages/AdminPortal';
import ErrorBoundary from './components/ErrorBoundary';
import './i18n';

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ScrollToHash />
        <div className="min-h-screen flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/portal" element={<Portal />} />
              <Route path="/admin" element={<AdminPortal />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </ErrorBoundary>
  );
}
