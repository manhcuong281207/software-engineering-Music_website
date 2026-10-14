import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BottomPlayer from './BottomPlayer';
import MobileNav from './MobileNav';

/**
 * AppLayout - Main 3-zone layout:
 * [Sidebar] [Main Content] 
 * [Bottom Player]
 */
export default function AppLayout() {
  return (
    <div className="flex h-full bg-[#000000] overflow-hidden">
      {/* Sidebar - hidden on mobile */}
      <Sidebar />

      {/* Main area: Topbar + scrollable content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#121212] rounded-lg m-0 md:m-2 overflow-hidden">
        <Topbar />
        <div
          id="main-content"
          className="flex-1 overflow-y-auto px-4 md:px-6 pb-4"
        >
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <MobileNav />

      {/* Fixed bottom player */}
      <BottomPlayer />
    </div>
  );
}
