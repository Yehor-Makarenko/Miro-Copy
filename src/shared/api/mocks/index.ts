let mocksEnabledPromise: Promise<void> | null = null;
// let mocksEnabled = false;

export async function enableMocking() {
  if (import.meta.env.PROD) {
    return;
  }

  if (mocksEnabledPromise) {
    return mocksEnabledPromise;
  }

  mocksEnabledPromise = (async () => {
    const { worker } = await import("@/shared/api/mocks/browser");
    await worker.start();
    mocksEnabledPromise = null;
  })();

  return mocksEnabledPromise;
}
