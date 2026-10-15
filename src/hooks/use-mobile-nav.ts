import { useSyncExternalStore } from "react";

// Tiny external store for the mobile navigation drawer. Lives outside React so
// imperative callers (the driver.js product tour) can open/close the drawer
// without a React context — both the Sheet and the tour talk to the same store.
let isOpen = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export const mobileNav = {
  open() {
    if (!isOpen) {
      isOpen = true;
      emit();
    }
  },
  close() {
    if (isOpen) {
      isOpen = false;
      emit();
    }
  },
  set(next: boolean) {
    if (isOpen !== next) {
      isOpen = next;
      emit();
    }
  },
  get() {
    return isOpen;
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

/** Reactive access to the mobile drawer open state. */
export function useMobileNav() {
  const open = useSyncExternalStore(
    mobileNav.subscribe,
    mobileNav.get,
    () => false,
  );
  return {
    open,
    setOpen: mobileNav.set,
    openNav: mobileNav.open,
    closeNav: mobileNav.close,
  };
}
