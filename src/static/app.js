document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");

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

  // Modal elements
  const modal = document.getElementById("registration-modal");
  const modalContent = document.querySelector(".modal-content");
  const closeModal = document.querySelector(".close-modal");
  const modalActivityName = document.getElementById("modal-activity-name");
  const modalForm = document.getElementById("modal-signup-form");
  const modalMessage = document.getElementById("modal-message");

  // Open registration modal
  function openRegistrationModal(activityName) {
    modalActivityName.textContent = activityName;
    modal.classList.remove("hidden");
    modal.style.display = "block";
  }

  // Close modal function
  function closeRegistrationModal() {
    modal.classList.add("hidden");
    modal.style.display = "none";
    modalForm.reset();
    modalMessage.classList.add("hidden");
  }

  // Modal event listeners
  if (closeModal) {
    closeModal.addEventListener("click", closeRegistrationModal);
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeRegistrationModal();
      }
    });
  }

  // Handle modal form submission
  if (modalForm) {
    modalForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      
      const email = document.getElementById("modal-email").value;
      const activity = modalActivityName.textContent;

      try {
        const response = await fetch(
          `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
          {
            method: "POST",
          }
        );

        const result = await response.json();

        if (response.ok) {
          modalMessage.textContent = result.message;
          modalMessage.className = "success";
          
          // Refresh activities list to show updated participants
          fetchActivities();
          
          // Close modal after success
          setTimeout(() => {
            closeRegistrationModal();
          }, 2000);
        } else {
          modalMessage.textContent = result.detail || "An error occurred";
          modalMessage.className = "error";
        }

        modalMessage.classList.remove("hidden");
      } catch (error) {
        modalMessage.textContent = "Failed to register. Please try again.";
        modalMessage.className = "error";
        modalMessage.classList.remove("hidden");
        console.error("Error registering:", error);
      }
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
        
        const isFullyBooked = details.participants.length >= details.max_participants;
        
        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p><strong>Description:</strong> ${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Max Participants:</strong> ${details.max_participants}</p>
          <div class="participants-container">
            <div class="participants-section">
              <h5>Participants (${details.participants.length}/${details.max_participants}):</h5>
              ${details.participants.length > 0 
                ? `<ul>${details.participants.map(email => `<li><span class="participant-email">${email}</span></li>`).join('')}</ul>`
                : '<p>No participants yet</p>'
              }
            </div>
          </div>
          <button class="register-btn" data-activity="${name}" ${isFullyBooked ? 'disabled' : ''}>
            ${isFullyBooked ? 'Fully Booked' : 'Register Student'}
          </button>
        `;
        
        activitiesList.appendChild(activityCard);
      });

      // Add event listeners to register buttons
      document.querySelectorAll('.register-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const activityName = e.target.getAttribute('data-activity');
          openRegistrationModal(activityName);
        });
      });
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  }

  // Initialize app
  fetchActivities();
});
