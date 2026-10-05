(() => {
  const money = (value) => new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0
  }).format(Math.round(value)).replace(/\u00A0/g, " ") + " ₽";

  const percent = (value) => new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 1
  }).format(value).replace(".", ",") + "%";

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.counter || 0);
      const duration = 950;
      const start = performance.now();

      const step = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        const value = target * eased;
        el.textContent = el.dataset.format === "money" ? money(value) : Math.round(value).toString();
        if (p < 1) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.45 });

  document.querySelectorAll("[data-counter]").forEach((el) => counterObserver.observe(el));

  const glow = document.querySelector(".cursor-glow");
  if (glow && window.matchMedia("(pointer:fine)").matches) {
    window.addEventListener("mousemove", (event) => {
      glow.style.left = event.clientX + "px";
      glow.style.top = event.clientY + "px";
      glow.style.opacity = "1";
    }, { passive: true });
    window.addEventListener("mouseleave", () => {
      glow.style.opacity = "0";
    });
  }

  const sokolRange = document.getElementById("sokolRange");
  const gryazRange = document.getElementById("gryazRange");
  const sheksnaRange = document.getElementById("sheksnaRange");
  const installmentToggle = document.getElementById("installmentToggle");

  if (sokolRange && gryazRange && sheksnaRange && installmentToggle) {
    const fixedPerLocation = 90500;
    const payrollPct = 0.495;
    const materialsPct = 0.08;
    const acquiringPct = 0.02;
    const contributionPct = 1 - payrollPct - materialsPct - acquiringPct;
    const installmentPerLocation = 34000;

    const profitFor = (revenue) => revenue * contributionPct - fixedPerLocation;

    const updateCalc = () => {
      const sokol = Number(sokolRange.value);
      const gryaz = Number(gryazRange.value);
      const sheksna = Number(sheksnaRange.value);

      const pSokol = profitFor(sokol);
      const pGryaz = profitFor(gryaz);
      const pSheksna = profitFor(sheksna);

      const revenue = sokol + gryaz + sheksna;
      const profit = pSokol + pGryaz + pSheksna;
      const installments = installmentToggle.checked ? installmentPerLocation * 3 : 0;
      const afterInstallments = profit - installments;
      const margin = revenue > 0 ? profit / revenue * 100 : 0;

      document.getElementById("sokolValue").textContent = money(sokol);
      document.getElementById("gryazValue").textContent = money(gryaz);
      document.getElementById("sheksnaValue").textContent = money(sheksna);
      document.getElementById("networkRevenue").textContent = money(revenue);
      document.getElementById("networkProfit").textContent = money(profit);
      document.getElementById("networkMargin").textContent = percent(margin);
      document.getElementById("afterInstallments").textContent = money(afterInstallments);
      document.getElementById("annualRevenue").textContent = money(revenue * 12);
      document.getElementById("profitSokol").textContent = money(pSokol);
      document.getElementById("profitGryaz").textContent = money(pGryaz);
      document.getElementById("profitSheksna").textContent = money(pSheksna);

      const maxProfit = Math.max(1, pSokol, pGryaz, pSheksna);
      const setBar = (id, value) => {
        const bar = document.getElementById(id);
        if (bar) bar.style.width = Math.max(4, value / maxProfit * 100) + "%";
      };
      setBar("barSokol", Math.max(0, pSokol));
      setBar("barGryaz", Math.max(0, pGryaz));
      setBar("barSheksna", Math.max(0, pSheksna));

      const after = document.getElementById("afterInstallments");
      if (after) after.style.color = afterInstallments < 0 ? "#ff4d57" : "#d8ff4f";
    };

    [sokolRange, gryazRange, sheksnaRange, installmentToggle].forEach((el) => {
      el.addEventListener("input", updateCalc);
      el.addEventListener("change", updateCalc);
    });
    updateCalc();
  }

  const links = [...document.querySelectorAll(".desktop-nav a")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (links.length && sections.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => link.classList.toggle(
          "is-active",
          link.getAttribute("href") === "#" + entry.target.id
        ));
      });
    }, { rootMargin: "-35% 0px -55% 0px" });

    sections.forEach((section) => navObserver.observe(section));
  }
})();
