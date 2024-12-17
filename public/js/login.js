const form = document.querySelector("form");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  // get errors
  const email_error = document.getElementById("email_error");
  const password_error = document.getElementById("password_error");

  // reset errors
  email_error.textContent = "";
  password_error.textContent = "";

  // get values
  const email = form.email.value;
  const password = form.password.value;

  try {
    const response = await axios.post("/user/login", { email, password });

    const data = response.data;

    if (data.statusCode == 200) {
      location.assign("/");
    }
  } catch (error) {
    if (error.response && error.response.data) {
      const { message } = error.response.data;
      email_error.textContent = message;
      password_error.textContent = message;
    } else {
      console.log(error); // Handle general errors
    }
  }
});
