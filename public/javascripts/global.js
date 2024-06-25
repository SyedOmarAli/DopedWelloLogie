function showNavBar() {
  const navDefaultMobile = document.querySelector(".nav-default-mobile");
  navDefaultMobile.style.visibility = "visible";
  navDefaultMobile.style.display = "block";
  navDefaultMobile.style.opacity = "2";
  navDefaultMobile.style.textAlign = "center";
  navDefaultMobile.style.left = "0";
  navDefaultMobile.style.width = "100%";
  navDefaultMobile.style.bottom = "0";
  navDefaultMobile.style.top = "25px";
  navDefault.style.display = "none";
}

function closeFunc() {
  const navDefaultMobile = document.querySelector(".nav-default-mobile");
  navDefaultMobile.style.visibility = "hidden";
}

const navDefault = document.querySelector(".nav-default");
const articleHed = document.querySelector(".header-scrolling-article-hed");
const headerNav = document.querySelector(".header__nav");
const toggleSocialLinks = document.querySelector(".tg-social-links");
const searchBox = document.querySelector(".serchBox");
const headerDef = document.querySelector(".header__inner");
articleHed.remove();
toggleSocialLinks.remove();

window.addEventListener("scroll", function () {
  if (window.scrollY > 10) {
    navDefault.remove();
    searchBox.remove();
    headerDef.appendChild(toggleSocialLinks);
    headerNav.appendChild(articleHed);
  } else {
    headerNav.appendChild(navDefault);
    headerDef.appendChild(searchBox);
    toggleSocialLinks.remove();
    articleHed.remove();
  }
});

function removeFunction(x) {
  if (x.matches) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 10) {
        navDefault.remove();
        searchBox.remove();
        toggleSocialLinks.remove();
      } else {
        headerNav.appendChild(navDefault);
        headerDef.appendChild(searchBox);
        toggleSocialLinks.remove();
        articleHed.remove();
      }
    });
  } else {
    // headerDef.appendChild(toggleSocialLinks);
  }
}

var x = window.matchMedia("(max-width: 1023px)");
removeFunction(x);

x.addEventListener("change", function () {
  removeFunction(x);
});
