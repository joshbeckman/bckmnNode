var optionsDiv = document.getElementById('options');
function handleAccounts(results) {
  if (!results.code) {
    if (results && results.items && results.items.length) {
      var appendingList = '<p>Choose an account</p><ul>';
      for(i=0;i<results.items.length;i++){
        appendingList += '<li><a href="#chosen-account" onClick="queryWebproperties('+results.items[i].id+')">'+results.items[i].name+'</a></li>';
      }
      appendingList += '<ul>';
      optionsDiv.innerHTML = appendingList;
    } else {
      console.log('No accounts found for this user.')
      optionsDiv.innerHTML += '<p>No accounts found for this user.</p>';
    }
  } else {
    console.log('There was an error querying accounts: ' + results.message);
  }
}
function handleWebproperties(results) {
  if (!results.code) {
    if (results && results.items && results.items.length) {
      var appendingList = '<p>Choose a web property</p><ul>';
      for(i=0;i<results.items.length;i++){
        appendingList += '<li><a href="#chosen-property" onClick="queryProfiles(\''+results.items[i].accountId+'\',\''+results.items[i].id+'\')">'+results.items[i].name+'</a></li>';
      }
      appendingList += '<ul>';
      optionsDiv.innerHTML = appendingList;
      document.getElementById('reload-button').className = '';
    } else {
      console.log('No webproperties found for this account.');
      optionsDiv.innerHTML += '<p>No webproperties found for this account.</p>';
    }
  } else {
    console.log('There was an error querying webproperties: ' + results.message);
  }
}
function handleProfiles(results) {
  if (!results.code) {
    if (results && results.items && results.items.length) {
      var appendingList = '<p>Finally, choose a profile</p><ul>';
      for(i=0;i<results.items.length;i++){
        appendingList += '<li><a href="#chosen-profile" onClick="addProfile('+results.items[i].id+',\''+results.items[i].name+'\')">'+results.items[i].name+'</a></li>';
      }
      appendingList += '<ul>';
      optionsDiv.innerHTML = appendingList;
    } else {
      console.log('No views (profiles) found for this account.');
      optionsDiv.innerHTML += '<p>No views (profiles) found for this account.</p>';
    }
  } else {
    console.log('There was an error querying views (profiles): ' + results.message);
  }
}
function handleLiveReportingResults(results){
  if (results.error) {
    console.log('There was an error querying core reporting API: ' + results.message);
  } else {
    // var el = document.getElementById(results.profileInfo.profileId.toString()+'-counter');
    // el.innerHTML = (results.rows ? results.rows[0][0] : 0);
    pushResults(results);
  }
}
function addProfile (profile, profileName) {
  var rb = document.getElementById('reload-button');
  rb.innerHTML = 'Add Profile';
  rb.onclick = function() { queryAccounts(); };
  optionsDiv.innerHTML = null;
  document.getElementById('counters').innerHTML += '<div class="pure-u-1-4"><div class="borders" style="border-color:'+color(siteBeat.profileList.length)+';"><h2 class="live-name">'+profileName+'</h2></div><div class="live-counter" style="background-color:'+color(siteBeat.profileList.length)+';"><span id="'+profile.toString()+'-counter" class="odometer odometer-theme-default">0</span></div></div>';
  if (siteBeat.profileList.indexOf) {
    if (siteBeat.profileList.indexOf(profile) == -1) {
      siteBeat.profileList.push(profile);
      siteBeat.counterList.push(new Odometer({el: document.getElementById(profile.toString()+'-counter'), value: 0}));
    }
  } else {
    siteBeat.profileList.push(profile);
    siteBeat.counterList.push(new Odometer({el: document.getElementById(profile.toString()+'-counter'), value: 0}));
  }
  if (siteBeat.running == false) {
    runnable();
  }
  if (siteBeat.profileList.length == siteBeat.data.length) {
    rb.style.display = 'none';
  }
}
function pushResults (results) {
  var position = 0;
  for (i = 0; i < siteBeat.data.length; i++) {
    if (siteBeat.data[i][59].profileId == results.profileInfo.profileId) {
      position = i;
      pusher(position, results);
      return;
    } else if (siteBeat.data[i][59].profileId == '') {
      position = i;
      pusher(position, results);
      return;
    }
  }
}
function pusher (position, results) {
  var count = (results.rows ? results.rows[0][0] : 0);
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
  siteBeat.counterList[position].update(count);
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
  delay: 3000,
  counterList: []
};
var x = d3.scale.linear()
    .domain([1, siteBeat.data[0].length - 2])
    .range([0, window.innerWidth]),
  y = d3.scale.linear()
    .domain([0, d3.max(siteBeat.data, function(d){ return d.value})])
    .rangeRound([0, h]),
  line = d3.svg.line()
    .x(function(d,i) {
      return x(i);
    })
    .y(function(d) {
      return h - y(d.value) - .5;
    }).interpolate("basis"),
  w = window.innerWidth/siteBeat.data[0].length,
  h = window.innerHeight/2,
  // color = d3.scale.linear()
  //   .domain([0, siteBeat.data.length - 1])
  //   .range(["#030208", "#4d45c1"]),
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

    setInterval(function() {
      for (i = 0; i < siteBeat.profileList.length; i++) {
        queryLiveReportingApi(siteBeat.profileList[i]);
      }
      redraw();
      d3.timer.flush(); // avoid memory leak when in background tab
    }, siteBeat.delay);
  },
  redraw = function () {
    y = d3.scale.linear()
      .domain([0, 1 + parseInt(d3.max(siteBeat.data, function(dat){ return d3.max(dat, function(d) {return parseInt(d.value);}); }))])
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