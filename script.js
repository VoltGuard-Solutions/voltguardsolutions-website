const header = document.getElementById("site-header");
const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.getElementById("mobile-nav");
const yearNodes = document.querySelectorAll("[data-year]");
const forms = document.querySelectorAll("[data-mail-form]");

yearNodes.forEach((node) => {
  node.textContent = new Date().getFullYear();
});

const closeMenu = () => {
  if (!menuToggle || !mobileNav) {
    return;
  }

  menuToggle.setAttribute("aria-expanded", "false");
  mobileNav.classList.remove("is-open");
  mobileNav.setAttribute("aria-hidden", "true");
  document.body.classList.remove("nav-open");
};

if (menuToggle && mobileNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    mobileNav.classList.toggle("is-open", !isOpen);
    mobileNav.setAttribute("aria-hidden", String(isOpen));
    document.body.classList.toggle("nav-open", !isOpen);
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

if (header) {
  const solidHeader = !document.querySelector(".home-hero, .page-hero");

  if (solidHeader) {
    header.classList.add("header-solid");
  }

  const syncHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href");

    if (!targetId || targetId === "#") {
      return;
    }

    const target = document.querySelector(targetId);
    if (!target) {
      return;
    }

    event.preventDefault();
    const offset = header ? header.offsetHeight + 24 : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
    closeMenu();
  });
});

const setFeedback = (form, message, className) => {
  const feedback = form.querySelector(".form-feedback");
  if (!feedback) {
    return;
  }

  feedback.textContent = message;
  feedback.classList.remove("is-error", "is-success");

  if (className) {
    feedback.classList.add(className);
  }
};

forms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    const recipient = document.body.dataset.contactEmail || "info@voltguardsolutions.be";
    const data = new FormData(form);
    const lines = [];

    data.forEach((value, key) => {
      const cleanValue = String(value).trim();
      if (cleanValue) {
        lines.push(`${key}: ${cleanValue}`);
      }
    });

    const subject = encodeURIComponent("Aanvraag via voltguardsolutions.be");
    const body = encodeURIComponent(lines.join("\n"));
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
    setFeedback(form, "Uw mailprogramma wordt geopend met de ingevulde aanvraag.", "is-success");
  });
});
