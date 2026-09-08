/* CIA — formulaire de contact.
   Aucun service tiers : le message est composé côté navigateur puis remis à la
   messagerie du visiteur, ou à WhatsApp, sur un choix explicite de sa part.
   Rien ne transite par le serveur d'un éditeur, rien n'est stocké, aucun compte
   à maintenir, et aucune ouverture de logiciel n'est déclenchée à son insu.
   Sans JavaScript, le formulaire retombe sur son action mailto: native. */
(function () {
  "use strict";

  var f = document.getElementById("f");
  var panneau = document.getElementById("sent");
  if (!f || !panneau) return;

  var MAIL = f.dataset.mail;
  var TEL = f.dataset.tel;
  var PIED = f.dataset.pied;
  var SUJET = f.dataset.sujet;
  var CHAMPS;
  try { CHAMPS = JSON.parse(f.dataset.champs); } catch (e) { return; }

  var ORDRE = ["nom", "name", "organisation", "pays", "country",
               "email", "telephone", "phone", "profil", "profile"];

  function valeur(noms) {
    for (var i = 0; i < noms.length; i++) {
      var el = f.elements[noms[i]];
      if (el && el.value) return el.value.trim();
    }
    return "";
  }

  function composer() {
    var paires = [
      [CHAMPS[0], valeur(["nom", "name"])],
      [CHAMPS[1], valeur(["organisation"])],
      [CHAMPS[2], valeur(["pays", "country"])],
      [CHAMPS[3], valeur(["email"])],
      [CHAMPS[4], valeur(["telephone", "phone"])],
      [CHAMPS[5], valeur(["profil", "profile"])]
    ];
    var lignes = [];
    for (var i = 0; i < paires.length; i++) {
      if (paires[i][1]) lignes.push(paires[i][0] + " : " + paires[i][1]);
    }
    var message = valeur(["message"]);
    return lignes.join("\n") + "\n\n" + message + "\n\n— " + PIED;
  }

  f.addEventListener("submit", function (e) {
    e.preventDefault();
    if (typeof f.reportValidity === "function" && !f.reportValidity()) return;

    var corps = composer();
    var org = valeur(["organisation"]);
    var sujet = SUJET + (org ? " — " + org : "");

    document.getElementById("recap").value = corps;

    var mailto = "mailto:" + MAIL +
                 "?subject=" + encodeURIComponent(sujet) +
                 "&body=" + encodeURIComponent(corps);
    document.getElementById("lien-mail").href = mailto;
    document.getElementById("lien-wa").href =
      "https://wa.me/" + TEL + "?text=" + encodeURIComponent(sujet + "\n\n" + corps);

    f.hidden = true;
    panneau.hidden = false;
    panneau.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  var bouton = document.getElementById("copier");
  var temoin = document.getElementById("copie-ok");
  if (!bouton) return;

  bouton.addEventListener("click", function () {
    var zone = document.getElementById("recap");
    var confirme = function () {
      if (!temoin) return;
      temoin.hidden = false;
      setTimeout(function () { temoin.hidden = true; }, 2500);
    };
    zone.removeAttribute("readonly");
    zone.select();
    zone.setSelectionRange(0, 99999);
    zone.setAttribute("readonly", "readonly");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(zone.value).then(confirme, function () {
        try { document.execCommand("copy"); confirme(); } catch (err) {}
      });
    } else {
      try { document.execCommand("copy"); confirme(); } catch (err) {}
    }
  });
})();
