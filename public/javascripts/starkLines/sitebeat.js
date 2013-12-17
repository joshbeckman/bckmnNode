var clientId = '248017327299';

var apiKey = 'AIzaSyA1TucEclEzMXJpeg9wL6ivbwDDbDPXZeU';

var scopes = 'https://www.googleapis.com/auth/analytics.readonly';

window.onload = function() {
  handleClientLoad();
};

function handleClientLoad() {
  gapi.client.setApiKey(apiKey);
  window.setTimeout(checkAuth,1);
}

function checkAuth() {
  // console.log('checking auth')
  gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
}

function handleAuthResult(authResult) {
  // console.log('handling auth')
  var authorizeButton = document.getElementById('authorize-button');
  if (authResult && !authResult.error) {
    if (authorizeButton) {
      authorizeButton.style.visibility = 'hidden';
    }
    gapi.client.load('analytics', 'v3', makeApiCall);
  } else {
    if (authorizeButton) {
      authorizeButton.style.visibility = '';
      authorizeButton.onclick = handleAuthClick;
    }
  }
}

function handleAuthClick(event) {
  // console.log('manual auth')
  gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
  return false;
}

function makeApiCall() {
  queryAccounts();
}
function queryAccounts() {
  // console.log('Querying Accounts');
  gapi.client.analytics.management.accounts.list().execute(handleAccounts);
}
function queryWebproperties(accountId) {
  // console.log('Querying Webproperties.');
  gapi.client.analytics.management.webproperties.list({'accountId': accountId}).execute(handleWebproperties);
}
function queryProfiles(accountId, webpropertyId) {
  // console.log('Querying Views (Profiles).');
  gapi.client.analytics.management.profiles.list({
      'accountId': accountId,
      'webPropertyId': webpropertyId
  }).execute(handleProfiles);
}
function queryLiveReportingApi(profileId){
  // console.log('Querying Live Reporting API.');
  var liveApiQuery = gapi.client.analytics.data.realtime.get({
    'ids': 'ga:' + profileId,
    'metrics': 'ga:activeVisitors',
    'dimensions': 'ga:pageTitle'
  });
  liveApiQuery.execute(handleLiveReportingResults);
}
function printResults(results) {
  if (results.rows && results.rows.length) {
    console.log(results);
  } else {
    console.log('No results found for ', results.profileInfo.profileName);
  }
}
var optionsDiv = document.getElementById('options');
function handleAccounts(results) {
  if (!results.code) {
    if (results && results.items && results.items.length) {
      var appendingList = '<p>Choose an account</p><ul>';
      for(i=0;i<results.items.length;i++){
        appendingList += '<li><a href="#chosen-account" onClick="queryWebproperties('+results.items[i].id+')">'+results.items[i].name+'</a></li>';
      }
      appendingList += '<ul><p><small>Or, you can drag and drop a Stark Lines configuration file anywhere on this page.<br><a href="http://www.bckmn.com/blog/even-starker-lines" target="_blank">You can read more here.</a></small></p>';
      optionsDiv.innerHTML = appendingList;
    } else {
      console.log('No accounts found for this user.');
      optionsDiv.innerHTML += '<p>No accounts found for this user.</p>';
    }
  } else {
    alert('There was an error querying accounts: ' + results.message);
  }
}
function handleWebproperties(results) {
  if (!results.code) {
    if (results && results.items && results.items.length) {
      var appendingList = '<p>Choose a web property</p><ul>';
      for(i=0;i<results.items.length;i++){
        appendingList += '<li><a href="#chosen-property" onClick="queryProfiles(\''+results.items[i].accountId+'\',\''+results.items[i].id+'\')">'+results.items[i].name+'</a></li>';
      }
      appendingList += '<ul><small>Or, you can drag and drop a Stark Lines configuration file anywhere on this page.<br><a href="http://www.bckmn.com/blog/even-starker-lines" target="_blank">You can read more here.</a></small></p>';
      optionsDiv.innerHTML = appendingList;
      document.getElementById('reload-button').className = '';
    } else {
      console.log('No webproperties found for this account.');
      optionsDiv.innerHTML += '<p>No webproperties found for this account.</p>';
    }
  } else {
    alert('There was an error querying webproperties: ' + results.message);
  }
}
function handleProfiles(results) {
  if (!results.code) {
    if (results && results.items && results.items.length) {
      var appendingList = '<p>Finally, choose a profile</p><ul>';
      for(i=0;i<results.items.length;i++){
        appendingList += '<li><a href="#chosen-profile" onClick="addProfile('+results.items[i].id+',\''+results.items[i].name+'\')">'+results.items[i].name+'</a></li>';
      }
      appendingList += '<ul><p><small>Or, you can drag and drop a Stark Lines configuration file anywhere on this page.<br><a href="http://www.bckmn.com/blog/even-starker-lines" target="_blank">You can read more here.</a></small></p>';
      optionsDiv.innerHTML = appendingList;
    } else {
      console.log('No views (profiles) found for this account.');
      optionsDiv.innerHTML += '<p>No views (profiles) found for this account.</p>';
    }
  } else {
    alert('There was an error querying views (profiles): ' + results.message);
  }
}
function handleLiveReportingResults(results){
  if (results.error) {
    alert('There was an error querying core reporting API: ' + results.message);
    clearInterval(siteBeat.runningInterval);
  } else {
    pushResults(results);
  }
}
function handleDownloadCreation() {
  window.URL = window.URL || window.webkitURL;
  var content = JSON.stringify(window.siteBeat.profileList),
      blob = new Blob([content], {type: 'application/json'}),
      link = document.getElementById('download-button'),
      d = new Date();
  link.style.visibility = 'visible';
  link.href = window.URL.createObjectURL(blob);
  link.download = ['stark_lines_config_',
                   d.getFullYear().toString(), '_',
                   (d.getMonth() + 1).toString(), '_',
                   d.getDate().toString(),
                   '.json'].join('');
}
function addProfile (profile, profileName) {
  var rb = document.getElementById('reload-button'),
      counters = document.getElementById('counters'),
      oldIndex = counters.children.length;
  rb.innerHTML = 'Add Profile';
  rb.onclick = function() { queryAccounts(); };
  optionsDiv.innerHTML = null;
  counters.innerHTML += '<div class="pure-u-1-5"><span style="float:right;display:none;cursor:pointer;">X</span><a target="_blank" id="'+profile.toString()+'-link"><div class="borders" style="border-color:'+color(siteBeat.profileList.length)+';"><h2 class="live-name">'+profileName+'</h2></div><div class="live-counter" style="background-color:'+color(siteBeat.profileList.length)+';"><span id="'+profile.toString()+'-counter" class="odometer odometer-theme-default">0</span></div><small class="live-top" id="'+profile.toString()+'-top"></small></a></div>';
  counters.children[oldIndex].onmouseover = function() {
    this.children[0].style.display = 'inline';
  };
  counters.children[oldIndex].onmouseout = function() {
    this.children[0].style.display = 'none';
  };
  counters.children[oldIndex].children[0].onclick = function(ev) {
    var resp = confirm('Remove this profile?');
    if (resp === true) {
      var pos = [].indexOf.call(this.parentNode.parentNode.children, this.parentNode);
      siteBeat.profileList.splice(pos, 1);
      siteBeat.data[pos] = d3.range(60).map(window.initial);
      siteBeat.allData[pos] = d3.range(60).map(window.initial);
      this.parentNode.parentNode.removeChild(this.parentNode);
    }
  };
  if (siteBeat.profileList.indexOf) {
    if (siteBeat.profileList.indexOf(profile) == -1) {
      siteBeat.profileList.push({id: profile, name: profileName});
    }
  } else {
    siteBeat.profileList.push({id: profile, name: profileName});
  }
  if (siteBeat.running === false) {
    runnable();
  }
  if (siteBeat.profileList.length == siteBeat.data.length) {
    rb.style.display = 'none';
  }
  setTimeout(handleDownloadCreation, 1);
}
function pushResults (results) {
  var position = 0;
  for (i = 0; i < siteBeat.data.length; i++) {
    if (siteBeat.data[i][59].profileId == results.profileInfo.profileId) {
      position = i;
      pusher(position, results);
      return;
    } else if (siteBeat.data[i][59].profileId === '') {
      position = i;
      pusher(position, results);
      return;
    }
  }
}
function pusher (position, results) {
  if (results.rows) {
    results.rows.sort(function(a,b) {
      return parseInt(b[1], 10) - parseInt(a[1], 10);
    });
  }
  var count = (results.rows ? d3.sum(results.rows, function(d) { return parseInt(d[1], 10); }) : 0);
  var el = document.getElementById(results.profileInfo.profileId.toString()+'-counter');
  el.innerHTML = count;
  el = document.getElementById(results.profileInfo.profileId.toString()+'-top');
  if (results.rows) {
    el.innerHTML = results.rows[0][0].substring(0,40) + '... ' + results.rows[0][1];
  } else {
    el.innerHTML = '';
  }
  el = document.getElementById(results.profileInfo.profileId.toString()+'-link');
  if (!el.href) {
    el.href = 'https://www.google.com/analytics/web/?hl=en#realtime/rt-overview/a'+results.profileInfo.accountId.toString()+'w'+results.profileInfo.internalWebPropertyId.toString()+'p'+results.profileInfo.profileId.toString();
  }
  siteBeat.data[position].shift();
  siteBeat.data[position].push({
    time: (new Date()).getTime(),
    value: count,
    profileName: results.profileInfo.profileName,
    profileId: results.profileInfo.profileId
  });
  siteBeat.allData[position].push({
    time: (new Date()).getTime(),
    value: count,
    profileName: results.profileInfo.profileName,
    profileId: results.profileInfo.profileName
  });
}
var initial = function () {
    return {
      time: (new Date()).getTime(),
      value: 0,
      profileName: '',
      profileId: ''
    };
  };
window.siteBeat = {
  data: d3.range(30).map(function(){return d3.range(60).map(initial);}),
  allData: d3.range(30).map(function(){return [];}),
  profileList: [],
  running: false,
  delay: 10000,
  counterList: [],
  runningInterval: null
};
var x = d3.scale.linear()
    .domain([1, siteBeat.data[0].length - 2])
    .range([0, window.innerWidth]),
  y = d3.scale.linear()
    .domain([0, d3.max(siteBeat.data, function(d){ return d.value;})])
    .rangeRound([0, h]),
  line = d3.svg.line()
    .x(function(d,i) {
      return x(i);
    })
    .y(function(d) {
      return h - y(d.value) - 0.5;
    }).interpolate("basis"),
  w = window.innerWidth/siteBeat.data[0].length,
  h = window.innerHeight/2,
  color = function (int) {
    return ['#00A0B0','#6A4A3C','#CC333F','#EB6841','#EDC951','#3B2D38','#F02475','#F27435','#CFBE27','#BCBDAC', '#413E4A', '#73626E', '#B38184', '#F0B49E', '#F7E4BE', '#8C2318', '#5E8C6A', '#88A65E', '#BFB35A', '#F2C45A'][int];
  },
  chart = d3.select("#graph1").append("svg")
    .attr("class", "chart")
    .attr("width", w * siteBeat.data[0].length - 1)
    .attr("height", h),
  divvy = d3.select("#divvy"),
  runnable = function () {
    siteBeat.running = true;

    for (i = 0; i < siteBeat.data.length; i++) {
      chart.append("path")
        .attr("id", "myPath"+i.toString())
        .attr("stroke", color(i))
        .attr("stroke-width", 3)
        .attr("fill", "none")
        .attr("d", line(siteBeat.data[i]));
    }
    for (i = 0; i < siteBeat.profileList.length; i++) {
      setTimeout(queryLiveReportingApi, 110, siteBeat.profileList[i].id);
    }
    redraw();
    siteBeat.runningInterval = setInterval(function() {
      for (i = 0; i < siteBeat.profileList.length; i++) {
        setTimeout(queryLiveReportingApi, 110, siteBeat.profileList[i].id);
      }
      redraw();
      d3.timer.flush(); // avoid memory leak when in background tab
    }, siteBeat.delay);
  },
  redraw = function () {
    y = d3.scale.linear()
      .domain([0, 1 + parseInt(d3.max(siteBeat.data, function(dat){ return d3.max(dat, function(d) {return parseInt(d.value, 10);}); }), 10)])
      .rangeRound([0, h]);
    for (i = 0; i < siteBeat.data.length; i++) {
      chart.selectAll("#myPath"+i.toString())
        .attr("d", line(siteBeat.data[i]))
        .attr("transform", "translate(" + x(1) + ")")
        .transition()
        .ease('linear')
        .duration(siteBeat.delay - 50)
        .attr("transform", "translate(" + x(0) + ")");
    }
  };
// dnd interface and loading
(function initializeDnd() {
  function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }
  function loadFileProfiles(profileArray) {
    var i = 0,
        length = profileArray.length;
    window.siteBeat.profileList = [];
    window.siteBeat.data = d3.range(30).map(function(){return d3.range(60).map(window.initial);});
    window.siteBeat.allData = d3.range(30).map(function(){return [];});
    document.getElementById('counters').innerHTML = null;
    for (; i < length; i++){
      addProfile(profileArray[i].id, profileArray[i].name);
    }
  }
  function handleJSONDrop(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      var files = evt.dataTransfer.files,
          i = 0,
          f;
      for (; i < files.length; i++) {
        f = files[i];
        if (!f.type.match('application/json')) {
          alert('You\'re gonna need to upload a valid JSON file to configure this baby!\nCurrently, you are uploading a file of type "'+f.type.toString()+'."');
          continue;
        }

        var reader = new FileReader();

        reader.onload = (function(theFile) {
          return function(e) {
            var result = JSON.parse(e.target.result);
            loadFileProfiles(result);
          };
        })(f);

        reader.readAsText(f);
      }
    } else {
      alert('Javascript File APIs are not fully supported in this here browser.\n Ya\'ll have to manually add profiles!');
    }
  }
  var dropZone = document.getElementsByTagName('body')[0];
  dropZone.addEventListener('dragover', handleDragOver, false);
  dropZone.addEventListener('drop', handleJSONDrop, false);
})();
