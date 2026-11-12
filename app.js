/* Del Sol prototype: hash-routed single page with a local cart. */
(function () {
  'use strict';

  var CDN = 'https://delsol-salon.com/cdn/shop/files/';
  var img = function (file, w) { return CDN + file + '?width=' + (w || 1200); };
  var FILES = {
    poolBlack: '9210FC76-69D9-4CB6-86E4-A9C786C57032.png',
    poolChoc: '5B542980-C504-475F-910F-D0D57CD61185.png',
    classicBlack: '9E4EA050-3688-47A3-9381-6FE56635BC6E_82d82a1e-a4ce-4eb0-8af5-924d71236295.png',
    classicToast: '748804E8-BB54-4A89-BEF2-7AB958C594DD_9cfb9423-6b7a-41d9-94f8-cd87a45e7f4f.png',
    wornPoolBlack: 'Screenshot2026-06-07at8.59.24pm.png',
    wornPoolChoc: 'Screenshot2026-06-07at9.00.27pm.png',
    wornClassicBlack: 'Screenshot2026-06-07at9.01.54pm.png',
    wornClassicToast: 'Screenshot2026-06-07at9.02.59pm.png',
    campaign: 'Screenshot_2026-08-27_at_3.33.14_am.png'
  };
  var LOCAL = {
    hero: 'assets/hero.jpg', sticker: 'assets/sticker.png', kase: 'assets/case.jpg',
    pink: 'assets/model-pink.jpg', lagoon: 'assets/shorts-clean.jpg',
    poolBlack: 'assets/pool-black.jpg', poolBrown: 'assets/pool-brown.jpg',
    shortsPink: 'assets/shorts-pink.jpg?v=2', shortsLagoon: 'assets/shorts-lagoon.jpg?v=3'
  };

  // ---------- Catalogue (prices for shorts, case and the 10% bundle are placeholders) ----------
  var PRODUCTS = {
    'pool-goggles': {
      name: 'pool goggles', price: 170, cats: ['goggles', 'pool'],
      desc: 'A wraparound goggle shape made for long days in the sun. Eyewear handcrafted in Italy.',
      colours: {
        black: { label: 'black', img: LOCAL.poolBlack, worn: img(FILES.wornPoolBlack) },
        choc: { label: 'choc', img: LOCAL.poolBrown, worn: img(FILES.wornPoolChoc) }
      }
    },
    'classic-goggles': {
      name: 'classic goggles', price: 165, cats: ['goggles', 'classic'],
      desc: 'A slim oval for every day of summer. Eyewear handcrafted in Italy.',
      colours: {
        black: { label: 'black', img: img(FILES.classicBlack), worn: img(FILES.wornClassicBlack) },
        toast: { label: 'toast', img: img(FILES.classicToast), worn: img(FILES.wornClassicToast) }
      }
    },
    'scuba-shorts': {
      name: 'scuba shorts', price: 110, cats: ['clothing'], sizes: ['xs', 's', 'm', 'l'],
      desc: 'A ribbed booty short with a drawstring waist. Our first piece of apparel.',
      colours: {
        lagoon: { label: 'lagoon', img: LOCAL.shortsLagoon },
        pink: { label: 'pink', img: LOCAL.shortsPink }
      }
    },
    'holiday-case': {
      name: 'holiday case', price: 60, cats: ['accessories'],
      desc: 'A zip case with a clip, made to carry your goggles from the pool to the street.',
      colours: { zip: { label: 'zip', img: LOCAL.kase } }
    }
  };
  var GOGGLES = [
    ['pool-goggles', 'black'], ['pool-goggles', 'choc'],
    ['classic-goggles', 'black'], ['classic-goggles', 'toast']
  ];
  var LOOKS = ['pink', 'lagoon'];
  var BUNDLE = 0.9;
  var EXPRESS_FREE = 250;

  var COLLECTION = [
    { p: 'pool-goggles', c: 'black' }, { p: 'pool-goggles', c: 'choc' }, { p: 'scuba-shorts', c: 'lagoon' },
    { p: 'classic-goggles', c: 'black' }, { p: 'classic-goggles', c: 'toast' }, { p: 'scuba-shorts', c: 'pink' },
    { p: 'holiday-case', c: 'zip' }, { look: 'lagoon' }, { look: 'pink' }
  ];
  var FILTERS = [
    ['all', 'all'], ['pool', 'pool'], ['classic', 'classic'], ['clothing', 'clothing'],
    ['accessories', 'accessories'], ['looks', 'the looks']
  ];

  // ---------- State ----------
  var state = { lookSize: '', look: { shorts: 'pink', goggle: 0 }, productSize: {}, gallery: 0 };
  var cart = load();

  function load() {
    try { return JSON.parse(localStorage.getItem('delsol-cart')) || []; } catch (e) { return []; }
  }
  function save() {
    try { localStorage.setItem('delsol-cart', JSON.stringify(cart)); } catch (e) { /* storage unavailable */ }
  }

  // ---------- Helpers ----------
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = function (n) { return '$' + (Math.round(n * 100) / 100).toFixed(n % 1 ? 2 : 0); };
  function setTotal(look, g) { return Math.round((PRODUCTS['scuba-shorts'].price + PRODUCTS[g[0]].price) * BUNDLE); }
  function setFull(g) { return PRODUCTS['scuba-shorts'].price + PRODUCTS[g[0]].price; }
  function fromSet() {
    return Math.min.apply(null, GOGGLES.map(function (g) { return setTotal(null, g); }));
  }
  function imgTag(src, cls, alt) {
    return '<img src="' + src + '" alt="' + (alt || '') + '" loading="lazy"' + (cls ? ' class="' + cls + '"' : '') + '>';
  }
  function colourImgClass(col) { return col.contain ? 'contain' : col.model ? 'model' : ''; }

  // ---------- Flat lay ----------
  // Each set gets one styled flat-lay photo (shorts, goggles and case). Until Steph shoots
  // them, the slot shows a quiet placeholder frame.
  var FLATLAYS = { lagoon: '', pink: '' };
  function defaultGoggle(lk) { return lk === 'lagoon' ? 3 : 0; }
  // One shop the look page. The link sets what is pre-selected:
  // #/look?shorts=pink&goggles=pool-black
  function goggleKey(gi) { var g = GOGGLES[gi]; return g[0].split('-')[0] + '-' + g[1]; }
  function goggleIndex(key) {
    for (var n = 0; n < GOGGLES.length; n++) if (goggleKey(n) === key) return n;
    return -1;
  }
  function lookHref(shorts, gi) { return '#/look?shorts=' + shorts + '&goggles=' + goggleKey(gi); }
  function lookTile(shorts, gi, caption) {
    var g = GOGGLES[gi];
    return '<a class="tile look-tile" href="' + lookHref(shorts, gi) + '"><div class="tile-img">' + caption + '</div>' +
      '<div class="tile-caption"><span>the SCUBA set <span class="muted">' + shorts + '</span></span>' +
      '<span>' + money(setTotal(shorts, g)) + ' <span class="strike">' + money(setFull(g)) + '</span></span></div></a>';
  }
  // Model shot for a look: the shorts colour plus the goggles chosen.
  // Placeholder copy: the first line says what kind of photo it is, the second what's in it.
  function lookDesc(lk, g) { return 'model wearing the scuba shorts in ' + lk + ' with the ' + PRODUCTS[g[0]].name + ' in ' + g[1]; }
  function placeholder(kind, desc, cls) {
    return '<div class="flatlay placeholder ' + (cls || '') + '"><span>' + kind + '</span><span class="muted">' + desc + '</span></div>';
  }
  function flatlay(lk, cls, gi) {
    if (gi == null) gi = defaultGoggle(lk);
    var g = GOGGLES[gi];
    if (FLATLAYS[lk]) return '<div class="flatlay ' + (cls || '') + '">' + imgTag(FLATLAYS[lk], '', 'the SCUBA set in ' + lk) + '</div>';
    return placeholder('model shot', lookDesc(lk, g), cls);
  }

  function tile(item) {
    if (item.look) {
      return '<a class="tile" href="' + lookHref(item.look, defaultGoggle(item.look)) + '"><div class="tile-img">' +
        flatlay(item.look) +
        '</div><div class="tile-caption"><span>the SCUBA set <span class="muted">' + item.look + '</span></span><span>' + money(setTotal(item.look, GOGGLES[defaultGoggle(item.look)])) + ' <span class="strike">' + money(setFull(GOGGLES[defaultGoggle(item.look)])) + '</span></span></div></a>';
    }
    var p = PRODUCTS[item.p], c = p.colours[item.c];
    var alt = c.worn ? imgTag(c.worn.replace('width=1200', 'width=800'), 'alt') : '';
    return '<a class="tile" href="#/product/' + item.p + '/' + item.c + '"><div class="tile-img">' +
      imgTag(c.img.replace('width=1200', 'width=800'), colourImgClass(c)) + alt +
      '</div><div class="tile-caption"><span>' + p.name + ' <span class="muted">' + c.label + '</span></span><span>' + money(p.price) + '</span></div></a>';
  }

  // ---------- Pages ----------
  function home() {
    var featured = [{ p: 'pool-goggles', c: 'black' }, { p: 'pool-goggles', c: 'choc' }, { p: 'scuba-shorts', c: 'lagoon' }, { p: 'classic-goggles', c: 'toast' }];
    return '<section class="hero"><picture><source media="(max-width: 1000px)" srcset="' + img(FILES.wornPoolBlack, 1000) + '">' +
      '<img class="hero-img" src="' + LOCAL.hero + '" alt="Del Sol summer campaign"></picture>' +
      '<img class="sticker" src="' + LOCAL.sticker + '" alt="Del Sol World sticker"></section>' +
      '<p class="statement">eyewear handcrafted in italy</p>' +
      '<section class="grid-4">' + featured.map(tile).join('') + '</section>' +
      '<p class="statement"><a href="#/look">shop the SCUBA set</a></p>' +
      '<a href="#/look"><img class="campaign" src="' + img(FILES.campaign, 2000) + '" alt="Del Sol campaign"></a>';
  }

  function shop(filter) {
    var f = filter === 'goggles' ? 'goggles' : (filter || 'all');
    var items = COLLECTION.filter(function (it) {
      if (f === 'all') return true;
      if (f === 'looks') return !!it.look;
      if (it.look) return false;
      return PRODUCTS[it.p].cats.indexOf(f) > -1;
    });
    var title = f === 'looks' ? 'shop the look' : f;
    return '<section class="collection-head"><h1 class="collection-title" style="font:inherit">' + title + '</h1>' +
      '<nav class="filters">' + FILTERS.map(function (x) {
        var active = x[0] === f;
        return '<a href="#/shop/' + x[0] + '"' + (active ? ' class="active"' : '') + '>' + x[1] + '</a>';
      }).join('') + '</nav></section>' +
      (f === 'looks' ? '<section class="worn-pair looks-grid">' + LOOKS.map(function (lk) {
        return lookTile(lk, defaultGoggle(lk), flatlay(lk));
      }).join('') + '</section>' :
      items.length ? '<section class="grid-3">' + items.map(tile).join('') + '</section>' : '<p class="empty">nothing here yet.</p>');
  }

  // One open at a time; panels slide open and closed by animating their row height.
  function accItem(title, body) {
    return '<div class="acc-item"><button type="button" class="acc-head" data-acc aria-expanded="false"><span>' + title + '</span><span class="acc-icon" aria-hidden="true"></span></button>' +
      '<div class="acc-body"><div><p>' + body + '</p></div></div></div>';
  }

  function product(handle, colour) {
    var p = PRODUCTS[handle];
    if (!p) return shop();
    var key = Object.keys(p.colours);
    var c = p.colours[colour] ? colour : key[0];
    var col = p.colours[c];
    var gallery = [{ src: col.img, cls: colourImgClass(col) }];
    // Every product page stacks three images: the product shot, then an on-model and a
    // second product shot (placeholders until Steph's photos arrive).
    var extra = {
      'scuba-shorts': [['model shot', 'model wearing the scuba shorts in ' + col.label + ', cropped at the waist'], ['product shot', 'the scuba shorts in ' + col.label + ', laid flat from the back']],
      'holiday-case': [['model shot', 'the holiday case clipped to a beach bag'], ['product shot', 'the holiday case unzipped, with goggles inside']]
    }[handle] || [['model shot', 'model wearing the ' + p.name + ' in ' + col.label + ', close up'], ['product shot', 'the ' + p.name + ' in ' + col.label + ', from the side']];
    extra.forEach(function (x) { gallery.push({ ph: x }); });
    var active = Math.min(state.gallery, gallery.length - 1);
    var size = state.productSize[handle];

    // Same option styles as the look page: thumbnails with a hairline, sizes as text.
    var swatches = key.length > 1 ? v3Swatches(col.label, key.map(function (k) {
      return { value: p.colours[k].label, img: p.colours[k].img, href: '#/product/' + handle + '/' + k };
    })) : '<div class="v3-opt"><span>colour <span class="muted">' + (col.label === 'zip' ? 'black' : col.label) + '</span></span></div>';
    var sizes = p.sizes ? v3Text('size', size, p.sizes, 'data-product-size') : '';

    // Complete the look: both looks feature the exact product on this page, and each tile
    // opens shop the look with that product already selected.
    var pairs;
    if (p.cats.indexOf('goggles') > -1) {
      var thisGoggle = goggleIndex(handle.split('-')[0] + '-' + c);
      pairs = [['pink', thisGoggle], ['lagoon', thisGoggle]];
    } else if (handle === 'scuba-shorts') {
      pairs = [[c, goggleIndex('pool-black')], [c, goggleIndex('classic-toast')]];
    } else {
      // The holiday case comes with every look, so show both.
      pairs = [['pink', defaultGoggle('pink')], ['lagoon', defaultGoggle('lagoon')]];
    }
    var completeLook = '<section class="complete"><p class="label">complete the look</p><div class="worn-pair">' +
      pairs.map(function (pr) {
        var g = GOGGLES[pr[1]];
        return lookTile(pr[0], pr[1], placeholder('model shot', lookDesc(pr[0], g)));
      }).join('') + '</div></section>';

    return '<section class="stage" data-handle="' + handle + '" data-colour="' + c + '">' +
      // Every image stacked down the left; the details stay put while they scroll past.
      '<div class="stack">' + gallery.map(function (g, i) {
        if (g.ph) return '<div class="stack-img flatlay placeholder"><span>' + g.ph[0] + '</span><span class="muted">' + g.ph[1] + '</span></div>';
        return '<div class="stack-img">' + (i === 0 ? '<img src="' + g.src + '" alt="' + p.name + ' ' + col.label + '"' + (g.cls ? ' class="' + g.cls + '"' : '') + '>' : imgTag(g.src, g.cls)) + '</div>';
      }).join('') + '</div>' +
      '<div class="info"><div class="info-block"><span class="strong">' + p.name + '</span><span>' + money(p.price) + ' AUD</span></div>' +
      '<p>' + p.desc + '</p><div class="v3-opts">' + swatches + sizes + '</div>' +
      '<button class="btn" data-add-product>add to bag</button>' +
      '<div class="details acc">' +
        accItem('more details', p.desc) +
        accItem('shipping &amp; returns', 'Standard shipping is free within Australia. Express is $10, free on orders over $250. International orders ship with DHL for a flat $48.') +
      '</div>' +
      '</div></section>' + completeLook;
  }

  // Set page, laid out like a Gimaguas look: look photos on the left, and on the right a
  // sticky list of every piece, each with its own options and add to bag, then the bundle.
  var STYLES = { pool: ['black', 'choc'], classic: ['black', 'toast'] };
  var SWATCH = { pink: '#F2C2D4', lagoon: '#9C9C9C', black: '#161616', choc: '#4B2B20', toast: '#8C5A3C', zip: '#161616' };
  function inlineOpts(label, current, opts, attr, swatch) {
    return '<div class="opt-row"><span>' + label + '</span><div class="inline-opts' + (swatch ? ' swatch-opts' : '') + '">' +
      opts.map(function (o) {
        var val = o.value || o, text = o.text || o;
        var inner = swatch ? '<span class="chip" style="background:' + SWATCH[val] + '"></span>' : text;
        var a11y = swatch ? ' aria-label="' + text + '" title="' + text + '"' : '';
        var cls = val === current ? ' class="active"' : '';
        if (o.href) return '<a href="' + o.href + '"' + cls + a11y + '>' + inner + '</a>';
        return '<button' + cls + a11y + ' ' + attr + '="' + val + '">' + inner + '</button>';
      }).join('') + '</div></div>';
  }
  function lookItem(href, imgSrc, imgCls, name, price, opts, addAttr) {
    return '<div class="look-item"><a class="look-item-img" href="' + href + '">' + imgTag(imgSrc, imgCls, name) + '</a>' +
      '<div class="look-item-info"><div class="info-block"><a href="' + href + '">' + name + '</a><span>' + money(price) + '</span></div>' +
      '<div class="look-opts">' + opts + '<button class="add-link" ' + addAttr + '>add to bag</button></div></div></div>';
  }

  // Full look page, laid out like the Paper v3 frame: one large shot on the left that
  // swaps with what's picked, and a list of the three pieces on the right.
  function v3Text(label, current, opts, attr) {
    return '<div class="v3-opt"><span>' + label + '</span><div class="v3-text-opts">' +
      opts.map(function (o) {
        return '<button type="button"' + (o === current ? ' class="active" aria-pressed="true"' : ' aria-pressed="false"') + ' ' + attr + '="' + o + '">' + o + '</button>';
      }).join('') + '</div></div>';
  }
  function v3Swatches(current, opts, attr) {
    return '<div class="v3-opt v3-opt-swatch"><span>colour <span class="muted">' + current + '</span></span><div class="v3-swatches">' +
      opts.map(function (o) {
        var cls = 'v3-sw' + (o.value === current ? ' active' : '');
        if (o.href) return '<a class="' + cls + '" href="' + o.href + '" aria-label="' + o.value + '" title="' + o.value + '">' + imgTag(o.img, '', o.value) + '</a>';
        return '<button type="button" class="' + cls + '" ' + attr + '="' + o.value + '" aria-label="' + o.value + '" title="' + o.value + '">' + imgTag(o.img, '', o.value) + '</button>';
      }).join('') + '</div></div>';
  }
  function v3Row(href, img, name, price, desc, opts, addAttr) {
    return '<div class="v3-row"><a class="v3-row-img" href="' + href + '">' + imgTag(img, '', name) + '</a>' +
      '<div class="v3-row-info"><div class="info-block"><a href="' + href + '">' + name + '</a><span>' + money(price) + ' AUD</span></div>' +
      '<p class="v3-desc">' + desc + '</p>' + opts +
      '<button type="button" class="add-link" ' + addAttr + '>add to bag</button></div></div>';
  }

  function look(id, q) {
    // Old #/look/pink links still work; otherwise the query decides.
    var L = state.look;
    if (LOOKS.indexOf(id) > -1) { L.shorts = id; L.goggle = defaultGoggle(id); }
    if (q.shorts && LOOKS.indexOf(q.shorts) > -1) L.shorts = q.shorts;
    if (q.goggles && goggleIndex(q.goggles) > -1) L.goggle = goggleIndex(q.goggles);
    else if (q.shorts) L.goggle = defaultGoggle(L.shorts);
    var sc = L.shorts;
    var shortsP = PRODUCTS['scuba-shorts'], shorts = shortsP.colours[sc];
    var size = state.lookSize;
    var gi = L.goggle, g = GOGGLES[gi], gp = PRODUCTS[g[0]], gc = gp.colours[g[1]];
    var style = g[0].split('-')[0];
    var kase = PRODUCTS['holiday-case'];

    // Stand-in for the model shot: the label says which photo would show, and it
    // cross-fades whenever the shorts or goggles change.
    var shot = '<div class="v3-shot" role="img" aria-label="' + lookDesc(sc, g) + '">' +
      '<div class="v3-shot-label"><span>model shot</span><span class="muted">' + lookDesc(sc, g) + '</span></div></div>';

    var rows =
      v3Row('#/product/scuba-shorts/' + sc, shorts.img, 'scuba shorts', shortsP.price, shortsP.desc,
        v3Text('size', size, shortsP.sizes, 'data-look-size') +
        v3Swatches(sc, LOOKS.map(function (k) { return { value: k, img: shortsP.colours[k].img }; }), 'data-look-shorts'),
        'data-add-look-item="shorts"') +
      v3Row('#/product/' + g[0] + '/' + g[1], gc.img, gp.name, gp.price, gp.desc,
        v3Text('style', style, ['pool', 'classic'], 'data-look-style') +
        v3Swatches(g[1], STYLES[style].map(function (c) { return { value: c, img: PRODUCTS[style + '-goggles'].colours[c].img }; }), 'data-look-colour'),
        'data-add-look-item="goggles"') +
      v3Row('#/product/holiday-case/zip', kase.colours.zip.img, kase.name, kase.price, kase.desc,
        '<div class="v3-opt"><span>colour <span class="muted">black</span></span></div>',
        'data-add-look-item="case"');

    var bundle = '<div class="v3-bundle"><div class="v3-bundle-head"><div class="info-block"><span class="strong">the full look</span>' +
      '<span class="muted">shorts and goggles together, 10% off</span></div>' +
      '<span>' + money(setTotal(sc, g)) + ' <span class="strike">' + money(setFull(g)) + '</span></span></div>' +
      '<button type="button" class="btn" data-add-set>add the look to bag</button></div>';

    return '<section class="look-v3" data-look>' +
      '<div class="v3-left">' + shot + '</div>' +
      '<div class="v3-right"><div class="v3-panel"><p class="v3-title">the SCUBA set</p>' + rows + bundle + '</div></div>' +
      '</section>';
  }

  function about() {
    return '<section class="about">' + imgTag('assets/about.webp', '', 'Del Sol campaign') +
      '<div class="about-copy"><span class="strong">about</span>' +
      '<p>Translating to ‘of the sun’, Del Sol was founded in the hazy memory of summers past. Launched in 2022 by Stephanie Dyer and thoughtfully designed in Sydney, Australia.</p>' +
      '<p>Inspired by a simpler time, retro rebellion and the summer of love. Eyewear handcrafted in Italy.</p>' +
      '<a class="muted" href="mailto:hola@delsol-salon.com">hola@delsol-salon.com</a></div></section>';
  }

  // ---------- Cart ----------
  function lineInfo(l) {
    if (l.kind === 'set') {
      var g = GOGGLES[l.goggle], gc = PRODUCTS[g[0]].colours[g[1]], sh = PRODUCTS['scuba-shorts'].colours[l.look];
      return {
        title: 'the SCUBA set', price: setTotal(l.look, g),
        sub: ['shorts ' + l.look + ', size ' + l.size, PRODUCTS[g[0]].name + ' ' + gc.label],
        imgs: [], look: true  // one photo of the look, not the pieces
      };
    }
    var p = PRODUCTS[l.handle], c = p.colours[l.colour];
    return {
      title: p.name, price: p.price,
      sub: [c.label + (l.size ? ', size ' + l.size : '')],
      imgs: [[c.img.replace('width=1200', 'width=300'), colourImgClass(c)]]
    };
  }

  function renderCart() {
    var count = cart.reduce(function (n, l) { return n + l.qty; }, 0);
    $$('.cart-count').forEach(function (el) { el.textContent = count; });
    var total = cart.reduce(function (n, l) { return n + lineInfo(l).price * l.qty; }, 0);
    var lines = cart.map(function (l, i) {
      var info = lineInfo(l);
      return '<div class="cart-line"><div class="cart-imgs">' + (info.look ? '<div class="cart-ph">model shot</div>' : info.imgs.map(function (x) { return imgTag(x[0], x[1]); }).join('')) + '</div>' +
        '<div class="cart-details"><div class="info-block"><span class="strong">' + info.title + '</span>' +
        info.sub.map(function (s) { return '<span class="muted">' + s + '</span>'; }).join('') + '</div>' +
        // Matches Paper: "qty 1" and the price. The +/- and remove appear on hover so the bag still works.
        '<div class="qty-row"><div class="qty"><span>qty ' + l.qty + '</span>' +
        '<span class="qty-edit"><button data-qty="' + i + '" data-delta="-1" aria-label="less">−</button><button data-qty="' + i + '" data-delta="1" aria-label="more">+</button>' +
        '<button class="remove" data-remove="' + i + '">remove</button></span></div><span>' + money(info.price * l.qty) + '</span></div></div></div>';
    }).join('');
    var away = EXPRESS_FREE - total;
    $('#cart').innerHTML =
      '<div class="cart-top"><div class="cart-header"><span class="strong">bag (' + count + ')</span><button data-close-cart>close</button></div>' +
      (cart.length ? lines : '<p class="cart-empty">your bag is empty. <a href="#/shop/all" data-close-cart>shop goggles</a></p>') + '</div>' +
      (cart.length ? '<div class="cart-bottom"><div class="cart-total"><span>subtotal</span><span>' + money(total) + '</span></div>' +
        '<span class="muted">standard shipping is free within australia.</span>' +
        '<button class="btn" data-checkout>check out</button></div>' : '');
  }

  // Adding stays on the page: the bag count updates and the button briefly reads "added to bag".
  function addLine(line, btn) {
    var existing = cart.filter(function (l) { return l.id === line.id; })[0];
    if (existing) existing.qty += 1; else cart.push(line);
    save(); renderCart();
    if (btn) flashAdded(btn);
  }
  function flashAdded(btn) {
    if (!btn.hasAttribute('data-label')) btn.setAttribute('data-label', btn.textContent);
    clearTimeout(btn._added);
    btn.textContent = 'added to bag';
    btn.classList.add('is-added');
    btn._added = setTimeout(function () {
      btn.textContent = btn.getAttribute('data-label');
      btn.classList.remove('is-added');
    }, 1600);
  }
  function openCart(open) {
    document.body.classList.toggle('cart-open', open);
    $('#cart').setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  // ---------- Router ----------
  var lastPath = '', lastView = '', enterTimer;
  function route() {
    var raw = location.hash.replace(/^#\/?/, '') || '';
    var qi = raw.indexOf('?'), q = {};
    if (qi > -1) {
      raw.slice(qi + 1).split('&').forEach(function (kv) { var a = kv.split('='); if (a[0]) q[a[0]] = decodeURIComponent(a[1] || ''); });
      raw = raw.slice(0, qi);
    }
    var parts = raw.split('/');
    var path = parts.join('/');
    // Same look page, or the same product in another colour: update in place.
    var view = parts[0] === 'product' ? 'product/' + parts[1] : parts[0];
    var soft = view === lastView && (view === 'look' || view === 'shop' || view.indexOf('product/') === 0);
    var keepGallery = path === lastPath || soft;
    if (!keepGallery && parts[0] !== 'product') state.gallery = 0;
    if (!keepGallery && parts[0] === 'product' && lastPath.split('/')[1] !== parts[1]) state.gallery = 0;
    var html;
    switch (parts[0]) {
      case 'shop': html = shop(parts[1]); break;
      case 'product': html = product(parts[1], parts[2]); break;
      case 'look': html = look(parts[1], q); break;
      case 'about': html = about(); break;
      default: html = home();
    }
    if (soft) softUpdate(html);
    else {
      $('#app').innerHTML = html;
      // Remember what the left image was rendered from, so a later swap only fades if it changed.
      $$('#app .v3-left, #app .stack').forEach(function (el) { el.setAttribute('data-src', el.innerHTML); });
      if (!keepGallery) { var app = $('#app'); app.classList.remove('page-enter'); void app.offsetWidth; app.classList.add('page-enter');
        clearTimeout(enterTimer); enterTimer = setTimeout(function () { app.classList.remove('page-enter'); }, 1600); }
    }
    markLoaded();
    var isHome = !parts[0];
    document.body.classList.toggle('is-home', isHome);
    updateHeader();
    fitLookPanel();
    $('#header').classList.remove('menu-open');
    if (!keepGallery) openCart(false);
    $('.menu-toggle').setAttribute('aria-expanded', 'false');
    $('.menu-toggle').textContent = 'menu';
    if (!keepGallery) window.scrollTo(0, 0);
    lastPath = path;
    lastView = view;
  }

  // Swap a page's contents without re-rendering it. The details update instantly (they
  // look the same), and the image on the left fades out and back in when it changes.
  function softUpdate(html) {
    // The entrance animation is for arriving on a page; without this, the swapped-in
    // details would replay it and look like a reload.
    clearTimeout(enterTimer);
    $('#app').classList.remove('page-enter');
    var next = document.createElement('div');
    next.innerHTML = html;
    var stage = $('#app .stage'), nextStage = next.querySelector('.stage');
    if (stage && nextStage) {
      stage.setAttribute('data-colour', nextStage.getAttribute('data-colour'));
      stage.setAttribute('data-handle', nextStage.getAttribute('data-handle'));
    }
    // Collection: the filters switch instantly; only the products fade out and the new set rises in.
    var head = $('#app .collection-head'), nextHead = next.querySelector('.collection-head');
    if (head && nextHead) {
      head.innerHTML = nextHead.innerHTML;
      var cur = head.nextElementSibling, nu = nextHead.nextElementSibling;
      if (cur && nu) {
        clearTimeout(head._swap);
        cur.classList.add('is-fading');
        head._swap = setTimeout(function () {
          var live = head.nextElementSibling;
          nu.classList.add('products-enter');
          live.replaceWith(nu);
          markLoaded();
        }, 280);
      }
      return;
    }
    [['.v3-right', false], ['.stage .info', false], ['.complete', false], ['.v3-left', true], ['.stack', true]].forEach(function (pair) {
      var cur = $('#app ' + pair[0]), nu = next.querySelector(pair[0]);
      if (!cur || !nu) return;
      if (!pair[1]) { cur.innerHTML = nu.innerHTML; return; }
      if (cur.getAttribute('data-src') === nu.innerHTML) return;
      cur.setAttribute('data-src', nu.innerHTML);
      // Look page: the new shot fades in on top of the current one, then the old one is removed.
      if (pair[0] === '.v3-left') {
        var incoming = nu.firstElementChild;
        if (!incoming) return;
        incoming.classList.add('shot-incoming');
        cur.appendChild(incoming);
        void incoming.offsetWidth;
        incoming.classList.add('is-in');
        clearTimeout(cur._swap);
        cur._swap = setTimeout(function () {
          while (cur.firstElementChild && cur.firstElementChild !== cur.lastElementChild) cur.removeChild(cur.firstElementChild);
          incoming.classList.remove('shot-incoming', 'is-in');
        }, 700);
        return;
      }
      clearTimeout(cur._swap);
      cur.classList.add('is-fading');
      cur._swap = setTimeout(function () {
        cur.innerHTML = nu.innerHTML;
        markLoaded();
        requestAnimationFrame(function () { cur.classList.remove('is-fading'); });
        setTimeout(function () { cur.classList.remove('is-fading'); }, 60);
      }, 380);
    });
    markLoaded();
  }

  // ---------- Events ----------
  document.addEventListener('click', function (e) {
    var t = e.target.closest('button, a');
    if (!t) {
      if (e.target.id === 'scrim') openCart(false);
      return;
    }
    if (t.classList.contains('cart-toggle')) { openCart(true); return; }
    if (t.hasAttribute('data-close-cart')) { openCart(false); return; }
    if (t.classList.contains('menu-toggle')) {
      var open = !$('#header').classList.contains('menu-open');
      $('#header').classList.toggle('menu-open', open);
      t.setAttribute('aria-expanded', String(open));
      t.textContent = open ? 'close' : 'menu';
      return;
    }
    if (t.hasAttribute('data-gallery')) {
      state.gallery = +t.getAttribute('data-gallery');
      if (window.matchMedia('(max-width: 1000px)').matches) return;
      route(); return;
    }
    var accHead = t.closest('[data-acc]');
    if (accHead) {
      var item = accHead.parentNode, opening = !item.classList.contains('open');
      $$('.acc-item', item.parentNode).forEach(function (el) {
        el.classList.remove('open');
        el.querySelector('[data-acc]').setAttribute('aria-expanded', 'false');
      });
      if (opening) { item.classList.add('open'); accHead.setAttribute('aria-expanded', 'true'); }
      return;
    }
    var stage = t.closest('[data-handle]');
    if (t.hasAttribute('data-product-size')) { state.productSize[stage.getAttribute('data-handle')] = t.getAttribute('data-product-size'); route(); return; }
    if (t.hasAttribute('data-add-product')) {
      var h = stage.getAttribute('data-handle'), c = stage.getAttribute('data-colour'), p = PRODUCTS[h];
      if (p.sizes && !state.productSize[h]) { toast('select a size first'); return; }
      var s = p.sizes ? state.productSize[h] : '';
      addLine({ id: 'p:' + h + ':' + c + ':' + s, kind: 'product', handle: h, colour: c, size: s, qty: 1 }, t);
      return;
    }
    var lookEl = t.closest('[data-look]');
    if (lookEl) {
      var L = state.look, cur = GOGGLES[L.goggle];
      var go = function () { history.replaceState(null, '', lookHref(L.shorts, L.goggle)); route(); };
      var pick = function (style, colour) {
        var list = STYLES[style], c = list.indexOf(colour) > -1 ? colour : list[0];
        L.goggle = goggleIndex(style + '-' + c);
        go();
      };
      if (t.hasAttribute('data-look-size')) { state.lookSize = t.getAttribute('data-look-size'); route(); return; }
      if (t.hasAttribute('data-look-shorts')) { L.shorts = t.getAttribute('data-look-shorts'); go(); return; }
      if (t.hasAttribute('data-look-style')) { pick(t.getAttribute('data-look-style'), cur[1]); return; }
      if (t.hasAttribute('data-look-colour')) { pick(cur[0].split('-')[0], t.getAttribute('data-look-colour')); return; }
      if (t.hasAttribute('data-add-look-item')) {
        var which = t.getAttribute('data-add-look-item');
        if (which === 'shorts') {
          if (!state.lookSize) { toast('select a size first'); return; }
          addLine({ id: 'p:scuba-shorts:' + L.shorts + ':' + state.lookSize, kind: 'product', handle: 'scuba-shorts', colour: L.shorts, size: state.lookSize, qty: 1 }, t);
        } else if (which === 'goggles') {
          addLine({ id: 'p:' + cur[0] + ':' + cur[1] + ':', kind: 'product', handle: cur[0], colour: cur[1], size: '', qty: 1 }, t);
        } else {
          addLine({ id: 'p:holiday-case:zip:', kind: 'product', handle: 'holiday-case', colour: 'zip', size: '', qty: 1 }, t);
        }
        return;
      }
      if (t.hasAttribute('data-add-set')) {
        if (!state.lookSize) { toast('select a shorts size first'); return; }
        addLine({ id: 'set:' + L.shorts + ':' + state.lookSize + ':' + L.goggle, kind: 'set', look: L.shorts, size: state.lookSize, goggle: L.goggle, qty: 1 }, t);
        return;
      }
    }
    if (t.hasAttribute('data-qty')) {
      var i = +t.getAttribute('data-qty');
      cart[i].qty += +t.getAttribute('data-delta');
      if (cart[i].qty < 1) cart.splice(i, 1);
      save(); renderCart(); return;
    }
    if (t.hasAttribute('data-remove')) { cart.splice(+t.getAttribute('data-remove'), 1); save(); renderCart(); return; }
    if (t.hasAttribute('data-checkout')) { toast('checkout runs through Shopify in the build.'); return; }
  });

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') openCart(false); });
  $('#newsletter').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = $('#email').value.trim();
    toast(v ? 'thanks, 10% off is on its way.' : 'add your email first.');
    if (v) $('#email').value = '';
  });

  // Images fade in once they've loaded, rather than popping in.
  function markLoaded() {
    $$('#app img, #cart img').forEach(function (im) {
      if (im.complete && im.naturalWidth) im.classList.add('is-loaded');
    });
  }
  document.addEventListener('load', function (e) {
    if (e.target && e.target.tagName === 'IMG') e.target.classList.add('is-loaded');
  }, true);

  function updateHeader() {
    var home = document.body.classList.contains('is-home');
    $('#header').classList.toggle('over-hero', home && window.scrollY < 40);
    // The frosted background only appears once the page has scrolled under the nav.
    $('#header').classList.toggle('is-scrolled', window.scrollY > 4);
  }
  // Set page: the product panel scrolls with the page until its last row is on screen,
  // then holds there while the look photos keep scrolling.
  function fitInfo() {
    var info = $('.stage .info');
    if (!info) return;
    if (window.matchMedia('(max-width: 1000px)').matches) { info.style.paddingTop = ''; return; }
    var kids = Array.prototype.slice.call(info.children), gap = parseFloat(getComputedStyle(info).rowGap) || 0;
    var h = kids.reduce(function (n, k) { return n + k.offsetHeight; }, 0) + gap * (kids.length - 1);
    info.style.paddingTop = Math.max(24, (info.clientHeight - h) / 2) + 'px';
  }
  function fitLookPanel() {
    fitInfo();
    var panel = $('.look-items') || $('.v3-panel');
    if (!panel) return;
    var navH = $('#header').offsetHeight;
    var top = Math.min(navH, window.innerHeight - panel.offsetHeight);
    panel.style.top = top + 'px';
  }
  window.addEventListener('scroll', updateHeader, { passive: true });
  window.addEventListener('resize', fitLookPanel);
  window.addEventListener('hashchange', route);
  renderCart();
  route();
  // A timer rather than requestAnimationFrame, so the nav still shows in a background tab.
  // First load: on the home page the hero photo arrives first, then the nav fades in over it.
  function revealNav() {
    if (document.body.classList.contains('is-ready')) return;
    document.body.classList.add('is-ready');
    setTimeout(function () { document.body.classList.add('nav-done'); }, 800);
  }
  var heroImg = $('.hero-img');
  if (heroImg && !(heroImg.complete && heroImg.naturalWidth)) {
    heroImg.addEventListener('load', function () { setTimeout(revealNav, 150); });
    heroImg.addEventListener('error', revealNav);
    setTimeout(revealNav, 2500); // don't hold the nav back if the photo is slow
  } else {
    setTimeout(revealNav, heroImg ? 150 : 30);
  }

  // Warm the cache so colour and goggle swaps feel instant.
  setTimeout(function () {
    Object.keys(PRODUCTS).forEach(function (h) {
      Object.keys(PRODUCTS[h].colours).forEach(function (k) {
        var c = PRODUCTS[h].colours[k];
        [c.img, c.img.replace('width=1200', 'width=300'), c.img.replace('width=1200', 'width=800'), c.img.replace('width=1200', 'width=1400'), c.worn]
          .filter(Boolean).forEach(function (src) { new Image().src = src; });
      });
    });
  }, 800);
})();
