const header = document.getElementById("site-header");
const progress = document.getElementById("scroll-progress");
const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.getElementById("mobile-nav");
const navLinks = [...document.querySelectorAll(".primary-nav a, .mobile-nav a[href^='#']")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let lastScrollY = window.scrollY;

function updateChrome() {
  const scrollY = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progressWidth = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;

  header.classList.toggle("is-scrolled", scrollY > 24);
  header.classList.toggle("is-hidden", scrollY > 420 && scrollY > lastScrollY && !document.body.classList.contains("menu-open"));
  progress.style.width = `${progressWidth}%`;
  lastScrollY = scrollY;
}

window.addEventListener("scroll", updateChrome, { passive: true });
updateChrome();

function setMenu(open) {
  menuToggle.setAttribute("aria-expanded", String(open));
  mobileNav.classList.toggle("is-open", open);
  mobileNav.setAttribute("aria-hidden", String(!open));
  document.body.classList.toggle("menu-open", open);
}

menuToggle.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
});

mobileNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    setMenu(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenu(false);
  }
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-header")) {
    setMenu(false);
  }
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.16,
  rootMargin: "0px 0px -70px 0px"
});

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      return;
    }

    const id = entry.target.id;
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
  });
}, {
  rootMargin: "-35% 0px -55% 0px"
});

document.querySelectorAll("main section[id]").forEach((section) => {
  sectionObserver.observe(section);
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  });
});

const scenarios = {
  nonEv: {
    title: "Niet-EV voertuig op laadplek",
    copy: "Het kenteken wordt gekoppeld aan een voertuig zonder elektrische of hybride aandrijving. De laadplek wordt dus geblokkeerd zonder laaddoel.",
    evidence: ["ANPR snapshot", "Locatie en tijdstip", "Voertuigtype validatie", "CRM dossier klaar"]
  },
  notCharging: {
    title: "EV aanwezig, maar geen actieve laadsessie",
    copy: "Het voertuig is elektrisch, maar de laadpaaldata bevestigt geen actieve sessie. VoltGuard wacht de ingestelde tolerantie af en bouwt daarna de case op.",
    evidence: ["ANPR snapshot", "OCPP status: idle", "Tolerantie verstreken", "Reviewbare case"]
  },
  overstay: {
    title: "Overstay na afgeronde laadsessie",
    copy: "De laadsessie is voltooid of de maximale parkeertijd is overschreden. De bezette bay wordt gekoppeld aan duur, status en bewijsbeelden.",
    evidence: ["Start en eindtijd", "Laadsessie voltooid", "Overstay timer", "CRM dossier klaar"]
  }
};

const scenarioTitle = document.getElementById("scenario-title");
const scenarioCopy = document.getElementById("scenario-copy");
const scenarioEvidence = document.getElementById("scenario-evidence");

document.querySelectorAll(".scenario-tab").forEach((button) => {
  button.addEventListener("click", () => {
    const scenario = scenarios[button.dataset.scenario];

    document.querySelectorAll(".scenario-tab").forEach((tab) => {
      const isActive = tab === button;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    scenarioTitle.textContent = scenario.title;
    scenarioCopy.textContent = scenario.copy;
    scenarioEvidence.innerHTML = scenario.evidence
      .map((item, index) => `<div class="evidence-item ${index < 3 ? "is-complete" : ""}">${item}</div>`)
      .join("");
  });
});

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      return;
    }

    const element = entry.target;
    const target = Number(element.dataset.count || "0");
    const duration = reduceMotion ? 1 : 1200;
    const start = performance.now();

    function tick(now) {
      const progressValue = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progressValue, 3);
      element.textContent = Math.round(target * eased);

      if (progressValue < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
    countObserver.unobserve(element);
  });
}, { threshold: 0.5 });

document.querySelectorAll("[data-count]").forEach((element) => {
  countObserver.observe(element);
});

if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateX = ((y / rect.height) - 0.5) * -7;
      const rotateY = ((x / rect.width) - 0.5) * 7;

      card.style.setProperty("--mx", `${(x / rect.width) * 100}%`);
      card.style.setProperty("--my", `${(y / rect.height) * 100}%`);
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });

  document.querySelectorAll(".magnetic").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${x * 0.16}px, ${y * 0.22}px)`;
    });

    button.addEventListener("pointerleave", () => {
      button.style.transform = "";
    });
  });
}

const teaser = document.querySelector(".play-teaser");
teaser?.addEventListener("click", () => {
  teaser.animate([
    { transform: "scale(1)" },
    { transform: "scale(0.92)" },
    { transform: "scale(1.06)" },
    { transform: "scale(1)" }
  ], {
    duration: 520,
    easing: "cubic-bezier(0.16, 1, 0.3, 1)"
  });
});
