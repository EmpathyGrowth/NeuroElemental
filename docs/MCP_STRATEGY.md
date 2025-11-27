# MCP Strategy for NeuroElemental

## Current Configuration Analysis

### Currently Installed MCPs

| MCP Server | Purpose | Relevance to Project | Recommendation |
|------------|---------|---------------------|----------------|
| `supabase` | Database operations, SQL queries | **Critical** - Direct DB access | ✅ Keep - Essential |
| `mui-mcp` | Material UI components | **Low** - Project uses Radix/Shadcn | ❌ Remove |
| `context7` | Upstash context management | **Low** - Not using Upstash | ❌ Remove |
| `playwright-mcp` | Browser automation/testing | **High** - E2E testing | ✅ Keep |
| `filesystem` | File operations | **Redundant** - Claude Code has built-in | ❌ Remove |
| `puppeteer` | Browser automation | **Duplicate** - Playwright is better | ❌ Remove |
| `memory` | Knowledge graph memory | **Medium** - Useful for long sessions | ⚠️ Optional |
| `sequential-thinking` | Problem-solving | **Low** - Claude handles this natively | ❌ Remove |

### Issues with Current Config
1. **Redundancy**: Puppeteer + Playwright do the same thing
2. **Irrelevant**: MUI MCP when project uses Radix UI
3. **Bloat**: Filesystem MCP duplicates Claude Code's native tools
4. **Missing**: No Stripe, GitHub, or Vercel MCPs for actual stack

---

## Recommended MCP Configuration

### Essential (Must Have)

#### 1. Supabase MCP ✅ Already Added
```json
"supabase": {
  "type": "http",
  "url": "https://mcp.supabase.com/mcp"
}
```
**Use Cases:**
- Run SQL migrations directly
- Create/modify tables
- Check schema
- Debug RLS policies
- Query data for debugging

#### 2. GitHub MCP (Add)
```json
"github": {
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
  }
}
```
**Use Cases:**
- Create issues for bugs found during development
- Create PRs automatically
- Review PR comments
- Manage repository settings
- Search code across repos

#### 3. Stripe MCP (Add)
```json
"stripe": {
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "@anthropic/mcp-server-stripe"],
  "env": {
    "STRIPE_SECRET_KEY": "${STRIPE_SECRET_KEY}"
  }
}
```
**Use Cases:**
- Debug webhook payloads
- Check subscription statuses
- Verify payment intents
- Test Stripe integration
- Query customer data

### Recommended (High Value)

#### 4. Playwright MCP ✅ Already Added
Keep current config - essential for E2E testing.

**Use Cases:**
- Automated E2E testing
- Visual regression testing
- Screenshot comparisons
- Form submission testing
- Auth flow testing

#### 5. Sentry MCP (Add)
```json
"sentry": {
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "@anthropic/mcp-server-sentry"],
  "env": {
    "SENTRY_AUTH_TOKEN": "${SENTRY_AUTH_TOKEN}",
    "SENTRY_ORG": "neuroelemental"
  }
}
```
**Use Cases:**
- Query production errors
- Get stack traces for debugging
- Track error trends
- Generate fix patches

#### 6. Postgres MCP (Add - Backup to Supabase)
```json
"postgres": {
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-postgres"],
  "env": {
    "POSTGRES_CONNECTION_STRING": "${DATABASE_URL}"
  }
}
```
**Use Cases:**
- Direct SQL when Supabase MCP has issues
- Schema introspection
- Query optimization analysis

### Optional (Nice to Have)

#### 7. Memory MCP ⚠️ Keep for Now
Useful for maintaining context across long development sessions.

#### 8. Vercel MCP (Add if deploying to Vercel)
```json
"vercel": {
  "type": "http",
  "url": "https://mcp.vercel.com/api/mcp"
}
```
**Use Cases:**
- Check deployment status
- View build logs
- Manage environment variables
- Debug serverless function issues

---

## Recommended Final Configuration

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp"
    },
    "github": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      },
      "alwaysAllow": [
        "search_repositories",
        "search_code",
        "get_file_contents",
        "list_commits",
        "get_issue",
        "list_issues"
      ]
    },
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"],
      "env": {
        "CI": "true"
      },
      "alwaysAllow": [
        "playwright_navigate",
        "playwright_screenshot",
        "playwright_click",
        "playwright_fill",
        "playwright_get_visible_text"
      ]
    },
    "memory": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"],
      "alwaysAllow": ["memory_store", "memory_retrieve", "memory_search"]
    }
  }
}
```

---

## MCP Usage Patterns for NeuroElemental

### Database Development Workflow
```
1. Use Supabase MCP to:
   - Create missing tables
   - Run migrations
   - Check RLS policies
   - Debug query issues

2. Fallback to Postgres MCP if:
   - Supabase MCP auth issues
   - Need raw SQL execution
```

### Testing Workflow
```
1. Write tests in code
2. Use Playwright MCP to:
   - Run E2E tests visually
   - Capture screenshots for docs
   - Debug failing tests interactively
   - Test auth flows
```

### Debugging Workflow
```
1. Check Sentry MCP for:
   - Production errors
   - Stack traces
   - Error frequency

2. Use Supabase MCP to:
   - Query related data
   - Check audit logs
   - Verify data state
```

### Deployment Workflow
```
1. Use GitHub MCP to:
   - Create PR with changes
   - Check CI status

2. Use Vercel MCP to:
   - Monitor deployment
   - Check build logs
   - Verify env vars
```

---

## MCPs to Remove

| MCP | Reason |
|-----|--------|
| `mui-mcp` | Project uses Radix UI + Shadcn, not Material UI |
| `context7` | Not using Upstash in this project |
| `filesystem` | Redundant with Claude Code's native file tools |
| `puppeteer` | Duplicate of Playwright (Playwright is superior) |
| `sequential-thinking` | Claude handles reasoning natively |

---

## Environment Variables Needed

Add to `.env` for full MCP functionality:

```env
# GitHub MCP
GITHUB_TOKEN=ghp_xxxxxxxxxxxx

# Stripe MCP (already have STRIPE_SECRET_KEY)
# Uses existing STRIPE_SECRET_KEY

# Sentry MCP (if using Sentry)
SENTRY_AUTH_TOKEN=sntrys_xxxxxxxxxxxx
SENTRY_ORG=neuroelemental

# Database (for Postgres MCP backup)
DATABASE_URL=postgresql://...
```

---

## Implementation Priority

1. **Immediate**: Use Supabase MCP to create missing tables
2. **This Week**: Add GitHub MCP for better repo management
3. **When Needed**: Add Stripe MCP when working on billing
4. **Future**: Add Sentry/Vercel when deploying to production

---

## Security Notes

- Never commit MCP configs with hardcoded tokens
- Use environment variable references (`${VAR_NAME}`)
- Supabase MCP uses OAuth - most secure option
- GitHub token needs minimal scopes (repo read/write)
- Stripe should use restricted API keys for MCP
