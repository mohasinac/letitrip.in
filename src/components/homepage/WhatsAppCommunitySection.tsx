"use client";

import { useApiQuery } from "@/hooks";
import { API_ENDPOINTS, THEME_CONSTANTS } from "@/constants";
import { Button } from "@/components";

interface WhatsAppConfig {
  groupLink: string;
  memberCount: number;
  benefits: string[];
  enabled: boolean;
}

export function WhatsAppCommunitySection() {
  const { data, isLoading } = useApiQuery<{
    settings: { whatsappCommunity: WhatsAppConfig };
  }>({
    queryKey: ["site-settings", "whatsapp"],
    queryFn: () =>
      fetch(`${API_ENDPOINTS.SITE_SETTINGS.GET}?fields=whatsappCommunity`).then(
        (r) => r.json(),
      ),
  });

  if (isLoading) {
    return (
      <section
        className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgSecondary}`}
      >
        <div className={`${THEME_CONSTANTS.container.xl} mx-auto`}>
          <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
        </div>
      </section>
    );
  }

  const config = data?.settings?.whatsappCommunity;

  if (!config || !config.enabled) {
    return null;
  }

  const benefits = config.benefits || [
    "Exclusive deals and early access",
    "Product launch notifications",
    "Community support from members",
    "Tips and tricks from experts",
  ];

  return (
    <section
      className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgSecondary}`}
    >
      <div className={`${THEME_CONSTANTS.container.xl} mx-auto`}>
        <div
          className={`bg-gradient-to-br from-green-500 to-green-600 ${THEME_CONSTANTS.borderRadius["2xl"]} ${THEME_CONSTANTS.spacing.padding.xl} text-white overflow-hidden relative`}
        >
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="whatsapp-pattern"
                  x="0"
                  y="0"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="20" cy="20" r="2" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#whatsapp-pattern)" />
            </svg>
          </div>

          <div className="relative z-10 text-center">
            {/* WhatsApp Icon */}
            <div className="text-7xl mb-6">💬</div>

            {/* Heading */}
            <h2 className={`${THEME_CONSTANTS.typography.h2} mb-3`}>
              Join Our WhatsApp Community
            </h2>
            <p className="text-lg md:text-xl mb-2 opacity-90">
              Connect with {config.memberCount?.toLocaleString() || "10,000+"}{" "}
              members
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto my-8">
              {benefits.slice(0, 4).map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 text-left bg-white/10 backdrop-blur-sm p-4 rounded-lg"
                >
                  <svg
                    className="w-6 h-6 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm md:text-base">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={() => window.open(config.groupLink, "_blank")}
              className="bg-white text-green-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl"
            >
              <svg
                className="w-6 h-6 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Join Group Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
