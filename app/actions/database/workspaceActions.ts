"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserWorkspaceId } from "@/lib/user";

export async function getWorkspaceDetails(workspaceId: string) {
  if (!workspaceId) {
    throw new Error("Workspace ID is required.");
  }

  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
    select: {
      id: true,
      name: true,
      promptUsageCount: true,
      ownerId: true,
    },
  });

  if (!workspace) {
    throw new Error("Workspace not found.");
  }

  return workspace;
}

// Helper function to get current user's workspace details directly
export async function getCurrentUserWorkspaceDetails() {
  const workspaceId = await getCurrentUserWorkspaceId();
  if (!workspaceId) {
    // This case should ideally be handled by getCurrentUserWorkspaceId throwing an error
    // or by UI preventing action if workspaceId is not available.
    throw new Error("User is not associated with a workspace.");
  }
  return getWorkspaceDetails(workspaceId);
}
