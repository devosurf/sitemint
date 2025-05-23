"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserWorkspaceId } from "@/lib/user";
import { redirect } from "next/navigation";

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
    // If no workspaceId, redirect to workspace creation page
    redirect("/workspaces/create");
  }
  // If workspaceId exists, proceed to get details
  return getWorkspaceDetails(workspaceId);
}
