import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconAlertTriangle, IconExternalLink } from "@tabler/icons-react";
import Link from "next/link";
import { SiteInfoEditor } from "@/components/project-edit/SiteInfoEditor";
import { OwnerInfoEditor } from "@/components/project-edit/OwnerInfoEditor";
import { ContactInfoEditor } from "@/components/project-edit/ContactInfoEditor";
import { SocialMediaEditor } from "@/components/project-edit/SocialMediaEditor";
import { HeroContentEditor } from "@/components/project-edit/HeroContentEditor";
import { SetPageTitle } from "@/components/set-page-title";

interface ProjectDetailsPageProps {
  params: {
    siteId: string;
  };
}

export default async function ProjectDetailsPage({
  params,
}: ProjectDetailsPageProps) {
  const { siteId } = await params;
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: {
      workspace: {
        include: {
          owner: true,
        },
      },
      contact: true,
      socialMedia: true,
      hero: true,
      services: true,
      theme: true,
    },
  });

  if (!site) {
    notFound();
  }

  return (
    <div className="@container/main flex flex-1 flex-col">
      {/* Page Header */}
      <SetPageTitle title={site.name} />
      <div className=" px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start gap-y-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
                {site.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Project ID: {site.id}
              </p>
            </div>
            {site.vercelProjectUrl ? (
              <Link
                href={site.vercelProjectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                <IconExternalLink className="-ml-1 mr-2 size-5" />
                View Live Site
              </Link>
            ) : (
              <Badge variant="outline" className="flex items-center gap-x-1.5">
                <IconAlertTriangle className="size-4 text-amber-500" />
                Not Deployed
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Sidebar Column */}
          <aside className="space-y-6 lg:col-span-4">
            {/* Owner Details Card - Replaced with Editor */}
            <OwnerInfoEditor
              siteId={site.id}
              initialData={site.workspace?.owner}
            />

            {/* Contact Details Card - Replaced with Editor */}
            <ContactInfoEditor siteId={site.id} initialData={site.contact} />

            {/* Social Media Card - Replaced with Editor */}
            <SocialMediaEditor
              siteId={site.id}
              initialData={site.socialMedia}
            />
          </aside>

          {/* Main Content Column */}
          <main className="space-y-6 lg:col-span-8">
            {/* Site Information Card - Replaced with Editor */}
            <SiteInfoEditor
              initialData={{
                id: site.id,
                name: site.name,
                description: site.description,
                subdomain: site.subdomain,
                githubRepoUrl: site.githubRepoUrl,
                vercelProjectUrl: site.vercelProjectUrl,
              }}
            />

            {/* Hero Section Card - Replaced with Editor */}
            <HeroContentEditor siteId={site.id} initialData={site.hero} />

            {/* Services Card */}
            {site.services && site.services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Services Offered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                    {site.services.map((service) => (
                      <div
                        key={service.id}
                        className="rounded-md border bg-background/50 p-4"
                      >
                        <h3 className="font-semibold text-foreground">
                          {service.title}
                        </h3>
                        {service.price && (
                          <p className="text-sm text-muted-foreground">
                            {service.price}
                          </p>
                        )}
                        <p className="mt-1.5 text-sm text-muted-foreground">
                          {service.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {!site.services ||
              (site.services.length === 0 && (
                <Card className="text-center">
                  <CardHeader>
                    <CardTitle className="text-lg text-muted-foreground font-normal">
                      No Services Listed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This project does not have any services defined yet.
                    </p>
                  </CardContent>
                </Card>
              ))}
          </main>
        </div>
      </div>
    </div>
  );
}
