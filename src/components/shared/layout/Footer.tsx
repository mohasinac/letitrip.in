import Link from "next/link";
import { FOOTER_NAVIGATION, SOCIAL_LINKS } from "@/constants/navigation";

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary">JustForView</h3>
            <p className="text-sm text-muted-foreground">
              Your trusted marketplace for authentic products, live auctions,
              and global connections with verified sellers worldwide.
            </p>
            <div className="flex space-x-4">
              {SOCIAL_LINKS.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="text-muted-foreground hover:text-primary"
                  title={social.platform}
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Footer Navigation Sections */}
          {Object.entries(FOOTER_NAVIGATION).map(([sectionKey, section]) => (
            <div key={sectionKey}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2 text-sm">
                {section.links.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© 2024 JustForView. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-primary">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
