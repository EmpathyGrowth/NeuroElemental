const fs = require('fs');
const path = require('path');

// Files with // @ts-nocheck
const tsNoCheckFiles = [
  'lib\\sso\\saml.ts',
  'lib\\optimization\\image-optimizer.ts',
  'lib\\sso\\index.ts',
  'lib\\monitoring\\web-vitals.ts',
  'lib\\middleware\\api-auth.ts',
  'lib\\middleware\\index.ts',
  'lib\\middleware\\require-admin.ts',
  'lib\\email\\templates\\session-reminder.tsx',
  'lib\\logging\\logger.ts',
  'lib\\db\\query-helpers.ts',
  'lib\\email\\email-service.ts',
  'lib\\db\\invitations.ts',
  'lib\\db\\organizations.ts',
  'lib\\billing\\stripe-client.ts',
  'lib\\db\\activity-log.ts',
  'lib\\db\\courses.ts',
  'hooks\\use-user.ts',
  'lib\\auth\\supabase.ts',
  'components\\notifications\\notification-center.tsx',
  'components\\organizations\\organization-switcher.tsx',
  'emails\\low-credits-warning.tsx',
  'components\\auth\\login-form.tsx',
  'components\\checkout\\checkout-button.tsx',
  'app\\dashboard\\organizations\\[id]\\invite\\bulk\\page.tsx',
  'app\\dashboard\\organizations\\[id]\\roles\\page.tsx',
  'app\\onboarding\\page.tsx',
  'components\\auth\\auth-provider.tsx',
  'app\\dashboard\\business\\organization\\page.tsx',
  'app\\dashboard\\organizations\\[id]\\api-keys\\page.tsx',
  'app\\dashboard\\admin\\page.tsx',
  'app\\dashboard\\billing\\plans\\page.tsx',
  'app\\dashboard\\admin\\events\\new\\page.tsx',
  'app\\dashboard\\admin\\events\\page.tsx',
  'app\\dashboard\\admin\\courses\\new\\page.tsx',
  'app\\dashboard\\admin\\courses\\page.tsx',
  'app\\dashboard\\admin\\blog\\new\\page.tsx',
  'app\\dashboard\\admin\\blog\\page.tsx',
  'app\\courses\\[slug]\\modules\\page.tsx',
  'app\\dashboard\\admin\\blog\\[id]\\edit\\page.tsx',
  'app\\assessment\\page.tsx',
  'app\\courses\\[slug]\\learn\\page.tsx',
  'app\\api\\uploads\\[id]\\route.ts',
  'app\\api\\user\\data-export\\[requestId]\\download\\route.ts',
  'app\\api\\stripe\\webhook\\route.ts',
  'app\\api\\subscriptions\\[id]\\route.ts',
  'app\\api\\reviews\\route.ts',
  'app\\api\\organizations\\[id]\\webhooks\\[webhookId]\\test\\route.ts',
  'app\\api\\products\\[id]\\route.ts',
  'app\\api\\organizations\\[id]\\reports\\[reportId]\\route.ts',
  'app\\api\\organizations\\[id]\\sso\\route.ts',
  'app\\api\\organizations\\[id]\\api-keys\\route.ts',
  'app\\api\\organizations\\[id]\\invite\\bulk\\route.ts',
  'app\\api\\notifications\\[id]\\route.ts',
  'app\\api\\notifications\\route.ts',
  'app\\api\\lessons\\[lessonId]\\quizzes\\route.ts',
  'app\\api\\invitations\\[id]\\decline\\route.ts',
  'app\\api\\lessons\\[lessonId]\\assignments\\route.ts',
  'app\\api\\export\\analytics\\route.ts',
  'app\\api\\invitations\\[id]\\accept\\route.ts',
  'app\\api\\dashboard\\student\\route.ts',
  'app\\api\\events\\route.ts',
  'app\\api\\courses\\[id]\\reviews\\route.ts',
  'app\\api\\cron\\process-data-exports\\route.ts',
  'app\\api\\assignments\\submissions\\[submissionId]\\grade\\route.ts',
  'app\\api\\coupons\\redeem\\route.ts',
  'app\\api\\assessment\\submit\\route.ts',
  'app\\api\\assignments\\[id]\\submit\\route.ts',
  'app\\api\\admin\\users\\[id]\\role\\route.ts',
  'app\\api\\admin\\users\\route.ts',
  '__tests__\\api\\courses.test.ts',
  'app\\api\\organizations\\[id]\\billing\\change-plan\\route.ts',
  'app\\api\\cron\\aggregate-metrics\\route.ts',
  'app\\api\\user\\data-deletion\\route.ts',
  'app\\dashboard\\organizations\\[id]\\credits\\history\\page.tsx',
  'lib\\analytics\\reports.ts',
  'app\\api\\lessons\\[lessonId]\\complete\\route.ts',
  'app\\api\\organizations\\[id]\\billing\\route.ts',
  'app\\api\\stripe\\credits\\checkout\\route.ts',
  'lib\\analytics\\tracking.ts',
  'lib\\db\\blog.ts',
  'app\\api\\invitations\\route.ts',
  'lib\\email\\resend.ts',
  'app\\api\\profile\\route.ts',
  'app\\api\\export\\user-data\\route.ts',
  'app\\api\\organizations\\[id]\\webhooks\\[webhookId]\\route.ts',
  'lib\\audit\\export.ts',
  'lib\\db\\events.ts',
  'lib\\gdpr\\data-export.ts',
  'app\\api\\cron\\process-audit-exports\\route.ts',
  'app\\api\\organizations\\[id]\\members\\route.ts',
  'app\\api\\organizations\\[id]\\webhooks\\route.ts',
  'app\\api\\courses\\[id]\\enroll\\route.ts',
  'app\\api\\organizations\\[id]\\credits\\purchase\\route.ts',
  'lib\\cache\\cache-manager.ts',
  'lib\\db\\base-crud.ts',
  'app\\api\\resources\\[id]\\route.ts',
  'lib\\db\\waitlist.ts',
  'app\\api\\organizations\\[id]\\rate-limits\\route.ts',
  'lib\\webhooks\\manage.ts',
  'app\\api\\search\\route.ts',
  'app\\dashboard\\admin\\analytics\\page.tsx',
  'app\\api\\cron\\check-low-credits\\route.ts',
  'lib\\api-keys\\manage.ts',
  'lib\\permissions\\manage.ts',
  'lib\\email\\send.ts',
  'app\\api\\billing\\webhook\\route.ts',
  'lib\\middleware\\require-org-access.ts',
  'app\\api\\resources\\[id]\\download\\route.ts',
  'app\\api\\organizations\\[id]\\rate-limits\\usage\\route.ts',
  'lib\\db\\memberships.ts',
  'app\\api\\admin\\platform\\stats\\route.ts',
  'app\\api\\payments\\invoices\\[id]\\route.ts',
  'lib\\webhooks\\deliver.ts',
  'app\\api\\events\\[id]\\register\\route.ts',
  'lib\\db\\coupons.ts',
  'lib\\db\\credits.ts',
  'lib\\middleware\\rate-limiter.ts',
  'lib\\sso\\manage.ts',
  'app\\api\\export\\certificates\\route.ts',
  'app\\api\\organizations\\[id]\\reports\\[reportId]\\download\\[type]\\route.ts',
  'lib\\billing\\subscriptions.ts',
];

let tsNoCheckCount = 0;
let asAnyCount = 0;
let filesModified = new Set();

const baseDir = 'C:\\Users\\Jannik\\Documents\\GitHub\\NeuroElemental';

console.log('Starting cleanup...\n');

// Remove // @ts-nocheck from files
tsNoCheckFiles.forEach(file => {
  const filePath = path.join(baseDir, file);
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Remove // @ts-nocheck at the beginning of file
    content = content.replace(/^\/\/ @ts-nocheck\n?/m, '');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      tsNoCheckCount++;
      filesModified.add(file);
      console.log(`✓ Removed // @ts-nocheck from: ${file}`);
    }
  } catch (err) {
    console.error(`✗ Error processing ${file}: ${err.message}`);
  }
});

console.log(`\n${tsNoCheckCount} // @ts-nocheck directives removed from ${tsNoCheckCount} files\n`);
console.log(`Total unique files modified: ${filesModified.size}`);
