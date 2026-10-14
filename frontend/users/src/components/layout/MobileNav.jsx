import { Home, Search, Library, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const MOBILE_NAV = [
  { to: '/', icon: Home, label: 'Trang chủ', exact: true },
  { to: '/search', icon: Search, label: 'Tìm kiếm' },
  { to: '/library', icon: Library, label: 'Thư viện' },
  { to: '/profile', icon: User, label: 'Hồ sơ' },
];

/**
 * MobileNav - Bottom navigation bar for mobile devices
 */
export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-[90px] left-0 right-0 z-40 bg-[#121212] border-t border-[#282828] flex items-center justify-around px-2 py-1">
      {MOBILE_NAV.map(({ to, icon: Icon, label, exact }) => (
        <NavLink
          key={to}
          to={to}
          end={exact}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
              isActive ? 'text-[#fa2d48]' : 'text-[#a7a7a7]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-semibold ${isActive ? 'text-[#fa2d48]' : ''}`}>
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
