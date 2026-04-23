import { useEffect, useRef } from 'react';

export function useUnsavedChangesGuard(enabled: boolean): void {
  const guardArmedRef = useRef(false);
  const allowLeaveRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      guardArmedRef.current = false;
      allowLeaveRef.current = false;
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (allowLeaveRef.current) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    };

    const handlePopState = () => {
      if (allowLeaveRef.current) {
        return;
      }

      const shouldLeave = window.confirm(
        'You have an unfinished application. Leaving now may discard your latest changes. Do you want to leave this page?'
      );

      if (!shouldLeave) {
        window.history.pushState({ enrollmentDraftGuard: true }, document.title, window.location.href);
        return;
      }

      allowLeaveRef.current = true;
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.history.back();
    };

    if (!guardArmedRef.current) {
      window.history.pushState({ enrollmentDraftGuard: true }, document.title, window.location.href);
      guardArmedRef.current = true;
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [enabled]);
}
