(function () {
  "use strict";

  const body = document.body;
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --- Theme toggle ---
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const savedTheme = localStorage.getItem("portfolio-theme");
  const initialTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    body.setAttribute("data-theme", theme);
    if (themeToggle) {
      themeToggle.textContent = theme === "light" ? "☾" : "☀︎";
      themeToggle.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
    }
    localStorage.setItem("portfolio-theme", theme);
  }

  applyTheme(initialTheme);

  themeToggle?.addEventListener("click", () => {
    const nextTheme = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    applyTheme(nextTheme);
  });

  // --- Page switching ---
  const pageSwitchers = document.querySelectorAll("[data-switch-page]");
  const isPhotographyPage = window.location.pathname.toLowerCase().includes("photography.html");

  pageSwitchers.forEach((switcher) => {
    switcher.addEventListener("click", () => {
      const targetUrl = isPhotographyPage ? "index.html" : "photography.html";
      window.location.href = targetUrl;
    });
  });

  // --- Mobile nav ---
  const toggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    navLinks.classList.toggle("is-open");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      navLinks.classList.remove("is-open");
    });
  });

  // --- Custom cursor orb + illumination (desktop only) ---
  const cursorLight = document.querySelector(".cursor-light");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
  const isTouchOnlyDevice = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

  if (cursorLight && !prefersReduced && hasFinePointer && !isTouchOnlyDevice) {
    body.classList.add("has-custom-cursor");

    let rafId = null;
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    // Track mouse entering and leaving the window viewport
    document.addEventListener("mouseenter", () => {
      cursorLight.classList.add("is-active");
    });
    document.addEventListener("mouseleave", () => {
      cursorLight.classList.remove("is-active");
      body.classList.remove("is-clicking"); // Safety cleanup if user drag-leaves screen
    });

    // Capture click press and click release states
    window.addEventListener("mousedown", () => {
      body.classList.add("is-clicking");
    });
    window.addEventListener("mouseup", () => {
      body.classList.remove("is-clicking");
    });

    // Track frame positions cleanly
    document.addEventListener("mousemove", (e) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (!cursorLight.classList.contains("is-active")) {
        cursorLight.classList.add("is-active");
      }

      if (!rafId) rafId = requestAnimationFrame(tick);
    });

    function tick() {
      // 0.1 gives that beautiful, smooth organic drag lag behind the real pointer
      currentX += (targetX - currentX) * 0.085;
      currentY += (targetY - currentY) * 0.085;

      cursorLight.style.left = currentX + "px";
      cursorLight.style.top = currentY + "px";

      if (Math.abs(targetX - currentX) > 0.5 || Math.abs(targetY - currentY) > 0.5) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    }
  }


  // --- Scroll reveal ---
  const revealEls = document.querySelectorAll(".reveal");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => entry.target.classList.add("is-visible"), Number(delay));
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  // --- Typewriter section headings ---
  const typewriterSpeed = 50;
  const typewriterMap = new WeakMap();

  function resetTypewriter(el) {
    const state = typewriterMap.get(el);
    if (state?.timeoutId) {
      clearTimeout(state.timeoutId);
      state.timeoutId = null;
    }

    if (state?.cursor) {
      state.cursor.remove();
      state.cursor = null;
    }

    el.innerHTML = el.dataset.typewriterHtml;
    el.classList.remove("is-typing");
    el.classList.remove("is-typed");
    state.started = false;
  }

  function parseTypewriterContent(el) {
    const ops = [];

    function walk(node, wrap) {
      node.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          for (const char of child.textContent) {
            ops.push({ type: "char", char, wrap });
          }
        } else if (child.nodeName === "BR") {
          ops.push({ type: "br" });
        } else if (child.nodeName === "EM") {
          walk(child, "em");
        } else {
          walk(child, wrap);
        }
      });
    }

    walk(el, null);
    return ops;
  }

  function runTypewriter(el, ops) {
    const state = typewriterMap.get(el) || { started: false, ops, timeoutId: null, cursor: null };
    if (state.started) return;
    state.started = true;
    typewriterMap.set(el, state);

    if (prefersReduced) {
      el.innerHTML = el.dataset.typewriterHtml;
      el.classList.add("is-typed");
      return;
    }

    el.innerHTML = "";
    el.classList.add("is-typing");

    const cursor = document.createElement("span");
    cursor.className = "typewriter-cursor";
    cursor.setAttribute("aria-hidden", "true");
    state.cursor = cursor;

    let index = 0;
    let currentWrap = null;
    let currentContainer = el;
    let textNode = null;

    function placeCursor() {
      el.appendChild(cursor);
    }

    function tick() {
      if (index >= ops.length) {
        cursor.remove();
        state.cursor = null;
        el.classList.remove("is-typing");
        el.classList.add("is-typed");
        state.timeoutId = null;
        return;
      }

      const op = ops[index++];
      cursor.remove();

      if (op.type === "br") {
        el.appendChild(document.createElement("br"));
      } else {
        if (op.wrap !== currentWrap) {
          if (op.wrap === "em") {
            currentContainer = document.createElement("em");
            el.appendChild(currentContainer);
          } else {
            currentContainer = el;
          }
          currentWrap = op.wrap;
          textNode = null;
        }

        if (!textNode || textNode.parentNode !== currentContainer) {
          textNode = document.createTextNode("");
          currentContainer.appendChild(textNode);
        }

        textNode.textContent += op.char;
      }

      placeCursor();
      state.timeoutId = setTimeout(tick, typewriterSpeed);
    }

    placeCursor();
    tick();
  }

  document.querySelectorAll(".typewriter-heading").forEach((el) => {
    const ops = parseTypewriterContent(el);
    el.dataset.typewriterHtml = el.innerHTML;

    if (prefersReduced) return;

    el.style.minHeight = el.offsetHeight + "px";
    el.style.visibility = "hidden";
    el.innerHTML = "";
    typewriterMap.set(el, { started: false, ops });

    const startTyping = () => {
      el.style.visibility = "visible";
      runTypewriter(el, ops);
    };

    const section = el.closest("section");
    const target = section || el;

    const typeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(startTyping, 250);
          } else {
            resetTypewriter(el);
          }
        });
      },
      { threshold: 0.25, rootMargin: "0px 0px -10% 0px" }
    );

    typeObserver.observe(target);
  });

  // --- Rotating hero words ---
  const words = [
    "thoughtful software",
    "clean interfaces",
    "reliable systems",
    "useful tools",
  ];
  const rotatingEl = document.querySelector(".hero-rotating-word");
  let wordIndex = 0;

  if (rotatingEl && !prefersReduced) {
    setInterval(() => {
      rotatingEl.classList.add("is-exiting");
      setTimeout(() => {
        wordIndex = (wordIndex + 1) % words.length;
        rotatingEl.textContent = words[wordIndex];
        rotatingEl.classList.remove("is-exiting");
        rotatingEl.classList.add("is-entering");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => rotatingEl.classList.remove("is-entering"));
        });
      }, 300);
    }, 3200);
  }

  // --- Active nav highlight on scroll ---
  const sections = document.querySelectorAll("section[id]");
  const navAnchors = document.querySelectorAll(".nav-links a:not(.nav-cta)");

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          navAnchors.forEach((a) => {
            a.style.color =
              a.getAttribute("href") === "#" + id ? "var(--text)" : "";
          });
        }
      });
    },
    { threshold: 0.35, rootMargin: "-20% 0px -55% 0px" }
  );

  sections.forEach((s) => sectionObserver.observe(s));
})();
