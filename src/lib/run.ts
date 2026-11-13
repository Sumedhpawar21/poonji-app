export async function runAction(
  action: () => Promise<unknown>,
  toast: (message: string) => void,
  success: string
) {
  try {
    await action();
    if (success) toast(success);
    return true;
  } catch (error) {
    toast(error instanceof Error ? error.message : 'That did not save. Try again.');
    return false;
  }
}
