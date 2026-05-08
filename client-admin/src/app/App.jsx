import { Toaster } from "react-hot-toast"
import { AppRoutes } from "./routes/AppRoutes"

export const App = () => {
  return (
    <>
        <AppRoutes />,
        <Toaster position="top-center"
         toastOptions={{
          style: {
            fontFamily: "Inter, sans-serif",
            fontWeight: "600",
            fontSize: "1rem",
            borderRadius: "8px",
          }
        }}
         />
       
    </>

      
  )
}
