import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginModal from './View/LoginModal';
import ForgotPasswordModal from './View/ForgotPasswordModal';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './View/Dashboard';
import NotFound from './View/NotFound';
import UserManagement from './View/UserManagement';
import ViewUser from './View/ViewUser';
import EditUser from './View/EditUser';
import AssignManager from './View/AssignManager';
import AddSalary from './View/AddSalary';
import LeaveManagement from './View/LeaveManagement';
import Attendance from './View/Attendance';
import UserTree from './View/UserTree';
import ProtectedRoute from './component/ProtectedRoute';
// import Payroll from './View/Payroll';

function AppContent() {
    return (
        <div className="App">
            <div className="content-container">
                <Routes>
                    <Route path="/" element={<LoginModal />} />
                    <Route path="/forgot-password" element={<ForgotPasswordModal />} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/user-management" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
                    <Route path="/user/:userId" element={<ProtectedRoute><ViewUser /></ProtectedRoute>} />
                    <Route path="/user/:userId/edit" element={<ProtectedRoute><EditUser /></ProtectedRoute>} />
                    <Route path="/user/:userId/assign-manager" element={<ProtectedRoute><AssignManager /></ProtectedRoute>} />
                    <Route path="/user/:userId/add-salary" element={<ProtectedRoute><AddSalary /></ProtectedRoute>} />
                    <Route path="/leave-management" element={<ProtectedRoute><LeaveManagement /></ProtectedRoute>} />
                    <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
                    <Route path="/tree-management" element={<ProtectedRoute><UserTree /></ProtectedRoute>} />
                    {/* <Route path="/payroll" element={<ProtectedRoute><Payroll /></ProtectedRoute>} /> */}
                    <Route path="*" element={<NotFound />} />
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