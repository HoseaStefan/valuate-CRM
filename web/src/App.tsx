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
// import Payroll from './View/Payroll';

function AppContent() {
    return (
        <div className="App">
            <div className="content-container">
                <Routes>
                    <Route path="/" element={<LoginModal />} />
                    <Route path="/forgot-password" element={<ForgotPasswordModal />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/user-management" element={<UserManagement />} />
                    <Route path="/user/:userId" element={<ViewUser />} />
                    <Route path="/user/:userId/edit" element={<EditUser />} />
                    <Route path="/user/:userId/assign-manager" element={<AssignManager />} />
                    <Route path="/user/:userId/add-salary" element={<AddSalary />} />
                    <Route path="/leave-management" element={<LeaveManagement />} />
                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/tree-management" element={<UserTree />} />
                    {/* <Route path="/payroll" element={<Payroll />} /> */}
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