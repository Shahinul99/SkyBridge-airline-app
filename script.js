// 1. DATA: cities (a code, name, emoji, and a "distance" number used to make prices)
const cities = [
  { code: "MIA", name: "Miami",     emoji: "🌴", x: 0 },
  { code: "NYC", name: "New York",  emoji: "🗽", x: 3 },
  { code: "IST", name: "Istanbul",  emoji: "🕌", x: 11 },
  { code: "LON", name: "London",    emoji: "🎡", x: 8 },
  { code: "PAR", name: "Paris",     emoji: "🗼", x: 9 },
  { code: "DXB", name: "Dubai",     emoji: "🏙️", x: 14 },
  { code: "DAC", name: "Dhaka",     emoji: "🌾", x: 19 },
  { code: "TYO", name: "Tokyo",     emoji: "🗾", x: 21 }
];

const fromSel = document.getElementById("from");
const toSel = document.getElementById("to");
const modal = document.getElementById("modal");
const modalBox = document.getElementById("modalBox");
let pax = 1;
let lastRoute = null;

// 2. Fill dropdowns and the destination cards
cities.forEach(c => {
  fromSel.innerHTML += `<option value="${c.code}">${c.name} (${c.code})</option>`;
  toSel.innerHTML += `<option value="${c.code}">${c.name} (${c.code})</option>`;
  document.getElementById("dests").innerHTML += `
    <div class="dest" onclick="pickDestination('${c.code}')">
      <div class="em">${c.emoji}</div><b>${c.name}</b>
      <div class="muted">from $${basePrice(cities[0], c)}</div>
    </div>`;
});
toSel.value = "IST";
document.getElementById("date").valueAsDate = new Date();

// 3. Helper functions
function find(code) { return cities.find(c => c.code === code); }
function basePrice(a, b) { return 120 + Math.abs(a.x - b.x) * 28; }   // farther = pricier
function hours(a, b) { return Math.max(2, Math.round(Math.abs(a.x - b.x) * 0.75)); }
function pad(n) { return String(n).padStart(2, "0"); }

function pickDestination(code) {
  toSel.value = code;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// 4. Build flights for a route (4 departure times, different prices)
function makeFlights(a, b) {
  const slots = [6, 10, 15, 21];
  const extra = [0, 25, 10, -15];
  return slots.map((h, i) => {
    const dur = hours(a, b);
    return {
      number: "SB" + (100 + a.x * 7 + b.x * 3 + i * 11),
      depart: h, arrive: (h + dur) % 24, dur,
      next: h + dur >= 24,
      price: basePrice(a, b) + extra[i]
    };
  });
}

// 5. Search
document.getElementById("searchBtn").onclick = () => {
  const a = find(fromSel.value), b = find(toSel.value);
  if (a.code === b.code) return alert("Please choose two different cities.");
  pax = Number(document.getElementById("pax").value) || 1;
  const date = document.getElementById("date").value || "today";
  lastRoute = { a, b, date };

  document.getElementById("resultsSection").style.display = "block";
  document.getElementById("resultsTitle").textContent =
    `${a.name} → ${b.name} · ${date} · ${pax} passenger(s)`;

  document.getElementById("results").innerHTML = makeFlights(a, b).map((f, i) => `
    <div class="flight">
      <div><div class="time">${pad(f.depart)}:00 → ${pad(f.arrive)}:00${f.next ? " +1" : ""}</div>
           <div class="muted">${f.number} · ${f.dur}h direct</div></div>
      <div class="price">$${f.price * pax}</div>
      <button class="btn" onclick="openBooking(${i})">Select</button>
    </div>`).join("");
  document.getElementById("resultsSection").scrollIntoView({ behavior: "smooth" });
};

// 6. Booking popup
function openBooking(i) {
  const { a, b, date } = lastRoute;
  const f = makeFlights(a, b)[i];
  modalBox.innerHTML = `
    <h3>Passenger details</h3>
    <p class="muted">${f.number} · ${a.code} → ${b.code} · ${date}<br>Total: <b>$${f.price * pax}</b></p>
    <input id="pname" placeholder="Full name">
    <input id="pemail" type="email" placeholder="Email">
    <button class="btn" style="width:100%" onclick="confirmBooking(${i})">Confirm booking</button>
    <button class="btn" style="width:100%;margin-top:8px;background:#888" onclick="closeModal()">Cancel</button>`;
  modal.classList.add("show");
}

function confirmBooking(i) {
  const name = document.getElementById("pname").value.trim();
  const email = document.getElementById("pemail").value.trim();
  if (!name || !email.includes("@")) return alert("Please enter your name and a valid email.");
  const { a, b, date } = lastRoute;
  const f = makeFlights(a, b)[i];
  const pnr = Math.random().toString(36).substring(2, 8).toUpperCase();
  modalBox.innerHTML = `
    <h3>Booking confirmed ✅</h3>
    <p>Thank you, <b>${name}</b>!</p>
    <div class="pnr">${pnr}</div>
    <p class="muted" style="text-align:center">Booking reference</p>
    <p>${f.number}: ${a.name} → ${b.name}<br>${date} at ${pad(f.depart)}:00<br>Total paid: $${f.price * pax}</p>
    <button class="btn" style="width:100%" onclick="closeModal()">Done</button>`;
}

function closeModal() { modal.classList.remove("show"); }
