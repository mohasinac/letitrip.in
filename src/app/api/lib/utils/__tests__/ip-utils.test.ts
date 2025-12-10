/**
 * Unit Tests for IP Utility Functions
 * Tests IP address extraction and validation
 */

import { NextRequest } from "next/server";
import { getAllForwardedIps, getClientIp, isPrivateIp } from "../ip-utils";

describe("ip-utils", () => {
  describe("getClientIp", () => {
    it("should extract IP from x-forwarded-for header", () => {
      const request = new NextRequest("http://localhost/test", {
        headers: {
          "x-forwarded-for": "192.168.1.100",
        },
      });

      expect(getClientIp(request)).toBe("192.168.1.100");
    });

    it("should take first IP from multiple forwarded IPs", () => {
      const request = new NextRequest("http://localhost/test", {
        headers: {
          "x-forwarded-for": "203.0.113.1, 192.168.1.100, 10.0.0.1",
        },
      });

      expect(getClientIp(request)).toBe("203.0.113.1");
    });

    it("should trim whitespace from forwarded IP", () => {
      const request = new NextRequest("http://localhost/test", {
        headers: {
          "x-forwarded-for": "  203.0.113.1  ",
        },
      });

      expect(getClientIp(request)).toBe("203.0.113.1");
    });

    it("should fall back to x-real-ip header", () => {
      const request = new NextRequest("http://localhost/test", {
        headers: {
          "x-real-ip": "203.0.113.5",
        },
      });

      expect(getClientIp(request)).toBe("203.0.113.5");
    });

    it("should prefer x-forwarded-for over x-real-ip", () => {
      const request = new NextRequest("http://localhost/test", {
        headers: {
          "x-forwarded-for": "203.0.113.1",
          "x-real-ip": "203.0.113.5",
        },
      });

      expect(getClientIp(request)).toBe("203.0.113.1");
    });

    it("should return 'unknown' when no IP headers present", () => {
      const request = new NextRequest("http://localhost/test");

      expect(getClientIp(request)).toBe("unknown");
    });

    it("should handle empty x-forwarded-for header", () => {
      const request = new NextRequest("http://localhost/test", {
        headers: {
          "x-forwarded-for": "",
          "x-real-ip": "203.0.113.5",
        },
      });

      expect(getClientIp(request)).toBe("203.0.113.5");
    });

    it("should handle IPv6 addresses", () => {
      const request = new NextRequest("http://localhost/test", {
        headers: {
          "x-forwarded-for": "2001:0db8:85a3::8a2e:0370:7334",
        },
      });

      expect(getClientIp(request)).toBe("2001:0db8:85a3::8a2e:0370:7334");
    });

    it("should handle localhost IPv6", () => {
      const request = new NextRequest("http://localhost/test", {
        headers: {
          "x-forwarded-for": "::1",
        },
      });

      expect(getClientIp(request)).toBe("::1");
    });
  });

  describe("getAllForwardedIps", () => {
    it("should return array of all forwarded IPs", () => {
      const request = new NextRequest("http://localhost/test", {
        headers: {
          "x-forwarded-for": "203.0.113.1, 192.168.1.100, 10.0.0.1",
        },
      });

      expect(getAllForwardedIps(request)).toEqual([
        "203.0.113.1",
        "192.168.1.100",
        "10.0.0.1",
      ]);
    });

    it("should return single IP as array", () => {
      const request = new NextRequest("http://localhost/test", {
        headers: {
          "x-forwarded-for": "203.0.113.1",
        },
      });

      expect(getAllForwardedIps(request)).toEqual(["203.0.113.1"]);
    });

    it("should trim whitespace from all IPs", () => {
      const request = new NextRequest("http://localhost/test", {
        headers: {
          "x-forwarded-for": "  203.0.113.1  ,  192.168.1.100  ,  10.0.0.1  ",
        },
      });

      expect(getAllForwardedIps(request)).toEqual([
        "203.0.113.1",
        "192.168.1.100",
        "10.0.0.1",
      ]);
    });

    it("should return empty array when no forwarded header", () => {
      const request = new NextRequest("http://localhost/test");

      expect(getAllForwardedIps(request)).toEqual([]);
    });

    it("should return empty array for empty header", () => {
      const request = new NextRequest("http://localhost/test", {
        headers: {
          "x-forwarded-for": "",
        },
      });

      expect(getAllForwardedIps(request)).toEqual([]);
    });

    it("should handle mixed IPv4 and IPv6 addresses", () => {
      const request = new NextRequest("http://localhost/test", {
        headers: {
          "x-forwarded-for": "203.0.113.1, 2001:db8::1, 192.168.1.1",
        },
      });

      expect(getAllForwardedIps(request)).toEqual([
        "203.0.113.1",
        "2001:db8::1",
        "192.168.1.1",
      ]);
    });

    it("should handle many forwarded IPs", () => {
      const ips = Array.from({ length: 10 }, (_, i) => `203.0.113.${i}`);
      const request = new NextRequest("http://localhost/test", {
        headers: {
          "x-forwarded-for": ips.join(", "),
        },
      });

      expect(getAllForwardedIps(request)).toEqual(ips);
    });
  });

  describe("isPrivateIp", () => {
    describe("IPv4 Private Ranges", () => {
      it("should identify 10.x.x.x as private", () => {
        expect(isPrivateIp("10.0.0.1")).toBe(true);
        expect(isPrivateIp("10.255.255.255")).toBe(true);
        expect(isPrivateIp("10.123.45.67")).toBe(true);
      });

      it("should identify 172.16-31.x.x as private", () => {
        expect(isPrivateIp("172.16.0.1")).toBe(true);
        expect(isPrivateIp("172.31.255.255")).toBe(true);
        expect(isPrivateIp("172.20.100.50")).toBe(true);
      });

      it("should NOT identify 172.15.x.x as private", () => {
        expect(isPrivateIp("172.15.0.1")).toBe(false);
      });

      it("should NOT identify 172.32.x.x as private", () => {
        expect(isPrivateIp("172.32.0.1")).toBe(false);
      });

      it("should identify 192.168.x.x as private", () => {
        expect(isPrivateIp("192.168.0.1")).toBe(true);
        expect(isPrivateIp("192.168.255.255")).toBe(true);
        expect(isPrivateIp("192.168.1.100")).toBe(true);
      });

      it("should identify 127.x.x.x as private (localhost)", () => {
        expect(isPrivateIp("127.0.0.1")).toBe(true);
        expect(isPrivateIp("127.255.255.255")).toBe(true);
        expect(isPrivateIp("127.0.1.1")).toBe(true);
      });

      it("should identify 169.254.x.x as private (link-local)", () => {
        expect(isPrivateIp("169.254.0.1")).toBe(true);
        expect(isPrivateIp("169.254.255.255")).toBe(true);
        expect(isPrivateIp("169.254.100.100")).toBe(true);
      });
    });

    describe("IPv4 Public Addresses", () => {
      it("should identify public IPs as not private", () => {
        expect(isPrivateIp("8.8.8.8")).toBe(false);
        expect(isPrivateIp("1.1.1.1")).toBe(false);
        expect(isPrivateIp("203.0.113.1")).toBe(false);
        expect(isPrivateIp("198.51.100.1")).toBe(false);
      });

      it("should handle edge cases near private ranges", () => {
        expect(isPrivateIp("9.255.255.255")).toBe(false);
        expect(isPrivateIp("11.0.0.0")).toBe(false);
        expect(isPrivateIp("172.15.255.255")).toBe(false);
        expect(isPrivateIp("172.32.0.0")).toBe(false);
        expect(isPrivateIp("192.167.255.255")).toBe(false);
        expect(isPrivateIp("192.169.0.0")).toBe(false);
      });
    });

    describe("IPv6 Addresses", () => {
      it("should identify ::1 as private (localhost)", () => {
        expect(isPrivateIp("::1")).toBe(true);
      });

      it("should identify fc00::/7 as private (unique local)", () => {
        expect(isPrivateIp("fc00::1")).toBe(true);
        expect(isPrivateIp("fdff:ffff:ffff:ffff:ffff:ffff:ffff:ffff")).toBe(
          true
        );
      });

      it("should identify fe80::/10 as private (link-local)", () => {
        expect(isPrivateIp("fe80::1")).toBe(true);
        expect(isPrivateIp("fe80:1234:5678:abcd::1")).toBe(true);
      });

      it("should identify public IPv6 as not private", () => {
        expect(isPrivateIp("2001:db8::1")).toBe(false);
        expect(isPrivateIp("2001:4860:4860::8888")).toBe(false); // Google DNS
      });
    });

    describe("Edge Cases", () => {
      it("should handle 'unknown' as not private", () => {
        expect(isPrivateIp("unknown")).toBe(false);
      });

      it("should handle invalid IP formats", () => {
        expect(isPrivateIp("not-an-ip")).toBe(false);
        expect(isPrivateIp("")).toBe(false);
        expect(isPrivateIp("256.256.256.256")).toBe(false);
      });

      it("should handle partial IPs", () => {
        expect(isPrivateIp("10.0")).toBe(false);
        expect(isPrivateIp("192.168")).toBe(false);
      });

      it("should handle IPs with extra characters", () => {
        expect(isPrivateIp("192.168.1.1:8080")).toBe(false);
        expect(isPrivateIp("192.168.1.1/24")).toBe(false);
      });
    });
  });

  describe("Integration Scenarios", () => {
    it("should handle typical proxy chain", () => {
      const request = new NextRequest("http://localhost/test", {
        headers: {
          "x-forwarded-for": "203.0.113.1, 10.0.0.1, 192.168.1.1",
          "x-real-ip": "192.168.1.1",
        },
      });

      const clientIp = getClientIp(request);
      const allIps = getAllForwardedIps(request);

      expect(clientIp).toBe("203.0.113.1");
      expect(allIps).toHaveLength(3);
      expect(isPrivateIp(allIps[0])).toBe(false); // Public IP
      expect(isPrivateIp(allIps[1])).toBe(true); // Private proxy
      expect(isPrivateIp(allIps[2])).toBe(true); // Private proxy
    });

    it("should identify originating IP from proxy chain", () => {
      const request = new NextRequest("http://localhost/test", {
        headers: {
          "x-forwarded-for": "203.0.113.5, 172.16.0.1, 192.168.1.1",
        },
      });

      const allIps = getAllForwardedIps(request);
      const publicIps = allIps.filter((ip) => !isPrivateIp(ip));

      expect(publicIps).toEqual(["203.0.113.5"]);
      expect(publicIps[0]).toBe(getClientIp(request));
    });

    it("should handle load balancer scenario", () => {
      const request = new NextRequest("http://localhost/test", {
        headers: {
          "x-forwarded-for": "203.0.113.10",
          "x-real-ip": "10.0.0.5",
        },
      });

      const clientIp = getClientIp(request);
      expect(clientIp).toBe("203.0.113.10");
      expect(isPrivateIp(clientIp)).toBe(false);
    });

    it("should handle direct connection (no proxy)", () => {
      const request = new NextRequest("http://localhost/test");

      const clientIp = getClientIp(request);
      const allIps = getAllForwardedIps(request);

      expect(clientIp).toBe("unknown");
      expect(allIps).toEqual([]);
    });

    it("should handle CloudFlare CDN headers", () => {
      const request = new NextRequest("http://localhost/test", {
        headers: {
          "x-forwarded-for": "203.0.113.20, 104.16.0.1",
          "cf-connecting-ip": "203.0.113.20",
        },
      });

      const clientIp = getClientIp(request);
      expect(clientIp).toBe("203.0.113.20");
    });

    it("should handle AWS ALB headers", () => {
      const request = new NextRequest("http://localhost/test", {
        headers: {
          "x-forwarded-for": "203.0.113.30, 10.0.1.50",
        },
      });

      const allIps = getAllForwardedIps(request);
      expect(allIps[0]).toBe("203.0.113.30");
      expect(isPrivateIp(allIps[1])).toBe(true);
    });

    it("should handle localhost development", () => {
      const request = new NextRequest("http://localhost:3000/test", {
        headers: {
          "x-forwarded-for": "127.0.0.1",
        },
      });

      const clientIp = getClientIp(request);
      expect(clientIp).toBe("127.0.0.1");
      expect(isPrivateIp(clientIp)).toBe(true);
    });

    it("should handle Docker network", () => {
      const request = new NextRequest("http://localhost/test", {
        headers: {
          "x-forwarded-for": "172.17.0.2",
        },
      });

      const clientIp = getClientIp(request);
      expect(isPrivateIp(clientIp)).toBe(true);
    });
  });

  describe("Security Scenarios", () => {
    it("should handle IP spoofing attempt", () => {
      // Attacker tries to spoof IP by including malicious header
      const request = new NextRequest("http://localhost/test", {
        headers: {
          "x-forwarded-for": "'; DROP TABLE users; --, 192.168.1.1",
        },
      });

      const clientIp = getClientIp(request);
      // Should return the malicious string as-is (validation happens elsewhere)
      expect(clientIp).toContain("DROP TABLE");
    });

    it("should handle very long IP chain", () => {
      const manyIps = Array.from({ length: 100 }, (_, i) => `10.0.0.${i}`);
      const request = new NextRequest("http://localhost/test", {
        headers: {
          "x-forwarded-for": manyIps.join(", "),
        },
      });

      const allIps = getAllForwardedIps(request);
      expect(allIps).toHaveLength(100);
      expect(getClientIp(request)).toBe("10.0.0.0");
    });

    it("should handle empty strings in IP chain", () => {
      const request = new NextRequest("http://localhost/test", {
        headers: {
          "x-forwarded-for": "203.0.113.1, , 192.168.1.1",
        },
      });

      const allIps = getAllForwardedIps(request);
      expect(allIps).toContain("");
      expect(allIps).toHaveLength(3);
    });
  });

  describe("Rate Limiting Use Case", () => {
    it("should provide consistent identifier for rate limiting", () => {
      const request1 = new NextRequest("http://localhost/test", {
        headers: {
          "x-forwarded-for": "203.0.113.1, 10.0.0.1",
        },
      });

      const request2 = new NextRequest("http://localhost/test", {
        headers: {
          "x-forwarded-for": "203.0.113.1, 10.0.0.2",
        },
      });

      // Same client, different proxies - should have same IP for rate limiting
      expect(getClientIp(request1)).toBe(getClientIp(request2));
    });

    it("should differentiate between different clients", () => {
      const request1 = new NextRequest("http://localhost/test", {
        headers: {
          "x-forwarded-for": "203.0.113.1",
        },
      });

      const request2 = new NextRequest("http://localhost/test", {
        headers: {
          "x-forwarded-for": "203.0.113.2",
        },
      });

      expect(getClientIp(request1)).not.toBe(getClientIp(request2));
    });
  });

  describe("Logging and Analytics Use Case", () => {
    it("should provide full IP chain for audit logs", () => {
      const request = new NextRequest("http://localhost/test", {
        headers: {
          "x-forwarded-for": "203.0.113.1, 10.0.0.1, 192.168.1.1",
        },
      });

      const logData = {
        clientIp: getClientIp(request),
        ipChain: getAllForwardedIps(request),
        isPrivate: isPrivateIp(getClientIp(request)),
      };

      expect(logData.clientIp).toBe("203.0.113.1");
      expect(logData.ipChain).toHaveLength(3);
      expect(logData.isPrivate).toBe(false);
    });
  });
});
