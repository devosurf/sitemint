"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

interface UpgradePromptProps {
  promptUsageCount: number;
}

export default function UpgradePrompt({
  promptUsageCount,
}: UpgradePromptProps) {
  const handleUpgradeClick = () => {
    toast.info("Upgrade feature is under development. Stay tuned!");
  };

  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Usage Limit Reached</CardTitle>
            <CardDescription>
              You have used the website scraper {promptUsageCount} times. Please
              upgrade your plan to continue using this feature.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p>
              Our free plan allows for up to 3 website scrapes. To unlock
              unlimited scraping and access more features, please upgrade your
              account.
            </p>
            <Button onClick={handleUpgradeClick} size="lg">
              Upgrade Your Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
