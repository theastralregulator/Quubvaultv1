'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // Throw the error so it's caught by the Next.js error overlay in development
      // or handle it gracefully in production
      if (process.env.NODE_ENV === 'development') {
        throw error;
      } else {
        toast({
          variant: "destructive",
          title: "Permission Denied",
          description: "You don't have access to perform this action.",
        });
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
