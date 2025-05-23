"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Copy, Mail, Edit2, Check } from "lucide-react";
import { SiteConfig } from "@/types/site";
import { scrapeAndAnalyzeWebsite } from "@/app/actions/scraper/scraperActions";
import { saveSiteConfig } from "@/app/actions/database/siteConfigActions";
import { toast } from "sonner";
import { getCurrentUserWorkspaceId } from "@/lib/user";

interface RecipientInfo {
  name: string;
  title?: string;
}

function generateEmailContent(
  site: SiteConfig,
  recipient: RecipientInfo
): string {
  return `Hei ${recipient.name}${recipient.title ? `, ${recipient.title}` : ""}!

Jeg har gleden av å informere deg om at vi har laget en demo-nettside for ${
    site.name
  }. Vi har hentet inspirasjon fra deres nåværende nettsted og lagt til moderne funksjoner og design.

Hovedpunkter fra demo-nettsiden:
• Responsivt design som fungerer perfekt på alle enheter
• Moderne og profesjonelt utseende
• Optimalisert for søkemotorer (SEO)
• Rask lastetid og god ytelse
• Integrert kontaktskjema
• Oversiktlig presentasjon av tjenester
${site.socialMedia ? "• Integrerte sosiale medier-lenker" : ""}

Du kan se demo-nettsiden på følgende lenke:
https://${site.subdomain}.codenord.no

Jeg vil gjerne høre dine tanker om nettsiden. Vi kan enkelt gjøre tilpasninger basert på dine ønsker og behov.

Ta gjerne kontakt hvis du har spørsmål eller ønsker å diskutere mulighetene videre.

Med vennlig hilsen
CodeNord
Telefon: +47 400 85 185
E-post: post@codenord.no`;
}

export default function ScraperPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<SiteConfig | null>(null);
  const [editedData, setEditedData] = useState<SiteConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [emailContent, setEmailContent] = useState("");
  const [recipient, setRecipient] = useState<RecipientInfo>({
    name: "",
    title: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }

    setIsLoading(true);
    try {
      const workspaceId = await getCurrentUserWorkspaceId();
      if (!workspaceId) {
        toast.error(
          "Could not determine your workspace. Please ensure you are logged in and have a workspace."
        );
        setIsLoading(false);
        return;
      }

      const siteConfig = await scrapeAndAnalyzeWebsite(url, workspaceId);
      setScrapedData(siteConfig);
      setEditedData(siteConfig);
      setRecipient({
        name: siteConfig.owner?.name?.split(" ")[0] || "",
        title: "",
      });
      setEmailContent(generateEmailContent(siteConfig, recipient));
      toast.success("Website scraped successfully!");
    } catch (error) {
      toast.error("Failed to scrape website");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedData) return;

    try {
      const siteId = await saveSiteConfig(editedData);
      setScrapedData(editedData);
      setEmailContent(generateEmailContent(editedData, recipient));
      toast.success("Site configuration saved successfully!");
      router.push(`/dashboard/projects/${siteId}`);
    } catch (error) {
      toast.error("Failed to save site configuration");
      console.error(error);
    }
  };

  const handleEdit = (field: string, value: string) => {
    if (!editedData) return;

    setEditedData((prev) => {
      if (!prev) return prev;
      const updated = { ...prev };
      const fields = field.split(".");
      let current: Record<string, any> = updated;

      for (let i = 0; i < fields.length - 1; i++) {
        current = current[fields[i]];
      }
      current[fields[fields.length - 1]] = value;

      return updated;
    });
  };

  const handleRecipientChange = (field: keyof RecipientInfo, value: string) => {
    setRecipient((prev) => {
      const updated = { ...prev, [field]: value };
      if (editedData) {
        setEmailContent(generateEmailContent(editedData, updated));
      }
      return updated;
    });
  };

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText(emailContent);
    toast.success("Email copied to clipboard!");
  };

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="outline">Website Scraper</Badge>
          <h1 className="text-3xl font-bold">
            Website to SiteConfig Converter
          </h1>
          <p className="text-muted-foreground">
            Enter a website URL to extract information and generate a SiteConfig
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enter Website URL</CardTitle>
            <CardDescription>
              We&apos;ll analyze the website and extract relevant information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scraping...
                    </>
                  ) : (
                    "Start Scraping"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {scrapedData && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>Site Configuration</CardTitle>
                  <CardDescription>
                    Review and edit the site configuration
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Done Editing
                      </>
                    ) : (
                      <>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit Data
                      </>
                    )}
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Website
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {isEditing && editedData ? (
                    <div className="grid gap-4">
                      <div>
                        <h3 className="font-semibold mb-2">
                          Basic Information
                        </h3>
                        <div className="grid gap-4">
                          <div>
                            <label className="text-sm font-medium">Name</label>
                            <Input
                              value={editedData.name}
                              onChange={(e) =>
                                handleEdit("name", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              Description
                            </label>
                            <Textarea
                              value={editedData.description}
                              onChange={(e) =>
                                handleEdit("description", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">
                          Contact Information
                        </h3>
                        <div className="grid gap-4">
                          <div>
                            <label className="text-sm font-medium">Email</label>
                            <Input
                              value={editedData.contact?.email || ""}
                              onChange={(e) =>
                                handleEdit("contact.email", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Phone</label>
                            <Input
                              value={editedData.contact?.phone || ""}
                              onChange={(e) =>
                                handleEdit("contact.phone", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              Address
                            </label>
                            <Input
                              value={editedData.contact?.address || ""}
                              onChange={(e) =>
                                handleEdit("contact.address", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Theme Colors</h3>
                        <div className="grid gap-4">
                          <div>
                            <label className="text-sm font-medium">
                              Primary Color
                            </label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={editedData.theme?.primaryColor || ""}
                                onChange={(e) =>
                                  handleEdit(
                                    "theme.primaryColor",
                                    e.target.value
                                  )
                                }
                                className="w-20"
                              />
                              <Input
                                value={editedData.theme?.primaryColor || ""}
                                onChange={(e) =>
                                  handleEdit(
                                    "theme.primaryColor",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              Secondary Color
                            </label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={editedData.theme?.secondaryColor || ""}
                                onChange={(e) =>
                                  handleEdit(
                                    "theme.secondaryColor",
                                    e.target.value
                                  )
                                }
                                className="w-20"
                              />
                              <Input
                                value={editedData.theme?.secondaryColor || ""}
                                onChange={(e) =>
                                  handleEdit(
                                    "theme.secondaryColor",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-md bg-muted p-4">
                      <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-[500px]">
                        {JSON.stringify(editedData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Recipient Information</CardTitle>
                  <CardDescription>
                    Who will receive this email?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <Input
                        value={recipient.name}
                        onChange={(e) =>
                          handleRecipientChange("name", e.target.value)
                        }
                        placeholder="Christer"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Title (Optional)
                      </label>
                      <Input
                        value={recipient.title || ""}
                        onChange={(e) =>
                          handleRecipientChange("title", e.target.value)
                        }
                        placeholder="Daglig Leder"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Email Template
                    </CardTitle>
                    <CardDescription>
                      Generated email template for the provider
                    </CardDescription>
                  </div>
                  <Button onClick={copyEmailToClipboard} variant="outline">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Email
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md bg-muted p-4">
                  <pre className="text-sm whitespace-pre-wrap font-sans">
                    {emailContent}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
