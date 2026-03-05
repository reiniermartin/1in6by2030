const btnGlobe = document.querySelector("#btnGlobe"),
  btnGallery = document.querySelector("#btnGallery"),
  globeContainer = document.querySelector(".fs-globe-container"),
  gridContainer = document.querySelector(".grid-container");

function FsGlobe() {
  const e = document.querySelector("[fs-3dglobe-element='container']"),
    t = {
      url: "https://uploads-ssl.webflow.com/64d37c1df6c828c9cba811db/650053fc2397fc4957289cc9_globe-image-one-in-six-by-2030.png",
    },
    n = document.createElement("div");

  n.className = "fs-3dglobe-container";
  e.appendChild(n);

  const o = document.createElement("canvas");
  o.className = "canvas-3dglobe-container";
  n.appendChild(o);

  const l = [].slice.call(
      document.querySelectorAll("[fs-3dglobe-element='tooltip']")
    ),
    a = [].slice.call(
      document.querySelectorAll("[fs-3dglobe-element='pin']")
    ),
    i = new THREE.WebGLRenderer({ canvas: o, alpha: !0 }),
    r = new THREE.PerspectiveCamera(60, 2, 0.1, 10);

  r.position.z = 2.5;

  const s = new THREE.OrbitControls(r, o);
  s.enableDamping = !0;
  s.enablePan = !1;
  s.minDistance = 1.2;
  s.maxDistance = 4;
  s.autoRotate = !0;
  s.autoRotateSpeed = 0.1;
  s.enableZoom = !1;
  s.update();

  const d = new THREE.Scene();
  i.setClearColor(0, 0);

  let c,
    p = !1;

  const m = fetchDataFromCollection("[fs-3dglobe-element='list'] .w-dyn-item"),
    u = new THREE.TextureLoader().load(t.url, H);

  u.needsUpdate = !0;

  const E = new THREE.SphereBufferGeometry(1, 64, 32),
    f = new THREE.MeshBasicMaterial({ map: u, side: THREE.DoubleSide }),
    h = new THREE.Mesh(E, f);

  d.add(h);
  f.map.needsUpdate = !0;

  (function () {
    const e = 1.5 * Math.PI,
      t = Math.PI,
      o = new THREE.Object3D(),
      i = new THREE.Object3D();

    o.add(i);

    const r = new THREE.Object3D();
    r.position.z = 1;
    i.add(r);

    const sLabels = document.createElement("div");
    sLabels.className = "fs-3dglobe-labels";
    n.appendChild(sLabels);

    for (const [nIdx, dItem] of m.entries()) {
      const { lat: c, lon: p, name: mName, url: mUrl } = dItem;

      o.rotation.y = THREE.MathUtils.degToRad(p) + e;
      i.rotation.x = THREE.MathUtils.degToRad(c) + t;

      r.updateWorldMatrix(!0, !1);

      const pos = new THREE.Vector3();
      r.getWorldPosition(pos);
      dItem.position = pos;

      const wrap = document.createElement("div"),
        info = document.createElement("div");

      wrap.className = "map-container";
      info.innerHTML =
        l[nIdx].outerHTML || getInfoBox({ url: mUrl, name: mName });
      info.className = "fs-3dglobe-info-box";
      wrap.style.cursor = "pointer";

      const arrowBox = document.createElement("div");
      arrowBox.className = "fs-3dglobe-arrow-box";

      if (a[nIdx]) {
        arrowBox.appendChild(a[nIdx]);
      } else {
        const e2 = document.createElement("div");
        e2.className = "fs-3dglobe-arrow_box";

        const img = document.createElement("img");
        img.className = "logo_dot";
        img.position = "relative";
        img.setAttribute("alt", mName);
        img.setAttribute("src", mUrl);
        img.style.cursor = "pointer";
        img.style.width = "50px";

        e2.appendChild(img);
        arrowBox.appendChild(e2);
      }

      wrap.appendChild(arrowBox);
      wrap.appendChild(info);
      sLabels.appendChild(wrap);

      dItem.elem = wrap;
    }

    R();
  })();

  const g = new THREE.Vector3(),
    y = new THREE.Vector3(),
    b = new THREE.Vector3(),
    x = new THREE.Matrix3(),
    v = 20,
    w = -0.08;

  // ---- TAB/GALLERY STATE ----
  let isGlobeActive = true; // globe-modus is default actief

  function handleBtnGlobeClick() {
    isGlobeActive = true;
    s.autoRotate = true;
    globeContainer.classList.remove("paused");
    gridContainer.classList.remove("active");
    btnGlobe.classList.add("active");
    btnGallery.classList.remove("active");

    // optioneel: forceer 1x resize/reflow als tab net zichtbaar werd
    requestAnimationFrame(() => R());
  }

  function handleBtnGalleryClick() {
    isGlobeActive = false;
    s.autoRotate = false;
    globeContainer.classList.add("paused");
    gridContainer.classList.add("active");
    btnGallery.classList.add("active");
    btnGlobe.classList.remove("active");
  }

  btnGlobe.addEventListener("click", handleBtnGlobeClick);
  btnGallery.addEventListener("click", handleBtnGalleryClick);

  // ---- FIX: delegated hover (werkt ook als map-container later in DOM komt) ----
  // pointerover/out bubbelen wél; mouseenter/leave niet.
  globeContainer.addEventListener("pointerover", (ev) => {
    if (ev.target.closest(".map-container")) {
      s.autoRotate = false; // pauzeer rotatie
    }
  });

  globeContainer.addEventListener("pointerout", (ev) => {
    const fromPin = ev.target.closest(".map-container");
    const toPin = ev.relatedTarget && ev.relatedTarget.closest(".map-container");

    // Alleen als je echt van de pin af gaat (niet naar een child element)
    if (fromPin && !toPin) {
      // alleen hervatten als globe modus actief is en niet "paused" door gallery
      if (isGlobeActive && !globeContainer.classList.contains("paused")) {
        s.autoRotate = true;
      }
    }
  });

  function H() {
    p = void 0;
    c = requestAnimationFrame(H);

    (function (e) {
      const t = e.domElement,
        n = t.clientWidth,
        o = t.clientHeight,
        l = t.width !== n || t.height !== o;
      return l && e.setSize(n, o, !1), l;
    })(i);

    if (i.domElement.clientWidth && i.domElement.clientHeight) {
      const e = i.domElement;
      r.aspect = e.clientWidth / e.clientHeight;
      r.updateProjectionMatrix();
    }

    s.update();

    (function () {
      const e = v * v;
      x.getNormalMatrix(r.matrixWorldInverse);
      r.getWorldPosition(b);

      for (const t of m) {
        const { position: n, elem: l, area: a } = t;

        if (a < e) {
          l.style.opacity = ".009";
          l.style.display = "none";
          continue;
        }

        g.copy(n);
        g.applyMatrix3(x);

        y.copy(n);
        y.applyMatrix4(r.matrixWorldInverse).normalize();

        if (g.dot(y) > w) {
          l.style.opacity = ".009";
          l.style.display = "none";
          continue;
        }

        l.style.opacity = "1";
        l.style.display = "";

        g.copy(n);
        g.project(r);

        const px = (0.5 * g.x + 0.5) * o.clientWidth,
          py = (-0.5 * g.y + 0.5) * o.clientHeight;

        l.style.transform = `translate(-50%, -50%) translate(${px}px,${py}px)`;
        l.style.zIndex = (1e5 * (0.5 * -g.z + 0.5)) | 0;
      }
    })();

    i.render(d, r);
  }

  function R() {
    p || (cancelAnimationFrame(c), (p = !0), (c = requestAnimationFrame(H)));
  }

  H();
  s.addEventListener("change", R);
  window.addEventListener("resize", R);
}

function getInfoBox({ url: e, name: t, location: n = "N/A", role: o = "N/A" }) {
  return `

  <div style=" border: 1px solid #dadce0; border-radius: 8px; overflow: hidden;">
    <div class="caption">
      <img src="${e}" style="height: 200px; max-width:600px;" />
    </div>
    <div style="padding:5px 10px">
      <div>
        <strong>${t}</strong>
      </div>
      <div>Javascript, Node.js</div>
      <div>${n}</div>
    </div>
  </div>
 `;
}

function fetchDataFromCollection(e) {
  return [].slice.call(document.querySelectorAll(e)).map((e) => ({
    name: (e.querySelector("[fs-3dglobe-element='name'") || {}).textContent,
    lat: (e.querySelector("[fs-3dglobe-element='lat'") || {}).textContent,
    lon: (e.querySelector("[fs-3dglobe-element='lon'") || {}).textContent,
    url: (e.querySelector("[fs-3dglobe-element='url'") || {}).textContent,
  }));
}

function LoadSvg(e, t) {
  new THREE.SVGLoader().load(
    e,
    function (e) {
      let n = e.paths,
        o = new THREE.Group();
      o.scale.multiplyScalar(0.011);
      o.position.x = -9;
      o.rotation.x = Math.PI;
      o.position.y = 5;
      o.position.z = -3;

      for (let e = 0; e < n.length; e++) {
        let t = n[e],
          l = new THREE.MeshBasicMaterial({
            color: t.color,
            side: THREE.DoubleSide,
            depthWrite: !1,
          }),
          a = t.toShapes(!0);

        for (let e = 0; e < a.length; e++) {
          let t = a[e],
            n = new THREE.ShapeBufferGeometry(t),
            i = new THREE.Mesh(n, l);
          o.add(i);
        }
      }

      t.add(o);
    },
    function (e) {
      console.log((e.loaded / e.total) * 100 + "% loaded");
    },
    function (e) {
      console.log("An error happened");
    }
  );
}

FsGlobe();
