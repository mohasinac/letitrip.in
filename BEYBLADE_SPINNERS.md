# Beyblade Loading Spinners

A collection of animated loading spinners inspired by Beyblade battle tops, perfect for a Beyblade-themed website.

## Components

### BeybladeSpinner

The main spinner component with customizable variants and colors.

```tsx
import BeybladeSpinner from "@/components/shared/BeybladeSpinner";

<BeybladeSpinner
  size="lg"
  variant="classic"
  color="blue"
  text="Loading..."
  showBattleRing={false}
  className=""
/>;
```

**Props:**

- `size`: "sm" | "md" | "lg" | "xl" - Controls the spinner size
- `variant`: "classic" | "battle" | "glow" | "pulse" - Animation style
- `color`: "blue" | "red" | "gold" | "silver" | "rainbow" - Color scheme
- `text`: string - Optional loading text
- `showBattleRing`: boolean - Show outer battle ring animation
- `className`: string - Additional CSS classes

### BeybladeeBattleSpinner

Displays two beyblades in battle with spark effects.

```tsx
import { BeybladeeBattleSpinner } from "@/components/shared/BeybladeSpinner";

<BeybladeeBattleSpinner size="md" text="Battle in Progress..." className="" />;
```

### SVGBeybladeSpinner

Uses custom SVG assets for more detailed beyblade designs.

```tsx
import { SVGBeybladeSpinner } from "@/components/shared/BeybladeSpinner";

<SVGBeybladeSpinner
  svgPath="/assets/svg/beyblades/classic-beyblade.svg"
  size="lg"
  text="Loading..."
  className=""
/>;
```

### BeybladeLoadingOverlay

Full-screen loading overlay with beyblade animation.

```tsx
import { BeybladeLoadingOverlay } from "@/components/shared/BeybladeSpinner";

<BeybladeLoadingOverlay
  text="Loading your Beyblade experience..."
  variant="battle"
/>;
```

## LoadingSpinner Integration

The existing `LoadingSpinner` component now supports a beyblade variant:

```tsx
import LoadingSpinner from "@/components/shared/LoadingSpinner";

<LoadingSpinner variant="beyblade" size="lg" color="blue" text="Loading..." />;
```

## Animation Variants

- **classic**: Standard smooth spinning animation
- **battle**: Variable speed spinning with scaling effects
- **glow**: Spinning with pulsing glow effect
- **pulse**: Spinning with opacity and scale pulsing

## Color Schemes

- **blue**: Classic blue gradient (default)
- **red**: Aggressive red gradient for battle mode
- **gold**: Premium gold gradient for special effects
- **silver**: Metallic silver gradient
- **rainbow**: Multi-color gradient for special attacks

## Custom CSS Animations

The following custom animations are available:

- `animate-spin-battle`: Variable speed battle spinning
- `animate-spin-pulse`: Spinning with scale pulsing
- `animate-spin-reverse`: Reverse direction spinning
- `animate-beyblade-wobble`: Wobbling effect for impact

## SVG Assets

Custom beyblade SVG files are located in:

- `/src/assets/svg/beyblades/classic-beyblade.svg`
- `/src/assets/svg/beyblades/battle-beyblade.svg`

You can create additional SVG designs and use them with the `SVGBeybladeSpinner` component.

## Demo

Visit `/beyblade-demo` to see all spinner variants in action with interactive examples.

## Usage Examples

### Basic Loading State

```tsx
const [loading, setLoading] = useState(true);

return (
  <div>
    {loading ? (
      <BeybladeSpinner size="lg" text="Loading battle data..." />
    ) : (
      <BattleContent />
    )}
  </div>
);
```

### Battle Loading

```tsx
<BeybladeeBattleSpinner text="Preparing for battle..." className="my-8" />
```

### Full Screen Loading

```tsx
{
  showLoading && (
    <BeybladeLoadingOverlay
      text="Loading your Beyblade adventure..."
      variant="rainbow"
    />
  );
}
```
