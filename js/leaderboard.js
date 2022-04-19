// First get record data from the server
// Render record into a table
// Send table to frontend 



async function renderLeaderboard() {
  const authToken = localStorage.getItem('authtoken');
  if (!authToken) {
    window.location.href = './login.html'
  }
  const leaderBoardType = document.getElementById('leaderboardType');
  const date = document.getElementById('date');
  const table = document.getElementById('table-body');
  var fc = table.firstChild;
  while (fc) {
    table.removeChild(fc);
    fc = table.firstChild;
  }
  const response = await axios.post('http://localhost:5000/api/leaderboard', {
    "leaderBoardType": leaderBoardType.value,
    "date": date.value
  }, {
    headers: {
      'auth-token': authToken
    }
  });
  const records = response.data.records;
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const tr = document.createElement('tr');
    const td1 = document.createElement('td');
    const td2 = document.createElement('td');
    const td3 = document.createElement('td');
    td1.innerHTML = i + 1;
    td2.innerHTML = record.username;
    if (leaderBoardType.value === 'local') {
      td3.innerHTML = record.dayHighest;
    }
    else {
      td3.innerHTML = record.highscore;
    }
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    table.appendChild(tr);
  }
};