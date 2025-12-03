import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { ToolsPageContent } from "@/components/tools/tools-page-content";

/**
 * Tools Page
 *
 * Displays all available tools with personalized recommendations.
 * Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 15.1, 15.3, 15.4
 */
export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        badge="Interactive Tools"
        title={
          <>
            Framework <span className="gradient-text">Tools</span>
          </>
        }
        description="Practical tools to understand, track, and optimize your energy patterns"
      />

      <main className="pb-20">
        <ToolsPageContent />
      </main>

      <Footer />
    </div>
  );
}
