"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { IconLoader2 } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createWorkspace } from "@/app/actions/workspace/createWorkspace";
import { authClient } from "@/lib/auth-client";

export function CreateWorkspaceForm() {
  const [workspaceName, setWorkspaceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();

  useEffect(() => {
    if (session?.user?.name && !workspaceName) {
      setWorkspaceName(`${session.user.name}'s Workspace`);
    } else if (!session?.user?.name && !workspaceName && !isSessionLoading) {
      setWorkspaceName("My Workspace");
    }
  }, [session, isSessionLoading, workspaceName]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!workspaceName.trim()) {
      toast.error("Workspace name cannot be empty.");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", workspaceName);

    try {
      const result = await createWorkspace(formData);
      if (result.success && result.data) {
        toast.success(`Workspace "${result.data.name}" created successfully!`);
        router.push("/dashboard/maker");
      } else if (result.error) {
        toast.error(result.error.message || "Failed to create workspace.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } catch (error) {
      console.error("Create workspace form error:", error);
      toast.error("An unexpected error occurred while creating the workspace.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">Create New Workspace</CardTitle>
        <CardDescription>
          Give your new workspace a name to get started, or use the suggestion.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="workspaceName">Workspace Name</Label>
            <Input
              id="workspaceName"
              placeholder="E.g. My Awesome Project"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              disabled={isLoading || isSessionLoading}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full mt-4" disabled={isLoading}>
            {isLoading ? (
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLoading
              ? "Creating..."
              : isSessionLoading
              ? "Loading User..."
              : "Create Workspace"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
