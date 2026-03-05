// public/app/ui/enableRailDrag.js
// Gentle drag-to-scroll with inertia that DOES NOT break clicks.
// Key changes vs your version:
// - No pointer capture until we *actually* start dragging
// - Inertia uses real dt timing (no “velocity * 16 * 12” rocket)
// - Click suppression only if a drag truly occurred

export function enableRailDrag(rail, opts = {}) {
    if (!rail) return;
    if (rail.dataset.railDrag === "1") return;
    rail.dataset.railDrag = "1";

    const cfg = {
        friction: 0.94,       // closer to 1 = longer glide
        minVelocity: 0.02,    // px/ms threshold to stop
        dragThreshold: 7,     // px before we treat as drag
        ...opts,
    };

    rail.style.cursor = "grab";

    let isDown = false;
    let dragging = false;

    let startX = 0;
    let startScrollLeft = 0;

    let lastX = 0;
    let lastT = 0;
    let velocity = 0; // px/ms

    let rafInertia = 0;

    function stopInertia() {
        if (rafInertia) cancelAnimationFrame(rafInertia);
        rafInertia = 0;
    }

    function startInertia() {
        stopInertia();

        let prevT = performance.now();

        const step = () => {
            const now = performance.now();
            const dt = now - prevT; // ms
            prevT = now;

            // apply velocity with real dt
            rail.scrollLeft -= velocity * dt;

            // decay velocity
            // decay factor should be frame-rate independent:
            // apply friction per 16ms chunk
            const decay = Math.pow(cfg.friction, dt / 16);
            velocity *= decay;

            if (Math.abs(velocity) < cfg.minVelocity) {
                rafInertia = 0;
                return;
            }
            rafInertia = requestAnimationFrame(step);
        };

        rafInertia = requestAnimationFrame(step);
    }

    function isPrimaryMouseButton(e) {
        return e.pointerType !== "mouse" || e.button === 0;
    }

    function onPointerDown(e) {
        if (!isPrimaryMouseButton(e)) return;

        stopInertia();
        isDown = true;
        dragging = false;

        startX = e.clientX;
        lastX = e.clientX;
        startScrollLeft = rail.scrollLeft;

        lastT = performance.now();
        velocity = 0;

        rail.style.cursor = "grabbing";
    }

    function onPointerMove(e) {
        if (!isDown) return;

        const dxTotal = e.clientX - startX;

        // only become "dragging" after threshold
        if (!dragging && Math.abs(dxTotal) >= cfg.dragThreshold) {
            dragging = true;
            rail.classList.add("is-dragging");

            // only now capture pointer (prevents losing drag if pointer leaves rail)
            rail.setPointerCapture?.(e.pointerId);
        }

        if (!dragging) return;

        // while dragging: prevent text selection / stray gestures
        e.preventDefault();

        const x = e.clientX;
        const t = performance.now();

        const dt = Math.max(1, t - lastT);
        const vx = (x - lastX) / dt; // px/ms

        lastX = x;
        lastT = t;

        // low-pass filter (smooth velocity)
        velocity = velocity * 0.75 + vx * 0.25;

        // update scroll immediately (no rocket scaling)
        rail.scrollLeft = startScrollLeft - (e.clientX - startX);
    }

    function onPointerUp(e) {
        if (!isDown) return;
        isDown = false;

        rail.releasePointerCapture?.(e.pointerId);
        rail.style.cursor = "grab";

        if (dragging) {
            // If we dragged, suppress the click that would otherwise fire.
            const killClick = (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
            };
            rail.addEventListener("click", killClick, { capture: true, once: true });

            // If the browser considers the interaction a pan gesture, it might not 
            // synthesize a click at all. We must remove the trap so it doesn't 
            // accidentally kill the user's *next* legitimate click.
            setTimeout(() => {
                rail.removeEventListener("click", killClick, { capture: true });
            }, 50);

            // Start inertia in the same direction as the drag scroll.
            // scrollLeft = startScrollLeft - dx => inertia should keep that going.
            // velocity is pointer velocity; invert it to match scroll direction.
            velocity = velocity * 1.0; // keep natural
            startInertia();

            setTimeout(() => rail.classList.remove("is-dragging"), 0);
        } else {
            rail.classList.remove("is-dragging");
        }
    }

    rail.addEventListener("pointerdown", onPointerDown, { passive: false });
    rail.addEventListener("pointermove", onPointerMove, { passive: false });
    rail.addEventListener("pointerup", onPointerUp, { passive: true });
    rail.addEventListener("pointercancel", onPointerUp, { passive: true });

    // Optional: make mouse wheel scroll horizontally while hovering the rail
    // (nice for desktop trackpads/mice)
    rail.addEventListener(
        "wheel",
        (e) => {
            // if user is already scrolling horizontally, don’t interfere
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

            // shift-wheel is commonly horizontal; let browser handle it
            if (e.shiftKey) return;

            // convert vertical wheel into horizontal scroll
            rail.scrollLeft += e.deltaY;
        },
        { passive: true }
    );
}