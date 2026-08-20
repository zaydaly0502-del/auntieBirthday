(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Reveal on scroll */
  const reveals = document.querySelectorAll(".reveal, .tile-enter");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* Confetti celebration */
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  let particles = [];
  let running = false;

  const colors = ["#d4654a", "#1f7a6e", "#c49a5c", "#7ec8b8", "#f0b39a", "#ffffff"];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function spawnBurst(count = 140) {
    const cx = canvas.width / 2;
    const cy = canvas.height * 0.28;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        g: 0.12 + Math.random() * 0.08,
        w: 6 + Math.random() * 8,
        h: 8 + Math.random() * 10,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.25,
        color: colors[(Math.random() * colors.length) | 0],
        life: 1,
        decay: 0.006 + Math.random() * 0.008,
      });
    }
  }

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter((p) => p.life > 0);
    particles.forEach((p) => {
      p.vy += p.g;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.99;
      p.rot += p.vr;
      p.life -= p.decay;
      ctx.save();
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (particles.length) {
      requestAnimationFrame(frame);
    } else {
      running = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function celebrate(count) {
    if (reduceMotion) return;
    resize();
    spawnBurst(count);
    if (!running) {
      running = true;
      requestAnimationFrame(frame);
    }
  }

  window.addEventListener("resize", resize);
  resize();
  window.addEventListener("load", () => setTimeout(() => celebrate(160), 500));
  document.getElementById("celebrateBtn")?.addEventListener("click", () => celebrate(180));

  /* Mobile nav */
  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");

  function setNavOpen(open) {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    siteNav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
  }

  navToggle?.addEventListener("click", () => {
    setNavOpen(navToggle.getAttribute("aria-expanded") !== "true");
  });

  siteNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setNavOpen(false));
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setNavOpen(false);
  });

  /* Featured photo stage slideshow */
  const stageSlides = [
    { src: "media/optimized/mem-10.jpg", caption: "Balloons, blue water, birthday spirit", side: ["media/optimized/mem-06.jpg", "media/optimized/new-11.jpg"] },
    { src: "media/optimized/mem-02.jpg", caption: "A kiss on the cheek, pure love", side: ["media/optimized/new-05.jpg", "media/optimized/mem-08.jpg"] },
    { src: "media/optimized/new-01.jpg", caption: "Four hearts, one horizon", side: ["media/optimized/new-04.jpg", "media/optimized/new-07.jpg"] },
    { src: "media/optimized/new-10.jpg", caption: "Joy with the little one", side: ["media/optimized/new-09.jpg", "media/optimized/new-12.jpg"] },
    { src: "media/optimized/mem-11.jpg", caption: "Night lights, warm company", side: ["media/optimized/mem-07.jpg", "media/optimized/mem-04.jpg"] },
    { src: "media/optimized/new-11.jpg", caption: "Captain Auntie", side: ["media/optimized/mem-10.jpg", "media/optimized/new-03.jpg"] },
    { src: "media/optimized/mem-01.jpg", caption: "A portrait of grace", side: ["media/optimized/mem-09.jpg", "media/optimized/new-08.jpg"] },
    { src: "media/optimized/new-05.jpg", caption: "A hug on the open sea", side: ["media/optimized/new-06.jpg", "media/optimized/mem-03.jpg"] },
  ];

  const imgA = document.getElementById("stageImgA");
  const imgB = document.getElementById("stageImgB");
  const stageCaption = document.getElementById("stageCaption");
  const stageDots = document.getElementById("stageDots");
  const sidePolas = [...document.querySelectorAll(".stage-polaroid img")];
  let stageIndex = 0;
  let showingA = true;
  let stageTimer = 0;

  function buildDots() {
    if (!stageDots) return;
    stageDots.innerHTML = "";
    stageSlides.forEach((_, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "stage-dot" + (i === 0 ? " is-active" : "");
      btn.setAttribute("aria-label", `Show featured photo ${i + 1}`);
      btn.addEventListener("click", () => goStage(i, true));
      stageDots.appendChild(btn);
    });
  }

  function updateDots() {
    stageDots?.querySelectorAll(".stage-dot").forEach((dot, i) => {
      dot.classList.toggle("is-active", i === stageIndex);
    });
  }

  function goStage(i, user = false) {
    if (!imgA || !imgB || !stageCaption) return;
    stageIndex = (i + stageSlides.length) % stageSlides.length;
    const slide = stageSlides[stageIndex];
    const incoming = showingA ? imgB : imgA;
    const outgoing = showingA ? imgA : imgB;

    stageCaption.classList.add("is-swap");
    incoming.src = slide.src;
    incoming.alt = slide.caption;

    const swap = () => {
      outgoing.classList.remove("is-active");
      incoming.classList.add("is-active");
      showingA = !showingA;
      stageCaption.textContent = slide.caption;
      stageCaption.classList.remove("is-swap");
      if (sidePolas[0] && slide.side[0]) sidePolas[0].src = slide.side[0];
      if (sidePolas[1] && slide.side[1]) sidePolas[1].src = slide.side[1];
      updateDots();
    };

    if (reduceMotion) swap();
    else setTimeout(swap, 180);

    if (user) restartStageTimer();
  }

  function nextStage() {
    goStage(stageIndex + 1);
  }

  function prevStage() {
    goStage(stageIndex - 1, true);
  }

  function restartStageTimer() {
    clearInterval(stageTimer);
    if (reduceMotion) return;
    stageTimer = setInterval(nextStage, 4500);
  }

  buildDots();
  document.getElementById("stageNext")?.addEventListener("click", () => {
    goStage(stageIndex + 1, true);
  });
  document.getElementById("stagePrev")?.addEventListener("click", prevStage);

  const stageEl = document.querySelector(".photo-stage");
  if (stageEl && "IntersectionObserver" in window) {
    const stageIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) restartStageTimer();
          else clearInterval(stageTimer);
        });
      },
      { threshold: 0.25 }
    );
    stageIo.observe(stageEl);
  } else {
    restartStageTimer();
  }

  /* Category filters with fade */
  const filterBtns = [...document.querySelectorAll(".filter-btn")];
  const allTiles = [...document.querySelectorAll(".gallery .tile")];

  function visibleTiles() {
    return allTiles.filter((t) => !t.classList.contains("is-hidden"));
  }

  function applyFilter(cat) {
    allTiles.forEach((tile, i) => {
      const match = cat === "all" || tile.dataset.cat === cat;
      if (match) {
        tile.classList.remove("is-hidden");
        tile.style.setProperty("--i", String(i % 12));
        requestAnimationFrame(() => tile.classList.add("is-in"));
      } else {
        tile.classList.add("is-hidden");
      }
    });
    filterBtns.forEach((btn) => {
      const on = btn.dataset.filter === cat;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => applyFilter(btn.dataset.filter));
  });

  /* Lightbox */
  const lightbox = document.getElementById("lightbox");
  const lbImg = lightbox.querySelector("img");
  const lbCaption = lightbox.querySelector(".lightbox-caption");
  let index = 0;

  function openAt(i) {
    const tiles = visibleTiles();
    if (!tiles.length) return;
    index = (i + tiles.length) % tiles.length;
    const tile = tiles[index];
    const img = tile.querySelector("img");
    lightbox.classList.remove("is-ready");
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = tile.dataset.caption || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => lightbox.classList.add("is-ready"));
    });
  }

  function closeLb() {
    lightbox.classList.remove("is-ready");
    lightbox.hidden = true;
    document.body.style.overflow = "";
    lbImg.removeAttribute("src");
  }

  allTiles.forEach((tile) => {
    tile.tabIndex = 0;
    tile.addEventListener("click", () => {
      const tiles = visibleTiles();
      openAt(tiles.indexOf(tile));
    });
    tile.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const tiles = visibleTiles();
        openAt(tiles.indexOf(tile));
      }
    });
  });

  lightbox.querySelector(".lightbox-close").addEventListener("click", closeLb);
  lightbox.querySelector(".lightbox-prev").addEventListener("click", () => openAt(index - 1));
  lightbox.querySelector(".lightbox-next").addEventListener("click", () => openAt(index + 1));
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLb();
  });

  window.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") openAt(index - 1);
    if (e.key === "ArrowRight") openAt(index + 1);
  });

  let touchX = 0;
  lightbox.addEventListener(
    "touchstart",
    (e) => {
      touchX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );
  lightbox.addEventListener(
    "touchend",
    (e) => {
      if (lightbox.hidden) return;
      const dx = e.changedTouches[0].screenX - touchX;
      if (Math.abs(dx) < 50) return;
      if (dx > 0) openAt(index - 1);
      else openAt(index + 1);
    },
    { passive: true }
  );
})();
