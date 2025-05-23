// No longer a client component
import { getCurrentUserWorkspaceDetails } from "@/app/actions/database/workspaceActions";
import MakerClientContent from "@/components/maker/MakerClientContent";
import UpgradePrompt from "@/components/maker/UpgradePrompt";

export default async function ScraperPage() {
  const workspaceDetails = await getCurrentUserWorkspaceDetails();

  if (workspaceDetails.promptUsageCount > 3) {
    return (
      <UpgradePrompt promptUsageCount={workspaceDetails.promptUsageCount} />
    );
  }

  return (
    <MakerClientContent
      initialPromptUsageCount={workspaceDetails.promptUsageCount}
      workspaceId={workspaceDetails.id}
    />
  );
}
