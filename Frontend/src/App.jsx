import { RouterProvider } from "react-router"
import AppRoutes from "./AppRoutes"
import ".//features/shared/global.scss"
import { AuthProvider } from "./features/auth/auth.context.jsx"

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
    
  )
}

export default App