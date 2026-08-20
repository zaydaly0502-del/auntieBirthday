(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Reveal on scroll */
  const reveals = document.querySelectorAll(".reveal");
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

  /* Category filters */
  const filterBtns = [...document.querySelectorAll(".filter-btn")];
  const allTiles = [...document.querySelectorAll(".gallery .tile")];

  function visibleTiles() {
    return allTiles.filter((t) => !t.classList.contains("is-hidden"));
  }

  function applyFilter(cat) {
    allTiles.forEach((tile) => {
      const match = cat === "all" || tile.dataset.cat === cat;
      tile.classList.toggle("is-hidden", !match);
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

  /* Lightbox — only through currently visible tiles */
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
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = tile.dataset.caption || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeLb() {
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
})();
