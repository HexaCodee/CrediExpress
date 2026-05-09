import { Navbar } from "./Navbar.jsx";
import { SideBar } from "./SideBar.jsx";

export const DashboardContainer = ({user, onLogout, children}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={user} onLogout={onLogout}/>
      <div className="flex flex-1">
        <SideBar/>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

