import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardPath = user?.role === 'admin' ? '/admin' : user?.role === 'provider' ? '/provider' : '/customer';

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-sm font-black text-white">LF</span>
          <div>
            <div className="text-lg font-black tracking-tight">LocalFix</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Local Services Marketplace</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-5 md:flex">
          <Link className="text-sm font-semibold text-slate-600 hover:text-slate-900" to="/services">Services</Link>
          {user && <Link className="text-sm font-semibold text-slate-600 hover:text-slate-900" to={dashboardPath}>Dashboard</Link>}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-sm font-semibold text-slate-600 sm:block">Hi, {user.name.split(' ')[0]}</span>
              <button className="btn-secondary text-sm" onClick={() => { logout(); navigate('/'); }}>Logout</button>
            </>
          ) : (
            <>
              <Link className="btn-secondary text-sm" to="/login">Login</Link>
              <Link className="btn-primary text-sm" to="/register">Join LocalFix</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
