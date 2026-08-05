type LogoutActions = {
  signOut: () => Promise<unknown>;
  afterSessionCleared: () => void;
  navigateHome: () => void;
};

/**
 * Keeps logout side effects ordered: the server session must be removed
 * before local state is cleared and protected browser state is abandoned.
 */
export async function performLogout({
  signOut,
  afterSessionCleared,
  navigateHome,
}: LogoutActions) {
  await signOut();
  afterSessionCleared();
  navigateHome();
}
