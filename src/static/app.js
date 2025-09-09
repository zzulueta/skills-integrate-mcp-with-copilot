document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Auth form toggling
  const showLoginBtn = document.getElementById("show-login");
  const showRegisterBtn = document.getElementById("show-register");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const authMessage = document.getElementById("auth-message");

  if (showLoginBtn && showRegisterBtn && loginForm && registerForm) {
    showLoginBtn.addEventListener("click", () => {
      loginForm.classList.remove("hidden");
      registerForm.classList.add("hidden");
      authMessage.classList.add("hidden");
    });
    showRegisterBtn.addEventListener("click", () => {
      console.log("Register button clicked");
      registerForm.classList.remove("hidden");
      loginForm.classList.add("hidden");
      authMessage.classList.add("hidden");
    });
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";
        // ...existing code for activity card...
      });
    } catch (error) {
      messageDiv.textContent = "Failed to fetch activities. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
  
  // Populate the dropdown after DOM is ready
  fetch('/activities')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(activities => {
      const select = document.getElementById('activity');
      if (!select) return;
      // Remove all options except the first
      while (select.options.length > 1) {
        select.remove(1);
      }
      Object.keys(activities).forEach(activityName => {
        const option = document.createElement('option');
        option.value = activityName;
        option.textContent = activityName;
        select.appendChild(option);
      });
    })
    .catch(error => {
      console.error('Error loading activities:', error);
    });

  // Call fetchActivities (for list) on DOMContentLoaded
  fetchActivities();
});
