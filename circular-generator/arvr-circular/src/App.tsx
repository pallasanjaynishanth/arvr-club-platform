import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from '@/components/common/Toast'
import Dashboard from '@/pages/Dashboard'
import CircularEditor from '@/pages/CircularEditor'
import EventsList from '@/pages/EventsList'
import EventDetails from '@/pages/EventDetails'
import Settings from '@/pages/Settings'

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/circulars/new" element={<CircularEditor />} />
        <Route path="/circulars/:id/edit" element={<CircularEditor />} />
        <Route path="/events" element={<EventsList />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ToastProvider>
  )
}
