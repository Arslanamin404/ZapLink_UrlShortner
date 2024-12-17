const form = document.querySelector("form");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  // Get error elements
  const fullName_error = document.getElementById("fullName_error");
  const email_error = document.getElementById("email_error");
  const password_error = document.getElementById("password_error");

  // Reset errors
  fullName_error.textContent = "";
  email_error.textContent = "";
  password_error.textContent = "";

  // Get form values
  const fullName = form.fullName.value;
  const email = form.email.value;
  const password = form.password.value;

  try {
    const response = await axios.post("/user/signup", {
      fullName,
      email,
      password,
    });

    const data = response.data;

    if (data.user) {
      location.assign("/"); // Redirect to home on success
    }
  } catch (error) {
    console.log(error.response.data);

    // Handle error response from server
    if (error.response && error.response.data) {
      const { errors } = error.response.data;

      // Display server-side errors
      fullName_error.textContent = errors.fullName;
      email_error.textContent = errors.email;
      password_error.textContent = errors.password;
    } else {
      console.log("Error: ", error); // Handle other errors (e.g., network issues)
    }
  }
});
