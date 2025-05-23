import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/sites/carpenter/header";
import { Hero } from "@/components/sites/carpenter/hero";
import { Footer } from "@/components/sites/carpenter/footer";
import { Services } from "@/components/sites/carpenter/services";
import { About } from "@/components/sites/carpenter/about";
import { Portfolio } from "@/components/sites/carpenter/portfolio";
import { Contact } from "@/components/sites/carpenter/contact";

interface PageProps {
  params: Promise<{
    subdomain: string;
  }>;
}

export default async function SitePage({ params }: PageProps) {
  // Await the params
  const { subdomain } = await params;

  // New way: Fetch site data from Prisma
  const site = await prisma.site.findUnique({
    where: { subdomain },
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
    notFound();
  }

  return (
    <>
      <Header site={site} />
      <Hero site={site} />
      <main className="container mx-auto px-4 py-12">
        <Services site={site} />
        <About site={site} />
        <Portfolio site={site} />
        <Contact site={site} />
      </main>
      <Footer site={site} />
    </>
  );
}
