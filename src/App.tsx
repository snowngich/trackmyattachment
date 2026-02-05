 import { Toaster } from "@/components/ui/toaster";
 import { Toaster as Sonner } from "@/components/ui/sonner";
 import { TooltipProvider } from "@/components/ui/tooltip";
 import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
 import { BrowserRouter, Routes, Route } from "react-router-dom";
 import { AuthProvider } from "@/contexts/AuthContext";
 import ProtectedRoute from "@/components/auth/ProtectedRoute";
 
 // Pages
 import Index from "./pages/Index";
 import NotFound from "./pages/NotFound";
 import Login from "./pages/Login";
 import Signup from "./pages/Signup";
 import Unauthorized from "./pages/Unauthorized";
 
 // Student Pages
 import StudentDashboard from "./pages/student/StudentDashboard";
 import StudentLogs from "./pages/student/StudentLogs";
 import NewLog from "./pages/student/NewLog";
 
 // Supervisor Pages
 import SupervisorDashboard from "./pages/supervisor/SupervisorDashboard";
 import SupervisorLogs from "./pages/supervisor/SupervisorLogs";
 import ReviewLog from "./pages/supervisor/ReviewLog";
 
 // Coordinator Pages
 import CoordinatorDashboard from "./pages/coordinator/CoordinatorDashboard";
 
 // Admin Pages
 import AdminDashboard from "./pages/admin/AdminDashboard";
 import AdminUsers from "./pages/admin/AdminUsers";
 import AdminOrganizations from "./pages/admin/AdminOrganizations";
 import AdminPlacements from "./pages/admin/AdminPlacements";
 
 const queryClient = new QueryClient();
 
 const App = () => (
   <QueryClientProvider client={queryClient}>
     <AuthProvider>
       <TooltipProvider>
         <Toaster />
         <Sonner />
         <BrowserRouter>
           <Routes>
             {/* Public Routes */}
             <Route path="/" element={<Index />} />
             <Route path="/login" element={<Login />} />
             <Route path="/signup" element={<Signup />} />
             <Route path="/unauthorized" element={<Unauthorized />} />
 
             {/* Student Routes */}
             <Route
               path="/student"
               element={
                 <ProtectedRoute allowedRoles={["student", "admin"]}>
                   <StudentDashboard />
                 </ProtectedRoute>
               }
             />
             <Route
               path="/student/logs"
               element={
                 <ProtectedRoute allowedRoles={["student", "admin"]}>
                   <StudentLogs />
                 </ProtectedRoute>
               }
             />
             <Route
               path="/student/logs/new"
               element={
                 <ProtectedRoute allowedRoles={["student", "admin"]}>
                   <NewLog />
                 </ProtectedRoute>
               }
             />
             <Route
               path="/student/attachments"
               element={
                 <ProtectedRoute allowedRoles={["student", "admin"]}>
                   <StudentDashboard />
                 </ProtectedRoute>
               }
             />
 
             {/* Supervisor Routes */}
             <Route
               path="/supervisor"
               element={
                 <ProtectedRoute allowedRoles={["supervisor", "admin"]}>
                   <SupervisorDashboard />
                 </ProtectedRoute>
               }
             />
             <Route
               path="/supervisor/students"
               element={
                 <ProtectedRoute allowedRoles={["supervisor", "admin"]}>
                   <SupervisorDashboard />
                 </ProtectedRoute>
               }
             />
             <Route
               path="/supervisor/logs"
               element={
                 <ProtectedRoute allowedRoles={["supervisor", "admin"]}>
                   <SupervisorLogs />
                 </ProtectedRoute>
               }
             />
             <Route
               path="/supervisor/logs/:logId"
               element={
                 <ProtectedRoute allowedRoles={["supervisor", "admin"]}>
                   <ReviewLog />
                 </ProtectedRoute>
               }
             />
 
             {/* Coordinator Routes */}
             <Route
               path="/coordinator"
               element={
                 <ProtectedRoute allowedRoles={["coordinator", "admin"]}>
                   <CoordinatorDashboard />
                 </ProtectedRoute>
               }
             />
             <Route
               path="/coordinator/students"
               element={
                 <ProtectedRoute allowedRoles={["coordinator", "admin"]}>
                   <CoordinatorDashboard />
                 </ProtectedRoute>
               }
             />
             <Route
               path="/coordinator/placements"
               element={
                 <ProtectedRoute allowedRoles={["coordinator", "admin"]}>
                   <AdminPlacements />
                 </ProtectedRoute>
               }
             />
             <Route
               path="/coordinator/reports"
               element={
                 <ProtectedRoute allowedRoles={["coordinator", "admin"]}>
                   <CoordinatorDashboard />
                 </ProtectedRoute>
               }
             />
 
             {/* Admin Routes */}
             <Route
               path="/admin"
               element={
                 <ProtectedRoute allowedRoles={["admin"]}>
                   <AdminDashboard />
                 </ProtectedRoute>
               }
             />
             <Route
               path="/admin/users"
               element={
                 <ProtectedRoute allowedRoles={["admin"]}>
                   <AdminUsers />
                 </ProtectedRoute>
               }
             />
             <Route
               path="/admin/organizations"
               element={
                 <ProtectedRoute allowedRoles={["admin"]}>
                   <AdminOrganizations />
                 </ProtectedRoute>
               }
             />
             <Route
               path="/admin/placements"
               element={
                 <ProtectedRoute allowedRoles={["admin"]}>
                   <AdminPlacements />
                 </ProtectedRoute>
               }
             />
             <Route
               path="/admin/reports"
               element={
                 <ProtectedRoute allowedRoles={["admin"]}>
                   <AdminDashboard />
                 </ProtectedRoute>
               }
             />
             <Route
               path="/admin/settings"
               element={
                 <ProtectedRoute allowedRoles={["admin"]}>
                   <AdminDashboard />
                 </ProtectedRoute>
               }
             />
 
             {/* Catch-all Route */}
             <Route path="*" element={<NotFound />} />
           </Routes>
         </BrowserRouter>
       </TooltipProvider>
     </AuthProvider>
   </QueryClientProvider>
 );
 
 export default App;
