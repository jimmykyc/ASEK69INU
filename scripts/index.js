"use strict";

(function() {
  const D_GENRE = "indie";
  let player;
  let playerState = new PlayerState();

  window.addEventListener("load", init);

  function init() {
    welcomeTab();
    loadGenres();
    loadPlaylist();
    ytPlayerSetup();
    titleScroller(document.title);

    qsa('aside > ul > li').forEach((elem) => {
      elem.addEventListener('click', toggleTab);
    });

    id('toggle-genres').addEventListener("click", () => {
      id("genres").classList.toggle("hidden");
    })
  }

  function titleScroller(text) {
    document.title = text;

    setTimeout(function() {
      titleScroller(text.substring(1) + text.substring(0, 1));
    }, 500);
  }

  function welcomeTab() {
    let wTab = tab("Welcome!", "welcome", "./welcome.html");
    let moi = gen("img");
    moi.src = "../graphics/logo.png";
    moi.id = "moi";
    moi.alt = "Me as a pixel doll"

    wTab.appendChild(moi);
    wTab.style.width = "400px";
    wTab.style.height = "300px";
    qs("main").appendChild(wTab);
  }

  function PlayerState() {
    this.genre = D_GENRE;
    this.beenClicked = false;
    this.ytid;
    this.playing;
  }
  
  function toggleSize(e) {
    let tab = this.closest('section');
    
    if (!tab.classList.contains('fullscreen')) {
      tab.classList.add('fullscreen');
    } else {
      tab.classList.remove('fullscreen');
    }
  }

  async function loadGenres() {
    try {
      let res = await fetch("../data/tracks.json");
      res = await res.json();

      buildGenres(res);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadPlaylist(genre = D_GENRE) {
    try {
      let res = await fetch("../data/tracks.json");
      res = await res.json();

      buildPlaylists(res, genre);
    } catch (err) {
      console.error(err);
    }
  }

  function buildPlaylists(songs, genre) {
    qs("#playlist ul").innerHTML = "";
    songs = songs.filter((elem) => {
      return elem["genres"].includes(genre);
    }).sort(() => Math.random() - 0.5);

    songs.forEach((elem) => {
      let song = playlistElem(elem);
      qs("#playlist ul").appendChild(song);
    });

    if (qs(".playing")) {
      qs(".playing").classList.remove("playing");
    }
    
    qs("#playlist li").classList.add("playing");
    playerState.currYtId = qs(".playing").dataset["value"];

    if (player && !playerState.playing) {
      player.cueVideoById(qs('.playing').getAttribute('data-value'));
    }
  }

  function buildGenres(songs) {
    let genres = Array.from(
      new Set(songs.reduce((carry, current) =>[...carry, ...current["genres"]],[]))
    ).sort();

    genres.forEach((elem) => {
      let newElem = genresOption(elem);
      if (newElem.dataset["genre"] === playerState["genre"]) {
        newElem.classList.add("active");
      }
      qs("#genres ul").appendChild(newElem);
    })
  }

  function genresOption(genre) {
    let li = gen("li");
    li.textContent = genre;
    li.dataset["genre"] = genre;

    li.addEventListener("click", (e) => {
      let genre = e.target.textContent;
      playerState["genre"] = genre;

      qs("#genres li.active").classList.remove("active");
      e.target.classList.add("active");

      loadPlaylist(genre);
    });

    return li;
  }
  

  function playlistElem(song) {
    let trck = gen("li");
    trck.dataset["value"] = song["ytid"];
    trck.textContent = song["title"] + "-" + song["artist"];
    trck.addEventListener("click", selectSong);

    if (song["ytid"] === playerState.currYtId) {
      trck.classList.add("playing");
    }

    if (song["explicit"]) {
      trck.classList.add("explicit")
    }

    return trck;
  }
  
  function close(e) {
    this.closest('.visible').remove();
  }
  
  function toggleTab(e) {
    if (this.hasAttribute('data-src')) {
      if (!id(this.getAttribute('data-id'))) {
        let currTab = e.target;
        qs("main").appendChild(tab(currTab.textContent, currTab.dataset["id"], currTab.dataset["src"]));
      }
    }
  }

  function tab(title, identity, source) {
    let tb = gen('section');
    let br = gen('div');
    let ti = gen('h1');
    let tg = gen('button');
    let cl = gen('button');
    let fr = gen('iframe');
    let allVis = qsa('.visible');

    br.classList.add('title-bar');
    tg.classList.add('toggle');
    cl.classList.add('close');
    tb.classList.add('visible');
    tb.classList.add('tab');

    ti.textContent = title;
    tg.textContent = "❏";
    cl.textContent = "X";

    cl.addEventListener("click", close);
    tg.addEventListener("click", toggleSize);

    fr.src = source;
    fr.title = title;
    tb.id = identity;
    tb.style.zIndex = (allVis[allVis.length - 1] ? allVis[allVis.length - 1].style.zIndex + 1 : 1);

    br.append(ti, tg, cl);
    tb.append(br, fr)

    $(tb).draggable({
      stack: ".tab"
    }).resizable();

    return tb;
  }
    
  function selectSong(e) {
    qs('.playing').classList.remove('playing');
    this.classList.add('playing');

    playerState.currYtId = this.dataset["value"];
    playerState.playing = true;
    qs('#music marquee').textContent = this.textContent;

    if (player) {
      player.loadVideoById(playerState.currYtId)
    };
  }

  function ytPlayerSetup() {
    // 2. This code loads the IFrame Player API code asynchronously.
    let tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    let firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  window.onYouTubeIframeAPIReady = async function () {
    player = new YT.Player('player', {
      height: '390',
      width: '640',
      videoId: qs(".playing").dataset["value"],
      playerVars: {
        'playsinline': 1
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });

    qs("#music marquee").textContent = qs(".playing").textContent;
  }

  // 4. The API will call this function when the video player is ready.
  function onPlayerReady(event) {
    let playButton = id("play");
    let pauseButton = id("pause");
    qs("#music marquee").textContent = qs(".playing").textContent;
    
    playButton.addEventListener("click", function() {
      if (player) {
        console.log(playerState.currYtId !== player.getVideoData()['video_id']);
        if (!playerState.playing) {
          let fn = function(){
            player.playVideo();
          }
          setTimeout(fn, 500);
          
          playerState.playing = true;
        } else if (playerState.currYtId !== player.getVideoData()['video_id']) {
          player.loadVideoById(playerState.currYtId);
        }
        qs("#music marquee").textContent = qs(".playing").textContent;

      }
    });

    pauseButton.addEventListener("click", function() {
      if (player) {
        player.pauseVideo();
        playerState.playing = false;
      }
    }); 
  }

  function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
      if (!playerState.beenClicked) { // deals with strange bug
        player.playVideo();
        playerState.beenClicked = true;
      }
    } else if (event.data === 0) {
      let next = qs(".playing").nextElementSibling;
      if (!next) {
        next = qs("#playlist li");
      }

      qs(".playing").classList.remove("playing");
      qs("#music marquee").textContent = next.textContent;
      next.classList.add("playing");
      next.scrollIntoView();

      player.loadVideoById(next.dataset["value"])
    }
  }
    
  /** Helper methods */
  function gen(query) {
    return document.createElement(query);
  }
  function qs(id) {
    return document.querySelector(id);
  }
      
  function qsa(query) {
    return document.querySelectorAll(query);
  }

  function id(query) {
    return document.getElementById(query);
  }
})();