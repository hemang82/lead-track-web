import { BrowserRouter, Route, Routes } from "react-router-dom"

import MainLayout from "./layouts/MainLayout"
import Dashboard from "./pages/Dashboard"
import AddLead from "./pages/leadManage/AddLead"
import EditLead from "./pages/leadManage/EditLead"
import LeadDetails from "./pages/leadManage/LeadDetails"
import Leads from "./pages/leadManage/Leads"
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"
import { Toaster } from "sonner"
import { ProtectedRoute, PublicRoute } from "./component/AuthGuards"

function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Routes>
        {/* Public Routes - Login હોવા પર જઈ ના શકાય */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected Routes - Login વગર જઈ ના શકાય */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/leads/add" element={<AddLead />} />
            <Route path="/leads/:id" element={<LeadDetails />} />
            <Route path="/leads/:id/edit" element={<EditLead />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App