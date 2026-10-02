import { revalidatePath } from 'next/cache';

/**
 * Safely triggers Next.js cache revalidation.
 * When called inside Next.js request lifecycle, executes standard revalidation.
 * When called in test runners, background workers, or CLI scripts, gracefully suppresses
 * the missing requestAsyncStorage invariant error.
 */
export function safeRevalidatePath(path: string, type?: 'layout' | 'page'): void {
  try {
    revalidatePath(path, type);
  } catch {
    // Gracefully suppress error when outside Next.js request context
  }
}
