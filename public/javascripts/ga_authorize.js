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
    'metrics': 'ga:activeVisitors'
  });
  liveApiQuery.execute(handleLiveReportingResults);
}
function printResults(results) {
  if (results.rows && results.rows.length) {
    console.log(results)
  } else {
    console.log('No results found for ', results.profileInfo.profileName);
  }
}