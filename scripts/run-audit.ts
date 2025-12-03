/**
 * Run Comprehensive Platform Audit
 * 
 * Execute with: npx tsx scripts/run-audit.ts
 */

import { runAuditAndSaveReport, createDefaultConfig } from '../lib/audit';

async function main() {
  console.log('='.repeat(60));
  console.log('COMPREHENSIVE PLATFORM AUDIT');
  console.log('='.repeat(60));
  console.log('');

  const config = createDefaultConfig(
    process.env.SUPABASE_PROJECT_ID || 'ieqvhgqubvfruqfjggqf',
    process.env.BASE_URL || 'http://localhost:3000'
  );

  try {
    const result = await runAuditAndSaveReport(config, 'COMPREHENSIVE_AUDIT_REPORT.md');

    console.log('\n' + '='.repeat(60));
    console.log('AUDIT SUMMARY');
    console.log('='.repeat(60));

    if (result.report) {
      console.log(`\nOverall Health Score: ${result.report.summary.overallHealthScore}/100`);
      console.log(`\nDomain Scores:`);
      for (const [domain, score] of Object.entries(result.report.summary.domainScores)) {
        const emoji = score >= 90 ? '✅' : score >= 70 ? '⚠️' : '❌';
        console.log(`  ${emoji} ${domain}: ${score}/100`);
      }

      console.log(`\nFindings:`);
      console.log(`  🔴 Critical: ${result.report.summary.criticalFindings}`);
      console.log(`  🟠 High: ${result.report.summary.highFindings}`);
      console.log(`  🟡 Medium: ${result.report.summary.mediumFindings}`);
      console.log(`  🟢 Low: ${result.report.summary.lowFindings}`);

      console.log(`\nEstimated Remediation: ${result.report.summary.estimatedRemediationEffort}`);

      if (result.report.roadmap.sprints.length > 0) {
        console.log(`\nRemediation Roadmap:`);
        for (const sprint of result.report.roadmap.sprints) {
          console.log(`  Sprint ${sprint.sprintNumber}: ${sprint.focus} (${sprint.estimatedEffort})`);
        }
      }
    }

    if (result.failedDomains.length > 0) {
      console.log(`\n⚠️ Some domains failed to evaluate:`);
      for (const failed of result.failedDomains) {
        console.log(`  - ${failed.domain}: ${failed.error}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('Full report saved to: COMPREHENSIVE_AUDIT_REPORT.md');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('Audit failed:', error);
    process.exit(1);
  }
}

main();
