async function getTeams() {
  const authToken = localStorage.getItem('authtoken');
  const listvalue = document.getElementById('myteams');
  const response = await axios.get("http://localhost:5000/api/findteam", {
    headers: {
      'auth-token': authToken
    }
  });
  const teams = response.data.data;
  for (var i = 0; i < teams.length; i++) {
    const team = teams[i];
    const tableid = team.tableid;
    const opt = document.createElement('option');
    opt.value = tableid;
    opt.innerHTML = tableid;
    listvalue.appendChild(opt);
  }
}


async function createTeam() {
  const authToken = localStorage.getItem('authtoken');
  const response = await axios.get("http://localhost:5000/api/createteam", {
    headers: {
      'auth-token': authToken
    }
  });
  alert(response.data.teamid);
}