/* Change the details here; every scene shares this single source. */
const weddingData = {
  groom: "أحمد",
  bride: "مريم",
  date: "2026-10-18T18:30:00",
  location: "قاعة الحكاية",
  city: "دمشق",
  instagram: "@hekaya.studio",
};

(() => {
  "use strict";

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [
    ...context.querySelectorAll(selector),
  ];
  const clamp = (value, min = 0, max = 1) =>
    Math.min(max, Math.max(min, value));
  const ease = (value) => 1 - Math.pow(1 - value, 3);
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const state = {
    opened: false,
    opening: false,
    reduced: motionQuery.matches,
    raf: 0,
    previousFrame: 0,
    time: 0,
    scrollY: window.scrollY,
    viewport: window.innerHeight,
    pageHeight: 1,
    scrollDirty: true,
    measureDirty: true,
    secret: false,
    pointer: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      tx: window.innerWidth / 2,
      ty: window.innerHeight / 2,
    },
    moments: [],
    frameTasks: [],
    measureTasks: [],
  };

  /* The soundtrack starts only after the visitor opens the invitation. */
  const audioConfig = {
    enabled: true,
    music:
      "assets/voice/موسيقى فرنسية لدخلة العروسة للقاعة روعة ( أقرأ العرض بالوصف ).mp4",
    curtain: null,
    chime: null,
  };
  const soundtrack = {
    enabled: false,
    muted: false,
    music: null,
    curtain: null,
    chime: null,
  };
  let introFinished = false;
  let revealObserver;
  let countdownRefresh = () => {};

  function moment(callback, delay = 0, group = "general") {
    state.moments.push({ at: state.time + delay, callback, group });
    wakeFrame();
  }

  function cancelMoments(group) {
    state.moments = state.moments.filter((item) => item.group !== group);
  }

  function wakeFrame() {
    if (!state.raf && !document.hidden)
      state.raf = requestAnimationFrame(renderFrame);
  }

  function invalidateMeasurements() {
    state.measureDirty = true;
    state.scrollDirty = true;
    wakeFrame();
  }

  function renderFrame(now) {
    state.raf = 0;
    if (document.hidden) return;
    const elapsed = state.previousFrame
      ? Math.min(now - state.previousFrame, 50)
      : 16.67;
    state.previousFrame = now;
    state.time += elapsed;

    if (state.measureDirty) {
      state.viewport = window.innerHeight;
      state.pageHeight = Math.max(
        1,
        document.documentElement.scrollHeight - state.viewport,
      );
      state.measureTasks.forEach((measure) => measure());
      state.measureDirty = false;
    }

    const due = state.moments.filter((item) => item.at <= state.time);
    state.moments = state.moments.filter((item) => item.at > state.time);
    due.forEach((item) => item.callback());
    state.frameTasks.forEach((task) => task(elapsed / 1000, state.time / 1000));
    state.scrollDirty = false;

    if (
      (state.opened && !state.reduced) ||
      state.opening ||
      state.moments.length
    )
      wakeFrame();
  }

  function afterOpening(callback) {
    if (state.opened) callback();
    else document.addEventListener("wedding:opened", callback, { once: true });
  }

  function populateWeddingData() {
    const date = new Date(weddingData.date);
    const validDate = !Number.isNaN(date.getTime());
    const formatted = (options) =>
      validDate
        ? new Intl.DateTimeFormat("ar-EG-u-ca-gregory-nu-latn", options).format(
            date,
          )
        : "";
    const hour = validDate ? date.getHours() : 18;
    const minute = validDate ? date.getMinutes() : 30;
    const arabicHours = [
      "الثانية عشرة",
      "الواحدة",
      "الثانية",
      "الثالثة",
      "الرابعة",
      "الخامسة",
      "السادسة",
      "السابعة",
      "الثامنة",
      "التاسعة",
      "العاشرة",
      "الحادية عشرة",
    ];
    const minuteWords =
      minute === 0
        ? ""
        : minute === 15
          ? " والربع"
          : minute === 30
            ? " والنصف"
            : minute === 45
              ? " وخمس وأربعون دقيقة"
              : ` و${minute} دقيقة`;
    const period = hour >= 12 ? "مساءً" : "صباحًا";
    const values = {
      groom: weddingData.groom,
      bride: weddingData.bride,
      "initial-groom": Array.from(weddingData.groom)[0] || "أ",
      "initial-bride": Array.from(weddingData.bride)[0] || "م",
      location: weddingData.location,
      city: weddingData.city,
      instagram: weddingData.instagram,
      "date-day": validDate ? String(date.getDate()).padStart(2, "0") : "18",
      "date-month-number": validDate
        ? String(date.getMonth() + 1).padStart(2, "0")
        : "10",
      "date-month": formatted({ month: "long" }),
      "date-year": validDate ? String(date.getFullYear()) : "2026",
      "date-weekday": formatted({ weekday: "long" }),
      "date-full": formatted({
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      time: `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${period}`,
      "time-words": `الساعة ${arabicHours[hour % 12]}${minuteWords} ${period}`,
      "date-dotted": validDate
        ? `${String(date.getDate()).padStart(2, "0")} • ${String(date.getMonth() + 1).padStart(2, "0")} • ${date.getFullYear()}`
        : "",
    };
    Object.entries(values).forEach(([key, value]) => {
      $$(`[data-${key}]`).forEach((element) => {
        element.textContent = value;
      });
    });
    $$("a[data-instagram]").forEach((link) => {
      link.href = `https://www.instagram.com/${weddingData.instagram.replace(/^@/, "")}/`;
    });
    const studioLogo = $(".studio-logo");
    if (studioLogo)
      studioLogo.href = `https://www.instagram.com/${weddingData.instagram.replace(/^@/, "")}/`;
    $("#open-story")?.setAttribute(
      "aria-label",
      `افتح الستائر وابدأ حكاية زفاف ${weddingData.groom} و${weddingData.bride}`,
    );
    $(".initials-composition")?.setAttribute(
      "aria-label",
      `${weddingData.groom} و${weddingData.bride}، يجمعهما الحب`,
    );
    const edition = $(".intro-edition");
    const colophon = $(".final-colophon");
    const description = $('meta[name="description"]');
    if (edition)
      edition.textContent = `A WEDDING STORY · ${values["date-year"]}`;
    if (colophon)
      colophon.textContent = `MADE WITH LOVE · ${weddingData.city} · ${values["date-year"]}`;
    if (description)
      description.content = `ليلة كُتبت بالنور — ${weddingData.groom} و${weddingData.bride}. ${values["date-full"]}، ${weddingData.city}. ندعوكم إلى أول صفحة من حكايتنا.`;
    document.title = `${weddingData.groom} و${weddingData.bride} — ليلة كُتبت بالنور`;
  }

  function safePlay(audio) {
    if (!audio || soundtrack.muted) return;
    const promise = audio.play();
    if (promise && promise.catch) promise.catch(() => {});
  }

  function enableAudio() {
    soundtrack.enabled = true;
    /* Audio is constructed only following the visitor's opening gesture.
       const bgMusic = new Audio("assets/music.mp3");
       const curtainSound = new Audio("assets/curtain.mp3");
       const chimeSound = new Audio("assets/chime.mp3"); */
    if (!audioConfig.enabled) return;
    ["music", "curtain", "chime"].forEach((name) => {
      if (!audioConfig[name]) return;
      const audio = new Audio(audioConfig[name]);
      audio.preload = "none";
      audio.volume = name === "music" ? 0.24 : 0.15;
      audio.loop = name === "music";
      soundtrack[name] = audio;
      audio.addEventListener(
        "error",
        () => {
          if (name === "music") {
            const button = $("#audio-toggle");
            if (button) button.hidden = true;
          }
        },
        { once: true },
      );
    });
    const toggle = $("#audio-toggle");
    if (toggle) {
      toggle.hidden = false;
      toggle.setAttribute("aria-pressed", "true");
      toggle.setAttribute("aria-label", "كتم الموسيقى");
    }
    safePlay(soundtrack.music);
    safePlay(soundtrack.curtain);
  }

  function completeHero() {
    const hero = $("#hero");
    if (hero)
      hero.classList.add(
        "prologue-done",
        "calligraphy-active",
        "names-visible",
        "hero-complete",
      );
  }

  function finishIntro(immediate = false) {
    if (introFinished) {
      if (immediate) {
        cancelMoments("hero");
        completeHero();
      }
      return;
    }
    introFinished = true;
    state.opened = true;
    state.opening = false;
    document.body.classList.add("intro-complete", "particles-ready");
    document.body.classList.remove("intro-pending");
    const main = $("#main-content");
    if (main) {
      main.inert = false;
      main.removeAttribute("aria-hidden");
    }
    const intro = $("#intro");
    const skip = $("#skip-intro");
    const button = $("#open-story");
    const needsFocus =
      document.activeElement === button || document.activeElement === skip;
    if (intro) {
      intro.inert = true;
      intro.setAttribute("aria-hidden", "true");
      if (immediate) intro.hidden = true;
      else
        moment(
          () => {
            intro.hidden = true;
          },
          900,
          "intro-cleanup",
        );
    }
    if (needsFocus && main) {
      main.setAttribute("tabindex", "-1");
      main.focus({ preventScroll: true });
    }
    document.dispatchEvent(new CustomEvent("wedding:opened"));
    invalidateMeasurements();
    const hero = $("#hero");
    if (state.reduced || immediate) {
      completeHero();
      if (skip) skip.hidden = true;
      return;
    }
    if (hero) {
      hero.classList.add("prologue-one");
      moment(() => hero.classList.add("prologue-two"), 1350, "hero");
      moment(() => hero.classList.add("prologue-done"), 2900, "hero");
      moment(() => hero.classList.add("calligraphy-active"), 3350, "hero");
      moment(() => hero.classList.add("names-visible"), 4250, "hero");
      moment(
        () => {
          hero.classList.add("hero-complete");
          if (skip) skip.hidden = true;
        },
        6500,
        "hero",
      );
    }
  }

  function openCurtains() {
    if (state.opening || state.opened) return;
    state.opening = true;
    const button = $("#open-story");
    if (button) button.disabled = true;
    document.body.classList.add("intro-opening");
    /* Starting audio here preserves the browser's user-gesture permission. */
    enableAudio();
    if (state.reduced) {
      document.body.classList.add("curtains-open", "light-full");
      finishIntro(true);
      return;
    }
    moment(() => document.body.classList.add("audio-ready"), 100, "intro");
    moment(() => document.body.classList.add("light-awake"), 200, "intro");
    moment(() => document.body.classList.add("curtains-breathe"), 500, "intro");
    moment(() => document.body.classList.add("curtains-open"), 900, "intro");
    moment(() => document.body.classList.add("light-full"), 1800, "intro");
    moment(() => document.body.classList.add("particles-ready"), 2200, "intro");
    moment(() => finishIntro(), 3000, "intro");
  }

  function initIntro() {
    const main = $("#main-content");
    if (main) main.inert = true;
    const preloader = $("#preloader");
    window.setTimeout(
      () => {
        if (!preloader) return;
        preloader.classList.add("is-hidden");
        preloader.setAttribute("aria-hidden", "true");
        window.setTimeout(
          () => {
            preloader.hidden = true;
          },
          state.reduced ? 0 : 650,
        );
      },
      state.reduced ? 300 : 1500,
    );
    $("#open-story")?.addEventListener("click", openCurtains);
    $("#skip-intro")?.addEventListener("click", () => {
      if (!state.opened && !state.opening) enableAudio();
      cancelMoments("intro");
      cancelMoments("hero");
      document.body.classList.add(
        "intro-opening",
        "curtains-open",
        "light-full",
      );
      finishIntro(true);
      const skip = $("#skip-intro");
      if (skip) skip.hidden = true;
    });
    $(".skip-link")?.addEventListener("click", (event) => {
      event.preventDefault();
      if (!state.opened) {
        cancelMoments("intro");
        cancelMoments("hero");
        document.body.classList.add(
          "intro-opening",
          "curtains-open",
          "light-full",
        );
        finishIntro(true);
      }
      const target = $("#date-scene");
      if (target) {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
        target.scrollIntoView({ behavior: "instant", block: "start" });
      }
    });
    $("#audio-toggle")?.addEventListener("click", (event) => {
      soundtrack.muted = !soundtrack.muted;
      Object.values(soundtrack).forEach((audio) => {
        if (audio instanceof HTMLAudioElement) audio.muted = soundtrack.muted;
      });
      event.currentTarget.setAttribute(
        "aria-pressed",
        String(!soundtrack.muted),
      );
      event.currentTarget.setAttribute(
        "aria-label",
        soundtrack.muted ? "تشغيل الموسيقى" : "كتم الموسيقى",
      );
      if (!soundtrack.muted) safePlay(soundtrack.music);
    });
  }

  function initParticles() {
    const container = $("#dust");
    if (!container) return;
    const motes = Array.from({ length: 28 }, () => {
      const element = document.createElement("i");
      element.className = "dust-mote";
      element.setAttribute("aria-hidden", "true");
      const seed = {
        element,
        x: Math.random(),
        y: Math.random(),
        speed: 0.004 + Math.random() * 0.009,
        phase: Math.random() * Math.PI * 2,
      };
      element.style.setProperty(
        "--mote-size",
        `${Math.random() * 1.7 + 0.7}px`,
      );
      element.style.width =
        element.style.height = `${Math.random() * 1.7 + 0.7}px`;
      element.style.opacity = String(0.15 + Math.random() * 0.45);
      container.appendChild(element);
      return seed;
    });
    state.frameTasks.push((dt, time) => {
      if (!state.opened || state.reduced) return;
      motes.forEach((mote) => {
        mote.y = (mote.y - dt * mote.speed + 1.05) % 1.05;
        const x =
          (mote.x + Math.sin(time * 0.1 + mote.phase) * 0.025) *
          window.innerWidth;
        mote.element.style.transform = `translate3d(${x.toFixed(1)}px,${(mote.y * state.viewport).toFixed(1)}px,0)`;
      });
    });
  }

  function initPetals() {
    const container = $("#petals");
    if (!container) return;
    const petals = Array.from({ length: 22 }, (_, index) => {
      const element = document.createElement("i");
      const depth = index % 8 === 0 ? 1 : 0.2 + Math.random() * 0.55;
      element.className = `petal${depth > 0.85 ? " petal-near" : ""}`;
      element.setAttribute("aria-hidden", "true");
      element.style.width = `${6 + depth * 16}px`;
      element.style.height = `${10 + depth * 22}px`;
      element.style.opacity = String(0.2 + depth * 0.4);
      element.style.filter =
        depth > 0.85 ? "blur(2px)" : depth > 0.6 ? "blur(.6px)" : "none";
      element.style.setProperty("--petal-depth", depth.toFixed(2));
      container.appendChild(element);
      return {
        element,
        depth,
        x: Math.random(),
        y: Math.random() * 1.25 - 0.15,
        speed: 0.014 + depth * 0.026,
        phase: Math.random() * Math.PI * 2,
        rotation: Math.random() * 360,
        direction: 1,
        rising: index < 7,
      };
    });
    state.frameTasks.push((dt, time) => {
      if (
        (!state.opened &&
          !document.body.classList.contains("particles-ready")) ||
        state.reduced
      )
        return;
      petals.forEach((petal) => {
        const target = state.secret && petal.rising ? -0.85 : 1;
        petal.direction += (target - petal.direction) * Math.min(1, dt * 1.5);
        petal.y += dt * petal.speed * petal.direction;
        if (petal.y > 1.12) {
          petal.y = -0.12;
          petal.x = Math.random();
        }
        if (petal.y < -0.16) {
          petal.y = 1.1;
          petal.x = Math.random();
        }
        const x =
          (petal.x + Math.sin(time * 0.18 + petal.phase) * 0.055) *
          window.innerWidth;
        const spin = petal.rotation + time * (7 + petal.depth * 11);
        const sway = Math.sin(time * 0.7 + petal.phase) * 48;
        petal.element.style.transform = `translate3d(${x.toFixed(1)}px,${(petal.y * state.viewport).toFixed(1)}px,0) rotate(${spin.toFixed(1)}deg) rotateY(${sway.toFixed(1)}deg)`;
      });
    });
  }

  function initCalligraphy() {
    $$("[data-draw]").forEach((path) => path.setAttribute("pathLength", "1"));
    $$("[data-calligraphy]").forEach((element) =>
      element.classList.add("calligraphy-ready"),
    );
  }

  function initRevealObserver() {
    const selector =
      ".reveal, .reveal-up, .reveal-down, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur, .reveal-line, .reveal-mask, .text-mask, [data-calligraphy]";
    const elements = $$(selector).filter(
      (element) => !element.closest("#hero .hero-sequence"),
    );
    afterOpening(() => {
      if (!("IntersectionObserver" in window)) {
        elements.forEach((element) => element.classList.add("is-visible"));
        return;
      }
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
      );
      elements.forEach((element) => revealObserver.observe(element));
    });
  }

  function initStory() {
    const chapters = $$("#story .story-chapter");
    afterOpening(() => {
      if (!("IntersectionObserver" in window)) {
        chapters.forEach((chapter) => chapter.classList.add("chapter-active"));
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            entry.target.classList.toggle(
              "chapter-active",
              entry.isIntersecting,
            );
            if (entry.isIntersecting) {
              const index = chapters.indexOf(entry.target);
              $("#story")?.style.setProperty("--chapter", String(index));
            }
          });
        },
        { threshold: 0.28 },
      );
      chapters.forEach((chapter) => observer.observe(chapter));
    });
  }

  function initInitialsScene() {
    const section = $("#initials-scene");
    if (!section) return;
    const position = { top: 0, height: 1, progress: 0 };
    state.measureTasks.push(() => {
      const rect = section.getBoundingClientRect();
      position.top = rect.top + window.scrollY;
      position.height = rect.height;
    });
    state.frameTasks.push((dt) => {
      if (!state.opened) return;
      const target = state.reduced
        ? 1
        : clamp(
            (state.scrollY - position.top + state.viewport * 0.12) /
              Math.max(
                state.viewport * 0.65,
                position.height - state.viewport * 0.78,
              ),
          );
      position.progress = state.reduced
        ? target
        : position.progress +
          (target - position.progress) * Math.min(1, dt * 7);
      if (Math.abs(position.progress - target) < 0.0005)
        position.progress = target;
      section.style.setProperty("--join", ease(position.progress).toFixed(4));
      const joined = state.reduced || position.progress > 0.8;
      if (joined && !section.classList.contains("is-joined"))
        safePlay(soundtrack.chime);
      section.classList.toggle("is-joined", joined);
    });
  }

  function initCountdown() {
    const container = $("#countdown");
    if (!container) return;
    const target = new Date(weddingData.date).getTime();
    const nodes = {};
    ["days", "hours", "minutes", "seconds"].forEach((unit) => {
      nodes[unit] = $(`[data-countdown="${unit}"]`, container);
    });
    const last = {};
    function changeNumber(element, value, unit) {
      if (!element || last[unit] === value) return;
      cancelMoments(`digit-${unit}`);
      const old = last[unit];
      last[unit] = value;
      element.classList.remove("is-changing");
      element.replaceChildren();
      const current = document.createElement("span");
      current.className = "digit-current";
      current.textContent =
        old === undefined || state.reduced || !state.opened ? value : old;
      element.appendChild(current);
      element.setAttribute("aria-label", value);
      if (old === undefined || state.reduced || !state.opened) return;
      const next = document.createElement("span");
      next.className = "digit-next";
      next.textContent = value;
      next.setAttribute("aria-hidden", "true");
      element.appendChild(next);
      moment(() => element.classList.add("is-changing"), 25, `digit-${unit}`);
      moment(
        () => {
          element.classList.remove("is-changing");
          const settled = document.createElement("span");
          settled.className = "digit-current";
          settled.textContent = value;
          element.replaceChildren(settled);
        },
        650,
        `digit-${unit}`,
      );
    }
    countdownRefresh = () => {
      if (document.hidden) return;
      const remaining = target - Date.now();
      if (!Number.isFinite(remaining) || remaining <= 0) {
        container.classList.add("has-ended");
        container.hidden = true;
        Object.values(nodes).forEach((node) => {
          const unit = node?.closest(".countdown-unit, [data-countdown-unit]");
          if (unit) unit.hidden = true;
        });
        const message = $("#countdown-message");
        if (message) {
          message.hidden = false;
          message.textContent = Number.isFinite(remaining)
            ? "لقد بدأت أجمل ليالينا 🤍"
            : "سيُعلن موعدنا قريبًا";
        }
        return;
      }
      const total = Math.floor(remaining / 1000);
      const values = {
        days: Math.floor(total / 86400),
        hours: Math.floor(total / 3600) % 24,
        minutes: Math.floor(total / 60) % 60,
        seconds: total % 60,
      };
      Object.entries(values).forEach(([unit, value]) =>
        changeNumber(nodes[unit], String(value).padStart(2, "0"), unit),
      );
    };
    countdownRefresh();
    window.setInterval(countdownRefresh, 1000);
  }

  function loadOptionalImages() {
    $$("img[data-optional-src]").forEach((image) => {
      const source = image.dataset.optionalSrc;
      if (!source) return;
      const probe = new Image();
      probe.onload = () => {
        image.src = source;
        const wrapper =
          image.closest(
            ".artwork, [data-image-frame], .hero-photo, .story-visual",
          ) || image.parentElement;
        wrapper?.classList.add("has-image");
        image.classList.add("is-loaded");
        invalidateMeasurements();
      };
      probe.onerror = () => {
        image.removeAttribute("src");
        image.classList.add("is-unavailable");
      };
      probe.src = source;
    });
  }

  function initGallery() {
    const items = $$("#gallery .gallery-item");
    items.forEach((item, index) => {
      item.dataset.galleryIndex = String(index);
      item.setAttribute("aria-haspopup", "dialog");
      if (!item.hasAttribute("aria-label"))
        item.setAttribute(
          "aria-label",
          `افتح الصورة ${index + 1}: ${item.dataset.title || "تفاصيل من الحكاية"}`,
        );
    });
    loadOptionalImages();
  }

  function initLightbox() {
    const dialog = $("#lightbox");
    const artwork = $("#lightbox-artwork");
    const items = $$("#gallery .gallery-item");
    if (!dialog || !artwork || !items.length) return;
    let currentIndex = 0;
    let previousFocus = null;
    let touchStart = null;
    function showImage(index) {
      currentIndex = (index + items.length) % items.length;
      const item = items[currentIndex];
      const source = $(".artwork", item) || item;
      const clone = source.cloneNode(true);
      clone.removeAttribute("id");
      clone.removeAttribute("data-parallax");
      clone.style.removeProperty("--parallax-y");
      clone.classList.remove("reveal", "reveal-mask");
      clone.classList.add("is-visible", "lightbox-image");
      $$("[data-parallax]", clone).forEach((element) => {
        element.removeAttribute("data-parallax");
        element.style.setProperty("--parallax-y", "0px");
      });
      artwork.replaceChildren(clone);
      const caption = $("#lightbox-caption");
      const counter = $("#lightbox-counter");
      if (caption)
        caption.textContent =
          item.dataset.title || $("img", item)?.alt || "تفاصيل من الحكاية";
      if (counter)
        counter.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
      dialog.setAttribute(
        "aria-label",
        `معرض الصور، الصورة ${currentIndex + 1} من ${items.length}`,
      );
    }
    function open(index) {
      previousFocus = document.activeElement;
      showImage(index);
      document.body.classList.add("lightbox-open");
      if (typeof dialog.showModal === "function") dialog.showModal();
      else {
        dialog.setAttribute("open", "");
        dialog.setAttribute("aria-modal", "true");
      }
      $("#lightbox-close")?.focus({ preventScroll: true });
    }
    function close() {
      if (!dialog.hasAttribute("open")) return;
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
      document.body.classList.remove("lightbox-open");
      previousFocus?.focus({ preventScroll: true });
    }
    items.forEach((item, index) =>
      item.addEventListener("click", () => open(index)),
    );
    $("#lightbox-close")?.addEventListener("click", close);
    $("#lightbox-prev")?.addEventListener("click", () =>
      showImage(currentIndex - 1),
    );
    $("#lightbox-next")?.addEventListener("click", () =>
      showImage(currentIndex + 1),
    );
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      close();
    });
    dialog.addEventListener("close", () => {
      document.body.classList.remove("lightbox-open");
      previousFocus?.focus({ preventScroll: true });
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) close();
    });
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showImage(currentIndex + 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        showImage(currentIndex - 1);
      }
      if (event.key === "Tab") {
        const focusable = $$(
          'button:not([disabled]), a[href], [tabindex="0"]',
          dialog,
        ).filter((element) => !element.hidden);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    });
    artwork.addEventListener(
      "touchstart",
      (event) => {
        if (event.touches.length === 1)
          touchStart = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY,
          };
      },
      { passive: true },
    );
    artwork.addEventListener(
      "touchend",
      (event) => {
        if (!touchStart || !event.changedTouches.length) return;
        const dx = event.changedTouches[0].clientX - touchStart.x;
        const dy = event.changedTouches[0].clientY - touchStart.y;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3)
          showImage(currentIndex + (dx > 0 ? 1 : -1));
        touchStart = null;
      },
      { passive: true },
    );
  }

  function initRsvp() {
    const form = $("#rsvp-form");
    const response = $("#rsvp-response");
    if (!form || !response) return;
    const edit = $("#rsvp-edit");
    const nameInput = $("#guest-name", form);
    const countInput = $("#guest-count", form);
    const storageKey = `hekaya-rsvp:${weddingData.date}:${weddingData.groom}:${weddingData.bride}`;
    let lastResponse = "accept";
    function displayResponse(answer, animate) {
      const message =
        answer === "decline"
          ? "وجود محبتكم يصلنا حتى من بعيد 🤍"
          : "سجّلنا اسمك بين أجمل تفاصيل الليلة 🤍";
      const messageTarget = $("[data-rsvp-message]", response);
      if (messageTarget) messageTarget.textContent = message;
      else {
        const text = document.createElement("p");
        text.setAttribute("data-rsvp-message", "");
        text.textContent = message;
        response.prepend(text);
      }
      form.classList.add("is-submitted");
      form.setAttribute("aria-hidden", "true");
      form.inert = true;
      const finish = () => {
        form.hidden = true;
        response.hidden = false;
        response.classList.add("is-visible");
        if (edit) edit.hidden = false;
        if (animate) {
          response.setAttribute("tabindex", "-1");
          response.focus({ preventScroll: true });
        }
        invalidateMeasurements();
      };
      if (animate) moment(finish, state.reduced ? 0 : 550, "rsvp");
      else finish();
    }
    nameInput?.addEventListener("input", () => nameInput.setCustomValidity(""));
    $$('button[type="submit"]', form).forEach((button) =>
      button.addEventListener("click", () => {
        lastResponse = button.value || "accept";
      }),
    );
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = nameInput?.value.trim() || "";
      nameInput?.setCustomValidity(name ? "" : "يرجى كتابة اسمكم الكريم.");
      if (!form.reportValidity()) return;
      const answer = event.submitter?.value || lastResponse;
      try {
        window.localStorage.setItem(
          storageKey,
          JSON.stringify({
            name,
            guests: Number(countInput?.value) || 1,
            answer,
          }),
        );
      } catch (_) {
        /* Private browsing and file URL storage restrictions do not block RSVP. */
      }
      displayResponse(answer, true);
    });
    edit?.addEventListener("click", () => {
      cancelMoments("rsvp");
      edit.hidden = true;
      response.hidden = true;
      response.classList.remove("is-visible");
      form.hidden = false;
      form.inert = false;
      form.removeAttribute("aria-hidden");
      form.classList.remove("is-submitted");
      nameInput?.focus({ preventScroll: true });
      invalidateMeasurements();
    });
    try {
      const saved = JSON.parse(
        window.localStorage.getItem(storageKey) || "null",
      );
      if (
        saved &&
        typeof saved.name === "string" &&
        ["accept", "decline"].includes(saved.answer)
      ) {
        if (nameInput) nameInput.value = saved.name.slice(0, 80);
        if (countInput)
          countInput.value = String(clamp(Number(saved.guests) || 1, 1, 12));
        lastResponse = saved.answer;
        displayResponse(saved.answer, false);
      }
    } catch (_) {
      /* The form remains usable when local storage is unavailable. */
    }
  }

  function initParallax() {
    const layers = $$("[data-parallax]").map((element) => ({
      element,
      speed: clamp(Number(element.dataset.parallax) || 0.04, -0.12, 0.12),
      internal: Boolean(element.closest(".gallery-item")),
      top: 0,
      height: 1,
      y: 0,
    }));
    state.measureTasks.push(() =>
      layers.forEach((layer) => {
        const rect = layer.element.getBoundingClientRect();
        layer.top = rect.top + window.scrollY - (layer.internal ? 0 : layer.y);
        layer.height = rect.height;
      }),
    );
    state.frameTasks.push((dt) => {
      if (!state.opened) return;
      layers.forEach((layer) => {
        const distance =
          state.scrollY + state.viewport / 2 - layer.top - layer.height / 2;
        if (
          !state.reduced &&
          Math.abs(distance) > state.viewport + layer.height
        )
          return;
        const target = state.reduced
          ? 0
          : clamp(
              distance * layer.speed,
              -layer.height * (layer.internal ? 0.055 : 0.1),
              layer.height * (layer.internal ? 0.055 : 0.1),
            );
        layer.y = state.reduced
          ? 0
          : layer.y + (target - layer.y) * Math.min(1, dt * 5);
        layer.element.style.setProperty(
          "--parallax-y",
          `${layer.y.toFixed(2)}px`,
        );
      });
    });
    const light = $("#pointer-light");
    if (!light) return;
    window.addEventListener(
      "pointermove",
      (event) => {
        if (!finePointer.matches || state.reduced) return;
        state.pointer.tx = event.clientX;
        state.pointer.ty = event.clientY;
        wakeFrame();
      },
      { passive: true },
    );
    state.frameTasks.push((dt) => {
      if (!state.opened || !finePointer.matches || state.reduced) return;
      const pointer = state.pointer;
      const amount = Math.min(1, dt * 4);
      pointer.x += (pointer.tx - pointer.x) * amount;
      pointer.y += (pointer.ty - pointer.y) * amount;
      light.style.transform = `translate3d(${(pointer.x - 225).toFixed(1)}px,${(pointer.y - 225).toFixed(1)}px,0)`;
      document.documentElement.style.setProperty(
        "--pointer-x",
        ((pointer.x / window.innerWidth - 0.5) * 2).toFixed(3),
      );
      document.documentElement.style.setProperty(
        "--pointer-y",
        ((pointer.y / state.viewport - 0.5) * 2).toFixed(3),
      );
    });
  }

  function initScrollScenes() {
    window.addEventListener(
      "scroll",
      () => {
        state.scrollY = window.scrollY;
        state.scrollDirty = true;
        wakeFrame();
      },
      { passive: true },
    );
    window.addEventListener("resize", invalidateMeasurements, {
      passive: true,
    });
    window.addEventListener("orientationchange", invalidateMeasurements, {
      passive: true,
    });
    document.fonts?.ready.then(invalidateMeasurements);
    if ("ResizeObserver" in window) {
      const resizeObserver = new ResizeObserver(invalidateMeasurements);
      if ($("#main-content")) resizeObserver.observe($("#main-content"));
    }
    state.frameTasks.push(() => {
      if (!state.opened || !state.scrollDirty) return;
      const progress = clamp(state.scrollY / state.pageHeight);
      document.documentElement.style.setProperty(
        "--scroll-progress",
        progress.toFixed(5),
      );
      const progressLine = $("#scroll-progress");
      if (progressLine)
        progressLine.style.transform = `scaleY(${progress.toFixed(5)})`;
      if (progress >= 0.98 && !state.secret) {
        state.secret = true;
        document.body.classList.add("secret-revealed");
        $("#secret-ending")?.classList.add("is-visible");
      }
    });
    afterOpening(() => {
      if (!("IntersectionObserver" in window)) {
        $$("[data-scene]").forEach((scene) =>
          scene.classList.add("scene-active"),
        );
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const scene = entry.target.closest("[data-scene]") || entry.target;
            const active =
              entry.isIntersecting &&
              (!entry.target.classList.contains("rings-composition") ||
                entry.intersectionRatio >= 0.45);
            scene.classList.toggle("scene-active", active);
            if (!active) return;
            scene.classList.add("scene-entered");
            const indicator = $("#scene-indicator");
            if (indicator && scene.dataset.scene)
              indicator.textContent = scene.dataset.scene;
          });
        },
        { threshold: [0, 0.18, 0.45] },
      );
      $$("[data-scene]").forEach((scene) =>
        observer.observe(
          scene.id === "rings-scene" ? $(".rings-composition", scene) : scene,
        ),
      );
    });
  }

  function initFinalScene() {
    const scene = $("#final-scene");
    if (!scene) return;
    const begin = () => {
      if (scene.classList.contains("final-started")) return;
      scene.classList.add("final-started");
      if (state.reduced) {
        scene.classList.add("final-names-visible", "final-complete");
        return;
      }
      moment(() => scene.classList.add("final-names-visible"), 7000, "final");
      moment(() => scene.classList.add("final-complete"), 9500, "final");
    };
    afterOpening(() => {
      if (!("IntersectionObserver" in window)) {
        begin();
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          if (
            entries.some(
              (entry) => entry.isIntersecting && entry.intersectionRatio >= 0.8,
            )
          ) {
            begin();
            observer.disconnect();
          }
        },
        { threshold: 0.8 },
      );
      // Start the final film when its central composition is actually in view.
      observer.observe($(".final-love", scene) || scene);
    });
  }

  function initReducedMotion() {
    function applyPreference() {
      state.reduced = motionQuery.matches;
      document.documentElement.classList.toggle(
        "reduced-motion",
        state.reduced,
      );
      if (state.reduced && (state.opening || state.opened)) {
        cancelMoments("intro");
        cancelMoments("hero");
        document.body.classList.add("curtains-open", "light-full");
        finishIntro(true);
        completeHero();
        const final = $("#final-scene.final-started");
        if (final) final.classList.add("final-names-visible", "final-complete");
      }
      invalidateMeasurements();
    }
    applyPreference();
    if (motionQuery.addEventListener)
      motionQuery.addEventListener("change", applyPreference);
    else motionQuery.addListener(applyPreference);
    document.addEventListener("visibilitychange", () => {
      document.body.classList.toggle("page-hidden", document.hidden);
      if (document.hidden) {
        if (state.raf) cancelAnimationFrame(state.raf);
        state.raf = 0;
        state.previousFrame = 0;
        if (soundtrack.music) soundtrack.music.pause();
      } else {
        state.previousFrame = 0;
        countdownRefresh();
        if (state.opened) safePlay(soundtrack.music);
        invalidateMeasurements();
      }
    });
  }

  function boot() {
    document.documentElement.classList.add("js");
    populateWeddingData();
    initReducedMotion();
    initIntro();
    initParticles();
    initPetals();
    initCalligraphy();
    initRevealObserver();
    initStory();
    initInitialsScene();
    initCountdown();
    initGallery();
    initLightbox();
    initRsvp();
    initParallax();
    initScrollScenes();
    initFinalScene();
    invalidateMeasurements();
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
