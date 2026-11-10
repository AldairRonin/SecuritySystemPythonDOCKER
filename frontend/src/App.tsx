import { SecurityPage } from '@/pages/SecurityPage';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { StudentDetailPage } from '@/pages/StudentDetailPage';
import { AdminPage } from '@/pages/AdminPage';
import { AddChildPage } from '@/pages/AddChildPage';
import { AddChildRelationshipPage } from '@/pages/AddChildRelationshipPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminPage />
              </ProtectedRoute>
            }

/>

<Route
  path="/security"
  element={
    <ProtectedRoute allowedRoles={['SECURITY']}>
      <SecurityPage />
    </ProtectedRoute>
  }
/>

          <Route
            path="/students/:guardianStudentId"
            element={
              <ProtectedRoute>
                <StudentDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
     path="/add-child"
     element={
       <ProtectedRoute allowedRoles={['PARENT', 'TRUSTED_PERSON']}>
         <AddChildPage />
       </ProtectedRoute>
     }
        />
        <Route
  path="/students/:studentId/add"
  element={
    <ProtectedRoute allowedRoles={['PARENT', 'TRUSTED_PERSON']}>
      <AddChildRelationshipPage />
    </ProtectedRoute>
  }
/>
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
