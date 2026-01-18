import { COMPANY_ALT_TEXT, COMPANY_NAME } from "@/constants/navigation";
import { WelcomeHero as LibraryWelcomeHero } from "@letitrip/react-library";

export function WelcomeHero() {
  return (
    <LibraryWelcomeHero
      title={`Welcome to ${COMPANY_NAME}`}
      description={`${COMPANY_ALT_TEXT} - Your Gateway to Authentic Collectibles`}
    />
  );
}
