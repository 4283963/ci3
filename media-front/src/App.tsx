import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/pages/Login'
import Layout from '@/pages/Layout'
import Dashboard from '@/pages/Dashboard'
import VideoLibrary from '@/pages/VideoLibrary'
import AccountManager from '@/pages/AccountManager'
import Distribute from '@/pages/Distribute'
import TaskList from '@/pages/TaskList'
import { useUserStore } from '@/store/userStore'

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn())
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="videos" element={<VideoLibrary />} />
        <Route path="accounts" element={<AccountManager />} />
        <Route path="distribute" element={<Distribute />} />
        <Route path="tasks" element={<TaskList />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
