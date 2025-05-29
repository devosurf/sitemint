"use server";

import { prisma } from "@/lib/prisma";
import { Octokit } from "octokit";

export async function deploySiteToVercel(siteId: string) {
  console.log(`🚀 Starting deployment process for site ID: ${siteId}`);

  const GH_OWNER = process.env.GITHUB_OWNER!;
  const GH_TEMPLATE_REPO = process.env.GITHUB_TEMPLATE_REPO!;

  if (
    !GH_OWNER ||
    !GH_TEMPLATE_REPO ||
    !process.env.GITHUB_TOKEN ||
    !process.env.VERCEL_TOKEN
  ) {
    console.error("❌ Missing critical environment variables for deployment.");
    throw new Error(
      "Deployment environment variables are not configured correctly."
    );
  }

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  console.log("🔍 Fetching site details from database...");
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: {
      workspace: {
        include: {
          owner: true,
        },
      },
      theme: true,
      contact: true,
      services: true,
      socialMedia: true,
      hero: true,
    },
  });

  if (!site) {
    console.error(`❌ Site with ID ${siteId} not found.`);
    throw new Error("Site not found");
  }
  console.log(`✅ Found site: ${site.name} (${site.subdomain})`);

  const repoName = `site-${site.subdomain}`;
  const configPath = "site-config.json";
  let repoHtmlUrl = "";

  console.log(
    `🔄 Ensuring GitHub repository "${GH_OWNER}/${repoName}" exists...`
  );
  try {
    const { data: repo } = await octokit.rest.repos.get({
      owner: GH_OWNER,
      repo: repoName,
    });
    repoHtmlUrl = repo.html_url;
    console.log(`✅ GitHub repository already exists: ${repoHtmlUrl}`);
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "status" in error) {
      const httpError = error as { status: number;[key: string]: unknown };
      if (httpError.status === 404) {
        console.log(
          `ℹ️ GitHub repository not found. Creating from template "${GH_TEMPLATE_REPO}"...`
        );
        const { data: createdRepo } = await octokit.request(
          "POST /repos/{template_owner}/{template_repo}/generate",
          {
            template_owner: GH_OWNER,
            template_repo: GH_TEMPLATE_REPO,
            owner: GH_OWNER,
            name: repoName,
            private: true,
            include_all_branches: false,
          }
        );
        repoHtmlUrl = createdRepo.html_url;
        console.log(
          `✅ Successfully created GitHub repository: ${repoHtmlUrl}`
        );
      } else {
        console.error(
          "❌ Error checking/creating GitHub repository:",
          httpError
        );
        throw httpError;
      }
    } else {
      console.error(
        "❌ Unexpected error type while checking/creating GitHub repository:",
        error
      );
      if (error instanceof Error) throw error;
      throw new Error(
        "An unknown error occurred during GitHub repository check/creation."
      );
    }
  }

  console.log(`🔄 Upserting "${configPath}" in repository "${repoName}"...`);
  const siteConfigContent = Buffer.from(JSON.stringify(site, null, 2)).toString(
    "base64"
  );
  let currentFileSha: string | undefined = undefined;
  try {
    const { data: existingFile } = await octokit.rest.repos.getContent({
      owner: GH_OWNER,
      repo: repoName,
      path: configPath,
    });
    if (!Array.isArray(existingFile) && existingFile.type === "file") {
      currentFileSha = existingFile.sha;
    }
  } catch {
    console.log(`ℹ️ "${configPath}" not found. It will be created.`);
  }

  await octokit.rest.repos.createOrUpdateFileContents({
    owner: GH_OWNER,
    repo: repoName,
    path: configPath,
    message: `feat: update site configuration for ${site.subdomain}`,
    content: siteConfigContent,
    sha: currentFileSha,
  });
  console.log(`✅ Successfully upserted "${configPath}".`);

  // Vercel related code is commented out, so Vercel SDK import and related variables are removed.
  /*
  console.log(
    `🔄 Ensuring Vercel project "${repoName}" exists and is linked...` // Using repoName as projectName was removed
  );
  let project: any; 
  try {
    const { projects: foundProjects } = await vercel.projects.getProjects({ search: repoName, limit: "1" });
    if (foundProjects && foundProjects.length > 0 && foundProjects[0].name === repoName) {
        project = foundProjects[0];
        console.log(`✅ Vercel project already exists: ${project.id}`);
    } else {
        throw new Error("Project not found, proceeding to creation.");
    }
  } catch (error: any) {
    console.log(
      `ℹ️ Vercel project "${repoName}" not found or error fetching. Attempting to create... (Error: ${(error as Error).message})`
    );
    const creationResult = await vercel.projects.createProject({
      requestBody: {
        name: repoName, // Using repoName
        framework: "nextjs",
        gitRepository: {
          repo: `${GH_OWNER}/${repoName}`,
          type: "github",
        },
      }
    });
    project = creationResult; 
    console.log(`✅ Successfully created Vercel project: ${project.id}`);

    console.log(
      `🔄 Adding environment variables to Vercel project "${project.id}"...`
    );
    await vercel.projects.createProjectEnv({
      idOrName: project.id, 
      requestBody: [ 
        {
          key: "SITE_SUBDOMAIN",
          value: site.subdomain,
          type: "plain",
          target: ["production", "preview", "development"],
        },
        {
          key: "DATABASE_URL",
          value: process.env.DATABASE_URL!,
          type: "encrypted",
          target: ["production", "preview", "development"],
        },
      ],
    });
    console.log("✅ Successfully added environment variables.");
  }

  let determinedUrl = "";
  if (project.alias && project.alias.length > 0 && project.alias[0].domain) {
    determinedUrl = `https://${project.alias[0].domain}`;
  } else {
    determinedUrl = `https://${repoName}.vercel.app`; 
  }
  // projectUrl = determinedUrl; // projectUrl variable removed
  console.log(`✅ Vercel project URL: ${determinedUrl}`); // Using determinedUrl directly
  */
  // End of Vercel section

  console.log("💾 Updating site record with GitHub URL...");
  await prisma.site.update({
    where: { id: site.id },
    data: {
      githubRepoUrl: repoHtmlUrl,
      // vercelProjectUrl: projectUrl, // projectUrl variable removed, Vercel URL persistence commented out
    },
  });
  console.log("✅ Successfully updated site record with GitHub URL.");
  console.log("🎉 GitHub interaction completed successfully!");

  return {
    success: true,
    message: "GitHub operations completed successfully!",
    data: { repoHtmlUrl },
  };
}
