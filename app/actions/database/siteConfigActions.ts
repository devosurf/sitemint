"use server";

import { SiteConfig } from "@/types/site";
import { prisma } from "@/lib/prisma";
import { getCurrentUserWorkspaceId } from "@/lib/user";
import type { Prisma } from "@/generated/prisma";

export async function saveSiteConfig(siteConfig: SiteConfig): Promise<string> {
  console.log("💾 Starting to save site configuration to database...");

  const workspaceId = await getCurrentUserWorkspaceId();
  if (!workspaceId) {
    console.error(
      "❌ User is not associated with a workspace or workspaceId could not be determined."
    );
    throw new Error(
      "User must be associated with a workspace to save site configuration."
    );
  }

  try {
    const {
      subdomain,
      name,
      description,
      theme,
      contact,
      services,
      socialMedia,
      hero,
    } = siteConfig;

    // Build update data conditionally
    const updateData: Prisma.SiteUpdateInput = {
      name,
      description,
      workspace: { connect: { id: workspaceId } },
    };
    if (theme) {
      updateData.theme = { upsert: { create: theme, update: theme } };
    }
    if (contact) {
      updateData.contact = {
        upsert: {
          create: {
            ...contact,
            email: contact.email || "",
            areas: contact.areas || [],
          },
          update: {
            ...contact,
            email: contact.email || "",
            areas: contact.areas || [],
          },
        },
      };
    }
    if (services) {
      updateData.services = {
        deleteMany: {},
        create: services.map((service) => ({
          title: service.title,
          description: service.description,
          price: service.price ?? "N/A",
        })),
      };
    }
    if (socialMedia) {
      updateData.socialMedia = {
        upsert: { create: socialMedia, update: socialMedia },
      };
    }
    if (hero) {
      updateData.hero = {
        upsert: {
          create: { ...hero, highlights: hero.highlights || [] },
          update: { ...hero, highlights: hero.highlights || [] },
        },
      };
    }

    // Build create data conditionally
    const createData: Prisma.SiteCreateInput = {
      subdomain,
      name,
      description,
      workspace: { connect: { id: workspaceId } },
    };
    if (theme) {
      createData.theme = { create: theme };
    }
    if (contact) {
      createData.contact = {
        create: {
          ...contact,
          email: contact.email || "",
          areas: contact.areas || [],
        },
      };
    }
    if (services) {
      createData.services = {
        create: services.map((service) => ({
          title: service.title,
          description: service.description,
          price: service.price ?? "N/A",
        })),
      };
    }
    if (socialMedia) {
      createData.socialMedia = { create: socialMedia };
    }
    if (hero) {
      createData.hero = {
        create: { ...hero, highlights: hero.highlights || [] },
      };
    }

    const savedSite = await prisma.site.upsert({
      where: { subdomain },
      update: updateData,
      create: createData,
      include: {
        workspace: true,
        theme: true,
        contact: true,
        services: true,
        socialMedia: true,
        hero: true,
      },
    });

    console.log("✅ Successfully saved site configuration to database:", {
      id: savedSite.id,
      subdomain: savedSite.subdomain,
      workspaceId: savedSite.workspaceId,
      themeId: savedSite.themeId,
      contactId: savedSite.contactId,
      socialMediaId: savedSite.socialMediaId,
      heroId: savedSite.heroId,
    });
    return savedSite.id;
  } catch (error) {
    console.error("❌ Error saving site configuration to database:", error);
    throw new Error("Failed to save site configuration to database");
  }
}
