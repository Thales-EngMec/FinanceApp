import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import Layout from '@/components/layout/Layout'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Onboarding from '@/pages/Onboarding'
import Dashboard from '@/pages/Dashboard'
import Expenses from '@/pages/Expenses'
import Investments from '@/pages/Investments'
import Goals from '@/pages/Goals'
import Chat from '@/pages/Chat'
import Market from '@/pages/Market'
import Crypto from '@/pages/Crypto'
import Education from '@/pages/Education'
import Settings from '@/pages/Settings'

function Spinner() {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-brand/20 border-t-brand rounded-full animate-spin" />
    </div>
  )
}

function Guard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/onboarding" element={<Guard><Onboarding /></Guard>} />
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      <Route path="/*" element={
        <Guard>
          <Layout>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/investments" element={<Investments />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/market" element={<Market />} />
              <Route path="/crypto" element={<Crypto />} />
              <Route path="/education" element={<Education />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Layout>
        </Guard>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1A1D23', color: '#fff', border: '1px solid #2E3340', borderRadius: '12px' },
          success: { iconTheme: { primary: '#00D4A1', secondary: '#0A0B0D' } }
        }} />
      </AuthProvider>
    </BrowserRouter>
  )
}
