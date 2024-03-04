import $ from "cash-dom";
import _ from "lodash";
import ky from "ky";
import Mustache from "mustache";
import { Converter } from "@gorymoon/minecraft-text";
import tippy from "tippy.js";

import "@fortawesome/fontawesome-free/js/fontawesome";
import "@fortawesome/fontawesome-free/js/solid";
import "@fortawesome/fontawesome-free/js/regular";
import "@fortawesome/fontawesome-free/js/brands";
import "tippy.js/dist/tippy.css";

const converter = new Converter({ newline: true });

$(function () {
  tippy("[data-tippy-content]");

  $(".navbar-burger").on("click", function () {
    $(".navbar-burger").toggleClass("is-active");
    $(".navbar-menu").toggleClass("is-active");
  });

  $("body").on("click", ".chs-modal-close", function (e) {
    let modal = $(this).data("modal");
    $(`#${modal}`).removeClass("is-active");
  });

  $("body").on("click", ".chs-modal-open", function (e) {
    let modal = $(this).data("modal");
    $(`#${modal}`).addClass("is-active");
  });

  $("body").on("click", ".modal-background", function (e) {
    $(this).parent().removeClass("is-active");
  });

  async function updateMOTD() {
    try {
      const response = await ky.get("/ping").json();
      const data = response["status"];
      console.log(converter.toHTML(converter.parse(data["description"])));
      const rendered = Mustache.render($("#motd-template-success").html(), {
        current: data["players"]["online"],
        max: data["players"]["max"],
        motd: converter.toHTML(converter.parse(data["description"])),
      });
      $("#status").html(rendered);

      ///// Broken for now, need to get players from the response
      // let players = 'No players online';
      // let tooltipPlayers = players;
      // if (_.size(data['players']['sample']) > 0) {
      //   tooltipPlayers = '<strong class="has-text-white">Players:</strong><br/>';
      //   const playerList = _.map(data['players']['sample'], 'name');

      //   players = playerList.join('<br/>');
      //   tooltipPlayers += _.take(playerList, 10).map((element) => `<i class="has-text-weight-light">${element}</i>`).join('<br/>')
      //   if (_.size(playerList) > 10) {
      //     tooltipPlayers += `<br/>And ${_.size(playerList) - 10} more, click to see all.`
      //   }
      // }
      // $('#online-players').html(players);

      // tippy('#players', {
      //   content: tooltipPlayers,
      //   allowHTML: true
      // });
    } catch (e) {
      $("#status").html(Mustache.render($("#motd-template-error").html()));
    }
  }

  updateMOTD();
  setInterval(updateMOTD, 30 * 1000);
});
