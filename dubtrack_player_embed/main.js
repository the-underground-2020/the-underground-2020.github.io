var firetable = {
  started: false,
  uid: null,
  playdex: 0,
  users: {},
  queue: false,
  preview: false,
  song: null,
  scSeek: false,
  ytLoaded: null,
  scLoaded: null,
  selectedListThing: "0",
  queueBind: null,
  songTagToEdit: null,
  scwidget: null,
  searchSelectsChoice: 1,
  importSelectsChoice: 1,
  queueRef: null,
  lastChatPerson: false,
  lastChatId: false,
  nonpmsg: true,
  playlimit: 2
}

firetable.version = "00.00.03";
var player;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('playerArea', {
    width: 600,
    height: 400,
    videoId: '0',
    events: {
      onReady: initialize
    }
  });
}

function initialize(event) {
  firetable.ytLoaded = true;
  var vol = localStorage["widgetFiretableVol"];
  if (typeof vol == "undefined") {
    vol = 80;
    localStorage["widgetFiretableVol"] = 80;
  }
    player.setVolume(vol);

  var muted = localStorage["widgetFiretableMute"];
  if (typeof muted == "undefined"){
    localStorage["widgetFiretableMute"] = false;
    muted = "false";
  }

  if (muted != "false"){
    var icon = "&#xE04E;";
    $("#volstatus").html(icon);

  }

  $("#slider").slider({
    orientation: "horizontal",
    range: "min",
    min: 0,
    max: 100,
    value: vol,
    step: 5,
    slide: function(event, ui) {
      player.setVolume(ui.value);
      firetable.scwidget.setVolume(ui.value);
      localStorage["widgetFiretableVol"] = ui.value;
      var muted = localStorage["widgetFiretableMute"];
      if (muted != "false"){
        localStorage["widgetFiretableMute"] = false;
        var icon = "&#xE050;";
        $("#volstatus").html(icon);
      } else if (ui.value == 0){
        firetable.actions.muteToggle(true);
      }
    }
  });
  $("#playerArea").toggle();
  if (firetable.song) {
    var data = firetable.song;
    var nownow = Date.now();
    var timeSince = nownow - data.started;
    var secSince = Math.floor(timeSince / 1000);
    var timeLeft = data.duration - secSince;
    if (data.type == 1) {
      if (!firetable.preview) {
        player.loadVideoById(data.cid, secSince, "large")
      }
    }
  }


}

function onPlayerStateChange(event) {
  //state changed thanks
}

firetable.init = function() {
    console.log("Yo sup welcome to firetable my name is chris rohn.")
    firetable.started = true;
    var config = {
      apiKey: "AIzaSyDdshWtOPnY_0ACt6uJKmcI_qPpTfO4sJ4",
      authDomain: "firetable-e10fd.firebaseapp.com",
      databaseURL: "https://firetable-e10fd.firebaseio.com"
    };
    var height = $(window).height(); // New height
    if (height > 690) {
      var morethan = height - 690;
      var newh = 315 + morethan;
      var chah = 578 + morethan;
      $("#queuelist").css("height", newh + "px");
      $("#userslist").css("height", newh + "px");
      $("#actualChat").css("height", chah + "px");
    } else {
      $("#queuelist").css("height", "315px");
      $("#userslist").css("height", "315px");
      $("#actualChat").css("height", "578px");

    }
    $(window).resize(function() {
      // This will execute whenever the window is resized
      var height = $(window).height(); // New height
      if (height > 690) {
        var morethan = height - 690;
        var newh = 315 + morethan;
        var chah = 578 + morethan;
        $("#queuelist").css("height", newh + "px");
        $("#userslist").css("height", newh + "px");
        $("#actualChat").css("height", chah + "px");
      } else {
        $("#queuelist").css("height", "315px");
        $("#userslist").css("height", "315px");
        $("#actualChat").css("height", "578px");

      }
    });
    var widgetIframe = document.getElementById('sc-widget');
    firetable.scwidget = SC.Widget(widgetIframe);
    firetable.scwidget.bind(SC.Widget.Events.READY, function() {
      firetable.scwidget.bind(SC.Widget.Events.PLAY, function() {
        var vol = localStorage["widgetFiretableVol"];
        if (!vol) {
          vol = 80;
          localStorage["widgetFiretableVol"] = 80;
        }
        firetable.scwidget.setVolume(vol);
        if (firetable.scSeek) firetable.scwidget.seekTo(firetable.scSeek);
      });
      if (firetable.song) {
        var data = firetable.song;
        var nownow = Date.now();
        var timeSince = nownow - data.started;
        var secSince = Math.floor(timeSince / 1000);
        var timeLeft = data.duration - secSince;
        if (data.type == 2) {
          if (!firetable.preview) {
            firetable.scSeek = timeSince;
            firetable.scwidget.load("http://api.soundcloud.com/tracks/"+data.cid, { auto_play: true});
          }
        }
      }
      firetable.scLoaded = true;
    });


    firebase.initializeApp(config);
    SC.initialize({
      client_id: "27028829630d95b0f9d362951de3ba2c"
    });
    firebase.auth().onAuthStateChanged(function(user) {
      console.log("fired");
      if (user) {
          console.log("YR LOGGED IN");
          firetable.uid = user.uid;
          if (firetable.users[firetable.uid]) {
            if (firetable.users[firetable.uid].username) {
              $("#yrname").text(firetable.users[firetable.uid].username);
            } else {
              $("#yrname").text(user.uid);
            }
          } else {
            $("#yrname").text(user.uid);
          }
      }
      firetable.ui.init();


    });
    };

    firetable.actions = {

      muteToggle: function(zeroMute){

        var muted = localStorage["widgetFiretableMute"];
        var icon = "&#xE050;";
        console.log(muted);
        if (zeroMute){
          icon = "&#xE04E;";
          muted = 0;

        } else if (typeof muted !== 'undefined') {
        if (muted != "false"){

          if (muted == 0){
                $("#slider").slider("value",80);
                player.setVolume(80);
                firetable.scwidget.setVolume(80);
                localStorage["widgetFiretableVol"] = 80;
              } else {
                muted = parseInt(muted);
                $("#slider").slider("value",muted);
                player.setVolume(muted);
                firetable.scwidget.setVolume(muted);
                localStorage["widgetFiretableVol"] = muted;
              }
            muted = false;
        } else {
          icon = "&#xE04E;";

          muted = $("#slider").slider("value");
          $("#slider").slider('value',0);
          player.setVolume(0);
          firetable.scwidget.setVolume(0);
          localStorage["widgetFiretableVol"] = 0;

        }
      } else {
        icon = "&#xE04E;";

        muted = $("#slider").slider("value");
        $("#slider").slider('value',0);
        player.setVolume(0);
        firetable.scwidget.setVolume(0);
        localStorage["widgetFiretableVol"] = 0;
      }


        $("#volstatus").html(icon);
        localStorage["widgetFiretableMute"] = muted;
      },

      uidLookup: function(name) {
        var match = false;
        var usrs = firetable.users;
        for (var key in usrs) {
          if (usrs.hasOwnProperty(key)) {
            if (firetable.users[key].username) {
              if (firetable.users[key].username == name) {
                match = key;
              }
            }
          }
        }
        if (!match && firetable.users[name]) match = name;
        return match;
      },
      grab: function() {
        if (firetable.song.cid != 0) {
          var title = firetable.song.artist + " - " + firetable.song.title;
          firetable.actions.queueTrack(firetable.song.cid, title, firetable.song.type);
          $("#grab").addClass("grabbed");
        }
      }
    };

    firetable.utilities = {
      htmlEscape: function(s, preserveCR) {
        preserveCR = preserveCR ? '&#13;' : '\n';
        return ('' + s) /* Forces the conversion to string. */
        .replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
        .replace(/'/g, '\\&apos;') /* The 4 other predefined entities, required. */
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        /*
        You may add other replacements here for HTML only
        (but it's not necessary).
        Or for XML, only if the named entities are defined in its DTD.
        */
        .replace(/\r\n/g, preserveCR) /* Must be before the next replacement. */
        .replace(/[\r\n]/g, preserveCR);
        ;
      },
      format_date: function(d) {

        var date = new Date(d);

        var month = date.getMonth() + 1;
        var day = date.getDate();
        var year = date.getFullYear();

        var formatted_date = month + "-" + day + "-" + year;
        return formatted_date;
      },
      format_time: function(d) {

        var date = new Date(d);

        var hours1 = date.getHours();
        var ampm = "am";
        var hours = hours1;
        if (hours1 > 12) {
          ampm = "pm";
          hours = hours1 - 12;
        }
        if (hours == 0) hours = 12;
        var minutes = date.getMinutes();
        var min = "";
        if (minutes > 9) {
          min += minutes;
        } else {
          min += "0" + minutes;
        }
        return hours + ":" + min + "" + ampm;
      }
    };

    firetable.ui = {
      textToLinks: function(text) {

        var re = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return text.replace(re, "<a href=\"$1\" target=\"_blank\">$1</a>");
      },
      init: function() {
        var ref2 = firebase.database().ref("users");
        ref2.on('value', function(dataSnapshot) {
          var okdata = dataSnapshot.val();
          var first1 = false;
          if (jQuery.isEmptyObject(firetable.users)){
            first1 = true;
          }
          firetable.users = okdata;
          if (first1){
            var s2p = firebase.database().ref("songToPlay");
            s2p.on('value', function(dataSnapshot) {
              var data = dataSnapshot.val();

              $("#timr").countdown("destroy");
              $("#track").text(data.title);
              $("#artist").text(data.artist);
              var nownow = Date.now();
              var timeSince = nownow - data.started;
              var secSince = Math.floor(timeSince / 1000);
              var timeLeft = data.duration - secSince;
              firetable.song = data;
              if (!firetable.users[firetable.uid].status){
                $("#volplace").css("display","block");
                $("#noaudiomsg").css("display", "none");
                if (data.type == 1 && firetable.ytLoaded) {
                  if (!firetable.preview) {
                    if (firetable.scLoaded) firetable.scwidget.pause();
                    player.loadVideoById(data.cid, secSince, "large");
                  }
                } else if (data.type == 2 && firetable.scLoaded) {
                  if (!firetable.preview) {
                    if (firetable.ytLoaded) player.stopVideo();
                    firetable.scSeek = timeSince;
                    firetable.scwidget.load("http://api.soundcloud.com/tracks/"+data.cid, { auto_play: true});
                  }
                }
              } else {
                console.log("YR LOGGED IN. NO AUDIO THANKS.");
                $("#volplace").css("display","none");
                $("#noaudiomsg").css("display", "block");
              }
              if (data.cid != 0) {
                var nicename = data.djid;
                if (firetable.users[data.djid]) {
                  if (firetable.users[data.djid].username) nicename = firetable.users[data.djid].username;
                }

              }
              $("#timr").countdown({
                until: timeLeft,
                compact: true,
                description: "",
                format: "MS"
              });
            });
          }
          if ($("#yrname").text() == firetable.uid) {
            if (firetable.users[firetable.uid]) {
              if (firetable.users[firetable.uid].username) $("#yrname").text(firetable.users[firetable.uid].username);
            }
          }
          var newlist = "";
          var count = 0;
          for (var key in okdata) {
            if (okdata.hasOwnProperty(key)) {
              var thisone = okdata[key];
              var utitle = "";

              if (thisone.status || key == firetable.uid) {
                //THIS PERSON IS HERE
                var thename = key;
                count++;
                if (firetable.users[key]) {
                  if (firetable.users[key].mod) utitle = "cop";
                  if (firetable.users[key].supermod) utitle = "supercop";
                  if (firetable.users[key].username) thename = firetable.users[key].username;
                }
                newlist += "<div class=\"prson\">" + thename + " <span class=\"utitle\">" + utitle + "</span></div>";
              }
            }
          }
          $("#allusers").html(newlist);
          $("#label1").text("Users (" + count + ")");
          console.log(okdata);
        });

        var tbl = firebase.database().ref("table");
        tbl.on('value', function(dataSnapshot) {
          var data = dataSnapshot.val();
          var ok1 = "";
          if (data) {
            var countr = 0;
            for (var key in data) {
              if (data.hasOwnProperty(key)) {
                ok1 += "<div id=\"spt" + countr + "\" class=\"spot\"><div class=\"djname\">" + data[key].name + "</div><div class=\"avtr\" id=\"avtr"+countr+"\" style=\"background-repeat: no-repeat; background-position: bottom 18px center; background-image: url(https://robohash.org/" + data[key].id + "" + data[key].name + ".png?size=71x71);\"></div><div id=\"djthing" + countr + "\" class=\"playcount\">" + data[key].plays + "/<span id=\"plimit" + countr + "\">" + firetable.playlimit + "</span></div></div> ";
                countr++;
              }
            }
            if (countr < 4) {
              ok1 += "<div class=\"spot\"><div class=\"djname\"><strong>EMPTY seat!</strong> <br/>DJ @ firetable.org</div><div class=\"playcount\"></div></div> ";
              countr++;
              for (var i = countr; i < 4; i++) {
                ok1 += "<div class=\"spot\"><div class=\"playcount\"></div></div> ";
              }
            }

          } else {
            ok1 += "<div class=\"spot\"><div class=\"djname\"><strong>EMPTY seat!</strong><br/>DJ @ firetable.org</div><div class=\"playcount\"></div></div> ";
            for (var i = 0; i < 3; i++) {
              ok1 += "<div class=\"spot\"><div class=\"playcount\"></div></div> ";
            }
          }
          $("#deck").html(ok1);
          for (var i = 0; i < 4; i++) {
            if (i != firetable.playdex) {
              $("#djthing" + i).css("background-color", "#999");
              $("#djthing" + i).css("color", "#000");
              $("#avtr" + i).css("animation", "none");

            } else {
              $("#djthing" + i).css("background-color", "#F4810B");
              $("#djthing" + i).css("color", "#fff");
              $("#avtr" + i).css("animation", "MoveUpDown 1s linear infinite");
            }
          }
        });
        var pldx = firebase.database().ref("playdex");
        pldx.on('value', function(dataSnapshot) {
          var data = dataSnapshot.val();
          firetable.playdex = data;
          for (var i = 0; i < 4; i++) {
            if (i != data) {
              $("#djthing" + i).css("background-color", "#999");
              $("#djthing" + i).css("color", "#000");
              $("#avtr" + i).css("animation", "none");

            } else {
              $("#djthing" + i).css("background-color", "#F4810B");
              $("#djthing" + i).css("color", "#fff");
              $("#avtr" + i).css("animation", "MoveUpDown 1s linear infinite");

            }
          }
        });
        var plc = firebase.database().ref("playlimit");
        plc.on('value', function(dataSnapshot) {
          var data = dataSnapshot.val();
          firetable.playlimit = data;
          for (var i = 0; i < 4; i++) {
            $("#plimit" + i).text(data);
          }
        });




        $("#volstatus").bind("click", function() {
          firetable.actions.muteToggle();
        });

        $(function() {
            $('#upperpart').css({
                'position' : 'absolute',
                'left' : '50%',
                'top' : '50%',
                'margin-left' : function() {return -$(this).outerWidth()/2},
                'margin-top' : function() {return -$(this).outerHeight()/2}
            });
        });



      }
    }

    if (!firetable.started) firetable.init();
