function toStyledSpan(segment) {
  const node = segment.link ? document.createElement("a") : document.createElement("span");
  node.textContent = segment.text || "";

  if (segment.link) {
    node.href = segment.link;
    node.target = "_blank";
    node.rel = "noopener noreferrer";
    node.style.textDecoration = "underline";
    node.style.textUnderlineOffset = "2px";
    if (!segment.color) {
      node.style.color = "#286adf";
    }
  }

  if (segment.color) {
    node.style.color = segment.color;
  }

  if (segment.bold) {
    node.style.fontWeight = "800";
  }

  if (segment.italic) {
    node.style.fontStyle = "italic";
  }

  return node;
}

function appendRichText(container, segments) {
  segments.forEach((segment) => {
    container.appendChild(toStyledSpan(segment));
  });
}

function createInlineIcon(iconType, label) {
  const span = document.createElement("span");
  span.className = "social-icon";
  span.setAttribute("aria-hidden", "true");

  const icons = {
    github: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.58 2 12.24c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.22-3.37-1.22-.46-1.2-1.12-1.51-1.12-1.51-.92-.65.07-.64.07-.64 1.01.07 1.55 1.08 1.55 1.08.91 1.59 2.38 1.13 2.96.86.09-.68.35-1.13.63-1.39-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.31.1-2.73 0 0 .84-.27 2.75 1.05A9.34 9.34 0 0 1 12 6.9c.85 0 1.71.12 2.51.37 1.9-1.32 2.74-1.05 2.74-1.05.55 1.42.2 2.47.1 2.73.64.72 1.02 1.64 1.02 2.76 0 3.95-2.35 4.82-4.59 5.07.36.32.68.95.68 1.91 0 1.38-.01 2.49-.01 2.83 0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z" fill="#111827"/></svg>`,
    notes: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="3" width="16" height="18" rx="2.5" stroke="#0EA5E9" stroke-width="1.8"/><path d="M8 7h8M8 11h8M8 15h5" stroke="#0EA5E9" stroke-width="1.8" stroke-linecap="round"/><path d="M6 3v18" stroke="#0EA5E9" stroke-width="1.8"/></svg>`,
    email: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="14" rx="2" stroke="#111827" stroke-width="1.8"/><path d="M4 7l8 6 8-6" stroke="#111827" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  };

  if (icons[iconType]) {
    span.innerHTML = icons[iconType];
    return span;
  }

  span.textContent = (label || "?").slice(0, 1).toUpperCase();
  return span;
}

function initParticleField() {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const mouse = { x: -9999, y: -9999, active: false };
  let particles = [];
  let rafId = 0;

  function createParticle(width, height) {
    const baseX = Math.random() * width;
    const baseY = Math.random() * height;
    return {
      x: baseX,
      y: baseY,
      baseX,
      baseY,
      vx: (Math.random() - 0.5) * 0.38,
      vy: (Math.random() - 0.5) * 0.38,
      size: 1.1 + Math.random() * 1.9
    };
  }

  function setupParticles(width, height) {
    const area = width * height;
    const count = Math.max(70, Math.floor(area / 14500));
    particles = Array.from({ length: count }, () => createParticle(width, height));
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    setupParticles(width, height);
  }

  function draw() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];

      if (mouse.active) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);
        const influence = 170;
        if (dist < influence && dist > 0.001) {
          const pull = (1 - dist / influence) * 0.042;
          p.vx += (dx / dist) * pull;
          p.vy += (dy / dist) * pull;
        }
      } else {
        // When cursor leaves, particles slowly return to their anchors and spread out.
        const spreadX = p.baseX - p.x;
        const spreadY = p.baseY - p.y;
        p.vx += spreadX * 0.0022;
        p.vy += spreadY * 0.0022;
      }

      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) {
        p.vx *= -1;
        p.x = Math.min(width, Math.max(0, p.x));
      }
      if (p.y < 0 || p.y > height) {
        p.vy *= -1;
        p.y = Math.min(height, Math.max(0, p.y));
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(100, 195, 255, 0.72)";
      ctx.fill();
    }

    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const a = particles[i];
        const b = particles[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        const maxDist = 108;
        if (dist < maxDist) {
          const opacity = (1 - dist / maxDist) * 0.26;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(72, 149, 255, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    if (mouse.active) {
      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        const dist = Math.hypot(mouse.x - p.x, mouse.y - p.y);
        const maxDist = 140;
        if (dist < maxDist) {
          const opacity = (1 - dist / maxDist) * 0.42;
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = `rgba(48, 255, 212, ${opacity})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }
    }

    rafId = requestAnimationFrame(draw);
  }

  window.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.active = true;
  });

  window.addEventListener("mouseleave", () => {
    mouse.active = false;
  });

  window.addEventListener("resize", () => {
    cancelAnimationFrame(rafId);
    resize();
    draw();
  });

  resize();
  draw();
}

async function loadJSON(path) {
  const cacheBustedPath = `${path}?v=${Date.now()}`;
  const response = await fetch(cacheBustedPath, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load config file: ${path}`);
  }
  return response.json();
}

function renderIntro(data) {
  document.title = data.pageTitle || data.name || "Personal Homepage";
  document.getElementById("name").textContent = data.name || "Your Name";
  document.getElementById("tagline").textContent = data.tagline || "";
  document.getElementById("avatar").src = data.avatar || "assets/images/avatar.svg";

  const introContainer = document.getElementById("intro-paragraphs");
  introContainer.innerHTML = "";
  (data.paragraphs || []).forEach((paragraphSegments) => {
    const paragraph = document.createElement("p");
    appendRichText(paragraph, paragraphSegments);
    introContainer.appendChild(paragraph);
  });

  const socialContainer = document.getElementById("social-links");
  socialContainer.innerHTML = "";
  (data.socialLinks || []).forEach((item) => {
    const link = document.createElement("a");
    link.className = "social-link";
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", item.label || "social link");
    link.title = item.label || "";

    if (item.iconType) {
      link.appendChild(createInlineIcon(item.iconType, item.label));
    } else if (item.icon) {
      const icon = document.createElement("img");
      icon.className = "social-icon";
      icon.src = item.icon;
      icon.alt = item.label || "icon";
      icon.addEventListener("error", () => {
        icon.replaceWith(createInlineIcon("", item.label));
      });
      link.appendChild(icon);
    } else {
      link.textContent = item.label;
    }

    socialContainer.appendChild(link);
  });
}

function renderNews(data) {
  const root = document.getElementById("news-list");
  const template = document.getElementById("news-item-template");
  root.innerHTML = "";

  (data.items || []).forEach((item) => {
    const fragment = template.content.cloneNode(true);
    fragment.querySelector(".news-date").textContent = item.date;
    const contentNode = fragment.querySelector(".news-content");
    appendRichText(contentNode, item.content || []);
    root.appendChild(fragment);
  });
}

function renderTimelineSection(mountNode, data) {
  const section = document.createElement("section");
  section.className = "content-section";

  const heading = document.createElement("h2");
  heading.textContent = data.title || "Section";
  section.appendChild(heading);

  const list = document.createElement("ul");
  list.className = "section-bullet-list";
  const showDate = data.showDate !== false;
  const datePlacement = data.datePlacement === "suffix" ? "suffix" : "prefix";

  (data.items || []).forEach((item) => {
    const listItem = document.createElement("li");
    listItem.className = "section-bullet-item";
    const contentNode = document.createElement("p");
    contentNode.className = "section-bullet-text";

    const hasHeadline = Array.isArray(item.headline) && item.headline.length > 0;
    const headlineSegments = hasHeadline ? item.headline : (item.content || []);

    if (showDate && item.date) {
      if (datePlacement === "prefix") {
        const dateNode = document.createElement("span");
        dateNode.className = "section-item-date";
        dateNode.textContent = `${item.date}, `;
        contentNode.appendChild(dateNode);
      }
    }

    appendRichText(contentNode, headlineSegments);

    if (showDate && item.date && datePlacement === "suffix") {
      const separator = document.createTextNode(" | ");
      const dateNode = document.createElement("span");
      dateNode.className = "section-item-date section-item-date-suffix";
      dateNode.textContent = item.date;
      contentNode.appendChild(separator);
      contentNode.appendChild(dateNode);
    }

    listItem.appendChild(contentNode);

    const details = Array.isArray(item.details) ? item.details : [];
    if (details.length > 0) {
      const detailsList = document.createElement("ul");
      detailsList.className = "section-subpoint-list";

      details.forEach((detail) => {
        const detailItem = document.createElement("li");
        detailItem.className = "section-subpoint-item";
        const detailText = document.createElement("p");
        detailText.className = "section-subpoint-text";

        if (Array.isArray(detail)) {
          appendRichText(detailText, detail);
        } else if (typeof detail === "string") {
          detailText.textContent = detail;
        }

        detailItem.appendChild(detailText);
        detailsList.appendChild(detailItem);
      });

      listItem.appendChild(detailsList);
    }

    list.appendChild(listItem);
  });

  section.appendChild(list);
  mountNode.appendChild(section);
}

function normalizeAuthorName(name) {
  return (name || "").replace(/\*/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

function renderAuthorsWithHighlight(container, authorsText, highlightName) {
  container.innerHTML = "";
  const names = (authorsText || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const normalizedHighlight = normalizeAuthorName(highlightName);
  names.forEach((author, index) => {
    const authorNode = document.createElement("span");
    authorNode.textContent = author;
    if (normalizedHighlight && normalizeAuthorName(author) === normalizedHighlight) {
      authorNode.style.fontWeight = "800";
    }
    container.appendChild(authorNode);

    if (index < names.length - 1) {
      container.appendChild(document.createTextNode(", "));
    }
  });
}

function renderPreprintsSection(mountNode, data, profileName) {
  const section = document.createElement("section");
  section.className = "content-section";

  const heading = document.createElement("h2");
  heading.textContent = data.title || "Preprints";
  section.appendChild(heading);

  const list = document.createElement("ul");
  list.className = "section-bullet-list preprints-list";

  (data.items || []).forEach((item) => {
    const hasNewFormat = Boolean(item.title || item.authors || item.arxiv);
    const hasLegacyFormat = Array.isArray(item.content) && item.content.length > 0;
    if (!hasNewFormat && !hasLegacyFormat) {
      return;
    }

    const listItem = document.createElement("li");
    listItem.className = "section-bullet-item preprint-item";

    const titleLine = document.createElement("p");
    titleLine.className = "section-bullet-text preprint-title-line";

    const linksLine = document.createElement("span");
    linksLine.className = "preprint-links";

    const arxivLink = document.createElement("a");
    let arxivHref = item.arxiv || "";
    if (!arxivHref && hasLegacyFormat) {
      const legacyArxiv = item.content.find((seg) => typeof seg?.text === "string" && seg.text.toLowerCase().includes("arxiv"));
      arxivHref = legacyArxiv?.link || "";
    }
    arxivLink.href = arxivHref || "https://arxiv.org";
    arxivLink.target = "_blank";
    arxivLink.rel = "noopener noreferrer";
    arxivLink.className = "preprint-arxiv-link";
    arxivLink.textContent = "[arXiv]";

    linksLine.appendChild(arxivLink);

    if (item.pdf) {
      const separator = document.createTextNode(" ");
      const pdfLink = document.createElement("a");
      pdfLink.href = item.pdf;
      pdfLink.target = "_blank";
      pdfLink.rel = "noopener noreferrer";
      pdfLink.className = "preprint-arxiv-link";
      pdfLink.textContent = "[PDF]";
      linksLine.appendChild(separator);
      linksLine.appendChild(pdfLink);
    }

    const titleText = document.createElement("span");
    titleText.className = "preprint-title-text";
    let paperTitle = item.title || "";
    if (!paperTitle && hasLegacyFormat) {
      const legacyTitle = item.content.find((seg) => !seg?.link && typeof seg?.text === "string" && seg.text.trim().length > 0);
      paperTitle = (legacyTitle?.text || "").trim().replace(/^[\s.]+|[\s.]+$/g, "");
    }
    titleText.textContent = paperTitle ? ` ${paperTitle}` : "";

    titleLine.appendChild(linksLine);
    titleLine.appendChild(titleText);

    const authorsLine = document.createElement("p");
    authorsLine.className = "section-bullet-text preprint-authors";
    let authorsText = item.authors || "";
    if (!authorsText && hasLegacyFormat) {
      const legacyPlain = item.content
        .filter((seg) => !seg?.link)
        .map((seg) => seg.text || "")
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      authorsText = legacyPlain;
    }
    renderAuthorsWithHighlight(authorsLine, authorsText, profileName);

    if (!paperTitle && !authorsText) {
      return;
    }

    listItem.appendChild(titleLine);
    listItem.appendChild(authorsLine);
    list.appendChild(listItem);
  });

  section.appendChild(list);
  mountNode.appendChild(section);
}

async function bootstrap() {
  try {
    const [intro, news, preprints, awards, internships, competitions] = await Promise.all([
      loadJSON("data/intro.json"),
      loadJSON("data/news.json"),
      loadJSON("data/preprints.json"),
      loadJSON("data/awards.json"),
      loadJSON("data/internships.json"),
      loadJSON("data/competitions.json")
    ]);

    renderIntro(intro);
    renderNews(news);

    const sectionsRoot = document.getElementById("profile-sections");
    sectionsRoot.innerHTML = "";
    [preprints, awards, internships, competitions].forEach((sectionData) => {
      if ((sectionData.title || "").toLowerCase() === "preprints") {
        renderPreprintsSection(sectionsRoot, sectionData, intro.name || "");
      } else {
        renderTimelineSection(sectionsRoot, sectionData);
      }
    });
  } catch (error) {
    document.body.innerHTML = `<main style=\"font-family: sans-serif; padding: 24px;\"><h1>Page failed to load</h1><p>${error.message}</p><p>Please open this site through a local web server (for example, VS Code Live Server).</p></main>`;
    console.error(error);
  }
}

bootstrap();
initParticleField();
