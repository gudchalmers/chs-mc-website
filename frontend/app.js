import mustache from "mustache";
import { Converter } from "@gorymoon/minecraft-text";
import tippy from "tippy.js";

import { faMap } from "@fortawesome/free-regular-svg-icons";
import { faEnvelope, faUser, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { library, dom } from "@fortawesome/fontawesome-svg-core";

library.add(faMap, faEnvelope, faUser, faSpinner);
dom.watch();

import "tippy.js/dist/tippy.css";
import "./app.scss";

const converter = new Converter({ newline: true });

tippy("[data-tippy-content]");

const navbarMenu = document.getElementById("navbarMenu");

const navbarBurger = document.getElementById("navbar-burger");
navbarBurger.addEventListener("click", () => {
  navbarBurger.classList.toggle("is-active");
  navbarMenu.classList.toggle("is-active");
});

document.body.addEventListener("click", (e) => {
  if (e.target.classList.contains("chs-modal-close")) {
    const modal = e.target.getAttribute("data-modal");
    document.getElementById(modal).classList.remove("is-active");
  }

  if (e.target.classList.contains("chs-modal-open")) {
    const modal = e.target.getAttribute("data-modal");
    document.getElementById(modal).classList.add("is-active");
  }

  if (e.target.classList.contains("modal-background")) {
    e.target.parentElement.classList.remove("is-active");
  }
});

const statusElem = document.getElementById("status");
async function updateMOTD() {
  try {
    const response = await fetch("/ping");
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    const rendered = mustache.render(
      document.getElementById("motd-template-success").innerHTML,
      {
        current: data.players.online,
        max: data.players.max,
        motd: converter.toHTML(converter.parse(data.description)),
      }
    );
    statusElem.innerHTML = rendered;
  } catch (error) {
    console.error(error);
    statusElem.innerHTML = mustache.render(
      document.getElementById("motd-template-error").innerHTML
    );
  }
}

updateMOTD();
setInterval(updateMOTD, 10000);
