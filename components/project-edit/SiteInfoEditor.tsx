"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  IconBuildingStore,
  IconWorldWww,
  IconGitFork,
  IconLink,
  IconDeviceFloppy,
  IconX,
  IconPencil,
  IconShieldCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";
import Link from "next/link";
import {
  updateSiteDetails,
  type UpdateSiteDetailsPayload,
} from "@/app/actions/database/siteActions";
import { toast } from "sonner";
import type { Site } from "@/generated/prisma/client"; // For prop typing
import { Badge } from "@/components/ui/badge";

interface SiteInfoEditorProps {
  initialData: Pick<
    Site,
    | "id"
    | "name"
    | "description"
    | "subdomain"
    | "githubRepoUrl"
    | "vercelProjectUrl"
  >;
}

export function SiteInfoEditor({ initialData }: SiteInfoEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value === "" ? null : value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    const payload: UpdateSiteDetailsPayload = {
      name: formData.name,
      description: formData.description,
      subdomain: formData.subdomain,
      githubRepoUrl: formData.githubRepoUrl,
      vercelProjectUrl: formData.vercelProjectUrl,
    };

    const result = await updateSiteDetails(initialData.id, payload);
    setIsLoading(false);

    if (result.success && result.site) {
      toast.success(result.message);
      // Optionally update local state if server returns the full updated site, or rely on revalidation
      // For now, we update based on input, revalidation will fetch fresh data
      setFormData((prev) => ({
        ...prev,
        name: result.site?.name ?? prev.name,
        description: result.site?.description ?? prev.description,
        subdomain: result.site?.subdomain ?? prev.subdomain,
        githubRepoUrl: result.site?.githubRepoUrl ?? prev.githubRepoUrl,
        vercelProjectUrl:
          result.site?.vercelProjectUrl ?? prev.vercelProjectUrl,
      }));
      setIsEditing(false);
    } else {
      toast.error(result.message);
    }
  };

  const handleCancel = () => {
    setFormData(initialData); // Reset changes
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <IconBuildingStore className="mr-2.5 size-5 text-muted-foreground" />
          <CardTitle className="text-lg">Site Information</CardTitle>
        </div>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <IconPencil className="mr-1.5 size-4" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Business Name
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                placeholder="Enter business name"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                placeholder="Enter site description"
                rows={3}
              />
            </div>
            <div>
              <label
                htmlFor="subdomain"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Subdomain
              </label>
              <Input
                id="subdomain"
                name="subdomain"
                value={formData.subdomain || ""}
                onChange={handleInputChange}
                placeholder="e.g., mycoolsite"
              />
            </div>
            <div>
              <label
                htmlFor="githubRepoUrl"
                className="block text-sm font-medium text-foreground mb-1"
              >
                GitHub Repository URL
              </label>
              <Input
                id="githubRepoUrl"
                name="githubRepoUrl"
                value={formData.githubRepoUrl || ""}
                onChange={handleInputChange}
                placeholder="https://github.com/user/repo"
              />
            </div>
            <div>
              <label
                htmlFor="vercelProjectUrl"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Vercel Project URL
              </label>
              <Input
                id="vercelProjectUrl"
                name="vercelProjectUrl"
                value={formData.vercelProjectUrl || ""}
                onChange={handleInputChange}
                placeholder="https://your-project.vercel.app"
              />
            </div>
          </>
        ) : (
          <>
            {initialData.description && (
              <CardDescription className="!mt-0">
                {initialData.description}
              </CardDescription>
            )}
            <div className="space-y-3 pt-2">
              <div className="flex items-center text-sm">
                <IconWorldWww className="mr-2 size-4 shrink-0 text-muted-foreground" />
                <span className="font-medium text-muted-foreground mr-1">
                  Subdomain:
                </span>
                {initialData.subdomain ? (
                  <Link
                    href={(() => {
                      const baseUrl =
                        process.env.NEXT_PUBLIC_APP_URL ||
                        "http://localhost:3000";
                      return `${baseUrl.replace(
                        /^https?:\/\//,
                        `http://${initialData.subdomain}.`
                      )}`;
                    })()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {initialData.subdomain}
                  </Link>
                ) : (
                  <span className="text-muted-foreground italic">Not set</span>
                )}
              </div>
              <div className="flex items-center text-sm">
                <IconGitFork className="mr-2 size-4 shrink-0 text-muted-foreground" />
                <span className="font-medium text-muted-foreground mr-1">
                  GitHub:
                </span>
                {initialData.githubRepoUrl ? (
                  <Link
                    href={initialData.githubRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Repository Link
                  </Link>
                ) : (
                  <span className="text-muted-foreground italic">Not set</span>
                )}
              </div>
              <div className="flex items-center text-sm">
                <IconLink className="mr-2 size-4 shrink-0 text-muted-foreground" />
                <span className="font-medium text-muted-foreground mr-1">
                  Deployment:
                </span>
                {initialData.vercelProjectUrl ? (
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 border-green-600/50"
                  >
                    <IconShieldCheck className="mr-1 size-3.5" />
                    Deployed
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <IconAlertTriangle className="mr-1 size-3.5 text-amber-500" />
                    Not Deployed
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
      {isEditing && (
        <CardFooter className="justify-end space-x-2">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            <IconX className="mr-1.5 size-4" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <IconDeviceFloppy className="mr-1.5 size-4" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
