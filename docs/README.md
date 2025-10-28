# JustForView Documentation Index

> **Last Updated:** October 28, 2025  
> **Purpose:** Master documentation index for the JustForView.in codebase

## 📚 Core Documentation

These three documents serve as the **single source of truth** for the entire codebase and should be updated whenever changes are made:

### 🗂️ **[Routes and Components](./ROUTES_AND_COMPONENTS.md)**

Complete documentation of all application routes, page components, and reusable UI components.

**Update when:**

- Adding new pages or routes
- Creating new components
- Modifying component APIs
- Changing component categories or organization

### 🌐 **[API Endpoints](./API_ENDPOINTS.md)**

Comprehensive documentation of all API endpoints, request/response schemas, and integration patterns.

**Update when:**

- Adding new API endpoints
- Modifying request/response formats
- Changing authentication requirements
- Adding new error codes or responses

### 🎨 **[Theme System](./THEME_SYSTEM.md)**

Complete guide to the theme system including color palettes, component styling, and usage patterns.

**Update when:**

- Adding new colors or gradients
- Creating theme-aware components
- Modifying theme behavior
- Adding new styling patterns

---

## 🏗️ Architecture Overview

### **Tech Stack**

- **Framework:** Next.js 14+ (App Router)
- **UI Library:** Material-UI v5
- **Styling:** CSS-in-JS + CSS Custom Properties
- **State Management:** React Context
- **Database:** Firebase Firestore
- **Authentication:** JWT + HTTP-only cookies
- **Language:** TypeScript

### **Project Structure**

```
src/
├── app/                    # App Router pages and layouts
├── components/             # Reusable UI components
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries and configurations
├── constants/             # Application constants
└── types/                 # TypeScript type definitions

docs/                      # Documentation (this directory)
content/                   # Markdown content files
public/                    # Static assets
```

---

## 📋 Quick Reference

### **Key Concepts**

- **Server Components:** Default for pages, SEO-optimized
- **Client Components:** Interactive features, marked with "use client"
- **Theme Aware:** Components that automatically adapt to light/dark mode
- **Route Guards:** Authentication and authorization wrappers

### **Naming Conventions**

- **Pages:** `Page` suffix (e.g., `ContactPage`)
- **Components:** Descriptive names (e.g., `ModernHeroBanner`)
- **Hooks:** `use` prefix (e.g., `useThemeStyles`)
- **Contexts:** `Context` suffix (e.g., `ModernThemeContext`)

### **Development Workflow**

1. Check relevant documentation before making changes
2. Implement changes following established patterns
3. Update documentation in the three core files
4. Test in both light and dark themes
5. Verify build success and performance

---

## 🚀 Getting Started

### **Development Setup**

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run type-check
```

### **Testing**

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run e2e tests
npm run test:e2e
```

---

## 📝 Documentation Maintenance

### **Documentation Philosophy**

- **Single Source of Truth:** Three core documents contain all essential information
- **Living Documentation:** Updated with every code change
- **Developer-Friendly:** Clear examples and usage patterns
- **Future-Proof:** Structured for easy maintenance and updates

### **Update Process**

1. **Code Change Made** → Identify affected documentation
2. **Update Relevant Docs** → Modify one or more of the three core documents
3. **Review & Validate** → Ensure accuracy and completeness
4. **Commit Together** → Code and documentation changes in same commit

### **Documentation Standards**

- Use clear, concise language
- Provide code examples for complex concepts
- Include TypeScript interfaces for APIs
- Maintain consistent formatting and structure
- Add "Last Updated" dates to track changes

---

## 🔗 External Resources

### **Framework Documentation**

- [Next.js App Router](https://nextjs.org/docs/app)
- [Material-UI Components](https://mui.com/material-ui/)
- [Firebase Documentation](https://firebase.google.com/docs)

### **Development Tools**

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [VS Code Extensions](https://marketplace.visualstudio.com/VSCode)

---

## 🎯 Contributing Guidelines

### **Before Making Changes**

1. Read the relevant documentation from the three core files
2. Understand the existing patterns and conventions
3. Plan your changes to minimize breaking changes
4. Consider impact on both light and dark themes

### **Making Changes**

1. Follow existing naming conventions
2. Maintain TypeScript type safety
3. Add proper error handling
4. Test in multiple scenarios
5. Update documentation immediately

### **Code Quality Standards**

- Write self-documenting code with clear variable names
- Add TypeScript interfaces for all data structures
- Implement proper error boundaries and handling
- Follow accessibility best practices (WCAG 2.1 AA)
- Optimize for performance (Core Web Vitals)

---

_This index provides an overview of the documentation structure. For detailed information about specific aspects of the codebase, refer to the three core documentation files listed above._
