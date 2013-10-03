var clientId = '248017327299';

var apiKey = 'AIzaSyA1TucEclEzMXJpeg9wL6ivbwDDbDPXZeU';

var scopes = 'https://www.googleapis.com/auth/analytics.readonly';

window.onload = function() {
  handleClientLoad();
}

function handleClientLoad() {
  gapi.client.setApiKey(apiKey);
  window.setTimeout(checkAuth,1);
}

function checkAuth() {
  console.log('checking auth')
  gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
}

function handleAuthResult(authResult) {
  console.log('handling auth')
  var authorizeButton = document.getElementById('authorize-button');
  if (authResult && !authResult.error) {
    authorizeButton.style.visibility = 'hidden';
    gapi.client.load('analytics', 'v3', makeApiCall);
  } else {
    authorizeButton.style.visibility = '';
    authorizeButton.onclick = handleAuthClick;
  }
}

function handleAuthClick(event) {
  console.log('manual auth')
  gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
  return false;
}

function makeApiCall() {
  queryAccounts();
}
function handleCoreReportingResults(results) {
  if (results.error) {
    console.log('There was an error querying core reporting API: ' + results.message);
  } else {
    // printResults(results);
    var weeklyButton = document.getElementById('weekly-button'), monthlyButton = document.getElementById('monthly-button'), reloadButton = document.getElementById('reload-button');
    optionsDiv.innerHTML = '<h3 style="margin-bottom:0;">'+results.profileInfo.profileName+'</h3>';
    daysOfYear = results.rows;
    splitData(daysOfYear);
    loadViz(daysOfYear, '#338d8f');
    weeklyButton.className = '';
    monthlyButton.className = '';
    reloadButton.className = '';
  }
}
function handleLiveReportingResults(results){
  if (results.error) {
    console.log('There was an error querying core reporting API: ' + results.message);
  } else {
    printResults(results);
  }
}
function queryAccounts() {
  console.log('Querying Accounts');
  gapi.client.analytics.management.accounts.list().execute(handleAccounts);
}
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
function queryWebproperties(accountId) {
  console.log('Querying Webproperties.');
  gapi.client.analytics.management.webproperties.list({'accountId': accountId}).execute(handleWebproperties);
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
      console.log('No webproperties found for this user.');
      optionsDiv.innerHTML += '<p>No webproperties found for this user.</p>';
    }
  } else {
    console.log('There was an error querying webproperties: ' + results.message);
  }
}
function queryProfiles(accountId, webpropertyId) {
  console.log('Querying Views (Profiles).');
  gapi.client.analytics.management.profiles.list({
      'accountId': accountId,
      'webPropertyId': webpropertyId
  }).execute(handleProfiles);
}
function handleProfiles(results) {
  if (!results.code) {
    if (results && results.items && results.items.length) {
      var appendingList = '<p>Finally, choose a profile</p><ul>';
      for(i=0;i<results.items.length;i++){
        appendingList += '<li><a href="#chosen-profile" onClick="queryCoreReportingApi('+results.items[i].id+')">'+results.items[i].name+'</a></li>';
      }
      appendingList += '<ul>';
      optionsDiv.innerHTML = appendingList;
    } else {
      console.log('No views (profiles) found for this user.');
      optionsDiv.innerHTML += '<p>No views (profiles) found for this user.</p>';
    }
  } else {
    console.log('There was an error querying views (profiles): ' + results.message);
  }
}
function queryCoreReportingApi(profileId){
  console.log('Querying Core Reporting API.');
  var apiQuery = gapi.client.analytics.data.ga.get({
    'ids': 'ga:' + profileId,
    'start-date': moment().subtract('years', 1).format('YYYY[-]MM[-]DD'),
    'end-date': moment().format('YYYY[-]MM[-]DD'),
    'metrics': 'ga:pageViews',
    'dimensions': 'ga:date'
  });
  apiQuery.execute(handleCoreReportingResults);
  // var liveApiQuery = gapi.client.analytics.data.realTime.get({
  //   'ids': 'ga:' + profileId,
  //   'metrics': 'ga:activeVisitors'
  // });
  // liveApiQuery.execute(handleLiveReportingResults);
}
var daysOfYear, monthsOfYear, daysOfWeek, daysOfMonth, weeksOfYear, hoursOfDay, minutesOfHour, secondsOfMinute;
function printResults(results) {
  if (results.rows && results.rows.length) {
    // console.log('View (Profile) Name: ', results.profileInfo.profileName);
    // console.log('Total Pageviews: ', results.rows[0][0]);
    console.log(results)
  } else {
    console.log('No results found');
    optionsDiv.innerHTML += '<p>No results found.</p>';
  }
}