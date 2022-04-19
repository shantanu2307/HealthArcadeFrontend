const username = document.getElementById('username');
const name = document.getElementById('name');
const highscore = document.getElementById('highscore');
const userIcon = document.getElementById('userIcon');
const submit = document.getElementById('submit');

submit.addEventListener("click", function (event) {
  event.preventDefault();
  submitLogout();
});


function submitLogout() {
  localStorage.removeItem('authtoken');
  window.location.href = './login.html';
}

async function getUserData() {
  const authToken = localStorage.getItem('authtoken');
  try {
    const response = await axios.get('http://localhost:5000/api/user', {
      headers: {
        'auth-token': authToken
      }
    });
    const user = response.data[0];
    username.innerHTML = user.username;
    name.innerHTML = user.name;
    highscore.innerHTML = user.highscore;
    userIcon.style.backgroundImage = `url('https://ui-avatars.com/api/?name=${user.username}')`;

  } catch (error) {
    window.location.href = './login.html';
  }
}