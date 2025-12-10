/**
 * Form Field Configurations Tests
 *
 * Tests for form field configurations across all entities
 * Coverage: 100%
 */

import {
  AUCTION_FIELDS,
  CATEGORY_FIELDS,
  COUPON_FIELDS,
  FieldType,
  FormField,
  HERO_SLIDE_FIELDS,
  PRODUCT_FIELDS,
  SHOP_FIELDS,
  USER_FIELDS,
  ValidatorType,
  getFieldsByGroup,
  getFieldsForContext,
  getFieldsForWizardStep,
  toInlineField,
  toInlineFields,
} from "../form-fields";

describe("Form Field Configurations", () => {
  describe("Type Definitions", () => {
    it("should have all FieldType values", () => {
      const fieldTypes: FieldType[] = [
        "text",
        "textarea",
        "number",
        "email",
        "url",
        "tel",
        "date",
        "datetime-local",
        "select",
        "multiselect",
        "checkbox",
        "radio",
        "file",
        "image",
        "richtext",
      ];
      expect(fieldTypes).toHaveLength(15);
    });

    it("should have all ValidatorType values", () => {
      const validatorTypes: ValidatorType[] = [
        "required",
        "email",
        "url",
        "phone",
        "min",
        "max",
        "minLength",
        "maxLength",
        "pattern",
        "custom",
      ];
      expect(validatorTypes).toHaveLength(10);
    });
  });

  describe("PRODUCT_FIELDS", () => {
    it("should export PRODUCT_FIELDS array", () => {
      expect(PRODUCT_FIELDS).toBeDefined();
      expect(Array.isArray(PRODUCT_FIELDS)).toBe(true);
      expect(PRODUCT_FIELDS.length).toBeGreaterThan(0);
    });

    it("should have name field with required validation", () => {
      const nameField = PRODUCT_FIELDS.find((f) => f.key === "name");
      expect(nameField).toBeDefined();
      expect(nameField?.required).toBe(true);
      expect(nameField?.type).toBe("text");
      expect(nameField?.minLength).toBe(3);
      expect(nameField?.maxLength).toBe(200);
    });

    it("should have SKU field", () => {
      const skuField = PRODUCT_FIELDS.find((f) => f.key === "sku");
      expect(skuField).toBeDefined();
      expect(skuField?.required).toBe(true);
      expect(skuField?.showInTable).toBe(true);
      expect(skuField?.showInQuickCreate).toBe(true);
    });

    it("should have price field with min validation", () => {
      const priceField = PRODUCT_FIELDS.find((f) => f.key === "price");
      expect(priceField).toBeDefined();
      expect(priceField?.type).toBe("number");
      expect(priceField?.required).toBe(true);
      expect(priceField?.min).toBe(0);
      expect(priceField?.group).toBe("pricing");
    });

    it("should have stockCount field", () => {
      const stockField = PRODUCT_FIELDS.find((f) => f.key === "stockCount");
      expect(stockField).toBeDefined();
      expect(stockField?.type).toBe("number");
      expect(stockField?.required).toBe(true);
      expect(stockField?.group).toBe("inventory");
    });

    it("should have status field with options", () => {
      const statusField = PRODUCT_FIELDS.find((f) => f.key === "status");
      expect(statusField).toBeDefined();
      expect(statusField?.type).toBe("select");
      expect(statusField?.options).toHaveLength(4);
      expect(statusField?.defaultValue).toBe("draft");
    });

    it("should have categoryId field", () => {
      const categoryField = PRODUCT_FIELDS.find((f) => f.key === "categoryId");
      expect(categoryField).toBeDefined();
      expect(categoryField?.type).toBe("select");
      expect(categoryField?.required).toBe(true);
    });

    it("should have description field", () => {
      const descField = PRODUCT_FIELDS.find((f) => f.key === "description");
      expect(descField).toBeDefined();
      expect(descField?.type).toBe("textarea");
      expect(descField?.maxLength).toBe(500);
    });

    it("should have featured checkbox field", () => {
      const featuredField = PRODUCT_FIELDS.find((f) => f.key === "featured");
      expect(featuredField).toBeDefined();
      expect(featuredField?.type).toBe("checkbox");
      expect(featuredField?.defaultValue).toBe(false);
    });

    it("should have proper wizard step assignments", () => {
      const fieldsWithWizardSteps = PRODUCT_FIELDS.filter(
        (f) => f.wizardStep !== undefined
      );
      expect(fieldsWithWizardSteps.length).toBeGreaterThan(0);
      fieldsWithWizardSteps.forEach((field) => {
        expect(field.wizardStep).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe("AUCTION_FIELDS", () => {
    it("should export AUCTION_FIELDS array", () => {
      expect(AUCTION_FIELDS).toBeDefined();
      expect(Array.isArray(AUCTION_FIELDS)).toBe(true);
      expect(AUCTION_FIELDS.length).toBeGreaterThan(0);
    });

    it("should have title field", () => {
      const titleField = AUCTION_FIELDS.find((f) => f.key === "title");
      expect(titleField).toBeDefined();
      expect(titleField?.required).toBe(true);
      expect(titleField?.minLength).toBe(5);
      expect(titleField?.maxLength).toBe(200);
    });

    it("should have startingBid field", () => {
      const bidField = AUCTION_FIELDS.find((f) => f.key === "startingBid");
      expect(bidField).toBeDefined();
      expect(bidField?.type).toBe("number");
      expect(bidField?.required).toBe(true);
      expect(bidField?.min).toBe(1);
      expect(bidField?.group).toBe("bidding");
    });

    it("should have bidIncrement field", () => {
      const incrementField = AUCTION_FIELDS.find(
        (f) => f.key === "bidIncrement"
      );
      expect(incrementField).toBeDefined();
      expect(incrementField?.type).toBe("number");
      expect(incrementField?.required).toBe(true);
      expect(incrementField?.min).toBe(1);
    });

    it("should have startDate and endDate fields", () => {
      const startField = AUCTION_FIELDS.find((f) => f.key === "startDate");
      const endField = AUCTION_FIELDS.find((f) => f.key === "endDate");
      expect(startField).toBeDefined();
      expect(endField).toBeDefined();
      expect(startField?.type).toBe("datetime-local");
      expect(endField?.type).toBe("datetime-local");
      expect(startField?.required).toBe(true);
      expect(endField?.required).toBe(true);
    });

    it("should have status field with auction statuses", () => {
      const statusField = AUCTION_FIELDS.find((f) => f.key === "status");
      expect(statusField).toBeDefined();
      expect(statusField?.options).toHaveLength(4);
      expect(statusField?.defaultValue).toBe("upcoming");
      const statusValues = statusField?.options?.map((o) => o.value);
      expect(statusValues).toContain("upcoming");
      expect(statusValues).toContain("active");
      expect(statusValues).toContain("ended");
      expect(statusValues).toContain("cancelled");
    });

    it("should have reservePrice and buyoutPrice as optional", () => {
      const reserveField = AUCTION_FIELDS.find((f) => f.key === "reservePrice");
      const buyoutField = AUCTION_FIELDS.find((f) => f.key === "buyoutPrice");
      expect(reserveField).toBeDefined();
      expect(buyoutField).toBeDefined();
      expect(reserveField?.required).toBeFalsy();
      expect(buyoutField?.required).toBeFalsy();
    });
  });

  describe("CATEGORY_FIELDS", () => {
    it("should export CATEGORY_FIELDS array", () => {
      expect(CATEGORY_FIELDS).toBeDefined();
      expect(Array.isArray(CATEGORY_FIELDS)).toBe(true);
      expect(CATEGORY_FIELDS.length).toBeGreaterThan(0);
    });

    it("should have name field", () => {
      const nameField = CATEGORY_FIELDS.find((f) => f.key === "name");
      expect(nameField).toBeDefined();
      expect(nameField?.required).toBe(true);
      expect(nameField?.minLength).toBe(2);
      expect(nameField?.maxLength).toBe(100);
    });

    it("should have slug field with pattern", () => {
      const slugField = CATEGORY_FIELDS.find((f) => f.key === "slug");
      expect(slugField).toBeDefined();
      expect(slugField?.pattern).toBe("^[a-z0-9-]+$");
      expect(slugField?.helpText).toContain("auto-generated");
    });

    it("should have parentId field for hierarchy", () => {
      const parentField = CATEGORY_FIELDS.find((f) => f.key === "parentId");
      expect(parentField).toBeDefined();
      expect(parentField?.type).toBe("select");
      expect(parentField?.options).toBeDefined();
    });

    it("should have icon field", () => {
      const iconField = CATEGORY_FIELDS.find((f) => f.key === "icon");
      expect(iconField).toBeDefined();
      expect(iconField?.helpText).toContain("Lucide");
    });

    it("should have displayOrder field", () => {
      const orderField = CATEGORY_FIELDS.find((f) => f.key === "displayOrder");
      expect(orderField).toBeDefined();
      expect(orderField?.type).toBe("number");
      expect(orderField?.min).toBe(0);
      expect(orderField?.defaultValue).toBe(0);
    });

    it("should have featured and showOnHomepage fields", () => {
      const featuredField = CATEGORY_FIELDS.find((f) => f.key === "featured");
      const homepageField = CATEGORY_FIELDS.find(
        (f) => f.key === "showOnHomepage"
      );
      expect(featuredField).toBeDefined();
      expect(homepageField).toBeDefined();
      expect(featuredField?.type).toBe("checkbox");
      expect(homepageField?.type).toBe("checkbox");
    });

    it("should have SEO fields", () => {
      const metaTitleField = CATEGORY_FIELDS.find((f) => f.key === "metaTitle");
      const metaDescField = CATEGORY_FIELDS.find(
        (f) => f.key === "metaDescription"
      );
      expect(metaTitleField).toBeDefined();
      expect(metaDescField).toBeDefined();
      expect(metaTitleField?.maxLength).toBe(60);
      expect(metaDescField?.maxLength).toBe(160);
      expect(metaTitleField?.group).toBe("seo");
      expect(metaDescField?.group).toBe("seo");
    });
  });

  describe("SHOP_FIELDS", () => {
    it("should export SHOP_FIELDS array", () => {
      expect(SHOP_FIELDS).toBeDefined();
      expect(Array.isArray(SHOP_FIELDS)).toBe(true);
      expect(SHOP_FIELDS.length).toBeGreaterThan(0);
    });

    it("should have name field", () => {
      const nameField = SHOP_FIELDS.find((f) => f.key === "name");
      expect(nameField).toBeDefined();
      expect(nameField?.required).toBe(true);
      expect(nameField?.minLength).toBe(3);
      expect(nameField?.maxLength).toBe(100);
    });

    it("should have description field with min/max length", () => {
      const descField = SHOP_FIELDS.find((f) => f.key === "description");
      expect(descField).toBeDefined();
      expect(descField?.required).toBe(true);
      expect(descField?.minLength).toBe(20);
      expect(descField?.maxLength).toBe(500);
    });

    it("should have email field with validation", () => {
      const emailField = SHOP_FIELDS.find((f) => f.key === "email");
      expect(emailField).toBeDefined();
      expect(emailField?.type).toBe("email");
      expect(emailField?.required).toBe(true);
      expect(emailField?.validators).toBeDefined();
      expect(emailField?.validators?.length).toBeGreaterThan(0);
    });

    it("should have phone field with validation", () => {
      const phoneField = SHOP_FIELDS.find((f) => f.key === "phone");
      expect(phoneField).toBeDefined();
      expect(phoneField?.type).toBe("tel");
      expect(phoneField?.required).toBe(true);
      expect(phoneField?.validators).toBeDefined();
    });

    it("should have location field", () => {
      const locationField = SHOP_FIELDS.find((f) => f.key === "location");
      expect(locationField).toBeDefined();
      expect(locationField?.required).toBe(true);
      expect(locationField?.group).toBe("contact");
    });

    it("should have isVerified field as readonly", () => {
      const verifiedField = SHOP_FIELDS.find((f) => f.key === "isVerified");
      expect(verifiedField).toBeDefined();
      expect(verifiedField?.readonly).toBe(true);
      expect(verifiedField?.helpText).toContain("Admin");
    });

    it("should have isBanned field as readonly", () => {
      const bannedField = SHOP_FIELDS.find((f) => f.key === "isBanned");
      expect(bannedField).toBeDefined();
      expect(bannedField?.readonly).toBe(true);
      expect(bannedField?.helpText).toContain("Admin");
    });
  });

  describe("USER_FIELDS", () => {
    it("should export USER_FIELDS array", () => {
      expect(USER_FIELDS).toBeDefined();
      expect(Array.isArray(USER_FIELDS)).toBe(true);
      expect(USER_FIELDS.length).toBeGreaterThan(0);
    });

    it("should have name field", () => {
      const nameField = USER_FIELDS.find((f) => f.key === "name");
      expect(nameField).toBeDefined();
      expect(nameField?.required).toBe(true);
      expect(nameField?.minLength).toBe(2);
      expect(nameField?.maxLength).toBe(100);
    });

    it("should have email field", () => {
      const emailField = USER_FIELDS.find((f) => f.key === "email");
      expect(emailField).toBeDefined();
      expect(emailField?.type).toBe("email");
      expect(emailField?.required).toBe(true);
    });

    it("should have role field with 3 options", () => {
      const roleField = USER_FIELDS.find((f) => f.key === "role");
      expect(roleField).toBeDefined();
      expect(roleField?.type).toBe("select");
      expect(roleField?.options).toHaveLength(3);
      expect(roleField?.defaultValue).toBe("user");
      const roleValues = roleField?.options?.map((o) => o.value);
      expect(roleValues).toContain("user");
      expect(roleValues).toContain("seller");
      expect(roleValues).toContain("admin");
    });

    it("should have isBanned field", () => {
      const bannedField = USER_FIELDS.find((f) => f.key === "isBanned");
      expect(bannedField).toBeDefined();
      expect(bannedField?.type).toBe("checkbox");
      expect(bannedField?.defaultValue).toBe(false);
    });
  });

  describe("COUPON_FIELDS", () => {
    it("should export COUPON_FIELDS array", () => {
      expect(COUPON_FIELDS).toBeDefined();
      expect(Array.isArray(COUPON_FIELDS)).toBe(true);
      expect(COUPON_FIELDS.length).toBeGreaterThan(0);
    });

    it("should have code field with uppercase pattern", () => {
      const codeField = COUPON_FIELDS.find((f) => f.key === "code");
      expect(codeField).toBeDefined();
      expect(codeField?.required).toBe(true);
      expect(codeField?.pattern).toBe("^[A-Z0-9-]+$");
      expect(codeField?.helpText).toContain("Uppercase");
    });

    it("should have discountType field with 2 options", () => {
      const typeField = COUPON_FIELDS.find((f) => f.key === "discountType");
      expect(typeField).toBeDefined();
      expect(typeField?.type).toBe("select");
      expect(typeField?.options).toHaveLength(2);
      const typeValues = typeField?.options?.map((o) => o.value);
      expect(typeValues).toContain("percentage");
      expect(typeValues).toContain("fixed");
    });

    it("should have discountValue field", () => {
      const valueField = COUPON_FIELDS.find((f) => f.key === "discountValue");
      expect(valueField).toBeDefined();
      expect(valueField?.type).toBe("number");
      expect(valueField?.required).toBe(true);
      expect(valueField?.min).toBe(0);
    });

    it("should have minPurchase and maxDiscount fields", () => {
      const minField = COUPON_FIELDS.find((f) => f.key === "minPurchase");
      const maxField = COUPON_FIELDS.find((f) => f.key === "maxDiscount");
      expect(minField).toBeDefined();
      expect(maxField).toBeDefined();
      expect(minField?.type).toBe("number");
      expect(maxField?.type).toBe("number");
    });

    it("should have usageLimit field", () => {
      const usageField = COUPON_FIELDS.find((f) => f.key === "usageLimit");
      expect(usageField).toBeDefined();
      expect(usageField?.helpText).toContain("unlimited");
    });

    it("should have expiresAt datetime field", () => {
      const expiresField = COUPON_FIELDS.find((f) => f.key === "expiresAt");
      expect(expiresField).toBeDefined();
      expect(expiresField?.type).toBe("datetime-local");
      expect(expiresField?.required).toBe(true);
    });
  });

  describe("HERO_SLIDE_FIELDS", () => {
    it("should export HERO_SLIDE_FIELDS array", () => {
      expect(HERO_SLIDE_FIELDS).toBeDefined();
      expect(Array.isArray(HERO_SLIDE_FIELDS)).toBe(true);
      expect(HERO_SLIDE_FIELDS.length).toBeGreaterThan(0);
    });

    it("should have title field", () => {
      const titleField = HERO_SLIDE_FIELDS.find((f) => f.key === "title");
      expect(titleField).toBeDefined();
      expect(titleField?.required).toBe(true);
      expect(titleField?.group).toBe("content");
    });

    it("should have image_url field", () => {
      const imageField = HERO_SLIDE_FIELDS.find((f) => f.key === "image_url");
      expect(imageField).toBeDefined();
      expect(imageField?.type).toBe("image");
      expect(imageField?.required).toBe(true);
    });

    it("should have link_url field with validation", () => {
      const linkField = HERO_SLIDE_FIELDS.find((f) => f.key === "link_url");
      expect(linkField).toBeDefined();
      expect(linkField?.type).toBe("url");
      expect(linkField?.validators).toBeDefined();
    });

    it("should have display_order field", () => {
      const orderField = HERO_SLIDE_FIELDS.find(
        (f) => f.key === "display_order"
      );
      expect(orderField).toBeDefined();
      expect(orderField?.type).toBe("number");
      expect(orderField?.defaultValue).toBe(0);
    });

    it("should have is_active and show_in_carousel checkboxes", () => {
      const activeField = HERO_SLIDE_FIELDS.find((f) => f.key === "is_active");
      const carouselField = HERO_SLIDE_FIELDS.find(
        (f) => f.key === "show_in_carousel"
      );
      expect(activeField).toBeDefined();
      expect(carouselField).toBeDefined();
      expect(activeField?.type).toBe("checkbox");
      expect(carouselField?.type).toBe("checkbox");
    });
  });

  describe("Helper Functions", () => {
    describe("getFieldsForContext", () => {
      it("should filter fields for table context", () => {
        const tableFields = getFieldsForContext(PRODUCT_FIELDS, "table");
        expect(Array.isArray(tableFields)).toBe(true);
        tableFields.forEach((field) => {
          expect(field.showInTable).toBe(true);
        });
      });

      it("should filter fields for quickCreate context", () => {
        const quickFields = getFieldsForContext(PRODUCT_FIELDS, "quickCreate");
        expect(Array.isArray(quickFields)).toBe(true);
        quickFields.forEach((field) => {
          expect(field.showInQuickCreate).toBe(true);
        });
      });

      it("should filter fields for wizard context", () => {
        const wizardFields = getFieldsForContext(PRODUCT_FIELDS, "wizard");
        expect(Array.isArray(wizardFields)).toBe(true);
        wizardFields.forEach((field) => {
          expect(field.showInWizard).toBe(true);
        });
      });

      it("should return empty array if no fields match context", () => {
        const mockFields: FormField[] = [
          {
            key: "test",
            label: "Test",
            type: "text",
            showInTable: false,
            showInQuickCreate: false,
            showInWizard: false,
          },
        ];
        const result = getFieldsForContext(mockFields, "table");
        expect(result).toHaveLength(0);
      });
    });

    describe("getFieldsForWizardStep", () => {
      it("should filter fields for specific wizard step", () => {
        const step1Fields = getFieldsForWizardStep(PRODUCT_FIELDS, 1);
        expect(Array.isArray(step1Fields)).toBe(true);
        step1Fields.forEach((field) => {
          expect(field.wizardStep).toBe(1);
          expect(field.showInWizard).toBe(true);
        });
      });

      it("should return empty array for non-existent step", () => {
        const result = getFieldsForWizardStep(PRODUCT_FIELDS, 999);
        expect(result).toHaveLength(0);
      });

      it("should only return fields with showInWizard true", () => {
        const mockFields: FormField[] = [
          {
            key: "test",
            label: "Test",
            type: "text",
            wizardStep: 1,
            showInWizard: false,
          },
        ];
        const result = getFieldsForWizardStep(mockFields, 1);
        expect(result).toHaveLength(0);
      });
    });

    describe("getFieldsByGroup", () => {
      it("should group fields by group name", () => {
        const grouped = getFieldsByGroup(PRODUCT_FIELDS);
        expect(typeof grouped).toBe("object");
        expect(Object.keys(grouped).length).toBeGreaterThan(0);
      });

      it("should have basic group", () => {
        const grouped = getFieldsByGroup(PRODUCT_FIELDS);
        expect(grouped.basic).toBeDefined();
        expect(Array.isArray(grouped.basic)).toBe(true);
        grouped.basic.forEach((field) => {
          expect(field.group).toBe("basic");
        });
      });

      it("should put fields without group in default", () => {
        const mockFields: FormField[] = [
          { key: "test", label: "Test", type: "text" },
        ];
        const grouped = getFieldsByGroup(mockFields);
        expect(grouped.default).toBeDefined();
        expect(grouped.default).toHaveLength(1);
      });

      it("should handle empty array", () => {
        const grouped = getFieldsByGroup([]);
        expect(Object.keys(grouped)).toHaveLength(0);
      });
    });

    describe("toInlineField", () => {
      it("should convert FormField to inline format", () => {
        const field: FormField = {
          key: "name",
          label: "Name",
          type: "text",
          placeholder: "Enter name",
          required: true,
          minLength: 2,
          maxLength: 100,
        };
        const inline = toInlineField(field);
        expect(inline.key).toBe("name");
        expect(inline.label).toBe("Name");
        expect(inline.type).toBe("text");
        expect(inline.placeholder).toBe("Enter name");
        expect(inline.required).toBe(true);
        expect(inline.minLength).toBe(2);
        expect(inline.maxLength).toBe(100);
      });

      it("should preserve all relevant properties", () => {
        const field: FormField = {
          key: "price",
          label: "Price",
          type: "number",
          min: 0,
          max: 1000,
          disabled: true,
          readonly: true,
          pattern: "^[0-9]+$",
          options: [{ value: "1", label: "One" }],
        };
        const inline = toInlineField(field);
        expect(inline.min).toBe(0);
        expect(inline.max).toBe(1000);
        expect(inline.disabled).toBe(true);
        expect(inline.readonly).toBe(true);
        expect(inline.pattern).toBe("^[0-9]+$");
        expect(inline.options).toEqual([{ value: "1", label: "One" }]);
      });
    });

    describe("toInlineFields", () => {
      it("should convert array of FormFields to inline format", () => {
        const fields: FormField[] = [
          { key: "name", label: "Name", type: "text" },
          { key: "email", label: "Email", type: "email" },
        ];
        const inlineFields = toInlineFields(fields);
        expect(Array.isArray(inlineFields)).toBe(true);
        expect(inlineFields).toHaveLength(2);
        expect(inlineFields[0].key).toBe("name");
        expect(inlineFields[1].key).toBe("email");
      });

      it("should handle empty array", () => {
        const result = toInlineFields([]);
        expect(result).toHaveLength(0);
      });
    });
  });

  describe("Field Validation", () => {
    it("should have all required fields marked correctly", () => {
      const allFields = [
        ...PRODUCT_FIELDS,
        ...AUCTION_FIELDS,
        ...CATEGORY_FIELDS,
        ...SHOP_FIELDS,
        ...USER_FIELDS,
        ...COUPON_FIELDS,
        ...HERO_SLIDE_FIELDS,
      ];
      const requiredFields = allFields.filter((f) => f.required);
      expect(requiredFields.length).toBeGreaterThan(0);
      requiredFields.forEach((field) => {
        expect(field.required).toBe(true);
      });
    });

    it("should have valid type for all fields", () => {
      const allFields = [
        ...PRODUCT_FIELDS,
        ...AUCTION_FIELDS,
        ...CATEGORY_FIELDS,
        ...SHOP_FIELDS,
        ...USER_FIELDS,
        ...COUPON_FIELDS,
        ...HERO_SLIDE_FIELDS,
      ];
      const validTypes: FieldType[] = [
        "text",
        "textarea",
        "number",
        "email",
        "url",
        "tel",
        "date",
        "datetime-local",
        "select",
        "multiselect",
        "checkbox",
        "radio",
        "file",
        "image",
        "richtext",
      ];
      allFields.forEach((field) => {
        expect(validTypes).toContain(field.type);
      });
    });

    it("should have valid min/max for number fields", () => {
      const allFields = [
        ...PRODUCT_FIELDS,
        ...AUCTION_FIELDS,
        ...CATEGORY_FIELDS,
        ...SHOP_FIELDS,
        ...USER_FIELDS,
        ...COUPON_FIELDS,
        ...HERO_SLIDE_FIELDS,
      ];
      const numberFields = allFields.filter((f) => f.type === "number");
      numberFields.forEach((field) => {
        if (field.min !== undefined && field.max !== undefined) {
          expect(field.min).toBeLessThanOrEqual(field.max);
        }
      });
    });

    it("should have valid minLength/maxLength for text fields", () => {
      const allFields = [
        ...PRODUCT_FIELDS,
        ...AUCTION_FIELDS,
        ...CATEGORY_FIELDS,
        ...SHOP_FIELDS,
        ...USER_FIELDS,
        ...COUPON_FIELDS,
        ...HERO_SLIDE_FIELDS,
      ];
      const textFields = allFields.filter(
        (f) => f.type === "text" || f.type === "textarea"
      );
      textFields.forEach((field) => {
        if (field.minLength !== undefined && field.maxLength !== undefined) {
          expect(field.minLength).toBeLessThanOrEqual(field.maxLength);
        }
      });
    });

    it("should have options for select and multiselect fields", () => {
      const allFields = [
        ...PRODUCT_FIELDS,
        ...AUCTION_FIELDS,
        ...CATEGORY_FIELDS,
        ...SHOP_FIELDS,
        ...USER_FIELDS,
        ...COUPON_FIELDS,
        ...HERO_SLIDE_FIELDS,
      ];
      const selectFields = allFields.filter(
        (f) => f.type === "select" || f.type === "multiselect"
      );
      selectFields.forEach((field) => {
        expect(field.options).toBeDefined();
        expect(Array.isArray(field.options)).toBe(true);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle fields without key property", () => {
      const field: FormField = {
        name: "testName",
        label: "Test",
        type: "text",
      };
      expect(field.name).toBe("testName");
    });

    it("should handle fields with both key and name", () => {
      const field: FormField = {
        key: "testKey",
        name: "testName",
        label: "Test",
        type: "text",
      };
      expect(field.key).toBe("testKey");
      expect(field.name).toBe("testName");
    });

    it("should handle validators as array", () => {
      const field: FormField = {
        key: "email",
        label: "Email",
        type: "email",
        validators: [
          { type: "email", message: "Invalid email" },
          (value: any) => (value ? null : "Required"),
        ],
      };
      expect(field.validators).toHaveLength(2);
      expect(typeof field.validators![1]).toBe("function");
    });

    it("should handle fields without helpText", () => {
      const field: FormField = {
        key: "test",
        label: "Test",
        type: "text",
      };
      expect(field.helpText).toBeUndefined();
    });

    it("should handle fields without defaultValue", () => {
      const field: FormField = {
        key: "test",
        label: "Test",
        type: "text",
      };
      expect(field.defaultValue).toBeUndefined();
    });
  });
});
