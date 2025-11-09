/**
 * Sentry Alert Configuration Script
 *
 * This script helps configure Sentry alert rules programmatically
 * Run: node scripts/configure-sentry-alerts.js
 *
 * Prerequisites:
 * 1. SENTRY_AUTH_TOKEN in environment
 * 2. SENTRY_ORG and SENTRY_PROJECT configured
 */

const https = require("https");

// Configuration
const SENTRY_ORG = process.env.SENTRY_ORG || "your-organization";
const SENTRY_PROJECT = process.env.SENTRY_PROJECT || "justforview-in";
const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;

if (!SENTRY_AUTH_TOKEN) {
  console.error("❌ SENTRY_AUTH_TOKEN not found in environment");
  console.log(
    "💡 Get your token from: https://sentry.io/settings/account/api/auth-tokens/",
  );
  console.log("💡 Then set: export SENTRY_AUTH_TOKEN=your_token");
  process.exit(1);
}

// Alert Rule Configurations
const ALERT_RULES = [
  {
    name: "Critical Payment Errors",
    conditions: [
      {
        id: "sentry.rules.conditions.event_attribute.EventAttributeCondition",
        attribute: "transaction",
        match: "co",
        value: "/api/checkout/",
      },
    ],
    filters: [
      {
        id: "sentry.rules.filters.level.LevelFilter",
        match: "eq",
        level: "error",
      },
    ],
    actions: [
      {
        id: "sentry.mail.actions.NotifyEmailAction",
        targetType: "IssueOwners",
        targetIdentifier: "",
      },
      {
        id: "sentry.integrations.slack.notify_action.SlackNotifyServiceAction",
        workspace: "workspace_id",
        channel: "#alerts",
        tags: "priority:critical",
      },
    ],
    actionMatch: "any",
    filterMatch: "all",
    frequency: 5, // minutes
    environment: "production",
  },
  {
    name: "High Auth Failure Rate",
    conditions: [
      {
        id: "sentry.rules.conditions.event_attribute.EventAttributeCondition",
        attribute: "transaction",
        match: "co",
        value: "/api/auth/",
      },
    ],
    filters: [
      {
        id: "sentry.rules.filters.level.LevelFilter",
        match: "eq",
        level: "error",
      },
    ],
    actions: [
      {
        id: "sentry.mail.actions.NotifyEmailAction",
        targetType: "IssueOwners",
        targetIdentifier: "",
      },
    ],
    actionMatch: "any",
    filterMatch: "all",
    frequency: 5,
    environment: "production",
  },
  {
    name: "Slow API Responses",
    conditions: [
      {
        id: "sentry.rules.conditions.event_attribute.EventAttributeCondition",
        attribute: "duration",
        match: "gt",
        value: "3000", // 3 seconds
      },
    ],
    filters: [
      {
        id: "sentry.rules.filters.tagged_event.TaggedEventFilter",
        key: "transaction.op",
        match: "eq",
        value: "http.server",
      },
    ],
    actions: [
      {
        id: "sentry.mail.actions.NotifyEmailAction",
        targetType: "IssueOwners",
        targetIdentifier: "",
      },
    ],
    actionMatch: "any",
    filterMatch: "all",
    frequency: 10,
    environment: "production",
  },
  {
    name: "Rate Limit Exceeded",
    conditions: [
      {
        id: "sentry.rules.conditions.event_attribute.EventAttributeCondition",
        attribute: "http.status_code",
        match: "eq",
        value: "429",
      },
    ],
    filters: [],
    actions: [
      {
        id: "sentry.mail.actions.NotifyEmailAction",
        targetType: "IssueOwners",
        targetIdentifier: "",
      },
    ],
    actionMatch: "any",
    filterMatch: "all",
    frequency: 30,
    environment: "production",
  },
];

// API Helper
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "sentry.io",
      port: 443,
      path: `/api/0/projects/${SENTRY_ORG}/${SENTRY_PROJECT}${path}`,
      method: method,
      headers: {
        Authorization: `Bearer ${SENTRY_AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${json.detail || body}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });

    req.on("error", reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Main Configuration
async function configureAlerts() {
  console.log("🚀 Configuring Sentry Alert Rules\n");
  console.log(`Organization: ${SENTRY_ORG}`);
  console.log(`Project: ${SENTRY_PROJECT}\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const rule of ALERT_RULES) {
    try {
      console.log(`⏳ Creating: "${rule.name}"...`);

      const result = await makeRequest("POST", "/rules/", rule);

      console.log(`✅ Created: "${rule.name}" (ID: ${result.id})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed: "${rule.name}"`);
      console.error(`   Error: ${error.message}`);
      errorCount++;
    }
  }

  console.log("\n📊 Configuration Summary:");
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log(`   📝 Total: ${ALERT_RULES.length}`);

  if (successCount > 0) {
    console.log("\n✨ Alert rules configured successfully!");
    console.log(
      `📱 View in dashboard: https://sentry.io/organizations/${SENTRY_ORG}/alerts/rules/`,
    );
  }

  if (errorCount > 0) {
    console.log("\n⚠️  Some rules failed. Common issues:");
    console.log("   - Invalid Slack workspace ID (update in script)");
    console.log("   - Insufficient permissions (need project:write)");
    console.log("   - Invalid rule configuration");
    process.exit(1);
  }
}

// Manual Configuration Guide
function printManualGuide() {
  console.log("\n📖 MANUAL CONFIGURATION GUIDE");
  console.log("═".repeat(50));
  console.log("\nIf automatic configuration fails, follow these steps:\n");

  console.log("1️⃣  Go to Sentry Dashboard:");
  console.log(`   https://sentry.io/organizations/${SENTRY_ORG}/alerts/\n`);

  console.log("2️⃣  Create Alert Rules (Settings → Alerts → New Alert Rule):\n");

  console.log("   📌 Critical Payment Errors:");
  console.log("      • When: Error event");
  console.log('      • Filter: transaction contains "/api/checkout/"');
  console.log("      • Threshold: 5+ events in 5 minutes");
  console.log("      • Actions: Email team + Slack #alerts\n");

  console.log("   📌 High Auth Failure Rate:");
  console.log("      • When: Error event");
  console.log('      • Filter: transaction contains "/api/auth/"');
  console.log("      • Threshold: 10+ events in 5 minutes");
  console.log("      • Actions: Email devops\n");

  console.log("   📌 Slow API Responses:");
  console.log("      • When: Transaction event");
  console.log("      • Filter: duration > 3000ms");
  console.log("      • Threshold: 50+ events in 5 minutes");
  console.log("      • Actions: Email devops\n");

  console.log("   📌 Rate Limit Exceeded:");
  console.log("      • When: Error event");
  console.log("      • Filter: http.status_code = 429");
  console.log("      • Threshold: 100+ events in 10 minutes");
  console.log("      • Actions: Email digest\n");

  console.log("3️⃣  Test Alerts:");
  console.log("   • Visit: http://localhost:3000/api/test/sentry");
  console.log("   • Check: Sentry dashboard for test events");
  console.log("   • Verify: Email/Slack notifications received\n");
}

// Run
console.log("🔧 Sentry Alert Configuration Tool\n");

if (process.argv.includes("--manual")) {
  printManualGuide();
} else {
  configureAlerts().catch((error) => {
    console.error("\n💥 Configuration failed:", error.message);
    console.log("\n💡 Run with --manual flag for step-by-step guide:");
    console.log("   node scripts/configure-sentry-alerts.js --manual");
    process.exit(1);
  });
}
