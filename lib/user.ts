"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { User } from "@/generated/prisma"; // Assuming User type is available
import { prisma } from "@/lib/prisma";

/**
 * Retrieves the current authenticated user from the session.
 * This is a server-side utility.
 * @returns {Promise<User | null>} The user object or null if not authenticated or an error occurs.
 */
export async function getCurrentUser(): Promise<User | null> {
  console.log("[getCurrentUser] Attempting to fetch current user...");
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (session && session.user && session.user.id) {
      console.log(
        `[getCurrentUser] Session found for user ID: ${session.user.id}`
      );
      const userFromDb = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
      if (userFromDb) {
        console.log(
          `[getCurrentUser] User fetched from DB:`,
          JSON.stringify(userFromDb, null, 2)
        );
      } else {
        console.log(
          `[getCurrentUser] User with ID ${session.user.id} not found in DB.`
        );
      }
      return userFromDb;
    }
    console.log("[getCurrentUser] No active session or user ID in session.");
    return null;
  } catch (error) {
    console.error("[getCurrentUser] Error fetching current user:", error);
    return null;
  }
}

/**
 * Retrieves the current authenticated user's ID from the session.
 * @returns {Promise<string | null>} The user ID or null if not authenticated.
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user?.id || null;
  } catch (error) {
    console.error("Error fetching current user ID:", error);
    return null;
  }
}

/**
 * Retrieves the current authenticated user's workspace ID.
 * This requires fetching the user from the database as the session might not directly store workspaceId.
 * @returns {Promise<string | null>} The workspace ID or null.
 */
export async function getCurrentUserWorkspaceId(): Promise<string | null> {
  console.log("[getCurrentUserWorkspaceId] Attempting to get workspace ID...");
  const currentUser = await getCurrentUser();
  if (currentUser) {
    console.log(
      `[getCurrentUserWorkspaceId] Current user object:`,
      JSON.stringify(currentUser, null, 2)
    );
    console.log(
      `[getCurrentUserWorkspaceId] User's workspaceId from object: ${currentUser.workspaceId}`
    );
    return currentUser.workspaceId || null;
  }
  console.log("[getCurrentUserWorkspaceId] No current user found.");
  return null;
}
