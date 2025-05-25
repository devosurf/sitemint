import { SitesDataTable } from "@/components/sites-data-table";
import { prisma } from "@/lib/prisma";
import { EmptyStateProjects } from "@/components/empty-state-projects";
import { getCurrentUserWorkspaceId } from "@/lib/user";
import { redirect } from "next/navigation";

export default async function Page() {
  // Get the current user's workspace ID
  const workspaceId = await getCurrentUserWorkspaceId();

  if (!workspaceId) {
    // If user doesn't have a workspace, redirect to workspace creation
    redirect("/workspaces/create");
  }

  const sitesFromDb = await prisma.site.findMany({
    where: {
      workspaceId: workspaceId,
    },
    include: {
      workspace: {
        include: {
          owner: true,
        },
      },
      contact: true,
      socialMedia: true,
    },
  });

  const sitesForTable = sitesFromDb.map((site) => ({
    ...site,
    owner: site.workspace?.owner || null, // Ensure owner is User | null, not undefined
  }));

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          {sitesForTable.length > 0 ? (
            <SitesDataTable sites={sitesForTable} />
          ) : (
            <EmptyStateProjects />
          )}
        </div>
      </div>
    </div>
  );
}
