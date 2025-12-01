import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">

      <main className="flex-1 flex items-center justify-center py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-purple-500/30 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-500/30 rounded-full blur-[120px] animate-pulse delay-1000" />
        </div>

        <div className="max-w-2xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-9xl font-bold gradient-text mb-8">404</h1>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Page Not Found
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            The element you are looking for seems to be missing from our table.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-gradient-to-r from-primary to-[#764BA2] text-white hover:shadow-lg">
              <Link href="/">
                Return Home
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="glass-card border-border/50">
              <Link href="/elements">
                Explore Elements <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}






