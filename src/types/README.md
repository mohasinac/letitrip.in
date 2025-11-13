/\*\*

- TYPE SYSTEM ARCHITECTURE
-
- This file defines the architecture for separating Frontend and Backend types
- to ensure proper type safety and data transformation across the application.
-
- PRINCIPLES:
- 1.  Frontend types (FE) - Used in React components, hooks, and context
- 2.  Backend types (BE) - Match API response structure exactly
- 3.  Transformation functions - Convert between FE and BE types
- 4.  No 'any' types allowed - Strict type checking enforced
-
- STRUCTURE:
- /types
- /frontend - UI-specific types (ProductFE, AuctionFE, etc.)
- /backend - API response types (ProductBE, AuctionBE, etc.)
- /shared - Common types used by both (Status, Role, etc.)
- /transforms - Conversion functions (toFE, toBE)
-
- NAMING CONVENTION:
- - Frontend: TypeNameFE (e.g., ProductFE, UserFE)
- - Backend: TypeNameBE (e.g., ProductBE, UserBE)
- - Shared: TypeName (e.g., Status, Role)
- - Transform to FE: toFETypeName (e.g., toFEProduct)
- - Transform to BE: toBETypeName (e.g., toBEProduct)
-
- USAGE EXAMPLE:
-
- // In API service
- async getProduct(id: string): Promise<ProductFE> {
- const response = await apiService.get<ProductBE>(`/products/${id}`);
- return toFEProduct(response);
- }
-
- // In component
- const ProductCard: React.FC<{ product: ProductFE }> = ({ product }) => {
- return <div>{product.name}</div>;
- };
-
- // In form submission
- const handleSubmit = async (data: ProductFE) => {
- await productService.create(toBEProduct(data));
- };
  \*/

export const TYPE_SYSTEM_VERSION = '1.0.0';

/\*\*

- Type transformation guidelines:
-
- FRONTEND TYPES:
- - Use Date objects for dates
- - Use number for numeric values
- - Use boolean for flags
- - Use arrays for collections
- - Include UI-specific fields (isExpanded, isSelected, etc.)
-
- BACKEND TYPES:
- - Match API response structure exactly
- - Use string for timestamps (ISO 8601)
- - Use Timestamp for Firestore timestamps
- - May include nested objects from database
- - No UI-specific fields
-
- TRANSFORMATION:
- - toFE: Convert BE type to FE type
- - Parse ISO strings to Date objects
- - Convert Firestore Timestamps to Date
- - Add default values for optional fields
- - Remove server-only fields
-
- - toBE: Convert FE type to BE type
- - Convert Date objects to ISO strings
- - Remove UI-specific fields
- - Ensure required fields are present
- - Validate data before sending
    \*/

// Export for documentation purposes
export {};
