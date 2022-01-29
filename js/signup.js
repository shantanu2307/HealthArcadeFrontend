const username = document.getElementById('username');
const password = document.getElementById('password');
const name = document.getElementById('name');
const submit = document.getElementById('submit');

submit.addEventListener("click", function (event) {
  event.preventDefault();
  submitSignup();
});

async function submitSignup() {
  try {
    const response = await axios.post('http://localhost:5000/api/signup', {
      username: username.value,
      password: password.value,
      name: name.value
    });
    if (response.status === 200) {
      localStorage.setItem('authtoken', response.data.authToken);
      window.location.href = './index.html';
    }
  } catch (error) {
    Toastify({
      text: "Try Another Username",
      className: "toast",
      style: { background: "linear-gradient(to right, #E80101, #FF4801)" }
    }).showToast();
  }
}