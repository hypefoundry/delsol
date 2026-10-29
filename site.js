// Nav dropdowns: open on hover, toggle on click
document.querySelectorAll('.dd').forEach(function (dd) {
  var b = dd.querySelector('button');
  function set(open) { dd.classList.toggle('open', open); b.setAttribute('aria-expanded', open ? 'true' : 'false'); }
  dd.addEventListener('mouseenter', function () { set(true); });
  dd.addEventListener('mouseleave', function () { set(false); });
  b.addEventListener('click', function () { set(!dd.classList.contains('open')); });
});

// Notify-me forms
document.querySelectorAll('form[data-notify]').forEach(function (f) {
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var done = document.createElement('span');
    done.textContent = "you're on the list.";
    f.replaceWith(done);
  });
});

// Shared picker helper: one aria-pressed button per group
function picker(group, onPick) {
  var buttons = Array.prototype.slice.call(group.querySelectorAll('button'));
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      buttons.forEach(function (o) { o.setAttribute('aria-pressed', o === btn ? 'true' : 'false'); });
      onPick(btn.dataset.value);
    });
  });
}

function setBag(n) {
  document.querySelectorAll('[data-bag]').forEach(function (el) { el.textContent = n; });
}
