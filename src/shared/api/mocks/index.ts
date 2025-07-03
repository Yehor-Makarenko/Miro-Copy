let mocksEnabledPromise: Promise<void> | null = null;
let mocksEnabled = false;

export async function enableMocking() {
  if (import.meta.env.PROD || mocksEnabled) {
    return;
  }

  if (mocksEnabledPromise) {
    return mocksEnabledPromise;
  }

  mocksEnabledPromise = (async () => {
    const { worker } = await import("@/shared/api/mocks/browser");
    await worker.start();
    mocksEnabled = true;
  })();

  return mocksEnabledPromise;
}
