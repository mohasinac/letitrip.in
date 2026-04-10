/**
 * CarouselSlideForm Component
 * Path: src/components/admin/carousel/CarouselSlideForm.tsx
 *
 * Form for creating/editing carousel slides inside SideDrawer.
 * The grid layout section lets admins place up to 6 content cards in a
 * fixed 2-row × 3-column grid (Top/Bottom × Left/Center/Right).
 */

"use client";

import { useState } from "react";
import { nowMs } from "@/utils";
import { Heading, Label, Text } from "@mohasinac/appkit/ui";
import { Button, Checkbox, FormField, FormGroup, Select } from "@/components";
import { useMediaUpload } from "@/hooks";
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import { useTranslations } from "next-intl";
import type { CarouselSlide, GridCard } from "./Carousel.types";

const { spacing, themed, flex } = THEME_CONSTANTS;

type CellKey = `${number},${number}`;

function makeNewCard(gridRow: 1 | 2, gridCol: 1 | 2 | 3): GridCard {
  return {
    id: `card-${gridRow}-${gridCol}-${nowMs()}`,
    gridRow,
    gridCol,
    background: { type: "color", value: "#3b82f6" },
    content: { title: "", subtitle: "", description: "" },
    buttons: [],
    isButtonOnly: false,
    sizing: { widthPct: 100, heightPct: 100, padding: "md" },
  };
}

// -- Props -------------------------------------------------------------------------------------

interface CarouselSlideFormProps {
  slide: CarouselSlide;
  onChange: (updated: CarouselSlide) => void;
  isReadonly?: boolean;
}

// -- Main form ---------------------------------------------------------------------------

export function CarouselSlideForm({
  slide,
  onChange,
  isReadonly = false,
}: CarouselSlideFormProps) {
  const t = useTranslations("adminCarousel");
  const { upload } = useMediaUpload();
  const [editingCell, setEditingCell] = useState<CellKey | null>(null);

  const update = (partial: Partial<CarouselSlide>) =>
    onChange({ ...slide, ...partial });

  const getCard = (gridRow: 1 | 2, gridCol: 1 | 2 | 3): GridCard | undefined =>
    slide.cards.find((c) => c.gridRow === gridRow && c.gridCol === gridCol);

  const upsertCard = (card: GridCard) => {
    const rest = slide.cards.filter(
      (c) => !(c.gridRow === card.gridRow && c.gridCol === card.gridCol),
    );
    update({ cards: [...rest, card] });
  };

  const removeCard = (gridRow: 1 | 2, gridCol: 1 | 2 | 3) => {
    update({
      cards: slide.cards.filter(
        (c) => !(c.gridRow === gridRow && c.gridCol === gridCol),
      ),
    });
    const key: CellKey = `${gridRow},${gridCol}`;
    if (editingCell === key) setEditingCell(null);
  };

  const colLabel = (col: 1 | 2 | 3) =>
    col === 1 ? t("colLeft") : col === 2 ? t("colCenter") : t("colRight");

  const cardCount = (slide.cards ?? []).length;

  /** True when the given row already has a card placed in any column */
  const rowHasCard = (row: 1 | 2) => slide.cards.some((c) => c.gridRow === row);

  return (
    <div className={spacing.stack}>
      {/* -- Slide metadata -------------------------------------------- */}
      <FormField
        name="title"
        label="Title"
        type="text"
        value={slide.title}
        onChange={(value) => update({ title: value })}
        disabled={isReadonly}
      />
      {!isReadonly && (
        <FormField
          name="slideImage"
          label="Slide Image"
          type="image"
          value={slide.media?.url ?? ""}
          onUpload={(file) =>
            upload(file, "carousel", true, {
              type: "carousel-image",
              title: slide.title || "slide",
            })
          }
          onChange={(url) =>
            update({ media: { type: "image", url, alt: slide.title || "" } })
          }
          helpText="Recommended: 1920×600 px"
        />
      )}
      <FormField
        name="linkUrl"
        label="Link URL (optional)"
        type="text"
        value={slide.link?.url ?? ""}
        onChange={(value) =>
          update({
            link: value
              ? { url: value, openInNewTab: slide.link?.openInNewTab ?? false }
              : undefined,
          })
        }
        disabled={isReadonly}
      />
      <FormGroup columns={2}>
        <FormField
          name="order"
          label="Order"
          type="number"
          value={String(slide.order)}
          onChange={(value) => update({ order: parseInt(value) || 0 })}
          disabled={isReadonly}
        />
        <div className="flex items-end pb-1">
          <Checkbox
            checked={slide.active}
            onChange={(e) => update({ active: e.target.checked })}
            disabled={isReadonly}
            label={UI_LABELS.STATUS.ACTIVE}
          />
        </div>
      </FormGroup>
      {/* -- Central overlay (mutually exclusive with cards) --------- */}
      <div className={`border-t ${themed.border} pt-4`}>
        <div className={`${flex.between} mb-3`}>
          <div>
            <Heading level={3} className="mb-0.5">
              {t("overlayMode")}
            </Heading>
            <Text variant="muted" size="xs">
              {t("overlayModeSubtitle")}
            </Text>
          </div>
          {!isReadonly && (
            <Checkbox
              checked={!!slide.overlay}
              onChange={(e) =>
                update({
                  overlay: e.target.checked
                    ? { title: "", subtitle: "", description: "" }
                    : null,
                  // Clear cards when switching to overlay mode
                  ...(e.target.checked ? { cards: [] } : {}),
                })
              }
              label=""
            />
          )}
        </div>

        {slide.overlay && (
          <div className="space-y-2">
            <FormField
              name="overlay-subtitle"
              label={t("overlaySubtitle")}
              type="text"
              value={slide.overlay.subtitle ?? ""}
              onChange={(val) =>
                update({ overlay: { ...slide.overlay!, subtitle: val } })
              }
              disabled={isReadonly}
            />
            <FormField
              name="overlay-title"
              label={t("overlayTitle")}
              type="text"
              value={slide.overlay.title ?? ""}
              onChange={(val) =>
                update({ overlay: { ...slide.overlay!, title: val } })
              }
              disabled={isReadonly}
            />
            <FormField
              name="overlay-description"
              label={t("overlayDescription")}
              type="textarea"
              rows={2}
              value={slide.overlay.description ?? ""}
              onChange={(val) =>
                update({ overlay: { ...slide.overlay!, description: val } })
              }
              disabled={isReadonly}
            />
            {/* Optional button */}
            <div className={`border ${themed.border} rounded-lg p-3 space-y-2`}>
              <div className={flex.between}>
                <Label className="text-xs font-medium">
                  {t("overlayButton")}
                </Label>
                {!isReadonly && (
                  <Checkbox
                    checked={!!slide.overlay.button}
                    onChange={(e) =>
                      update({
                        overlay: {
                          ...slide.overlay!,
                          button: e.target.checked
                            ? {
                                id: `btn-overlay-${nowMs()}`,
                                text: "",
                                link: "",
                                variant: "primary",
                                openInNewTab: false,
                              }
                            : undefined,
                        },
                      })
                    }
                    label={t("enableButton")}
                  />
                )}
              </div>
              {slide.overlay.button && (
                <div className="space-y-2">
                  <FormGroup columns={2}>
                    <FormField
                      name="overlay-btn-text"
                      label={t("buttonText")}
                      type="text"
                      value={slide.overlay.button.text}
                      onChange={(val) =>
                        update({
                          overlay: {
                            ...slide.overlay!,
                            button: { ...slide.overlay!.button!, text: val },
                          },
                        })
                      }
                      disabled={isReadonly}
                    />
                    <FormField
                      name="overlay-btn-link"
                      label={t("buttonLink")}
                      type="text"
                      value={slide.overlay.button.link}
                      onChange={(val) =>
                        update({
                          overlay: {
                            ...slide.overlay!,
                            button: { ...slide.overlay!.button!, link: val },
                          },
                        })
                      }
                      disabled={isReadonly}
                    />
                  </FormGroup>
                  <FormGroup columns={2}>
                    <Select
                      value={slide.overlay.button.variant}
                      onChange={(e) =>
                        update({
                          overlay: {
                            ...slide.overlay!,
                            button: {
                              ...slide.overlay!.button!,
                              variant: e.target.value as
                                | "primary"
                                | "secondary"
                                | "outline",
                            },
                          },
                        })
                      }
                      options={[
                        { value: "primary", label: t("variantPrimary") },
                        { value: "secondary", label: t("variantSecondary") },
                        { value: "outline", label: t("variantOutline") },
                      ]}
                    />
                    <div className="flex items-end pb-1">
                      <Checkbox
                        checked={slide.overlay.button.openInNewTab}
                        onChange={(e) =>
                          update({
                            overlay: {
                              ...slide.overlay!,
                              button: {
                                ...slide.overlay!.button!,
                                openInNewTab: e.target.checked,
                              },
                            },
                          })
                        }
                        disabled={isReadonly}
                        label={t("openInNewTab")}
                      />
                    </div>
                  </FormGroup>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* -- 2×3 grid designer (max 2 cards) — hidden when overlay active */}
      {!slide.overlay && (
        <div className={`border-t ${themed.border} pt-4`}>
          <Heading level={3} className="mb-1.5">
            {t("gridLayout")}
          </Heading>
          <Text variant="secondary" size="sm" className="mb-1.5">
            {t("gridLayoutSubtitle")}
          </Text>
          <Text variant="muted" size="xs" className="mb-4">
            {t("cardCount", { count: cardCount })}
          </Text>

          {([1, 2] as const).map((row) => (
            <div key={row} className="mb-5">
              <Label className="block mb-2 text-xs font-semibold uppercase tracking-wide">
                {row === 1 ? t("topRow") : t("bottomRow")}
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {([1, 2, 3] as const).map((col) => {
                  const card = getCard(row, col);
                  const cellKey: CellKey = `${row},${col}`;
                  const isEditing = editingCell === cellKey;

                  return (
                    <div
                      key={col}
                      className={`border ${themed.border} rounded-xl overflow-hidden`}
                    >
                      {/* Cell header */}
                      <div
                        className={`${flex.between} px-3 py-2 ${
                          card
                            ? "bg-primary/5 dark:bg-primary/10"
                            : themed.bgSecondary
                        }`}
                      >
                        <Text size="xs" weight="medium">
                          {colLabel(col)}
                        </Text>
                        {!isReadonly && (
                          <div className="flex gap-1">
                            {card ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setEditingCell(isEditing ? null : cellKey)
                                  }
                                >
                                  {t("editCard")}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeCard(row, col)}
                                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  {t("removeCard")}
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={cardCount >= 2 || rowHasCard(row)}
                                onClick={() => {
                                  if (cardCount >= 2 || rowHasCard(row)) return;
                                  upsertCard(makeNewCard(row, col));
                                  setEditingCell(cellKey);
                                }}
                              >
                                {t("addCard")}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Empty state */}
                      {!card && (
                        <div
                          className={`py-6 ${flex.center} ${
                            !isReadonly ? "cursor-pointer" : ""
                          }`}
                          onClick={
                            isReadonly || cardCount >= 2 || rowHasCard(row)
                              ? undefined
                              : () => {
                                  upsertCard(makeNewCard(row, col));
                                  setEditingCell(cellKey);
                                }
                          }
                        >
                          <Text variant="muted" size="xs">
                            {t("emptyCell")}
                          </Text>
                        </div>
                      )}

                      {/* Card summary */}
                      {card && !isEditing && (
                        <div className="px-3 py-2 space-y-1">
                          {card.content?.title && (
                            <Text size="sm" weight="medium">
                              {card.content.title}
                            </Text>
                          )}
                          {card.content?.subtitle && (
                            <Text size="xs" variant="secondary">
                              {card.content.subtitle}
                            </Text>
                          )}
                          <Text size="xs" variant="muted">
                            {t("cardBackground")}: {card.background.type}
                            {card.isButtonOnly ? ` · ${t("isButtonOnly")}` : ""}
                          </Text>
                        </div>
                      )}

                      {/* Inline card editor */}
                      {card && isEditing && !isReadonly && (
                        <CardEditor card={card} onChange={upsertCard} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}{" "}
      {/* end !slide.overlay */}
    </div>
  );
}

// -- Inline card editor --------------------------------------------------------------------

function CardEditor({
  card,
  onChange,
}: {
  card: GridCard;
  onChange: (card: GridCard) => void;
}) {
  const t = useTranslations("adminCarousel");
  const update = (partial: Partial<GridCard>) =>
    onChange({ ...card, ...partial });

  const updateContent = (partial: Partial<NonNullable<GridCard["content"]>>) =>
    update({ content: { ...card.content, ...partial } });

  const updateButton = (
    index: number,
    partial: Partial<NonNullable<GridCard["buttons"]>[number]>,
  ) => {
    const buttons = [...(card.buttons ?? [])];
    buttons[index] = { ...buttons[index], ...partial };
    update({ buttons });
  };

  const removeButton = (index: number) => {
    const buttons = [...(card.buttons ?? [])];
    buttons.splice(index, 1);
    update({ buttons });
  };

  const addButton = () => {
    update({
      buttons: [
        ...(card.buttons ?? []),
        {
          id: `btn-${nowMs()}`,
          text: "",
          link: "",
          variant: "primary" as const,
          openInNewTab: false,
        },
      ],
    });
  };

  return (
    <div className={`px-3 py-3 space-y-3 border-t ${themed.border}`}>
      {/* Background */}
      <div>
        <Label className="block mb-1.5 text-xs font-medium">
          {t("cardBackground")}
        </Label>
        <div
          className={`grid gap-2 ${card.background.type !== "transparent" ? "grid-cols-2" : "grid-cols-1"}`}
        >
          <Select
            value={card.background.type}
            onChange={(e) =>
              update({
                background: {
                  ...card.background,
                  type: e.target.value as GridCard["background"]["type"],
                },
              })
            }
            options={[
              { value: "color", label: "Color" },
              { value: "gradient", label: "Gradient" },
              { value: "image", label: "Image URL" },
              { value: "transparent", label: "Transparent" },
            ]}
          />
          {card.background.type !== "transparent" && (
            <FormField
              name="bgValue"
              label=""
              type="text"
              value={card.background.value}
              onChange={(val) =>
                update({ background: { ...card.background, value: val } })
              }
              placeholder={t("backgroundValue")}
            />
          )}
        </div>
      </div>

      {/* Sizing */}
      <div>
        <Label className="block mb-1.5 text-xs font-medium">
          {t("cardSizing")}
        </Label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label className="block mb-1.5 text-xs">{t("cardWidth")}</Label>
            <Select
              value={String(card.sizing?.widthPct ?? 100)}
              onChange={(e) =>
                update({
                  sizing: {
                    ...(card.sizing ?? {}),
                    widthPct: Number(e.target.value) as 25 | 50 | 75 | 100,
                  },
                })
              }
              options={[
                { value: "100", label: t("sizeFull") },
                { value: "75", label: t("size75") },
                { value: "50", label: t("size50") },
                { value: "25", label: t("size25") },
              ]}
            />
          </div>
          <div>
            <Label className="block mb-1.5 text-xs">{t("cardHeight")}</Label>
            <Select
              value={String(card.sizing?.heightPct ?? 100)}
              onChange={(e) =>
                update({
                  sizing: {
                    ...(card.sizing ?? {}),
                    heightPct: Number(e.target.value) as 25 | 50 | 75 | 100,
                  },
                })
              }
              options={[
                { value: "100", label: t("sizeFull") },
                { value: "75", label: t("size75") },
                { value: "50", label: t("size50") },
                { value: "25", label: t("size25") },
              ]}
            />
          </div>
          <div>
            <Label className="block mb-1.5 text-xs">{t("cardPadding")}</Label>
            <Select
              value={card.sizing?.padding ?? "md"}
              onChange={(e) =>
                update({
                  sizing: {
                    ...(card.sizing ?? {}),
                    padding: e.target.value as "none" | "sm" | "md" | "lg",
                  },
                })
              }
              options={[
                { value: "none", label: t("paddingNone") },
                { value: "sm", label: t("paddingSm") },
                { value: "md", label: t("paddingMd") },
                { value: "lg", label: t("paddingLg") },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Button-only toggle */}
      <Checkbox
        checked={card.isButtonOnly}
        onChange={(e) => update({ isButtonOnly: e.target.checked })}
        label={t("isButtonOnly")}
      />

      {/* Content */}
      {!card.isButtonOnly && (
        <div className="space-y-2">
          <FormField
            name="contentTitle"
            label={t("cardTitle")}
            type="text"
            value={card.content?.title ?? ""}
            onChange={(val) => updateContent({ title: val })}
          />
          <FormField
            name="contentSubtitle"
            label={t("cardSubtitle")}
            type="text"
            value={card.content?.subtitle ?? ""}
            onChange={(val) => updateContent({ subtitle: val })}
          />
          <FormField
            name="contentDesc"
            label={t("cardDescription")}
            type="textarea"
            rows={2}
            value={card.content?.description ?? ""}
            onChange={(val) => updateContent({ description: val })}
          />
        </div>
      )}

      {/* Buttons */}
      <div>
        <Label className="block mb-2 text-xs font-medium">
          {t("cardButtons")}
        </Label>
        {(card.buttons ?? []).map((btn, i) => (
          <div
            key={btn.id}
            className={`mb-2 p-2 border ${themed.border} rounded-lg`}
          >
            <FormGroup columns={2}>
              <FormField
                name={`btnText${i}`}
                label={t("cardButtonText")}
                type="text"
                value={btn.text}
                onChange={(val) => updateButton(i, { text: val })}
              />
              <FormField
                name={`btnLink${i}`}
                label={t("cardButtonLink")}
                type="text"
                value={btn.link}
                onChange={(val) => updateButton(i, { link: val })}
              />
            </FormGroup>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <Select
                value={btn.variant}
                onChange={(e) =>
                  updateButton(i, {
                    variant: e.target.value as NonNullable<
                      GridCard["buttons"]
                    >[number]["variant"],
                  })
                }
                options={[
                  { value: "primary", label: t("variantPrimary") },
                  { value: "secondary", label: t("variantSecondary") },
                  { value: "outline", label: t("variantOutline") },
                ]}
              />
              <Checkbox
                checked={btn.openInNewTab}
                onChange={(e) =>
                  updateButton(i, { openInNewTab: e.target.checked })
                }
                label="New tab"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeButton(i)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-auto"
              >
                {t("removeButton")}
              </Button>
            </div>
          </div>
        ))}
        {(card.buttons ?? []).length < 3 && (
          <Button variant="outline" size="sm" onClick={addButton}>
            {t("addButton")}
          </Button>
        )}
      </div>
    </div>
  );
}
