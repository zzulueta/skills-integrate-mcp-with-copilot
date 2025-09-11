document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Filter and sort controls
  const searchInput = document.getElementById("search-input");
  const categoryFilter = document.getElementById("category-filter");
  const sortSelect = document.getElementById("sort-select");

  // Store original activities data
  let allActivities = {};
  let filteredActivities = {};

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

  // Function to filter and sort activities
  function filterAndSortActivities() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;
    const sortBy = sortSelect.value;

    // Start with all activities
    let activities = { ...allActivities };

    // Apply search filter
    if (searchTerm) {
      activities = Object.fromEntries(
        Object.entries(activities).filter(([name, details]) => 
          name.toLowerCase().includes(searchTerm) ||
          details.description.toLowerCase().includes(searchTerm) ||
          details.schedule.toLowerCase().includes(searchTerm)
        )
      );
    }

    // Apply category filter
    if (selectedCategory) {
      activities = Object.fromEntries(
        Object.entries(activities).filter(([name, details]) => 
          details.category === selectedCategory
        )
      );
    }

    // Sort activities
    const sortedEntries = Object.entries(activities).sort(([nameA, detailsA], [nameB, detailsB]) => {
      switch (sortBy) {
        case 'name':
          return nameA.localeCompare(nameB);
        case 'name-desc':
          return nameB.localeCompare(nameA);
        case 'date':
          return new Date(detailsB.created_date) - new Date(detailsA.created_date);
        case 'date-desc':
          return new Date(detailsA.created_date) - new Date(detailsB.created_date);
        case 'capacity':
          const spotsA = detailsA.max_participants - detailsA.participants.length;
          const spotsB = detailsB.max_participants - detailsB.participants.length;
          return spotsB - spotsA;
        default:
          return 0;
      }
    });

    filteredActivities = Object.fromEntries(sortedEntries);
    displayActivities(filteredActivities);
  }

  // Function to display activities
  function displayActivities(activities) {
    // Clear loading message or previous activities
    activitiesList.innerHTML = "";

    if (Object.keys(activities).length === 0) {
      activitiesList.innerHTML = '<p class="no-activities">No activities match your criteria.</p>';
      return;
    }

    // Populate activities list
    Object.entries(activities).forEach(([name, details]) => {
      const activityCard = document.createElement("div");
      activityCard.className = "activity-card";
      
      // Format the created date for display
      const createdDate = new Date(details.created_date);
      const formattedDate = createdDate.toLocaleDateString();
      
      activityCard.innerHTML = `
        <h4>${name} <span class="category-tag">${details.category}</span></h4>
        <p><strong>Description:</strong> ${details.description}</p>
        <p><strong>Schedule:</strong> ${details.schedule}</p>
        <p><strong>Capacity:</strong> ${details.participants.length}/${details.max_participants}</p>
        <p><strong>Added:</strong> ${formattedDate}</p>
        <div class="participants-container">
          <div class="participants-section">
            <h5>Participants:</h5>
            ${details.participants.length > 0 
              ? `<ul>${details.participants.map(email => `<li><span class="participant-email">${email}</span></li>`).join('')}</ul>`
              : '<p>No participants yet</p>'
            }
          </div>
        </div>
      `;
      
      activitiesList.appendChild(activityCard);
    });
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Store the activities data
      allActivities = activities;
      
      // Apply filters and display
      filterAndSortActivities();
    } catch (error) {
      messageDiv.textContent = "Failed to fetch activities. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error fetching activities:", error);
    }
  }

  // Add event listeners for filters
  searchInput.addEventListener('input', filterAndSortActivities);
  categoryFilter.addEventListener('change', filterAndSortActivities);
  sortSelect.addEventListener('change', filterAndSortActivities);

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
});
