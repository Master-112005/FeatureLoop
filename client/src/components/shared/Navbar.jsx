import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOutIcon, PlusIcon, ShieldIcon, SparklesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Menu, MenuItem, MenuTrigger, MenuPopup } from '@/components/ui/menu';
import { AuthorAvatar } from '@/components/shared/AuthorAvatar';
import { SearchBar } from '@/components/shared/SearchBar';
import { SortTabs } from '@/components/feed/SortTabs';
import { CategoryBar } from '@/components/feed/CategoryBar';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { to: '/', label: 'Feed', end: true },
  { to: '/roadmap', label: 'Roadmap' },
];

export function Navbar({ onNewRequest, query, onSearch, category, onCategoryChange, sort, onSortChange }) {
  const { user, isAdmin, loading, logout, openAuthGate } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNewRequest = () => {
    if (user) onNewRequest?.();
    else openAuthGate();
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-4">
        <Link to="/" className="flex items-center gap-2 rounded-lg px-1 font-semibold tracking-tight">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <SparklesIcon className="size-4" />
          </span>
          <span className="hidden text-[15px] sm:inline">FeatureLoop</span>
        </Link>

        <nav className="ms-1 flex items-center gap-0.5">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          {isAdmin ? (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              <ShieldIcon className="size-3.5" />
              Admin
            </NavLink>
          ) : null}
        </nav>

        <div className="ms-3 hidden min-w-0 flex-1 sm:block">
          <SearchBar value={query} onSearch={onSearch} />
        </div>

        <div className="ms-auto flex shrink-0 items-center gap-2">
          {!loading && !user && (
            <>
              <Button type="button" variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Log in
              </Button>
              <Button type="button" size="sm" onClick={() => navigate('/signup')}>
                Sign up
              </Button>
            </>
          )}

          {user && (
            <>
              <Button type="button" size="sm" onClick={handleNewRequest}>
                <PlusIcon />
                New request
              </Button>

              <Menu open={menuOpen} onOpenChange={setMenuOpen}>
                <MenuTrigger
                  className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Account menu"
                >
                  <AuthorAvatar author={user} size="sm" />
                </MenuTrigger>
                <MenuPopup side="bottom" align="end" sideOffset={8}>
                  <MenuItem className="flex flex-col !items-start gap-0 pe-8">
                    <span className="font-medium">{user.username}</span>
                    <span className="text-muted-foreground">{user.email}</span>
                  </MenuItem>
                  {isAdmin ? (
                    <MenuItem
                      render={
                        <Link to="/admin" onClick={() => setMenuOpen(false)}>
                          <ShieldIcon />
                          Admin dashboard
                        </Link>
                      }
                    />
                  ) : null}
                  <MenuItem
                    variant="destructive"
                    onClick={async () => {
                      setMenuOpen(false);
                      await logout();
                      navigate('/');
                    }}
                  >
                    <LogOutIcon />
                    Log out
                  </MenuItem>
                </MenuPopup>
              </Menu>
            </>
          )}
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 py-2">
          <SortTabs sort={sort} onSortChange={onSortChange} />
          <CategoryBar category={category} onCategoryChange={onCategoryChange} />
        </div>
      </div>
    </header>
  );
}