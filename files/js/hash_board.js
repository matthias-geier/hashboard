var Util = Util || {};
Util.updateLocation = function() {
  var id = Board.id;
  window.history.pushState({ pageTitle: id }, "hash board: " + id,
    "/board/" + id);
};

var AjaxConnector = AjaxConnector || {};
AjaxConnector.create = function(is_shared) {
  $.ajax("/api/hash_board", {
    type: "PUT",
    data: { created_by: $.cookie('username'), is_shared: !(!is_shared) },
    success: function(data) {
      var json = $.parseJSON(data);
      Board.id = json.id;
      Util.updateLocation();
      Board.parse(json);
      $("#post_content").focus();
    }
  });
};
AjaxConnector.update = function() {
  var data = $("#post").serialize();
  if ($.cookie('username')) {
    data += "&created_by=" + $.cookie('username');
  }
  $.ajax("/api/hash_board", {
    type: "PATCH",
    data: data,
    success: function(data) { Board.entry($.parseJSON(data)); }
  });
};
AjaxConnector.read = function(id, page) {
  if (!page) { page = 0; }
  if (!Board.validId(id)) { console.log("id empty"); return; }
  $.ajax("/api/hash_board", {
    type: "POST",
    data: { id: id, index: page },
    success: function(data) {
      var json = $.parseJSON(data);
      if (json.length === 0) { return; }
      Board.id = json.id;
      if (page === 0 && $("#entries").length === 0) {
        Util.updateLocation();
      }
      Board.parse(json);
      $("#post_content").focus();
    }
  });
};
AjaxConnector.createToken = function() {
  if (!Board.id) { return; }
  $.ajax("/api/token", {
    type: "PUT",
    data: { id: Board.id },
    success: function(data) {
      data = $.parseJSON(data);
      $("#tmp_token").val(window.location.origin + "/token/" + data.token);
    }
  });
};
AjaxConnector.consumeToken = function(token) {
  $.ajax("/api/token", {
    type: "POST",
    data: { token: token },
    success: function(data) {
      Board.id = $.parseJSON(data).id;
      AjaxConnector.read(Board.id);
      Util.updateLocation();
    }
  });
};
AjaxConnector.trending = function() {
  $.ajax("/api/trends", {
    type: "GET",
    success: function(data) {
      var json = $.parseJSON(data);
      Trends.parse(json);
    }
  });
};

var Board = Board || {};
Board.id = undefined;
Board.validId = function(id) {
  return id.match(/^[a-zA-Z0-9]+$/);
};
Board.entry = function(elem) {
  elem.timestamp = elem.timestamp.replace(/[^0-9]/, '');
  var template = "<div class=\"col_9 grey_border\" id=\"{{timestamp}}\">" +
    "<p><i class=\"icon-2x icon-quote-left up\"></i> " +
    "{{&content}} <i class=\"icon-2x icon-quote-right down\"></i></p>" +
    "<p><em class=\"indent\">by {{created_by}} - {{created_on}}</em></p></div>";
  var html = Mustache.render(template, elem);

  if ($("#" + elem.timestamp).length > 0) { return; }
  var older_children = $.grep($("#entries").children(), function(c) {
    return elem.timestamp > $(c).attr('id');
  });
  if (older_children.length > 0) {
    $(older_children[0]).before(html);
  } else {
    $(html).appendTo($("#entries"));
  }
};
Board.parse = function(data) {
  if ($("#entries").length === 0) {
    $("#main").html("");
    var lock_icon = data.shared ? "icon-unlock" : "icon-lock";
    var input = "<div class=\"col_4\">" +
      "<form class=\"col_12 vertical\" id=\"post\">" +
      "<input type=\"hidden\" name=\"id\" value=\"{{id}}\" />" +
      "<textarea id=\"post_content\" name=\"content\" " +
      "placeholder=\"add a post\"></textarea>" +
      "<input type=\"submit\" value=\"post!\" /></form>";
    var token = "<form class=\"col_12 vertical\" id=\"token\">" +
      "<input type=\"text\" id=\"tmp_token\" placeholder=\"" +
      "generate 48h token\" />" +
      "<input type=\"submit\" value=\"generate\" /></form>";
    var trends = "<div id=\"trends\" class=\"col_12\"></div></div>";
    var template = "<div class=\"col_8\"><p>" +
      "<h3 class=\"red_border\">{{id}} <i class=\"red " + lock_icon +
      "\"></i></h3></p>" +
      "<p class=\"bmargin-3\"><em class=\"indent-2x\">" +
      "<strong>by {{created_by}} " +
      "- {{created_on}}</strong></em></p><div id=\"entries\"></div>" +
      "<div class=\"pull center col_9\"><button class=\"large red\">" +
      "<i class=\"icon-magnet\"></i></button></div></div>";
    var html = Mustache.render(input + token + trends + template, data);
    $(html).appendTo("#main");
  }
  if (data.entries) {
    $.each(data.entries, function(i, elem) { Board.entry(elem); });
  }
};

var Trends = Trends || {};
Trends.parse = function(data) {
  $("#trends").html("");
  $.each(data, function(i, elem) {
    var trend = "<p><a href=\"/board/{{id}}\">{{id}}</a></p>";
    var html = Mustache.render(trend, elem);
    $(html).appendTo("#trends");
  });
};

$(document).ready(function() {
  $("#hash_board").click(function(e) {
    $("#main").html("");
    AjaxConnector.create();
    $("#id_hash").val("");
    e.stopImmediatePropagation();
    e.preventDefault();
    return false;
  });
  $("#hash_shared_board").click(function(e) {
    $("#main").html("");
    AjaxConnector.create('shared');
    $("#id_hash").val("");
    e.stopImmediatePropagation();
    e.preventDefault();
    return false;
  });
  $("#hash_search").submit(function(e) {
    $("#main").html("");
    AjaxConnector.read($("#id_hash").val());
    $("#id_hash").val("");
    e.stopImmediatePropagation();
    e.preventDefault();
    return false;
  });
  $("#username").keyup(function(e) {
    $("#username").val($("#username").val().replace(/[^a-zA-Z0-9]/, ''));
    $.cookie('username', $("#username").val(), { path: "/" });
  });
  $("body").delegate("#post", "submit", function(e) {
    $("#post_content").val($("#post_content").val().replace(/<[^>]+>/, ""));
    AjaxConnector.update();
    $("#post_content").val("");
    $("#post_content").focus();
    e.stopImmediatePropagation();
    e.preventDefault();
    return false;
  });
  $("body").delegate("#token", "submit", function(e) {
    AjaxConnector.createToken();
    e.stopImmediatePropagation();
    e.preventDefault();
    return false;
  });
  $("body").delegate("#post_content", "keypress", function(e) {
    if (e.which === 13 && !e.shiftKey) {
      $("#post").submit();
      return false;
    } else { return true; }
  });
  $("body").delegate(".pull", "click", function(e) {
    if (Board.id) {
      var entries = $("#entries").children();
      var page = Math.ceil(entries.length / 10);
      var last_child = entries[entries.length - 1];
      AjaxConnector.read(Board.id, page);
    }
  });

  var url = window.location.pathname;
  var id = undefined;
  var match = url.match(/^\/board\/(.*)$/i);
  var match2 = url.match(/^\/token\/(.*)$/i);
  if (match && Board.validId(match[1])) {
    Board.id = match[1];
  } else if (match2 && Board.validId(match[1])) {
    AjaxConnector.consumeToken(match[1]);
  }

  var reload = function() {
    if (Board.id) { AjaxConnector.read(Board.id) }
    setTimeout(reload, 5000);
  };
  reload();
  var reloadTrends = function() {
    AjaxConnector.trending();
    setTimeout(reloadTrends, 30000);
  }
  setTimeout(reloadTrends, 2000);
  $("#id_hash").focus();
  $("#username").val($.cookie('username'));
});
