import { SitesDataTable } from "@/components/sites-data-table";
import { prisma } from "@/lib/prisma";
import { EmptyStateProjects } from "@/components/empty-state-projects";

export default async function Page() {
  const sitesFromDb = await prisma.site.findMany({
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
    owner: site.workspace?.owner,
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
