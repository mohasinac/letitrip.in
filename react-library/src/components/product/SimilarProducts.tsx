/**
 * @deprecated Use SimilarItems from @letitrip/react-library/common instead
 */
import { ComponentType } from "react";
import { SimilarItems } from "../common/SimilarItems";

export interface SimilarProductsProps {
  productId: string;
  parentCategoryIds: string[];
  currentShopId: string;
  parentCategoryName?: string;
  products: any[];
  loading?: boolean;
  onLoadProducts?: () => void;
  showAllModal?: boolean;
  onShowAllModalChange?: (show: boolean) => void;
  ProductCardComponent: ComponentType<any>;
  CardGridComponent: ComponentType<{
    children: React.ReactNode;
    className?: string;
  }>;
  LinkComponent: ComponentType<any>;
  icons?: {
    grid?: React.ReactNode;
    x?: React.ReactNode;
    package?: React.ReactNode;
    chevronLeft?: React.ReactNode;
    chevronRight?: React.ReactNode;
  };
}

/**
 * @deprecated Use SimilarItems component instead
 * This is a backward compatibility wrapper
 */
export function SimilarProducts(props: SimilarProductsProps) {
  return (
    <SimilarItems
      items={props.products}
      currentItemId={props.productId}
      loading={props.loading}
      title="You might also like"
      categoryName={props.parentCategoryName}
      onLoadItems={props.onLoadProducts}
      showAllModal={props.showAllModal}
      onShowAllModalChange={props.onShowAllModalChange}
      ItemCardComponent={props.ProductCardComponent}
      CardGridComponent={props.CardGridComponent}
      icons={{
        grid: props.icons?.grid,
        x: props.icons?.x,
        empty: props.icons?.package,
        chevronLeft: props.icons?.chevronLeft,
        chevronRight: props.icons?.chevronRight,
      }}
    />
  );
}
