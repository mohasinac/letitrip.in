export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initProviders } = await import("./providers.config");
    await initProviders();
  }
}
