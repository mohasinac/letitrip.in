/**
 * Team Notifications Setup Script
 * 
 * This script helps configure team notification channels
 * Run: node scripts/setup-team-notifications.js
 * 
 * Supports:
 * - Sentry Slack Integration
 * - Email notification groups
 * - PagerDuty integration (optional)
 */

const https = require('https');

// Configuration
const SENTRY_ORG = process.env.SENTRY_ORG || 'your-organization';
const SENTRY_PROJECT = process.env.SENTRY_PROJECT || 'justforview-in';
const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;

const TEAM_CONFIG = {
  devops: {
    emails: ['devops@justforview.in', 'tech-lead@justforview.in'],
    slack: {
      channel: '#devops-alerts',
      severity: ['critical', 'high']
    }
  },
  engineering: {
    emails: ['team@justforview.in', 'engineering@justforview.in'],
    slack: {
      channel: '#engineering',
      severity: ['medium', 'low']
    }
  },
  oncall: {
    emails: ['oncall@justforview.in'],
    pagerduty: {
      integration_key: process.env.PAGERDUTY_KEY
    }
  }
};

// Notification Templates
const NOTIFICATION_TEMPLATES = {
  critical: {
    slack: {
      text: '🚨 CRITICAL ALERT',
      attachments: [
        {
          color: 'danger',
          fields: [
            { title: 'Severity', value: 'Critical', short: true },
            { title: 'Environment', value: 'Production', short: true }
          ]
        }
      ]
    },
    email: {
      subject: '🚨 [CRITICAL] Production Alert',
      priority: 'high'
    }
  },
  high: {
    slack: {
      text: '⚠️  HIGH PRIORITY ALERT',
      attachments: [
        {
          color: 'warning',
          fields: [
            { title: 'Severity', value: 'High', short: true },
            { title: 'Environment', value: 'Production', short: true }
          ]
        }
      ]
    },
    email: {
      subject: '⚠️  [HIGH] Production Alert',
      priority: 'high'
    }
  },
  medium: {
    slack: {
      text: 'ℹ️  Alert Notification',
      attachments: [
        {
          color: '#36a64f',
          fields: [
            { title: 'Severity', value: 'Medium', short: true }
          ]
        }
      ]
    },
    email: {
      subject: 'ℹ️  Production Alert',
      priority: 'normal'
    }
  }
};

// Setup Guide
function printSetupGuide() {
  console.log('📧 TEAM NOTIFICATIONS SETUP GUIDE');
  console.log('═'.repeat(60));
  console.log('\n🎯 STEP 1: Configure Email Notifications\n');
  
  console.log('1. Go to Sentry Settings:');
  console.log(`   https://sentry.io/organizations/${SENTRY_ORG}/settings/\n`);
  
  console.log('2. Navigate to: Teams → Create Team or Select Existing\n');
  
  console.log('3. Add team members:');
  Object.entries(TEAM_CONFIG).forEach(([team, config]) => {
    console.log(`\n   📌 Team: ${team.toUpperCase()}`);
    config.emails.forEach(email => console.log(`      • ${email}`));
  });
  
  console.log('\n\n🎯 STEP 2: Configure Slack Integration\n');
  
  console.log('1. Install Slack App:');
  console.log(`   https://sentry.io/organizations/${SENTRY_ORG}/integrations/slack/\n`);
  
  console.log('2. Authorize Sentry in your Slack workspace\n');
  
  console.log('3. Configure Channels:');
  Object.entries(TEAM_CONFIG).forEach(([team, config]) => {
    if (config.slack) {
      console.log(`\n   📌 ${config.slack.channel}`);
      console.log(`      Purpose: ${team} notifications`);
      console.log(`      Severity: ${config.slack.severity.join(', ')}`);
    }
  });
  
  console.log('\n\n🎯 STEP 3: Configure Alert Routing\n');
  
  console.log('1. Go to Alert Rules:');
  console.log(`   https://sentry.io/organizations/${SENTRY_ORG}/alerts/rules/\n`);
  
  console.log('2. For each rule, configure actions:\n');
  
  console.log('   📌 Critical Alerts:');
  console.log('      • Send to: DevOps Team');
  console.log('      • Slack: #devops-alerts');
  console.log('      • Email: devops@justforview.in');
  console.log('      • PagerDuty: Optional\n');
  
  console.log('   📌 High Priority:');
  console.log('      • Send to: DevOps Team');
  console.log('      • Slack: #devops-alerts');
  console.log('      • Email: team@justforview.in\n');
  
  console.log('   📌 Medium/Low:');
  console.log('      • Send to: Engineering Team');
  console.log('      • Slack: #engineering');
  console.log('      • Email: Daily digest\n');
  
  console.log('\n🎯 STEP 4: Test Notifications\n');
  
  console.log('Run test alerts:');
  console.log('   curl http://localhost:3000/api/test/sentry\n');
  
  console.log('Verify notifications:');
  console.log('   ✓ Check Slack channels for messages');
  console.log('   ✓ Check email inboxes');
  console.log('   ✓ Verify alert routing is correct\n');
  
  console.log('\n🎯 STEP 5: Configure Escalation\n');
  
  console.log('Set up escalation policies:');
  console.log('   1. No response in 15 minutes → Escalate to on-call');
  console.log('   2. No response in 30 minutes → Page senior engineer');
  console.log('   3. Critical alerts → Immediate page\n');
  
  console.log('\n📝 NOTIFICATION MATRIX\n');
  console.log('┌─────────────┬──────────────┬─────────────┬────────────┐');
  console.log('│ Severity    │ Slack        │ Email       │ PagerDuty  │');
  console.log('├─────────────┼──────────────┼─────────────┼────────────┤');
  console.log('│ Critical    │ Immediate    │ Immediate   │ Yes        │');
  console.log('│ High        │ Immediate    │ Immediate   │ No         │');
  console.log('│ Medium      │ Immediate    │ Digest      │ No         │');
  console.log('│ Low         │ No           │ Daily       │ No         │');
  console.log('└─────────────┴──────────────┴─────────────┴────────────┘\n');
}

// Slack Webhook Test
function testSlackWebhook() {
  const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;
  
  if (!SLACK_WEBHOOK) {
    console.log('⚠️  SLACK_WEBHOOK_URL not configured');
    return;
  }
  
  console.log('\n🧪 Testing Slack Webhook...\n');
  
  const message = {
    text: '🎉 JustForView.in - Notification System Test',
    attachments: [
      {
        color: '#36a64f',
        title: 'Test Alert',
        text: 'If you can see this message, Slack integration is working!',
        fields: [
          { title: 'Status', value: '✅ Connected', short: true },
          { title: 'Time', value: new Date().toISOString(), short: true }
        ],
        footer: 'JustForView Monitoring',
        ts: Math.floor(Date.now() / 1000)
      }
    ]
  };
  
  const url = new URL(SLACK_WEBHOOK);
  const options = {
    hostname: url.hostname,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const req = https.request(options, (res) => {
    if (res.statusCode === 200) {
      console.log('✅ Slack webhook test successful!');
      console.log('   Check your Slack channel for the test message.\n');
    } else {
      console.log(`❌ Slack webhook test failed (${res.statusCode})\n`);
    }
  });
  
  req.on('error', (error) => {
    console.error('❌ Slack webhook error:', error.message);
  });
  
  req.write(JSON.stringify(message));
  req.end();
}

// Email Template Generator
function generateEmailTemplates() {
  console.log('\n📧 EMAIL NOTIFICATION TEMPLATES\n');
  console.log('Add these to your email notification service:\n');
  
  console.log('═'.repeat(60));
  console.log('\n🚨 CRITICAL ALERT TEMPLATE\n');
  console.log('Subject: 🚨 [CRITICAL] {{project}} - {{error.type}}');
  console.log('Priority: High');
  console.log('Body:');
  console.log('─'.repeat(60));
  console.log(`
CRITICAL ALERT DETECTED

Project: {{project}}
Environment: {{environment}}
Error: {{error.type}}
Message: {{error.message}}
Affected Users: {{affected_users}}
First Seen: {{first_seen}}
Last Seen: {{last_seen}}
Event Count: {{event_count}}

Stack Trace:
{{stack_trace}}

View in Sentry:
{{sentry_url}}

Action Required:
1. Acknowledge this alert
2. Investigate root cause
3. Deploy fix within 1 hour
4. Post-mortem required

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JustForView.in Monitoring System
  `);
  
  console.log('\n═'.repeat(60));
  console.log('\n⚠️  HIGH PRIORITY TEMPLATE\n');
  console.log('Subject: ⚠️  [HIGH] {{project}} - {{error.type}}');
  console.log('Priority: High');
  console.log('Body:');
  console.log('─'.repeat(60));
  console.log(`
HIGH PRIORITY ALERT

Project: {{project}}
Error: {{error.type}}
Message: {{error.message}}
Event Count: {{event_count}}

View Details: {{sentry_url}}

Action Required:
- Investigate within 2 hours
- Update team on findings
  `);
}

// Main
function main() {
  console.log('🔔 TEAM NOTIFICATIONS SETUP\n');
  
  const mode = process.argv[2];
  
  switch (mode) {
    case '--test-slack':
      testSlackWebhook();
      break;
    case '--email-templates':
      generateEmailTemplates();
      break;
    case '--guide':
    default:
      printSetupGuide();
      if (process.env.SLACK_WEBHOOK_URL) {
        testSlackWebhook();
      }
      break;
  }
  
  console.log('\n✨ Next Steps:');
  console.log('   1. Follow the setup guide above');
  console.log('   2. Configure Slack integration');
  console.log('   3. Test with: node scripts/setup-team-notifications.js --test-slack');
  console.log('   4. Set up email templates');
  console.log('   5. Test end-to-end with sample alerts\n');
}

main();
