import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Research References | NeuroElemental',
  description: 'Complete bibliography of research studies, papers, and sources that inform the NeuroElemental framework',
};

export default function ScienceReferencesPage() {
  const categories = [
    {
      title: 'Neuroscience & Brain Function',
      references: [
        {
          citation: 'Porges, S. W. (2011). The Polyvagal Theory: Neurophysiological Foundations of Emotions, Attachment, Communication, and Self-regulation. Norton.',
          doi: '10.17761/1531-2917-25.4.292',
          summary: 'Foundational work on autonomic nervous system regulation and the role of the vagus nerve in social engagement and stress response.',
        },
        {
          citation: 'Siegel, D. J. (1999). The Developing Mind: How Relationships and the Brain Interact to Shape Who We Are. Guilford Press.',
          summary: 'Introduction of Window of Tolerance concept - the optimal arousal zone for functioning.',
        },
        {
          citation: 'Dana, D. (2018). The Polyvagal Theory in Therapy: Engaging the Rhythm of Regulation. Norton.',
          doi: '10.17761/1531-2917-25.4.292',
          summary: 'Clinical applications of Polyvagal Theory for trauma and nervous system regulation.',
        },
        {
          citation: 'McEwen, B. S., & Stellar, E. (1993). Stress and the individual: Mechanisms leading to disease. Archives of Internal Medicine, 153(18), 2093-2101.',
          doi: '10.1001/archinte.1993.00410180039004',
          summary: 'Seminal work on allostatic load - the cumulative burden of chronic stress on the body.',
        },
      ],
    },
    {
      title: 'ADHD & Dopamine Research',
      references: [
        {
          citation: 'Volkow, N. D., Wang, G. J., Kollins, S. H., et al. (2009). Evaluating dopamine reward pathway in ADHD. JAMA, 302(10), 1084-1091.',
          doi: '10.1001/jama.2009.1308',
          summary: 'Evidence for dopamine dysregulation in ADHD, particularly in reward processing and motivation circuits.',
        },
        {
          citation: 'Barkley, R. A. (2015). Attention-Deficit Hyperactivity Disorder: A Handbook for Diagnosis and Treatment (4th ed.). Guilford Press.',
          summary: 'Comprehensive reference on ADHD diagnosis, neurobiology, and treatment approaches.',
        },
        {
          citation: 'Ebstein, R. P., Novick, O., Umansky, R., et al. (1996). Dopamine D4 receptor (DRD4) exon III polymorphism associated with the human personality trait of novelty seeking. Nature Genetics, 12, 78-80.',
          doi: '10.1038/ng0196-78',
          summary: 'Genetic evidence linking dopamine receptor variants to novelty-seeking behavior.',
        },
      ],
    },
    {
      title: 'Autism & Sensory Processing',
      references: [
        {
          citation: 'Baron-Cohen, S. (2002). The extreme male brain theory of autism. Trends in Cognitive Sciences, 6(6), 248-254.',
          doi: '10.1016/S1364-6613(02)01904-6',
          summary: 'Theory proposing enhanced systemizing and reduced empathizing in autism (note: controversial and critiqued).',
        },
        {
          citation: 'Hull, L., Petrides, K. V., Allison, C., et al. (2017). "Putting on My Best Normal": Social Camouflaging in Adults with Autism Spectrum Conditions. Journal of Autism and Developmental Disorders, 47, 2519-2534.',
          doi: '10.1007/s10803-017-3166-5',
          summary: 'Research on masking/camouflaging in autism and its psychological costs.',
        },
        {
          citation: 'Dunn, W. (1997). The impact of sensory processing abilities on the daily lives of young children and their families. Infants & Young Children, 9(4), 23-35.',
          summary: 'Introduction of sensory processing framework used in occupational therapy.',
        },
      ],
    },
    {
      title: 'Personality & Temperament',
      references: [
        {
          citation: 'John, O. P., & Srivastava, S. (1999). The Big Five trait taxonomy: History, measurement, and theoretical perspectives. In L. A. Pervin & O. P. John (Eds.), Handbook of personality: Theory and research (pp. 102-138). Guilford Press.',
          summary: 'Comprehensive overview of the Five-Factor Model (Big Five) of personality.',
        },
        {
          citation: 'Gray, J. A. (1970). The psychophysiological basis of introversion-extraversion. Behaviour Research and Therapy, 8(3), 249-266.',
          doi: '10.1016/0005-7967(70)90069-0',
          summary: 'Foundation of Behavioral Activation System (BAS) and Behavioral Inhibition System (BIS) theory.',
        },
        {
          citation: 'Rothbart, M. K., & Bates, J. E. (2006). Temperament. In N. Eisenberg (Ed.), Handbook of child psychology: Vol. 3. Social, emotional, and personality development (6th ed., pp. 99-166). Wiley.',
          summary: 'Comprehensive review of temperament research and individual differences.',
        },
      ],
    },
    {
      title: 'Highly Sensitive Person (HSP) Research',
      references: [
        {
          citation: 'Aron, E. N., & Aron, A. (1997). Sensory-processing sensitivity and its relation to introversion and emotionality. Journal of Personality and Social Psychology, 73(2), 345-368.',
          doi: '10.1037/0022-3514.73.2.345',
          summary: 'Original research establishing Sensory Processing Sensitivity as a trait.',
        },
        {
          citation: 'Lionetti, F., Aron, A., Aron, E. N., et al. (2018). Dandelions, tulips and orchids: Evidence for the existence of low-sensitive, medium-sensitive and high-sensitive individuals. Translational Psychiatry, 8, 24.',
          doi: '10.1038/s41398-017-0090-6',
          summary: 'Meta-analysis showing environmental sensitivity exists on a spectrum.',
        },
      ],
    },
    {
      title: 'Attachment Theory',
      references: [
        {
          citation: 'Bowlby, J. (1969). Attachment and Loss: Vol. 1. Attachment. Basic Books.',
          summary: 'Foundational work establishing attachment theory and its lifelong impacts.',
        },
        {
          citation: 'Mikulincer, M., & Shaver, P. R. (2007). Attachment in Adulthood: Structure, Dynamics, and Change. Guilford Press.',
          summary: 'Comprehensive examination of adult attachment patterns and earned security.',
        },
      ],
    },
    {
      title: 'Energy, Burnout & Chronic Stress',
      references: [
        {
          citation: 'Maslach, C., & Leiter, M. P. (2016). Understanding the burnout experience: recent research and its implications for psychiatry. World Psychiatry, 15(2), 103-111.',
          doi: '10.1002/wps.20311',
          summary: 'Current understanding of burnout dimensions and prevention strategies.',
        },
        {
          citation: 'Miserandino, C. (2003). The Spoon Theory. Retrieved from butyoudontlooksick.com',
          summary: 'Conceptual framework for understanding limited energy capacity in chronic illness.',
        },
      ],
    },
    {
      title: 'Emotion Regulation',
      references: [
        {
          citation: 'Gross, J. J., & John, O. P. (2003). Individual differences in two emotion regulation processes: Implications for affect, relationships, and well-being. Journal of Personality and Social Psychology, 85(2), 348-362.',
          doi: '10.1037/0022-3514.85.2.348',
          summary: 'Research on cognitive reappraisal and expressive suppression strategies.',
        },
        {
          citation: 'Aldao, A., Nolen-Hoeksema, S., & Schweizer, S. (2010). Emotion-regulation strategies across psychopathology: A meta-analytic review. Clinical Psychology Review, 30(2), 217-237.',
          doi: '10.1016/j.cpr.2009.11.004',
          summary: 'Meta-analysis of emotion regulation strategies and mental health outcomes.',
        },
      ],
    },
    {
      title: 'Neurodivergence & Masking',
      references: [
        {
          citation: 'Hull, L., Lai, M. C., Baron-Cohen, S., et al. (2020). Gender differences in self-reported camouflaging in autistic and non-autistic adults. Autism, 24(2), 352-363.',
          doi: '10.1177/1362361319864804',
          summary: 'Research on autistic masking/camouflaging and its relationship to mental health outcomes.',
        },
        {
          citation: 'Dodson, W. (2022). How ADHD Ignites Rejection Sensitive Dysphoria. ADDitude Magazine.',
          summary: 'Clinical observations on rejection sensitivity in ADHD populations.',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Header */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-blue-500/10" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex p-3 rounded-full bg-primary/10 mb-6">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Research <span className="gradient-text">References</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Complete bibliography of the scientific research, theories, and studies that inform the NeuroElemental framework
            </p>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <Card className="glass-card border-amber-500/20 bg-amber-500/5">
            <CardContent className="pt-6">
              <p className="text-sm text-foreground/80">
                <strong>Important Note:</strong> The NeuroElemental framework synthesizes concepts from established research across neuroscience, psychology, and clinical practice. However, our specific framework, assessment, and element categorization have not been formally validated through peer-reviewed research. We are transparent about this limitation and position NeuroElemental as an educational self-awareness tool, not a diagnostic instrument.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* References by Category */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="space-y-12">
            {categories.map((category, index) => (
              <div key={index}>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <div className="h-1 w-12 bg-gradient-to-r from-primary to-purple-500 rounded" />
                  {category.title}
                </h2>
                <div className="space-y-4">
                  {category.references.map((ref, refIndex) => (
                    <Card key={refIndex} className="glass-card hover:border-primary/30 transition-colors">
                      <CardContent className="pt-6">
                        <p className="text-sm font-medium text-foreground mb-2">
                          {ref.citation}
                        </p>
                        {ref.doi && (
                          <div className="mb-3">
                            <a
                              href={`https://doi.org/${ref.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              DOI: {ref.doi}
                            </a>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {ref.summary}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Additional Resources */}
          <Card className="glass-card mt-12">
            <CardHeader>
              <CardTitle>Additional Resources & Ongoing Research</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The NeuroElemental framework continues to evolve as new research emerges. We actively monitor developments in:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Neurodivergence research (ADHD, autism, dyslexia, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Energy regulation and burnout prevention</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Sensory processing and environmental sensitivity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Attachment theory and relationship dynamics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Personality psychology and individual differences</span>
                </li>
              </ul>
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  <strong>Last Updated:</strong> January 2025 • <strong>Next Review:</strong> April 2025
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  See something missing or outdated? <a href="mailto:research@neuroelemental.com" className="text-primary hover:underline">Contact our research team</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
