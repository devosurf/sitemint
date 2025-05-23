import { Button } from "@/components/ui/button";
import { IconInnerShadowTop } from "@tabler/icons-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex items-center gap-3 text-3xl font-medium">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <IconInnerShadowTop className="!size-6" />
          </div>
          Sitemint
        </div>

        <div className="text-center sm:text-left max-w-xl">
          <h1 className="text-2xl font-semibold tracking-tight mb-3">
            Build beautiful websites with ease
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Create stunning, professional websites without the complexity. Get
            started with our intuitive website builder.
          </p>
        </div>

        <Button asChild>
          <Link href="/dashboard/maker">Get Started</Link>
        </Button>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-sm text-muted-foreground">
        <span>© 2024 Sitemint</span>
      </footer>
    </div>
  );
}
