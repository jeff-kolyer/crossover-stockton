import { useEffect, useRef, useState } from "react";
import "./PublicMobileMenu.layout.css";

export type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "investigation";
type MenuPage = PublicRoute;

interface PublicMobileMenuProps {
  active?: PublicRoute;
  onNavigate: (page: PublicRoute) => void;
  onOpenAbout?: () => void;
  popoverOnWide?: boolean;
}

const menuItems: Array<{ label: string; page: MenuPage }> = [
  { label: "Home", page: "home" },
  { label: "Needs", page: "reality" },
  { label: "Stories", page: "connection" },
  { label: "Action", page: "action" },
  { label: "Updates", page: "updates" },
  { label: "Investigation", page: "investigation" },
  { label: "About", page: "about" },
];

export function PublicMobileMenu({ onNavigate, onOpenAbout, popoverOnWide = false }: PublicMobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [desktopPopover, setDesktopPopover] = useState(false);
  const [pressedPage, setPressedPage] = useState<MenuPage | null>(null);
  const navigationTimer = useRef<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeMenu = () => {
    setIsOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    if (!popoverOnWide) return;
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktopPopover(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [popoverOnWide]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
      if (desktopPopover || event.key !== "Tab" || !dialogRef.current) return;
      const buttons = Array.from(dialogRef.current.querySelectorAll("button"));
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };

    window.requestAnimationFrame(() => dialogRef.current?.querySelector("button")?.focus());
    document.addEventListener("keydown", handleKeyDown);
    const handleOutsideClick = (event: PointerEvent) => {
      if (desktopPopover && !dialogRef.current?.contains(event.target as Node) && !triggerRef.current?.contains(event.target as Node)) closeMenu();
    };
    document.addEventListener("pointerdown", handleOutsideClick);
    document.body.classList.add("has-public-menu");

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.body.classList.remove("has-public-menu");
    };
  }, [isOpen, desktopPopover]);

  useEffect(() => {
    return () => {
      if (navigationTimer.current) window.clearTimeout(navigationTimer.current);
    };
  }, []);

  const handleNavigate = (page: MenuPage) => {
    setPressedPage(page);
    navigationTimer.current = window.setTimeout(() => {
      setIsOpen(false);
      setPressedPage(null);
      if (page === "about" && onOpenAbout) {
        onOpenAbout();
        return;
      }
      onNavigate(page);
    }, 90);
  };

  return (
    <>
      <button
        ref={triggerRef}
        className="public-mobile-menu"
        type="button"
        aria-label="Open navigation"
        aria-expanded={isOpen}
        aria-controls="site-navigation-menu"
        onClick={() => {
          if (isOpen) {
            closeMenu();
            return;
          }
          setPressedPage(null);
          setIsOpen(true);
        }}
      >
        <span className="public-mobile-menu-icon" aria-hidden="true"><span /><span /><span /></span>
      </button>

      {isOpen && (
        <div className={popoverOnWide && desktopPopover ? "public-menu-popover" : "public-menu-backdrop"} role="presentation" onMouseDown={closeMenu}>
          <div
            ref={dialogRef}
            id="site-navigation-menu"
            className="public-menu-modal"
            role={desktopPopover ? undefined : "dialog"}
            aria-modal={desktopPopover ? undefined : "true"}
            aria-label={desktopPopover ? undefined : "Primary navigation"}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="public-menu-header">
              <span>Menu</span>
              <button type="button" aria-label="Close navigation" onClick={closeMenu}>
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="public-menu-location">
              Stockton, CA
            </div>

            <div className="public-menu-list" role="navigation" aria-label="Mobile primary">
              {menuItems.map((item) => (
                <button
                  className={pressedPage === item.page ? "is-pressed" : ""}
                  type="button"
                  onPointerDown={() => setPressedPage(item.page)}
                  onClick={() => handleNavigate(item.page)}
                  key={item.page}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
