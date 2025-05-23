"use server";

import { auth } from "@/lib/auth";
import { PrismaClient, Role } from "@/generated/prisma";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";

const prisma = new PrismaClient();

export async function createWorkspace(formData: FormData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user || !session.user.id) {
      throw new APIError("UNAUTHORIZED", {
        message: "User not authenticated.",
      });
    }

    const userId = session.user.id;
    const name = formData.get("name") as string;

    if (!name || name.trim().length === 0) {
      throw new APIError("BAD_REQUEST", {
        message: "Workspace name cannot be empty.",
      });
    }

    // Check if user already owns a workspace or is part of one, if applicable
    // For now, let's assume a user can create a workspace if they don't have one linked.
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { workspaceId: true, ownedWorkspace: true },
    });

    if (!existingUser) {
      throw new APIError("NOT_FOUND", { message: "User not found." });
    }

    // Basic logic: if user already has a workspaceId or owns a workspace, prevent creation.
    // This can be adjusted based on product requirements (e.g., allow multiple owned workspaces, or being part of multiple).
    if (existingUser.workspaceId || existingUser.ownedWorkspace) {
      // More specific error or redirect logic could be here
      throw new APIError("FORBIDDEN", {
        message: "User is already associated with a workspace.",
      });
    }

    const newWorkspace = await prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: name.trim(),
          ownerId: userId,
          // promptUsageCount will default to 0 as per schema
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          workspaceId: workspace.id,
          roleInWorkspace: Role.OWNER,
        },
      });

      return workspace;
    });

    return { success: true, data: newWorkspace };
  } catch (error) {
    if (error instanceof APIError) {
      // The first argument to APIError constructor is the code, but it might not be exposed as error.code
      // Relying on error.message for now.
      return { success: false, error: { message: error.message } };
    }
    console.error("Error creating workspace:", error);
    // For generic errors, we can still provide a generic code for client-side handling if needed.
    return {
      success: false,
      error: {
        message: "Failed to create workspace due to an unexpected error.",
        code: "INTERNAL_SERVER_ERROR",
      },
    };
  }
}
