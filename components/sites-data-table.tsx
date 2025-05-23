"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconExternalLink,
  IconMail,
  IconCloudUpload,
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight,
  IconEye,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";
import type {
  Site,
  User,
  Contact,
  SocialMedia,
} from "@/generated/prisma/client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deploySiteToVercel } from "@/app/actions/deploy/deploymentActions";
import Link from "next/link";

interface SiteWithRelations extends Site {
  owner: User | null;
  contact: Contact | null;
  socialMedia: SocialMedia | null;
}

interface SitesDataTableProps {
  sites: SiteWithRelations[];
}

const handleViewSite = (subdomain: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const siteUrl = `${baseUrl.replace(/^https?:\/\//, `http://${subdomain}.`)}`;

  window.open(siteUrl, "_blank");
  toast.success("Opening website in a new tab", {
    description: `Viewing ${siteUrl}`,
  });
};

const handleSendEmail = (site: SiteWithRelations) => {
  if (!site.owner || !site.owner.email) {
    toast.error("Owner email not found for this site.");
    return;
  }
  toast.success("Opening email client (simulated)", {
    description: `Preparing email for ${site.owner.name}`,
  });
};

const handleDeploySite = async (siteId: string, siteName: string) => {
  const promise = deploySiteToVercel(siteId);

  toast.promise(promise, {
    loading: `Starting deployment for ${siteName}... This may take a few minutes. Please wait. `,
    success: (result: {
      success: boolean;
      data: { repoHtmlUrl: string; projectUrl?: string };
      message?: string;
    }) => {
      if (result.success && result.data && result.data.repoHtmlUrl) {
        let successMessage = `${siteName} deployed to GitHub successfully!\nRepo: ${result.data.repoHtmlUrl}`;
        if (result.data.projectUrl) {
          successMessage += `\nSite: ${result.data.projectUrl}`;
        }
        return successMessage;
      }
      return (
        result.message ||
        `${siteName} deployment process completed with unspecified status.`
      );
    },
    error: (err: Error) => {
      return `Failed to deploy ${siteName}: ${err.message}`;
    },
  });
};

export const columns: ColumnDef<SiteWithRelations>[] = [
  {
    accessorKey: "name",
    header: "Business Name",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/projects/${row.original.id}`}
        className="font-medium text-blue-600 hover:underline dark:text-blue-400"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "subdomain",
    header: "Subdomain",
    cell: ({ row }) => row.original.subdomain,
  },
  {
    accessorKey: "contact.city",
    header: "City",
    cell: ({ row }) => row.original.contact?.city || "N/A",
  },
  {
    accessorKey: "contact",
    header: "Contact",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <span className="text-sm">{row.original.contact?.email || "N/A"}</span>
        {row.original.contact?.phone && (
          <span className="text-sm text-muted-foreground">
            {row.original.contact.phone}
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "vercelProjectUrl",
    header: "Status",
    cell: ({ row }) => {
      const isDeployed = !!row.original.vercelProjectUrl;
      return (
        <Badge
          variant={isDeployed ? "default" : "outline"}
          className={`px-1.5 ${
            isDeployed
              ? "bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-400 border-green-500/50"
              : "text-muted-foreground"
          }`}
        >
          {isDeployed ? (
            <IconCircleCheckFilled className="mr-1 size-3.5" />
          ) : (
            <IconCircleXFilled className="mr-1 size-3.5" />
          )}
          {isDeployed ? "Deployed" : "Not Deployed"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      const isDeployed = !!row.original.vercelProjectUrl;
      if (value === "all") return true;
      if (value === "deployed") return isDeployed;
      if (value === "not-deployed") return !isDeployed;
      return true;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const site = row.original;
      return (
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" asChild title="View Details">
            <Link href={`/dashboard/projects/${site.id}`}>
              <IconEye className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewSite(site.subdomain)}
            title="View Site"
          >
            <IconExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSendEmail(site)}
            title="Email Client"
          >
            <IconMail className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => handleDeploySite(site.id, site.name)}
            title="Deploy Site"
          >
            <IconCloudUpload className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

export function SitesDataTable({ sites }: SitesDataTableProps) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [activeTab, setActiveTab] = React.useState("all");

  const table = useReactTable({
    data: sites,
    columns,
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  React.useEffect(() => {
    if (activeTab === "all") {
      table.getColumn("vercelProjectUrl")?.setFilterValue(undefined);
    } else {
      table.getColumn("vercelProjectUrl")?.setFilterValue(activeTab);
    }
  }, [activeTab, table]);

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Sites</TabsTrigger>
            <TabsTrigger value="deployed">Deployed</TabsTrigger>
            <TabsTrigger value="not-deployed">Not Deployed</TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No sites found for the current filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-2">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <select
              value={table.getState().pagination?.pageSize ?? 10}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="h-8 w-[70px] rounded-md border border-input bg-transparent px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page{" "}
            {table.getState().pagination?.pageIndex !== undefined
              ? table.getState().pagination.pageIndex + 1
              : 1}{" "}
            of {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <IconChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <IconChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <IconChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <IconChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
