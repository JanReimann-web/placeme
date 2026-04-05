import { getSceneSelection } from "@/lib/constants";
import { MockGenerationProvider } from "@/services/generation/mock-provider";
import type {
  GeneratedImageDraft,
  GenerationProviderContext,
  Profile,
} from "@/types/domain";

const provider = new MockGenerationProvider();

export async function processGenerationJob({
  jobId,
  userId,
  destination,
  style,
  imageCount,
  primaryProfile,
  companionProfile,
}: {
  jobId: string;
  userId: string;
  destination: GenerationProviderContext["destination"];
  style: GenerationProviderContext["style"];
  imageCount: 8 | 10 | 12;
  primaryProfile: Profile;
  companionProfile?: Profile | null;
}): Promise<GeneratedImageDraft[]> {
  const scenes = getSceneSelection(destination, imageCount);

  return provider.generate({
    jobId,
    userId,
    destination,
    style,
    primaryProfile,
    companionProfile,
    scenes,
  });
}
