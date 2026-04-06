import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Type,
  Link,
  ExternalLink,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Highlighter,
  Droplet,
  AlignJustify,
  Unlink,
} from "lucide-react";

interface ExistingLinkData {
  url: string;
  color: string;
  underline: boolean;
  newTab: boolean;
}

interface InlineFormattingPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  selectedText: string;
  onFormat: (command: string, value?: string) => void;
  onOpenStormy?: () => void;
  showStormyButton?: boolean;
  /** When true, open the link popover immediately (e.g. from CMD+K) */
  openLinkPopover?: boolean;
  /** Called after the link popover auto-open has been consumed */
  onLinkPopoverOpened?: () => void;
  /** When provided, the link popover opens in edit mode with existing data */
  existingLinkData?: ExistingLinkData | null;
  /** Whether the popover is in link-only edit mode (hide the full toolbar) */
  linkEditMode?: boolean;
  /** When true, render as a static (non-floating) toolbar that is always visible. Ignores isOpen/position. */
  persistent?: boolean;
  /** Called on mousedown of the toolbar container - use to save iframe selection before focus shifts */
  onSaveSelection?: () => void;
}

export const InlineFormattingPopover: React.FC<
  InlineFormattingPopoverProps
> = ({
  isOpen,
  onClose,
  position,
  selectedText,
  onFormat,
  onOpenStormy,
  showStormyButton = false,
  openLinkPopover = false,
  onLinkPopoverOpened,
  existingLinkData = null,
  linkEditMode = false,
  persistent = false,
  onSaveSelection,
}) => {
    const popoverSide: "top" | "bottom" = persistent ? "bottom" : "top";

    const stopEvent = (e: React.MouseEvent | React.PointerEvent) => {
      e.preventDefault();
      if (!persistent) e.stopPropagation();
    };
    const stopProp = (e: React.MouseEvent | React.PointerEvent) => {
      if (!persistent) e.stopPropagation();
    };

    const [linkUrl, setLinkUrl] = useState("");
    const [linkUnderline, setLinkUnderline] = useState(true);
    const [linkNewTab, setLinkNewTab] = useState(true);
    const [linkColor, setLinkColor] = useState("#0066cc");
    const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(position);
    const [textColor, setTextColor] = useState("#000000");
    const [backgroundColor, setBackgroundColor] = useState("#ffffff");
    const [isTextColorOpen, setIsTextColorOpen] = useState(false);
    const [isBgColorOpen, setIsBgColorOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);
    const [popoverWidth, setPopoverWidth] = useState<number>(0);

    const runNextFrame = (fn: () => void) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        fn();
      });
    };

    // Colors
    const commonColors = [
      // Grays
      "#000000",
      "#1f2937",
      "#374151",
      "#4b5563",
      "#6b7280",
      "#9ca3af",
      "#d1d5db",
      "#e5e7eb",
      "#f3f4f6",
      "#ffffff",
      // Reds
      "#7f1d1d",
      "#991b1b",
      "#b91c1c",
      "#dc2626",
      "#ef4444",
      "#f87171",
      // Oranges
      "#7c2d12",
      "#9a3412",
      "#c2410c",
      "#ea580c",
      "#f97316",
      "#fb923c",
      // Yellows
      "#78350f",
      "#92400e",
      "#b45309",
      "#d97706",
      "#f59e0b",
      "#fbbf24",
      // Greens
      "#064e3b",
      "#065f46",
      "#047857",
      "#059669",
      "#10b981",
      "#34d399",
      // Teals
      "#134e4a",
      "#115e59",
      "#0f766e",
      "#0d9488",
      "#14b8a6",
      "#2dd4bf",
      // Blues
      "#1e3a8a",
      "#1d4ed8",
      "#2563eb",
      "#3b82f6",
      "#60a5fa",
      "#93c5fd",
      // Indigos/Purples
      "#3730a3",
      "#4f46e5",
      "#6366f1",
      "#7444DD",
      "#a78bfa",
      "#c4b5fd",
      "#581c87",
      "#452686",
      "#7e22ce",
      "#6338c4",
      "#8b6ee5",
      "#c4b5f0",
      // Pinks
      "#831843",
      "#9d174d",
      "#be185d",
      "#db2777",
      "#ec4899",
      "#f472b6",
    ];

    const fontFamilies = [
      { label: "Arial", value: "Arial, sans-serif" },
      { label: "Georgia", value: "Georgia, serif" },
      { label: "Times New Roman", value: "Times New Roman, serif" },
      { label: "Helvetica", value: "Helvetica, sans-serif" },
      { label: "Courier New", value: "Courier New, monospace" },
    ];

    const fontSizes = [
      { label: "Tiny", value: "1" },
      { label: "Small", value: "2" },
      { label: "Normal", value: "3" },
      { label: "Medium", value: "4" },
      { label: "Large", value: "5" },
      { label: "X-Large", value: "6" },
      { label: "XX-Large", value: "7" },
    ];

    const commonEmojis = [
      "😊",
      "😂",
      "❤️",
      "👍",
      "👏",
      "🎉",
      "🔥",
      "💯",
      "😎",
      "🤔",
      "😍",
      "🥳",
      "🙌",
      "✨",
      "💪",
      "🚀",
      "⭐",
      "💡",
      "📧",
      "💼",
      "🏆",
      "🎯",
      "📊",
      "💰",
    ];

    React.useEffect(() => {
      setCurrentPosition({
        x: position.x,
        y: Math.max(position.y - 24, 10), // Position 24px above the selected area
      });
    }, [position]);

    // Measure popover width to center it above selection/editor
    React.useLayoutEffect(() => {
      if (!isOpen) return;
      const measure = () => {
        if (popoverRef.current) {
          const rect = popoverRef.current.getBoundingClientRect();
          setPopoverWidth(rect.width);
        }
      };
      measure();
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }, [isOpen, currentPosition.x]);

    // Auto-open link popover when triggered externally (e.g. CMD+K)
    React.useEffect(() => {
      if (openLinkPopover && isOpen) {
        setIsLinkPopoverOpen(true);
        onLinkPopoverOpened?.();
      }
    }, [openLinkPopover, isOpen]);

    // Populate link popover fields when editing an existing link
    React.useEffect(() => {
      if (existingLinkData && isOpen && linkEditMode) {
        setLinkUrl(existingLinkData.url);
        setLinkColor(existingLinkData.color);
        setLinkUnderline(existingLinkData.underline);
        setLinkNewTab(existingLinkData.newTab);
        setIsLinkPopoverOpen(true);
      }
    }, [existingLinkData, isOpen, linkEditMode]);

    // Reset internal link popover state when link-edit context is cleared
    React.useEffect(() => {
      if (!existingLinkData && !openLinkPopover) {
        setIsLinkPopoverOpen(false);
      }
    }, [existingLinkData, openLinkPopover]);

    const handleLinkSubmit = () => {
      if (linkUrl.trim()) {
        const command = existingLinkData ? "editLink" : "createLink";
        onFormat(command, JSON.stringify({
          url: linkUrl,
          color: linkColor,
          underline: linkUnderline,
          newTab: linkNewTab,
        }));
        setLinkUrl("");
        setLinkColor("#0066cc");
        setLinkUnderline(true);
        setLinkNewTab(true);
        setIsLinkPopoverOpen(false);
      }
    };

    const handleFormatClick = (command: string, value?: string) => {
      // Selection restore happens inside onFormat (EmailEditor)
      onFormat(command, value);
    };

    const isValidHex = (hex: string): boolean => {
      // Check if the hex value is valid (3 or 6 characters, with or without #)
      const hexPattern = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      return hexPattern.test(hex);
    };

    const normalizeHex = (hex: string): string => {
      // Ensure hex value has # prefix and is in 6a-character format
      let normalized = hex.trim();
      if (!normalized.startsWith("#")) {
        normalized = "#" + normalized;
      }
      // Convert 3-character hex to 6-character
      if (normalized.length === 4) {
        normalized =
          "#" +
          normalized[1] +
          normalized[1] +
          normalized[2] +
          normalized[2] +
          normalized[3] +
          normalized[3];
      }
      return normalized;
    };

    if (!persistent && !isOpen) return null;

    // In link-edit mode, render only the link popover content directly (not in persistent mode)
    if (!persistent && linkEditMode) {
      return (
        <div
          ref={popoverRef}
          className="fixed z-50 bg-background border border-border rounded-lg shadow-lg backdrop-blur-sm inline-formatting-popover-container"
          style={{
            left: Math.max(
              10,
              Math.min(
                currentPosition.x - 160,
                window.innerWidth - 340
              )
            ),
            top: Math.max(currentPosition.y, 10),
          }}
          onMouseDown={stopProp}
          onClick={stopProp}
          onMouseUp={stopProp}
        >
          <div className="w-80 p-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="h-8 text-xs flex-1 font-sans"
                  style={{ fontFamily: "Inter, Arial, Helvetica, sans-serif" }}
                  onKeyDown={(e) => e.key === "Enter" && handleLinkSubmit()}
                  autoFocus
                />
                <Button
                  size="sm"
                  onMouseDown={stopEvent}
                  onClick={handleLinkSubmit}
                  className="h-8 px-3"
                >
                  {existingLinkData ? "Update" : "Add"}
                </Button>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Link Color</Label>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className="h-7 w-7 rounded border border-border shadow-sm cursor-pointer"
                        style={{ backgroundColor: linkColor }}
                        onMouseDown={stopEvent}
                      />
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" side={popoverSide} align="start">
                      <div className="grid grid-cols-6 gap-1">
                        {commonColors.map((color) => (
                          <button
                            key={`link-edit-${color}`}
                            className={`h-6 w-6 rounded border cursor-pointer transition-transform hover:scale-110 ${linkColor === color ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
                              }`}
                            style={{ backgroundColor: color }}
                            onMouseDown={stopEvent}
                            onClick={() => setLinkColor(color)}
                          />
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Input
                          type="text"
                          value={linkColor}
                          onChange={(e) => setLinkColor(e.target.value)}
                          className="h-7 text-xs flex-1"
                          placeholder="#0066cc"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <span className="text-xs text-muted-foreground font-mono">{linkColor}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="link-edit-underline" className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Underline className="h-3.5 w-3.5" />
                    Underline
                  </Label>
                  <Switch
                    id="link-edit-underline"
                    checked={linkUnderline}
                    onCheckedChange={setLinkUnderline}
                    className="scale-75"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="link-edit-new-tab" className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open in new tab
                  </Label>
                  <Switch
                    id="link-edit-new-tab"
                    checked={linkNewTab}
                    onCheckedChange={setLinkNewTab}
                    className="scale-75"
                  />
                </div>
              </div>

              {/* Remove link */}
              {existingLinkData && (
                <div className="pt-1 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 gap-1.5"
                    onMouseDown={stopEvent}
                    onClick={() => {
                      onFormat("removeLink");
                      setLinkUrl("");
                      setLinkColor("#0066cc");
                      setLinkUnderline(true);
                      setLinkNewTab(true);
                      setIsLinkPopoverOpen(false);
                    }}
                  >
                    <Unlink className="h-3.5 w-3.5" />
                    Remove link
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={popoverRef}
        className={persistent
          ? "bg-white border-b inline-formatting-popover-container"
          : "fixed z-50 bg-background border border-border rounded-lg shadow-lg backdrop-blur-sm inline-formatting-popover-container"
        }
        style={persistent ? undefined : {
          left: Math.max(
            10,
            Math.min(
              currentPosition.x - (popoverWidth ? popoverWidth / 2 : 0),
              window.innerWidth - (popoverWidth ? popoverWidth : 0) - 10
            )
          ),
          top: Math.max(currentPosition.y, 10),
        }}
        onMouseDown={(e) => {
          if (!persistent) e.stopPropagation();
          if (persistent) onSaveSelection?.();
        }}
        onClick={(e) => { if (!persistent) e.stopPropagation(); }}
        onMouseUp={(e) => { if (!persistent) e.stopPropagation(); }}
      >
        {/* Single line toolbar */}
        <TooltipProvider delayDuration={0} skipDelayDuration={0}>
          <div className="flex items-center gap-1 p-2">
            {/* Edit with Stormy button - first item */}
            {showStormyButton && onOpenStormy && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onMouseDown={stopEvent}
                    onClick={(e) => {
                      if (!persistent) e.stopPropagation();
                      onOpenStormy();
                    }}
                    className="h-8 px-2 gap-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800 border border-purple-200"
                  >
                    <img
                      src="/lovable-uploads/8e728019-0b85-4a18-bc89-6b6583826e7d.png"
                      className="w-4 h-4 rounded-full"
                      alt="Stormy"
                    />
                    <span className="text-xs font-medium">AI Editor</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side={popoverSide} className="duration-0">AI Editor</TooltipContent>
              </Tooltip>
            )}
            {showStormyButton && onOpenStormy && (
              <div className="w-px h-6 bg-border mx-1"></div>
            )}

            {/* Basic formatting */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onMouseDown={stopEvent}
                  onClick={() => handleFormatClick("bold")}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  <Bold className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={popoverSide} className="duration-0">Bold</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onMouseDown={stopEvent}
                  onClick={() => handleFormatClick("italic")}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  <Italic className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={popoverSide} className="duration-0">Italic</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onMouseDown={stopEvent}
                  onClick={() => handleFormatClick("underline")}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  <Underline className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={popoverSide} className="duration-0">Underline</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onMouseDown={stopEvent}
                  onClick={() => handleFormatClick("strikeThrough")}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  <Strikethrough className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={popoverSide} className="duration-0">Strikethrough</TooltipContent>
            </Tooltip>

            <div className="w-px h-6 bg-border mx-1"></div>

            {/* Font Size Popover */}
            <Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-muted"
                      onMouseDown={stopEvent}
                    >
                      <span className="text-xs font-bold">
                        T<sup className="text-[8px]">t</sup>
                      </span>
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side={popoverSide} className="duration-0">Font Size</TooltipContent>
              </Tooltip>
              <PopoverContent className="w-32 p-2" side={popoverSide} align="center">
                <div className="grid grid-cols-1 gap-1">
                  {fontSizes.map((size) => (
                    <Button
                      key={size.value}
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs justify-start hover:bg-muted"
                      onMouseDown={stopEvent}
                      onClick={() => handleFormatClick("fontSize", size.value)}
                    >
                      {size.label}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Font Family Popover */}
            <Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-muted"
                      onMouseDown={stopEvent}
                    >
                      <Type className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side={popoverSide} className="duration-0">Font Family</TooltipContent>
              </Tooltip>
              <PopoverContent className="w-48 p-2" side={popoverSide} align="center">
                <div className="space-y-1">
                  {fontFamilies.map((font) => (
                    <Button
                      key={font.value}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-full text-xs justify-start hover:bg-muted"
                      style={{ fontFamily: font.value }}
                      onMouseDown={stopEvent}
                      onClick={() => handleFormatClick("fontName", font.value)}
                    >
                      {font.label}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <div className="w-px h-6 bg-border mx-1"></div>

            {/* Text Color Popover */}
            <Popover open={isTextColorOpen} onOpenChange={setIsTextColorOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-muted"
                      onMouseDown={stopEvent}
                    >
                      <Droplet className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side={popoverSide} className="duration-0">Text Color</TooltipContent>
              </Tooltip>
              <PopoverContent
                className="w-72 p-3 relative"
                side={popoverSide}
                align="center"
                onMouseDown={stopProp}
                onClick={stopProp}
                onMouseUp={stopProp}
                onPointerDown={stopProp}
                onPointerUp={stopProp}
              >
                <button
                  className="absolute right-2 top-2 rounded px-1 text-xs text-muted-foreground hover:bg-muted"
                  onMouseDown={stopEvent}
                  onClick={() => setIsTextColorOpen(false)}
                  aria-label="Close"
                >
                  ×
                </button>
                <div className="space-y-3">
                  {/* Quick Color Palette */}
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground font-medium">
                      Quick Text Colors:
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                      {commonColors.map((color) => (
                        <button
                          key={color}
                          className="w-5 h-5 rounded border border-border hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                        onMouseDown={stopEvent}
                          onClick={() => {
                            setTextColor(color);
                            handleFormatClick("foreColor", color);
                          }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="w-full h-px bg-border"></div>

                  {/* Advanced Color Picker */}
                  <div className="space-y-2" data-color-picker="text">
                    <div className="text-xs text-muted-foreground font-medium">
                      Custom Text Color:
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="relative"
                        onMouseDown={stopProp}
                        onClick={stopProp}
                        onMouseUp={stopProp}
                      >
                        <input
                          type="color"
                          value={textColor}
                          className="w-8 h-8 border border-border rounded cursor-pointer"
                          onMouseDown={stopProp}
                          onMouseUp={stopProp}
                          onClick={stopProp}
                          onPointerDown={stopProp}
                          onPointerUp={stopProp}
                          onChange={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const newColor = e.target.value;
                            setTextColor(newColor);
                            // Apply color immediately when RGB slider changes
                            runNextFrame(() =>
                              handleFormatClick("foreColor", newColor)
                            );
                          }}
                        />
                        <div
                          className="absolute inset-0 rounded border-2 border-white shadow-sm pointer-events-none"
                          style={{ backgroundColor: textColor }}
                        />
                      </div>
                      <input
                        type="text"
                        value={textColor}
                        placeholder="#000000"
                        className="flex-1 px-2 py-1 text-xs border border-border rounded font-mono"
                        onMouseDown={stopProp}
                        onClick={stopProp}
                        onFocus={(e) => {
                          e.stopPropagation();
                        }}
                        onBlur={(e) => {
                          e.stopPropagation();
                        }}
                        onChange={(e) => {
                          setTextColor(e.target.value);
                          // Apply color immediately when hex input changes
                          if (isValidHex(e.target.value)) {
                            const normalizedHex = normalizeHex(e.target.value);
                            runNextFrame(() =>
                              handleFormatClick("foreColor", normalizedHex)
                            );
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.stopPropagation();
                            const hexValue = (
                              e.target as HTMLInputElement
                            ).value.trim();
                            if (isValidHex(hexValue)) {
                              const normalizedHex = normalizeHex(hexValue);
                              setTextColor(normalizedHex);
                              handleFormatClick("foreColor", normalizedHex);
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Background Color Popover */}
            <Popover open={isBgColorOpen} onOpenChange={setIsBgColorOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-muted"
                      onMouseDown={stopEvent}
                    >
                      <Highlighter className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side={popoverSide} className="duration-0">Background Color</TooltipContent>
              </Tooltip>
              <PopoverContent
                className="w-72 p-3 relative"
                side={popoverSide}
                align="center"
                onMouseDown={stopProp}
                onClick={stopProp}
                onMouseUp={stopProp}
                onPointerDown={stopProp}
                onPointerUp={stopProp}
              >
                <button
                  className="absolute right-2 top-2 rounded px-1 text-xs text-muted-foreground hover:bg-muted"
                  onMouseDown={stopEvent}
                  onClick={() => setIsBgColorOpen(false)}
                  aria-label="Close"
                >
                  ×
                </button>
                <div className="space-y-3">
                  {/* Quick Color Palette (match Text Color popover) */}
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground font-medium">
                      Quick Background Colors:
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                      {commonColors.map((color) => (
                        <button
                          key={color}
                          className="w-5 h-5 rounded border border-border hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                        onMouseDown={stopEvent}
                          onClick={() => {
                            setBackgroundColor(color);
                            handleFormatClick("hiliteColor", color);
                          }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="w-full h-px bg-border"></div>

                  {/* Advanced Color Picker */}
                  <div className="space-y-2" data-color-picker="background">
                    <div className="text-xs text-muted-foreground font-medium">
                      Custom Background Color:
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="relative"
                        onMouseDown={stopProp}
                        onClick={stopProp}
                        onMouseUp={stopProp}
                      >
                        <input
                          type="color"
                          value={backgroundColor}
                          className="w-8 h-8 border border-border rounded cursor-pointer"
                          onMouseDown={stopProp}
                          onMouseUp={stopProp}
                          onClick={stopProp}
                          onPointerDown={stopProp}
                          onPointerUp={stopProp}
                          onChange={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const newColor = e.target.value;
                            setBackgroundColor(newColor);
                            // Apply background color immediately when RGB slider changes
                            runNextFrame(() =>
                              handleFormatClick("hiliteColor", newColor)
                            );
                          }}
                        />
                        <div
                          className="absolute inset-0 rounded border-2 border-white shadow-sm pointer-events-none"
                          style={{ backgroundColor: backgroundColor }}
                        />
                      </div>
                      <input
                        type="text"
                        value={backgroundColor}
                        placeholder="#ffffff"
                        className="flex-1 px-2 py-1 text-xs border border-border rounded font-mono"
                        onMouseDown={stopProp}
                        onClick={stopProp}
                        onFocus={(e) => {
                          e.stopPropagation();
                        }}
                        onBlur={(e) => {
                          e.stopPropagation();
                        }}
                        onChange={(e) => {
                          setBackgroundColor(e.target.value);
                          // Apply background color immediately when hex input changes
                          if (isValidHex(e.target.value)) {
                            const normalizedHex = normalizeHex(e.target.value);
                            runNextFrame(() =>
                              handleFormatClick("hiliteColor", normalizedHex)
                            );
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.stopPropagation();
                            const hexValue = (
                              e.target as HTMLInputElement
                            ).value.trim();
                            if (isValidHex(hexValue)) {
                              const normalizedHex = normalizeHex(hexValue);
                              setBackgroundColor(normalizedHex);
                              handleFormatClick("hiliteColor", normalizedHex);
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <div className="w-px h-6 bg-border mx-1"></div>

            {/* Alignment Popover */}
            <Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-muted"
                      onMouseDown={stopEvent}
                    >
                      <AlignJustify className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side={popoverSide} className="duration-0">Text Alignment</TooltipContent>
              </Tooltip>
              <PopoverContent className="w-32 p-2" side={popoverSide} align="center">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-muted focus-visible:ring-0 focus-visible:ring-offset-0"
                    onMouseDown={stopEvent}
                    onClick={() => handleFormatClick("justifyLeft")}
                    title="Align Left"
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-muted focus-visible:ring-0 focus-visible:ring-offset-0"
                    onMouseDown={stopEvent}
                    onClick={() => handleFormatClick("justifyCenter")}
                    title="Align Center"
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-muted focus-visible:ring-0 focus-visible:ring-offset-0"
                    onMouseDown={stopEvent}
                    onClick={() => handleFormatClick("justifyRight")}
                    title="Align Right"
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Lists */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onMouseDown={stopEvent}
                  onClick={() => handleFormatClick("insertOrderedList")}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={popoverSide} className="duration-0">Numbered List</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onMouseDown={stopEvent}
                  onClick={() => handleFormatClick("insertUnorderedList")}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={popoverSide} className="duration-0">Bullet List</TooltipContent>
            </Tooltip>

            <div className="w-px h-6 bg-border mx-1"></div>

            {/* Link Popover */}
            <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-muted"
                      onMouseDown={stopEvent}
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side={popoverSide} className="duration-0">Link (⌘K)</TooltipContent>
              </Tooltip>
              <PopoverContent className="w-80 p-4" side={popoverSide} align="center" onMouseDown={stopProp}>
                <div className="space-y-3">
                  {/* URL input */}
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="https://..."
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      className="h-8 text-xs flex-1 font-sans"
                      style={{ fontFamily: "Inter, Arial, Helvetica, sans-serif" }}
                      onKeyDown={(e) => e.key === "Enter" && handleLinkSubmit()}
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onMouseDown={stopEvent}
                      onClick={handleLinkSubmit}
                      className="h-8 px-3"
                    >
                      {existingLinkData ? "Update" : "Add"}
                    </Button>
                  </div>

                  {/* Link color */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Link Color</Label>
                    <div className="flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className="h-7 w-7 rounded border border-border shadow-sm cursor-pointer"
                            style={{ backgroundColor: linkColor }}
                        onMouseDown={stopEvent}
                          />
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2" side={popoverSide} align="start">
                          <div className="grid grid-cols-6 gap-1">
                            {commonColors.map((color) => (
                              <button
                                key={`link-${color}`}
                                className={`h-6 w-6 rounded border cursor-pointer transition-transform hover:scale-110 ${linkColor === color
                                    ? "border-blue-500 ring-1 ring-blue-500"
                                    : "border-gray-200"
                                  }`}
                                style={{ backgroundColor: color }}
                        onMouseDown={stopEvent}
                                onClick={() => setLinkColor(color)}
                              />
                            ))}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <Input
                              type="text"
                              value={linkColor}
                              onChange={(e) => {
                                const val = e.target.value;
                                setLinkColor(val);
                              }}
                              className="h-7 text-xs flex-1"
                              placeholder="#0066cc"
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <span className="text-xs text-muted-foreground font-mono">{linkColor}</span>
                    </div>
                  </div>

                  {/* Toggle options */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="link-underline" className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Underline className="h-3.5 w-3.5" />
                        Underline
                      </Label>
                      <Switch
                        id="link-underline"
                        checked={linkUnderline}
                        onCheckedChange={setLinkUnderline}
                        className="scale-75"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="link-new-tab" className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open in new tab
                      </Label>
                      <Switch
                        id="link-new-tab"
                        checked={linkNewTab}
                        onCheckedChange={setLinkNewTab}
                        className="scale-75"
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Close button (hidden in persistent mode) */}
            {!persistent && (
              <>
                <div className="w-px h-6 bg-border mx-1"></div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 border border-transparent hover:border-red-200"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side={popoverSide} className="duration-0">Close</TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </TooltipProvider>
      </div>
    );
  };
