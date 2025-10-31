# SEO Keywords Feature for Categories

## Overview

Categories now support SEO keywords to improve search engine optimization and discoverability. Keywords can be added, managed, and displayed in the category form.

**Status**: ✅ Implemented  
**Date**: November 1, 2025

---

## Features

### 1. **Keywords Input Field**

- Tag-based interface for easy keyword management
- Add keywords by typing and pressing Enter or clicking "Add"
- Visual tags display with remove (×) button
- Prevents duplicate keywords

### 2. **Backend Support**

- Keywords stored in `seo.keywords` array
- Validated through Zod schema
- Automatically saved and retrieved with category data

### 3. **User Interface**

- Clean, modern tag design with blue theme
- Supports both light and dark modes
- Responsive keyboard interaction (Enter to add)
- Visual feedback with hover effects

---

## Implementation Details

### Frontend Component

**File**: `src/components/admin/categories/CategoryForm.tsx`

#### Keywords Input Component

```tsx
<Controller
  name="seo.keywords"
  control={control}
  render={({ field }) => {
    const [inputValue, setInputValue] = React.useState("");
    const keywords = field.value || [];

    const handleAddKeyword = () => {
      const keyword = inputValue.trim();
      if (keyword && !keywords.includes(keyword)) {
        field.onChange([...keywords, keyword]);
        setInputValue("");
      }
    };

    const handleRemoveKeyword = (indexToRemove: number) => {
      field.onChange(keywords.filter((_, index) => index !== indexToRemove));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddKeyword();
      }
    };

    return (
      <div>
        <label>SEO Keywords</label>
        <div className="flex gap-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add keyword and press Enter"
          />
          <button onClick={handleAddKeyword}>Add</button>
        </div>
        {/* Display keywords as removable tags */}
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword, index) => (
            <span key={index} className="tag">
              {keyword}
              <button onClick={() => handleRemoveKeyword(index)}>×</button>
            </span>
          ))}
        </div>
      </div>
    );
  }}
/>
```

### Backend API

**File**: `src/app/api/admin/categories/route.ts`

Keywords are already supported through the existing SEO object:

```typescript
const newCategory: Category = {
  // ...other fields
  seo: formData.seo, // Contains keywords array
  // ...
};
```

### Data Schema

**File**: `src/lib/validations/category.ts`

```typescript
seo: z.object({
  metaTitle: z.string().max(60).optional().or(z.literal("")),
  metaDescription: z.string().max(160).optional().or(z.literal("")),
  keywords: z.array(z.string()).optional().default([]), // ✅ Keywords support
  altText: z.string().max(125).optional().or(z.literal("")),
}).optional();
```

### Type Definition

**File**: `src/types/index.ts`

```typescript
export interface CategorySEO {
  metaTitle?: string;
  metaDescription?: string;
  altText?: string;
  keywords?: string[]; // ✅ Keywords array
}

export interface Category {
  // ...other fields
  seo?: CategorySEO;
  // ...
}
```

---

## User Guide

### Adding Keywords

1. Navigate to **Admin Panel** → **Categories**
2. Click **Add Category** or edit an existing category
3. Go to **Step 2: Optional Details**
4. Scroll to the **SEO Information** section
5. In the **SEO Keywords** field:
   - Type a keyword
   - Press **Enter** or click **Add**
   - The keyword appears as a tag

### Removing Keywords

- Click the **×** button on any keyword tag
- The keyword is immediately removed

### Best Practices

**Good Keywords:**

```
beyblades
metal fusion
beyblade parts
spinning tops
competitive beyblades
```

**Keyword Guidelines:**

- Use lowercase
- Keep keywords relevant to the category
- Use specific terms (e.g., "metal fusion beyblades" instead of just "toys")
- Include plural and singular forms if relevant
- Add 5-10 keywords per category
- Avoid keyword stuffing

---

## UI Screenshots (Conceptual)

### Empty State

```
┌─────────────────────────────────────────┐
│ SEO Keywords                            │
├─────────────────────────────────────────┤
│ [Add keyword and press Enter...]  [Add] │
│                                         │
│ Add keywords relevant to this category  │
│ for better SEO                          │
└─────────────────────────────────────────┘
```

### With Keywords

```
┌─────────────────────────────────────────┐
│ SEO Keywords                            │
├─────────────────────────────────────────┤
│ [Add keyword and press Enter...]  [Add] │
│                                         │
│ ╭─────────────╮ ╭──────────────╮       │
│ │ beyblades × │ │ metal fusion × │     │
│ ╰─────────────╯ ╰──────────────╯       │
│ ╭───────────────╮ ╭─────────────────╮  │
│ │ spinning tops × │ │ competitive × │   │
│ ╰───────────────╯ ╰─────────────────╯  │
│                                         │
│ Add keywords relevant to this category  │
│ for better SEO                          │
└─────────────────────────────────────────┘
```

---

## Database Storage

### Firestore Document Structure

```json
{
  "id": "cat_1234567890_abcdefg",
  "name": "Metal Fusion",
  "slug": "buy-metal-fusion",
  "description": "Metal Fusion series beyblades",
  "seo": {
    "metaTitle": "Buy Metal Fusion Beyblades Online",
    "metaDescription": "Shop authentic Metal Fusion beyblades with fast shipping",
    "keywords": [
      "beyblades",
      "metal fusion",
      "spinning tops",
      "beyblade parts",
      "competitive beyblades"
    ],
    "altText": "Metal Fusion Beyblade Collection"
  }
}
```

---

## SEO Benefits

### 1. **Meta Keywords Tag** (Optional)

```html
<meta name="keywords" content="beyblades, metal fusion, spinning tops" />
```

### 2. **Content Optimization**

Use keywords to:

- Generate related product suggestions
- Create internal linking strategies
- Optimize category descriptions
- Improve site search functionality

### 3. **Search Engine Signals**

While meta keywords aren't directly used by Google, they help:

- Organize content strategy
- Guide content creation
- Track category focus areas
- Inform other SEO elements

---

## Technical Features

### Duplicate Prevention

```typescript
if (keyword && !keywords.includes(keyword)) {
  field.onChange([...keywords, keyword]);
}
```

### Keyboard Shortcuts

- **Enter**: Add keyword
- **Backspace**: (Future) Remove last keyword when input is empty

### Validation

- Keywords are trimmed (no leading/trailing spaces)
- Empty keywords are rejected
- Array is stored as `string[]` in Firestore

### Performance

- ✅ No API calls during typing
- ✅ Instant add/remove feedback
- ✅ Lightweight component
- ✅ Minimal re-renders

---

## API Response Example

### GET `/api/admin/categories`

```json
{
  "success": true,
  "data": [
    {
      "id": "cat_123",
      "name": "Metal Fusion",
      "slug": "buy-metal-fusion",
      "seo": {
        "metaTitle": "Buy Metal Fusion Beyblades",
        "metaDescription": "Shop authentic Metal Fusion beyblades",
        "keywords": ["beyblades", "metal fusion", "spinning tops"],
        "altText": "Metal Fusion Collection"
      }
    }
  ]
}
```

---

## Usage in Frontend

### Displaying Keywords in UI

```tsx
// In a category page
function CategoryPage({ category }: { category: Category }) {
  return (
    <>
      <Head>
        <meta
          name="keywords"
          content={category.seo?.keywords?.join(", ") || ""}
        />
      </Head>

      {/* Category content */}
    </>
  );
}
```

### Searching by Keywords

```typescript
// Filter categories by keyword
const filteredCategories = allCategories.filter((cat) =>
  cat.seo?.keywords?.some((keyword) =>
    keyword.toLowerCase().includes(searchTerm.toLowerCase())
  )
);
```

---

## Future Enhancements

### Potential Improvements

1. **Keyword Suggestions**

   - Auto-suggest popular keywords
   - Show related keywords from other categories
   - AI-powered keyword recommendations

2. **Keyword Analytics**

   - Track which keywords drive traffic
   - Show keyword performance metrics
   - Suggest optimization opportunities

3. **Keyword Limits**

   - Set max keywords per category (e.g., 10)
   - Character limit per keyword
   - Warning for over-optimization

4. **Bulk Operations**

   - Import keywords from CSV
   - Copy keywords between categories
   - Bulk update keywords

5. **Keyword Highlighting**
   - Show duplicate keywords across categories
   - Highlight unused keywords
   - Color-code by usage frequency

---

## Testing Checklist

- [x] Add single keyword
- [x] Add multiple keywords
- [x] Remove keyword
- [x] Prevent duplicate keywords
- [x] Press Enter to add
- [x] Click Add button
- [x] Display keywords as tags
- [x] Save category with keywords
- [x] Load category with keywords
- [x] Update existing keywords
- [x] Keywords persist after refresh
- [x] Dark mode support
- [x] Empty state handling

---

## Related Files

### Frontend

- `src/components/admin/categories/CategoryForm.tsx` - Form with keywords input

### Backend

- `src/app/api/admin/categories/route.ts` - API endpoints (already supports keywords)

### Validation

- `src/lib/validations/category.ts` - Zod schema validation

### Types

- `src/types/index.ts` - TypeScript interfaces

---

## Troubleshooting

### Keywords Not Saving

**Check**: Ensure SEO object is included in form submission
**Solution**: Verify `seo: formData.seo` is in the API request

### Duplicate Keywords

**Check**: Duplicate prevention logic
**Solution**: Keywords are checked with `!keywords.includes(keyword)`

### Keywords Not Displaying

**Check**: Data structure in database
**Solution**: Ensure `seo.keywords` is an array of strings

---

## Summary

✅ **Frontend**: Keywords input with tag-based UI  
✅ **Backend**: Full support through existing SEO object  
✅ **Validation**: Zod schema with array validation  
✅ **Storage**: Firestore compatible (array of strings)  
✅ **UX**: Keyboard shortcuts and visual feedback

Keywords are now fully integrated into the category management system and ready for use!
