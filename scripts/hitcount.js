"use strict";
(function() {
  const API_URL = "https://weirdscifi.ratiosemper.com/neocities.php?sitename=hekate";

  window.addEventListener("load", init);

  function init() {
    document.querySelector(".lastupdated").textContent = new Date((document.lastModified)).toLocaleDateString();
    getHits();
  }

  async function getHits() {
    let hitCount = document.querySelector(".hitcount");
    
    try {
      let res = await fetch(API_URL);
      await statusCheck(res);
      res = await res.json();

      hitCount.textContent = res["info"]["views"];;

    } catch (err) {
      hitCount.textContent = "Problems fetching hit count"
    }
  }

  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }
})();