import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { SparklesIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardPanel } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate('/');
  }, [loading, user, navigate]);

  if (!loading && user) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12">
      <div className="flex items-center justify-center gap-2 text-lg font-semibold">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <SparklesIcon className="size-4.5" />
        </span>
        FeatureLoop
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Log in with your email or username.</CardDescription>
        </CardHeader>
        <CardPanel className="pb-6 pt-4">
          <LoginForm onSuccess={() => navigate('/')} />
        </CardPanel>
      </Card>
      <p className="text-center text-sm text-muted-foreground">
        New to FeatureLoop?{' '}
        <Link to="/signup" className="font-medium text-foreground hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}