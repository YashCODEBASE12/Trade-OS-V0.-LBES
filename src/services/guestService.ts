// Guest session management for value-first onboarding
const GUEST_ID_KEY = 'lbes-guest-id';
const GUEST_EXPIRY_KEY = 'lbes-guest-expiry';
const GUEST_EXPIRY_DAYS = 90; // 90 days for guest data retention

/**
 * Get or create a guest ID for anonymous users.
 * Persists across browser sessions using localStorage.
 */
export function getOrCreateGuestId(): string {
  const stored = localStorage.getItem(GUEST_ID_KEY);
  const expiry = localStorage.getItem(GUEST_EXPIRY_KEY);
  const now = Date.now();

  // Return existing guest ID if still valid
  if (stored && expiry) {
    const expiryTime = parseInt(expiry, 10);
    if (now < expiryTime) {
      return stored;
    }
    // Expired, clear and create new
    localStorage.removeItem(GUEST_ID_KEY);
    localStorage.removeItem(GUEST_EXPIRY_KEY);
  }

  // Create new guest ID (uuid-like format)
  const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const expiryTime = now + GUEST_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

  localStorage.setItem(GUEST_ID_KEY, guestId);
  localStorage.setItem(GUEST_EXPIRY_KEY, expiryTime.toString());

  return guestId;
}

/**
 * Check if user is a guest (no logged-in user_id)
 */
export function isGuest(userId: string | null | undefined): boolean {
  return !userId;
}

/**
 * Get the identifier to use for saving data (guest_id or user_id)
 */
export function getSessionIdentifier(userId: string | null | undefined): { guest_id: string | null; user_id: string | null } {
  if (userId) {
    return { user_id: userId, guest_id: null };
  }
  return { user_id: null, guest_id: getOrCreateGuestId() };
}

/**
 * Clear guest session (used on logout)
 */
export function clearGuestSession(): void {
  localStorage.removeItem(GUEST_ID_KEY);
  localStorage.removeItem(GUEST_EXPIRY_KEY);
}
