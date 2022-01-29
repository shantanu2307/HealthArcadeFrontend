const username = document.getElementById('username');
const password = document.getElementById('password');
const submit = document.getElementById('submit');

submit.addEventListener("click", function (event) {
  event.preventDefault();
  submitLogin();
});

async function submitLogin() {
  try {
    const response = await axios.post('http://localhost:5000/api/login', {
      username: username.value,
      password: password.value
    });
    if (response.status === 200) {
      localStorage.setItem('authtoken', response.data.authToken);
      window.location.href = './index.html';
    }
  } catch (error) {
    Toastify({
      text: "Enter Valid Credentials",
      className: "toast",
      style: { background: "linear-gradient(to right, #E80101, #FF4801)" }
    }).showToast();
  }
}
