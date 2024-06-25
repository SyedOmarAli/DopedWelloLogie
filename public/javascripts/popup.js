const couponBtns = document.querySelectorAll(".coupon-button");
const popupTwo = document.querySelector(".popup2");

couponBtns.forEach(function (couponBtn) {
  couponBtn.addEventListener("click", function () {
    popupTwo.style.visibility = "visible";
  });
});

$(document).ready(function () {
  function sortCoupons(category) {
    if (category === "all") {
      $(".coupons-list li.coupon-info").show();
    } else {
      $(".coupons-list li.coupon-info").hide();
      if (category === "deal") {
        $(".coupons-list li.coupon-info.csle").fadeIn("slow");
      } else if (category === "code") {
        $(".coupons-list li.coupon-info.ccod").fadeIn("slow");
      } else {
        $(".coupons-list .c-title").each(function () {
          var $element = $(this).closest("li");
          if (
            $(this).find("a").text().trim().toLowerCase().includes(category) ||
            $element
              .find(".offer-box")
              .text()
              .trim()
              .toLowerCase()
              .includes(category) ||
            $element
              .find(".coupon-button-box .cpnbtn .cpnbtx")
              .text()
              .trim()
              .toLowerCase()
              .includes(category)
          ) {
            $element.fadeIn("slow");
          }
        });
      }
    }
  }

  $(".cpn-sort").on("click", function () {
    var category = $(this).data("type");
    $(".list-inline .ftrAtv").removeClass("ftrAtv");
    $(this).parent().addClass("ftrAtv");
    sortCoupons(category);
  });

  // $("body").on("click", ".reveal-coupon", function () {
  //     var link = $(this).closest(".coupon-info").data("link");
  //     if (link) {
  //         var redirect = "/redirect" + link;
  //         window.open(redirect, "_blank");
  //         setTimeout(function () {
  //             window.location.href = RemoveParameterFromUrl(window.location.href, "u") + link;
  //         }, 100);
  //     } else {
  //         console.error("Link is undefined.");
  //     }
  // });

  $("body").on("click", "#clipbox-btn", function () {
    var code = $("#cp-code").val();
    navigator.clipboard.writeText(code);
    $(this).find(".copy").text("Copied..");
    setTimeout(function () {
      $(this).find(".copy").text("Copy");
    }, 1500);
  });

  $("body").on("click", ".couponcode-modal .close", function () {
    $(".couponcode-modal").remove();
  });

  $("#nav-icon").click(function () {
    $(this).toggleClass("open");
    $(".cd-mobile-nav").toggleClass("open");
  });

  $(".search_icon").click(function () {
    $(".search-form").animate({ right: 0 }, 50);
    $(".search-popup").show();
  });

  $(".search-bg").click(function () {
    $(".search-popup").hide();
    $(".search-form").animate({ right: "-100%" }, 50);
  });
});

function closePopup2() {
  popupTwo.style.visibility = "hidden";
}
