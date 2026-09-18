import { useState } from 'react';
import { Dialog, DialogPopup, DialogHeader, DialogTitle, DialogPanel } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { useAuth } from '@/context/AuthContext';

export function AuthGateModal() {
  const { authGateOpen, closeAuthGate } = useAuth();
  const [mode, setMode] = useState('login');

  const switchMode = () => setMode((m) => (m === 'login' ? 'signup' : 'login'));

  return (
    <Dialog
      open={authGateOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeAuthGate();
          setMode('login');
        }
      }}
    >
      <DialogPopup className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'login' ? 'Welcome back' : 'Join FeatureLoop'}</DialogTitle>
        </DialogHeader>
        <DialogPanel className="pb-6">
          {mode === 'login' ? (
            <LoginForm onSuccess={closeAuthGate} />
          ) : (
            <SignupForm onSuccess={closeAuthGate} />
          )}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {mode === 'login' ? "New to FeatureLoop?" : 'Already have an account?'}{' '}
            <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={switchMode}>
              {mode === 'login' ? 'Create an account' : 'Log in'}
            </Button>
          </p>
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  );
}