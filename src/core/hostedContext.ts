import { createHostingProvider } from "../hosting/index.js";
import type {
  HostedContextSnapshot,
  HostingProviderId,
} from "../hosting/provider.js";

export async function getHostedContext(
  cwd: string = process.cwd(),
  requestedProvider: HostingProviderId | "auto" = "auto",
): Promise<HostedContextSnapshot> {
  const provider = await createHostingProvider(cwd, requestedProvider);
  return provider.getContext(cwd);
}
