import { WelcomeHero as LibraryWelcomeHero } from "@letitrip/react-library";
import { COMPANY_NAME, COMPANY_ALT_TEXT } from "@/constants/navigation";

export function WelcomeHero() {
  return (
    <LibraryWelcomeHero
      title={`Welcome to ${COMPANY_NAME}`}
      description={`${COMPANY_ALT_TEXT} - Your Gateway to Authentic Collectibles`}
    />
  );
}
