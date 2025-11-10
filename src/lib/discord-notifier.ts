/**
 * Discord Notifications
 * FREE webhook-based notifications for team
 * NO external dependencies beyond fetch
 */

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  timestamp?: string;
  footer?: {
    text: string;
  };
}

interface DiscordWebhookPayload {
  content?: string;
  username?: string;
  avatar_url?: string;
  embeds?: DiscordEmbed[];
}

class DiscordNotifier {
  private webhookUrl: string | undefined;

  constructor() {
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  }

  /**
   * Send simple text message
   */
  async sendMessage(message: string): Promise<void> {
    if (!this.webhookUrl) {
      console.warn("[Discord] Webhook URL not configured");
      return;
    }

    try {
      await fetch(this.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: message,
          username: "JustForView Bot",
        }),
      });
    } catch (error) {
      console.error("[Discord] Failed to send message:", error);
    }
  }

  /**
   * Send rich embed message
   */
  async sendEmbed(embed: DiscordEmbed): Promise<void> {
    if (!this.webhookUrl) {
      console.warn("[Discord] Webhook URL not configured");
      return;
    }

    try {
      await fetch(this.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "JustForView Bot",
          embeds: [embed],
        }),
      });
    } catch (error) {
      console.error("[Discord] Failed to send embed:", error);
    }
  }

  /**
   * Send error notification
   */
  async notifyError(error: Error, context?: Record<string, any>): Promise<void> {
    await this.sendEmbed({
      title: "🚨 Error Occurred",
      description: error.message,
      color: 0xff0000, // Red
      fields: [
        {
          name: "Error Type",
          value: error.name,
          inline: true,
        },
        {
          name: "Stack Trace",
          value: error.stack?.substring(0, 1000) || "N/A",
        },
        ...(context
          ? Object.entries(context).map(([key, value]) => ({
              name: key,
              value: String(value),
              inline: true,
            }))
          : []),
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "JustForView.in Error Monitor",
      },
    });
  }

  /**
   * Send new order notification
   */
  async notifyNewOrder(orderId: string, amount: number, items: number): Promise<void> {
    await this.sendEmbed({
      title: "🎉 New Order Received!",
      color: 0x00ff00, // Green
      fields: [
        {
          name: "Order ID",
          value: orderId,
          inline: true,
        },
        {
          name: "Amount",
          value: `₹${amount.toLocaleString()}`,
          inline: true,
        },
        {
          name: "Items",
          value: String(items),
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send new user registration notification
   */
  async notifyNewUser(email: string, name: string): Promise<void> {
    await this.sendEmbed({
      title: "👤 New User Registered",
      color: 0x0099ff, // Blue
      fields: [
        {
          name: "Name",
          value: name,
          inline: true,
        },
        {
          name: "Email",
          value: email,
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send system alert
   */
  async sendAlert(title: string, message: string, severity: "info" | "warning" | "critical" = "info"): Promise<void> {
    const colors = {
      info: 0x0099ff,
      warning: 0xffaa00,
      critical: 0xff0000,
    };

    const emojis = {
      info: "ℹ️",
      warning: "⚠️",
      critical: "🚨",
    };

    await this.sendEmbed({
      title: `${emojis[severity]} ${title}`,
      description: message,
      color: colors[severity],
      timestamp: new Date().toISOString(),
    });
  }
}

// Singleton instance
export const discordNotifier = new DiscordNotifier();

// Helper functions
export const notifyError = (error: Error, context?: Record<string, any>) => discordNotifier.notifyError(error, context);
export const notifyNewOrder = (orderId: string, amount: number, items: number) => discordNotifier.notifyNewOrder(orderId, amount, items);
export const notifyNewUser = (email: string, name: string) => discordNotifier.notifyNewUser(email, name);
export const sendAlert = (title: string, message: string, severity?: "info" | "warning" | "critical") => discordNotifier.sendAlert(title, message, severity);
