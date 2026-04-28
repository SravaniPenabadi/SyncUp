import { Link } from "react-router-dom";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const navButtonClass =
  "btn btn-ghost btn-sm gap-2 text-slate-200 hover:bg-white/10 hover:text-white";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link
          to="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-slate-100">SyncUp</h1>
            <p className="hidden text-xs text-slate-400 sm:block">
              Chat and sync with your people
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link to="/settings" className={navButtonClass}>
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Link>

          {authUser && (
            <>
              <Link to="/profile" className={navButtonClass}>
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </Link>

              <button type="button" className={navButtonClass} onClick={logout}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
