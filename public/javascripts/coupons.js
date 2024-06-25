async function copyTextToClipboard(text) {
  try {
    const permissionStatus = await navigator.permissions.query({ name: "clipboard-write" });

    if (permissionStatus.state === "granted" || permissionStatus.state === "prompt") {
      await navigator.clipboard.writeText(text);
      console.debug('Text copied to clipboard successfully!');
      return true;
    } else {
      console.debug('Clipboard-write permission denied.');
      return false;
    }
  } catch (err) {
    console.debug('Failed to copy text to clipboard:', err);
    return false;
  }
}

function initCouponButtons() {
  $('[data-cpn-btn]').each(function() {
    const couponBtn = $(this);

    if (couponBtn.is('data-initialized')) {
      return;
    }

    const couponEl = couponBtn.parents('[data-coupon]');
    const couponId = couponEl.attr('data-cnum');
    const couponType = couponEl.attr('data-type');
    const link = couponEl.attr('data-link');
    const redirectUrl = decodeURL("/redirect" + link);
    const newLink = decodeURL(RemoveParameterFromUrl(window.location.href, 'u') + couponEl.attr('data-link'));
    const couponCode = couponEl.attr('data-cp-code');
    const clipboardTargetId = 'coupon-cp-' + couponId;

    if (couponType !== 'code') {
      couponBtn.on('click', () => {
        window.open(redirectUrl, "_blank");
        setTimeout(() => {
          window.location.href = newLink;
        }, 100);
      });
      return;
    }

    couponBtn.attr('data-clipboard-target', '#' + clipboardTargetId);
    $('<input>').attr({
      type: 'hidden',
      id: clipboardTargetId,
      value: couponCode,
    }).insertAfter(couponBtn);

    const couponClipoard = new ClipboardJS(couponBtn.get(0));

    couponClipoard.on('success', function(e) {
      e.clearSelection();
      const notyf = new Notyf({ duration: 5000 });
      notyf.success('Successfully copied code to clipboard.');
      window.open(redirectUrl, "_blank");
      setTimeout(() => {
        window.location.href = newLink;
      }, 500);
    });

    couponClipoard.on('error', function(e) {
      let _notyf = new Notyf({ duration: 0 });
      const continue_noty = _notyf.open({
        type: 'success',
        message: 'Manually copy the code and click here to proceed.',
      });
      document.getElementById('cp-code').select();
      continue_noty.on('click', ({ target, event }) => {
        window.open(redirectUrl, "_blank");
        window.location.href = newLink;
      });
    });

    couponBtn.attr('data-initialized', 1);
  });
}

function decodeURL(url) {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = url;
  const decodedHTML = textArea.value;
  return decodeURIComponent(decodedHTML);
}

function RemoveParameterFromUrl(url, parameter) {
  return url
    .replace(new RegExp('[?&]' + parameter + '=[^&#]*(#.*)?$'), '$1')
    .replace(new RegExp('([?&])' + parameter + '=[^&]*&'), '$1');
}

$(document).ready(function() {
  initCouponButtons();
});
