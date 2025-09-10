
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/ui/logo';
import { Button } from '../ui/button';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.901,35.636,44,30.338,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
        </svg>
    )
}


export function AuthModal() {
  const { isOpen, setOpen } = useAuthModal();
  const { signInWithGoogle, loading } = useAuth();

  const handleSignIn = () => {
    // Ensure signInWithGoogle is not called if it's already in progress
    if (!loading) {
      signInWithGoogle();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-4xl grid grid-cols-1 md:grid-cols-2">
            <div className="p-10 flex flex-col justify-center">
                 <div className="w-full text-center">
                    <DialogHeader>
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Logo className="h-12 w-12" />
                            <DialogTitle className="text-4xl font-bold tracking-tight">MindMate</DialogTitle>
                        </div>
                    </DialogHeader>
                    <p className="text-balance text-muted-foreground">Join or sign in to unlock your full potential.</p>
                    <div className="mt-8">
                        <Button 
                            className="w-full h-14 text-lg" 
                            onClick={handleSignIn}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="h-6 w-6 animate-spin rounded-full border-4 border-dashed border-primary-foreground"></div>
                            ) : (
                                <>
                                 <GoogleIcon className="mr-3" /> Continue with Google
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-4 px-8">By continuing, you agree to our Terms of Service and Privacy Policy.</p>
                    </div>
                </div>
            </div>
            <div className="hidden md:block bg-muted relative overflow-hidden rounded-r-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background z-10"></div>
                <img
                    src="https://picsum.photos/1200/1000"
                    alt="Abstract background"
                    className="h-full w-full object-cover dark:brightness-[0.3]"
                    data-ai-hint="abstract digital"
                />
                 <div className="absolute inset-0 flex items-end p-10 z-20">
                    <div className="text-white bg-black/30 p-8 rounded-xl backdrop-blur-sm">
                        <h2 className="text-4xl font-bold leading-tight">Unlock Your Potential.</h2>
                        <p className="text-lg mt-4 text-white/80 max-w-lg">Join a community of learners and achieve your academic goals.</p>
                    </div>
                </div>
            </div>
        </DialogContent>
    </Dialog>
  )
}
