import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { assessmentRepository } from "@/lib/db";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export async function UserOverview({ userId }: { userId: string }) {
  const latestAssessment = await assessmentRepository.getLatestByUserId(userId);

  if (!latestAssessment) {
    return (
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Welcome to NeuroElemental
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            You haven't taken the assessment yet. Discover your unique Element Mix to unlock personalized insights and tools.
          </p>
          <Link href="/assessment">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-primary to-[#764BA2] hover:shadow-lg transition-all">
              Take Free Assessment
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Parse scores if they are JSON string, otherwise use as is
  const scores = latestAssessment.scores as Record<string, number>;

  // Find top element
  const topElement = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b);
  const [elementName, score] = topElement;

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Your Element Mix
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl font-bold capitalize gradient-text">
            {elementName}
          </div>
          <div className="text-2xl font-semibold text-muted-foreground">
            {score}%
          </div>
        </div>
        <p className="text-muted-foreground mb-6">
          Your dominant energy is <strong>{elementName}</strong>. This means you thrive on specific types of stimulation and have unique regeneration needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href={`/results?${new URLSearchParams(Object.entries(scores).map(([k, v]) => [k, v.toString()])).toString()}`}>
            <Button className="w-full sm:w-auto bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20">
              View Full Profile
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link href="/courses">
            <Button variant="outline" className="w-full sm:w-auto">
              Recommended Courses
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
