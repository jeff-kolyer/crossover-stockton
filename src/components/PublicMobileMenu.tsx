import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations";

interface PublicMobileMenuProps {
  active?: PublicRoute;
  onNavigate: (page: PublicRoute) => void;
  onOpenAbout?: () => void;
}

const menuItems: Array<{ label: string; page: PublicRoute }> = [
  { label: "Home", page: "home" },
  { label: "Needs", page: "reality" },
  { label: "Stories", page: "connection" },
  { label: "Action", page: "action" },
  { label: "Updates", page: "updates" },
  { label: "Organizations", page: "organizations" },
  { label: "About", page: "about" },
];

export function PublicMobileMenu({ onNavigate, onOpenAbout }: PublicMobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pressedPage, setPressedPage] = useState<PublicRoute | null>(null);
  const navigationTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("has-public-menu");

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("has-public-menu");
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (navigationTimer.current) window.clearTimeout(navigationTimer.current);
    };
  }, []);

  const handleNavigate = (page: PublicRoute) => {
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
        className="public-mobile-menu"
        type="button"
        aria-label="Open navigation"
        onClick={() => {
          setPressedPage(null);
          setIsOpen(true);
        }}
      >
        <Menu size={24} />
      </button>

      {isOpen && (
        <div className="public-menu-backdrop" role="presentation" onMouseDown={() => setIsOpen(false)}>
          <div
            className="public-menu-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Primary navigation"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="public-menu-header">
              <span>Menu</span>
              <button type="button" aria-label="Close navigation" onClick={() => setIsOpen(false)}>
                <X size={22} />
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
