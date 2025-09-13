// header section 
const btn = document.querySelector(".ham")
const btnmod = document.querySelector(".dark_light")
const body = document.body

let isOpen = false

// Hamburger menu toggle
btn.addEventListener("click", function() {
    console.log("Hamburger clicked")

    if (!isOpen) {
        isOpen = true
        btn.innerHTML = '<i class="fa-solid fa-xmark"></i>'
    } else {
        isOpen = false
        btn.innerHTML = '<i class="fa-solid fa-bars"></i>'
    }
    console.log("Menu state:", isOpen)
})

// Dark/Light mode toggle
btnmod.addEventListener("click", function() {
    console.log("Theme toggle clicked")

    body.classList.toggle("light-theme")   // toggle theme class

    // update icon depending on state
    if (body.classList.contains("light-theme")) {
        btnmod.innerHTML = '<i class="fa-solid fa-sun" id="mode-con"></i>'
        localStorage.setItem("theme", "light")
    } else {
        btnmod.innerHTML = '<i class="fa-solid fa-moon" id="mode-con"></i>'
        localStorage.setItem("theme", "dark")
    }
})

// On page load, restore saved theme
if (localStorage.getItem("theme") === "light") {
    body.classList.add("light-theme")
    btnmod.innerHTML = '<i class="fa-solid fa-sun" id="mode-con"></i>'
} else {
    btnmod.innerHTML = '<i class="fa-solid fa-moon" id="mode-con"></i>'
}




// hero and banner javascript joel

// simple hero carousel
const slides = document.querySelectorAll(".upcom-slide");
const dots = document.querySelectorAll(".upcom-dot");
let heroIndex = 0;
let heroTimer;

function initHero() {
  showHero(0);
  heroTimer = setInterval(() => showHero(heroIndex + 1), 5000);

  dots.forEach((dot) =>
    dot.addEventListener("click", () => {
      clearInterval(heroTimer);
      showHero(Number(dot.dataset.index));
      heroTimer = setInterval(() => showHero(heroIndex + 1), 5000);
    })
  );
}

function showHero(i) {
  heroIndex = (i + slides.length) % slides.length;
  slides.forEach((s) => s.classList.remove("active"));
  dots.forEach((d) => d.classList.remove("active"));
  slides[heroIndex].classList.add("active");
  dots[heroIndex].classList.add("active");
}

// load events from json
async function loadEvents() {
  try {
    const res = await fetch("data/upcoming-events.json");
    if (!res.ok) throw new Error("failed to load events");
    const data = await res.json();
    renderEventss(data);
    startCountdown(data);
  } catch (err) {
    console.error(err);
    document.getElementById("noResults").hidden = false;
  }
}

// fill event cards
function renderEventss(eventss) {
  console.log("this code ran");
  eventss.forEach((ev) => {
    const card = document.querySelector(`.upcom-card[data-id="${ev.id}"]`);
    if (!card) return;

    const badge = card.querySelector(".upcom-date");
    const title = card.querySelector(".upcom-cardtitle");
    const meta = card.querySelector(".upcom-card-oth");

    const d = new Date(ev.date);
    badge.textContent = `${d.getDate()} ${d
      .toLocaleString("default", { month: "short" })
      .toUpperCase()}`;
    title.textContent = ev.title;
    meta.textContent = `${ev.venue} • ${ev.time}`;
  });
}

// countdown logic
function startCountdown(eventss) {
  const cdDays = document.getElementById("cd-days");
  const cdHours = document.getElementById("cd-hours");
  const cdMins = document.getElementById("cd-mins");
  const cdSecs = document.getElementById("cd-secs");

  function update() {
    const upcoming = eventss.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    )[0];
    const now = new Date().getTime();
    const diff = new Date(upcoming.date).getTime() - now;

    if (diff <= 0) return;
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    cdDays.textContent = d.toString().padStart(2, "0");
    cdHours.textContent = h.toString().padStart(2, "0");
    cdMins.textContent = m.toString().padStart(2, "0");
    cdSecs.textContent = s.toString().padStart(2, "0");
  }

  update();
  setInterval(update, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
  initHero();
  loadEvents();
});

// hero and banner javascript joel end

// About section gt section start

// About section gt section end

// event ire section start
// Script for handling events (loading, filters, search, sort, bookmarks)

const EVENTS_JSON = "data/events.json";
const EVENTS_GRID_ID = "eventsGrid";
const SEARCH_INPUT_ID = "searchInput";
const SORT_SELECT_ID = "sortBy";
const CATEGORY_FILTERS_ID = "categoryFilters";
const TIME_TOGGLE_ID = "timeToggle";
const NO_RESULTS_ID = "noResults";

let allEvents = [];
let selectedCategory = "all";
let selectedTimeFilter = "all";
let searchQuery = "";
let sortBy = "date";

const $ = (id) => document.getElementById(id);

// Load events from JSON
fetch(EVENTS_JSON)
  .then((res) => {
    if (!res.ok) throw new Error("Failed to load events JSON.");
    return res.json();
  })
  .then((data) => {
    allEvents = data;
    buildCategoryFilters(allEvents);
    attachUIHandlers();
    applyFiltersAndRender();
  })
  .catch((err) => {
    console.error("Error loading events:", err);
    $("noResults").hidden = false;
    $("noResults").textContent = "Could not load events data.";
  });

// Build category pills
function buildCategoryFilters(events) {
  const container = $(CATEGORY_FILTERS_ID);
  container.innerHTML = "";

  const cats = new Set(events.map((e) => e.category || "Uncategorized"));
  container.appendChild(createCategoryPill("All", "all", true));

  cats.forEach((cat) => {
    container.appendChild(createCategoryPill(cat, cat.toLowerCase(), false));
  });
}

// Helper for category pills
function createCategoryPill(label, value, active = false) {
  const btn = document.createElement("button");
  btn.className = "category-pill" + (active ? " active" : "");
  btn.type = "button";
  btn.textContent = label;
  btn.dataset.value = value;
  if (btn.textContent === "All") {
    console.log("hello");
    document
      .querySelectorAll(".category-pill")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedCategory = value;
    applyFiltersAndRender();
  }
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".category-pill")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedCategory = value;
    applyFiltersAndRender();
  });
  return btn;
}

// Attach event listeners
function attachUIHandlers() {
  $(SEARCH_INPUT_ID).addEventListener("input", (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    applyFiltersAndRender();
  });

  $(SORT_SELECT_ID).addEventListener("change", (e) => {
    sortBy = e.target.value;
    applyFiltersAndRender();
  });

  // Time filter buttons
  document.querySelectorAll("#timeToggle .toggle-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll("#timeToggle .toggle-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedTimeFilter = btn.dataset.filter;
      applyFiltersAndRender();
    });
  });

  // Bookmarks filter
  const showBookmarksBtn = document.getElementById("showBookmarks");
  if (showBookmarksBtn) {
    showBookmarksBtn.addEventListener("click", () => {
      const bookmarks = loadBookmarks();
      const bookmarkedEvents = allEvents.filter((ev) =>
        bookmarks.includes(ev.id)
      );

      document
        .querySelectorAll("#timeToggle .toggle-btn")
        .forEach((b) => b.classList.remove("active"));
      showBookmarksBtn.classList.add("active");

      renderEvents(bookmarkedEvents);
    });
  }
}

// Filtering + Sorting logic
function applyFiltersAndRender() {
  let results = [...allEvents];
  const today = new Date();

  // filter by time (upcoming / past)
  results = results.filter((e) => {
    if (!e.date) return true;
    const eventDate = new Date(e.date + "T00:00:00");
    if (selectedTimeFilter === "upcoming")
      return eventDate >= startOfDay(today);
    if (selectedTimeFilter === "past") return eventDate < startOfDay(today);
    return true;
  });

  // filter by category
  if (selectedCategory !== "all") {
    results = results.filter(
      (ev) =>
        (ev.category || "").toLowerCase() === selectedCategory.toLowerCase()
    );
  }

  // filter by search term
  if (searchQuery) {
    results = results.filter(
      (ev) =>
        (ev.title || "").toLowerCase().includes(searchQuery) ||
        (ev.description || "").toLowerCase().includes(searchQuery)
    );
  }

  // sorting
  if (sortBy === "name") {
    results.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  } else if (sortBy === "category") {
    results.sort((a, b) => (a.category || "").localeCompare(b.category || ""));
  } else {
    results.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  renderEvents(results);
}

// Render event cards
function renderEvents(events) {
  console.log(events);

  const grid = $(EVENTS_GRID_ID);
  const noResults = $(NO_RESULTS_ID);

  grid.innerHTML = "";
  if (!events.length) {
    noResults.hidden = false;
    return;
  }
  noResults.hidden = true;

  const bookmarks = loadBookmarks();

  events.forEach((ev) => {
    const card = document.createElement("article");
    card.className = "event-card";

    const thumb = document.createElement("div");
    thumb.className = "event-thumb";
    thumb.style.backgroundImage = ev.image
      ? `url("${ev.image}")`
      : `linear-gradient(180deg,#2a2a2a,#1e1e1e)`;

    const box = document.createElement("div");
    box.className = "event-box";

    const title = document.createElement("h3");
    title.className = "event-title";
    title.textContent = ev.title || "Untitled Event";

    const meta = document.createElement("div");
    meta.className = "event-meta";
    meta.textContent = `${ev.date ? formatDate(ev.date) : "Date TBA"}${
      ev.time ? " • " + ev.time : ""
    }${ev.venue ? " • " + ev.venue : ""}`;

    const desc = document.createElement("p");
    desc.className = "event-desc";
    desc.textContent = ev.description ? truncate(ev.description, 100) : "";

    const foot = document.createElement("div");
    foot.className = "event-foot";

    const cat = document.createElement("div");
    cat.className = "event-category";
    cat.textContent = ev.category || "General";

    // bookmark button
    const bookmarkBtn = document.createElement("button");
    bookmarkBtn.className = "bookmark-btn";
    bookmarkBtn.setAttribute("aria-label", "Bookmark event");
    if (bookmarks.includes(ev.id)) {
      bookmarkBtn.innerHTML = '<i class="fa-solid fa-bookmark"></i>';
      bookmarkBtn.classList.add("bookmarked");
    } else {
      bookmarkBtn.innerHTML = '<i class="fa-regular fa-bookmark"></i>';
    }
    bookmarkBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleBookmark(ev.id);
      if (isBookmarked(ev.id)) {
        bookmarkBtn.innerHTML = '<i class="fa-solid fa-bookmark"></i>';
        bookmarkBtn.classList.add("bookmarked");
      } else {
        bookmarkBtn.innerHTML = '<i class="fa-regular fa-bookmark"></i>';
        bookmarkBtn.classList.remove("bookmarked");
      }
    });

    foot.appendChild(cat);
    box.appendChild(title);
    box.appendChild(meta);
    box.appendChild(desc);
    box.appendChild(foot);

    card.appendChild(thumb);
    card.appendChild(box);
    card.appendChild(bookmarkBtn);

    grid.appendChild(card);
  });
}

// Bookmark storage
const BOOKMARK_KEY = "campusconnect_bookmarks";
function loadBookmarks() {
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveBookmarks(arr) {
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(arr));
}
function toggleBookmark(id) {
  const arr = loadBookmarks();
  const idx = arr.indexOf(id);
  if (idx === -1) arr.push(id);
  else arr.splice(idx, 1);
  saveBookmarks(arr);
}
function isBookmarked(id) {
  return loadBookmarks().includes(id);
}

// Helpers
function truncate(str, n) {
  return str && str.length > n ? str.slice(0, n - 1) + "…" : str;
}
function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
function startOfDay(dt) {
  const x = new Date(dt);
  x.setHours(0, 0, 0, 0);
  return x;
}

// event ire section end

// feedback section April start

// drop-down-form-html start
document.addEventListener("DOMContentLoaded", () => {
  const dropdowns = document.querySelectorAll(".custom-dropdown");

  dropdowns.forEach((dropdown) => {
    const selected = dropdown.querySelector(".selected");
    const optionsList = dropdown.querySelector(".options");
    const selectId = dropdown.dataset.select;
    const nativeSelect = document.getElementById(selectId);

    // Toggle visibility
    selected.addEventListener("click", () => {
      optionsList.classList.toggle("visible");
    });

    // Handle selection
    optionsList.addEventListener("click", (e) => {
      const clicked = e.target.closest("li");
      if (!clicked) return;

      const value = clicked.dataset.value;
      const label = clicked.textContent.trim();

      selected.textContent = label;
      optionsList
        .querySelectorAll("li")
        .forEach((li) => li.classList.remove("active"));
      clicked.classList.add("active");

      nativeSelect.value = value;
      optionsList.classList.remove("visible");
    });

    // Close if clicked outside
    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target)) {
        optionsList.classList.remove("visible");
      }
    });
  });
});

// drop-down-form-html end

//contact-page ft.json
// Fetch contacts from JSON file and render them
fetch("data/contact.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to fetch contact.json");
    }
    return response.json();
  })
  .then((contacts) => {
    const container = document.getElementById("contact-container");

    contacts.forEach((contact) => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <h3>${contact.name}</h3>
        <p>${contact.designation}</p>
        <p>${contact.department}</p>
        <p>Phone: <a href="tel:${contact.phone}">${contact.phone}</a></p>
        <p>Email: <a href="mailto:${contact.email}">${contact.email}</a></p>
      `;

      container.appendChild(card);
    });
  })
  .catch((error) => {
    console.error("Error loading contacts:", error);
  });

// feedback section April end







// sign up screen 

const overlay = document.getElementById("overlay");
const openFormDesktop = document.getElementById("openFormDesktop");
const openFormMobile = document.getElementById("openFormMobile");
const closeBtn = document.getElementById("closeBtn");
const form = document.getElementById("eventForm");
const successMsg = document.getElementById("successMsg");

function openPopup() {
  overlay.style.display = "flex";
  form.style.display = "block";
  successMsg.style.display = "none";
}

openFormDesktop.onclick = openPopup;
openFormMobile.onclick = openPopup;

closeBtn.onclick = () => {
  overlay.style.display = "none";
};

window.onclick = (e) => {
  if (e.target === overlay) overlay.style.display = "none";
};

form.onsubmit = (e) => {
  e.preventDefault();
  form.style.display = "none";
  successMsg.style.display = "block";
  form.reset();

  // auto close after 3 seconds
  setTimeout(() => {
    overlay.style.display = "none";
  }, 3000);
};