import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PlayerProvider } from './contexts/PlayerContext';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import LibraryPage from './pages/LibraryPage';
import ProfilePage from './pages/ProfilePage';

/**
 * App - Root component with Router + PlayerProvider
 *
 * Route structure:
 *   /          → HomePage
 *   /search    → SearchPage
 *   /library   → LibraryPage
 *   /profile   → ProfilePage
 *   *          → redirect to /
 *
 * All routes share AppLayout (Sidebar + Topbar + BottomPlayer).
 * Auth pages (login/register) are separate routes NOT under AppLayout.
 */
export default function App() {
  return (
    <BrowserRouter>
      <PlayerProvider>
        <Routes>
          {/* === App Routes (authenticated layout) === */}
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* === Auth Routes (future: login / register) === */}
          {/* <Route path="login" element={<LoginPage />} /> */}
          {/* <Route path="register" element={<RegisterPage />} /> */}

          {/* === Fallback === */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PlayerProvider>
    </BrowserRouter>
  );
}
