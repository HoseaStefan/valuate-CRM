import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginModal from './View/LoginModal';
import ForgotPasswordModal from './View/ForgotPasswordModal';
import { AuthProvider } from './context/AuthContext';

function AppContent() {
    return (
        <div className="App">
            <div className="content-container">
                <Routes>
                    <Route path="/" element={<LoginModal />} />
                    <Route path="/forgot-password" element={<ForgotPasswordModal />} />
                </Routes>
            </div>
        </div>
    );
}

function App() {
    return (
      <AuthProvider>
        <Router>
            <AppContent />
        </Router>
      </AuthProvider>
    );
}

export default App;