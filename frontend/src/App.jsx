import React from 'react';
import { BrowserRouter as Router, Routes, Route, ScrollRestoration } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/routing/ProtectedRoute';
import AdminRoute from './components/routing/AdminRoute';

// Public Pages
import Home from './pages/Home';
import BrowseBooks from './pages/BrowseBooks';
import BookDetail from './pages/BookDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Student Dashboard Pages
import DashboardLayout from './pages/dashboard/DashboardLayout';
import UserOverview from './pages/dashboard/UserOverview';
import MyBooks from './pages/dashboard/MyBooks';
import CreateBook from './pages/dashboard/CreateBook';
import EditBook from './pages/dashboard/EditBook';
import Profile from './pages/dashboard/Profile';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPendingBooks from './pages/admin/AdminPendingBooks';
import AdminAllBooks from './pages/admin/AdminAllBooks';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';

// Scroll to top helper on route change
function ScrollToTop() {
  const { pathname } = React.useMemo(() => window.location, []);
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
            <Navbar />
            <div className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/books" element={<BrowseBooks />} />
                <Route path="/books/:id" element={<BookDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Student Dashboard Routes (Protected) */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<UserOverview />} />
                  <Route path="my-books" element={<MyBooks />} />
                  <Route path="create-book" element={<CreateBook />} />
                  <Route path="edit-book/:id" element={<EditBook />} />
                  <Route path="profile" element={<Profile />} />
                </Route>

                {/* Admin Routes (Protected + Admin Role) */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="pending" element={<AdminPendingBooks />} />
                  <Route path="books" element={<AdminAllBooks />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="categories" element={<AdminCategories />} />
                </Route>

                {/* 404 Catch All */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
