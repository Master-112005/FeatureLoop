import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Navbar } from '@/components/shared/Navbar';
import { AuthGateModal } from '@/components/auth/AuthGateModal';
import { NewRequestModal } from '@/components/feed/NewRequestModal';
import { FeedPage } from '@/pages/FeedPage';
import { RequestDetailPage } from '@/pages/RequestDetailPage';
import { RoadmapPage } from '@/pages/RoadmapPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { VerifyEmailPage } from '@/pages/VerifyEmailPage';

export default function App() {
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(null);
  const [sort, setSort] = useState('trending');

  return (
    <BrowserRouter>
      <div className="flex min-h-dvh flex-col bg-background text-foreground">
        <Navbar
          onNewRequest={() => setNewRequestOpen(true)}
          query={query}
          onSearch={setQuery}
          category={category}
          onCategoryChange={setCategory}
          sort={sort}
          onSortChange={setSort}
        />
        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <FeedPage
                  query={query}
                  onQueryChange={setQuery}
                  category={category}
                  sort={sort}
                  onNewRequest={() => setNewRequestOpen(true)}
                />
              }
            />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/requests/:id" element={<RequestDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <AuthGateModal />
        <NewRequestModal
          open={newRequestOpen}
          onOpenChange={setNewRequestOpen}
          onCreated={(item) => {
            window.location.href = `/requests/${item.id}`;
          }}
        />
      </div>
    </BrowserRouter>
  );
}

function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-20 text-center">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
      <a href="/" className="text-sm font-medium text-foreground hover:underline">
        Go home
      </a>
    </div>
  );
}