/* OakEvidence — interaction layer */
(function(){
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- sticky nav ---------- */
  const nav = document.getElementById("nav");
  function onScroll(){
    if (window.scrollY > 18) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  document.addEventListener("scroll", onScroll, {passive:true});
  onScroll();

  /* ---------- mobile menu ---------- */
  const burger = document.getElementById("burger");
  const navLinks = document.getElementById("navLinks");
  burger.addEventListener("click", () => {
    burger.classList.toggle("open");
    navLinks.classList.toggle("open");
  });
  navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    burger.classList.remove("open");
    navLinks.classList.remove("open");
  }));

  /* ---------- headline word-split reveal ---------- */
  function splitWords(el){
    const text = el.innerHTML;
    // split on spaces while preserving inner tags as whole tokens
    const tokens = text.split(/(<[^>]+>[^<]*<\/[^>]+>|\s+)/).filter(t => t !== undefined && t !== "");
    el.innerHTML = "";
    tokens.forEach(tok => {
      if (/^\s+$/.test(tok)) { el.appendChild(document.createTextNode(tok)); return; }
      if (/^<br/i.test(tok)) { el.insertAdjacentHTML("beforeend", tok); return; }
      const wrap = document.createElement("span");
      wrap.className = "split-word";
      const inner = document.createElement("span");
      inner.innerHTML = tok;
      wrap.appendChild(inner);
      el.appendChild(wrap);
    });
  }
  const headline = document.getElementById("heroHeadline");
  if (headline && !reduced){
    splitWords(headline);
    requestAnimationFrame(() => requestAnimationFrame(() => headline.classList.add("split-ready")));
  }

  /* ---------- generic scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (reduced){
    revealEls.forEach(el => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, {threshold:.18, rootMargin:"0px 0px -40px 0px"});
    revealEls.forEach(el => io.observe(el));
  }

  /* ---------- count-up numbers ---------- */
  function countUp(el){
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const dur = 1400;
    const start = performance.now();
    function tick(now){
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(target * eased);
      el.innerHTML = val.toLocaleString() + (suffix ? `<span class="suffix">${suffix}</span>` : "");
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const counters = document.querySelectorAll(".num[data-count]");
  if (reduced){
    counters.forEach(el => {
      el.innerHTML = el.dataset.count + (el.dataset.suffix ? `<span class="suffix">${el.dataset.suffix}</span>` : "");
    });
  } else {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          countUp(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, {threshold:.5});
    counters.forEach(el => cio.observe(el));
  }

  /* ---------- hero feed: cycling detection chips ---------- */
  const chips = ["chip1","chip2","chip3"].map(id => document.getElementById(id));
  const boxes = ["box1","box2","box3"].map(id => document.getElementById(id));
  let feedIndex = -1, feedTimer = null;
  function cycleFeed(){
    if (feedIndex >= 0){
      chips[feedIndex]?.classList.remove("show");
      boxes[feedIndex] && boxes[feedIndex].setAttribute("opacity","0");
    }
    feedIndex = (feedIndex + 1) % chips.length;
    chips[feedIndex]?.classList.add("show");
    boxes[feedIndex] && boxes[feedIndex].setAttribute("opacity","1");
  }
  const feedVisual = document.getElementById("feedVisual");
  if (feedVisual){
    if (reduced){
      cycleFeed();
    } else {
      const fio = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting){
            if (!feedTimer){ cycleFeed(); feedTimer = setInterval(cycleFeed, 2200); }
          } else if (feedTimer){
            clearInterval(feedTimer); feedTimer = null;
          }
        });
      }, {threshold:.3});
      fio.observe(feedVisual);
    }
  }

  /* ---------- audience tabs ---------- */
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".tab-panel");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      document.querySelector(`.tab-panel[data-panel="${tab.dataset.tab}"]`).classList.add("active");
    });
  });

  /* ---------- how-it-works progress line ---------- */
  const stepsRow = document.getElementById("stepsRow");
  const stepsLine = document.getElementById("stepsLine");
  const stepEls = document.querySelectorAll(".step");
  if (stepsRow){
    const sio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          stepsLine && (stepsLine.style.width = "100%");
          stepEls.forEach((s, i) => setTimeout(() => s.classList.add("on"), i * 260));
          sio.unobserve(entry.target);
        }
      });
    }, {threshold:.4});
    sio.observe(stepsRow);
  }

  /* ---------- network map: generated nodes + connecting lines ---------- */
  const mapNodes = document.getElementById("mapNodes");
  const mapLines = document.getElementById("mapLines");
  if (mapNodes && mapLines){
    const pts = [
      [120,90],[260,150],[420,80],[560,170],[700,100],[860,160],
      [180,260],[340,300],[500,260],[660,320],[820,280],
      [140,400],[300,420],[460,380],[620,420],[780,400],[900,340]
    ];
    const nsSVG = "http://www.w3.org/2000/svg";
    // connect each point to its nearest 2 neighbors for an organic mesh
    function dist(a,b){ return Math.hypot(a[0]-b[0], a[1]-b[1]); }
    pts.forEach((p, i) => {
      const others = pts.map((q,j)=>({j,d:dist(p,q)})).filter(o=>o.j!==i).sort((a,b)=>a.d-b.d).slice(0,2);
      others.forEach(o => {
        const q = pts[o.j];
        const line = document.createElementNS(nsSVG, "path");
        line.setAttribute("d", `M${p[0]},${p[1]} L${q[0]},${q[1]}`);
        line.setAttribute("class", "map-line");
        mapLines.appendChild(line);
      });
    });
    pts.forEach((p, i) => {
      const c = document.createElementNS(nsSVG, "circle");
      c.setAttribute("cx", p[0]); c.setAttribute("cy", p[1]); c.setAttribute("r", 3.4);
      c.setAttribute("class", "map-node");
      mapNodes.appendChild(c);
      if (i % 3 === 0 && !reduced){
        const pulse = document.createElementNS(nsSVG, "circle");
        pulse.setAttribute("cx", p[0]); pulse.setAttribute("cy", p[1]); pulse.setAttribute("r", 3);
        pulse.setAttribute("fill", "none");
        pulse.setAttribute("stroke", "#3FC919");
        pulse.setAttribute("stroke-width", "1.4");
        pulse.setAttribute("class", "map-pulse");
        pulse.style.animationDelay = (i * 0.35) + "s";
        mapNodes.appendChild(pulse);
      }
    });
  }

})();
