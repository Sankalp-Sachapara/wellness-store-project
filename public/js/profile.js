// profile.js - Updated to match your backend API
document.addEventListener("DOMContentLoaded", () => {
  // Check authentication
  const user = checkAuthStatus();
  if (!user) {
    window.location.href = "login.html?redirect=profile.html";
    return;
  }

  // DOM Elements
  const profileForm = document.getElementById("profile-form");
  const securityForm = document.getElementById("security-form");
  const preferencesForm = document.getElementById("preferences-form");
  const addAddressBtn = document.getElementById("add-address-btn");
  const changeAvatarBtn = document.getElementById("change-avatar-btn");
  const avatarUpload = document.getElementById("avatar-upload");
  const profilePicture = document.getElementById("profile-picture");
  const menuLinks = document.querySelectorAll(".profile-menu a");
  const tabs = document.querySelectorAll(".profile-tab");

  // Load user data
  loadProfileData(user._id);

  // Tab switching
  menuLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // Update active tab
      menuLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      // Show corresponding content
      const tabId = link.dataset.tab;
      tabs.forEach((tab) => tab.classList.remove("active"));
      document.getElementById(tabId).classList.add("active");
    });
  });

  // Form submissions
  if (profileForm) {
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      updateProfile(user._id);
    });
  }

  if (securityForm) {
    securityForm.addEventListener("submit", (e) => {
      e.preventDefault();
      updatePassword();
    });
  }

  // if (preferencesForm) {
  //   preferencesForm.addEventListener("submit", (e) => {
  //     e.preventDefault();
  //     updatePreferences(user._id);
  //   });
  // }

  // // Change avatar
  // if (changeAvatarBtn && avatarUpload) {
  //   changeAvatarBtn.addEventListener("click", () => avatarUpload.click());
  //   avatarUpload.addEventListener("change", handleAvatarUpload);
  // }

  // // Add address
  // if (addAddressBtn) {
  //   addAddressBtn.addEventListener("click", showAddAddressForm);
  // }

  // Functions
  async function loadProfileData(userId) {
    try {
      const response = await fetch(`${API_URL}/users/profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to load profile data");

      const userData = await response.json();

      // Populate form fields
      document.getElementById("first-name").value = userData.username || "";
      // document.getElementById("last-name").value = userData.lastName || "";
      document.getElementById("email").value = userData.email || "";
      // document.getElementById("phone").value = userData.phone || "";
      // document.getElementById("birthdate").value = userData.birthdate || "";

      // if (userData.avatar) {
      //   profilePicture.src = userData.avatar;
      // }

      // // Load addresses if they exist in the user data
      // if (userData.addresses) {
      //   renderAddresses(userData.addresses);
      // }
    } catch (error) {
      console.error("Error loading profile data:", error);
      showErrorMessage("Failed to load profile data");
    }
  }

  async function updateProfile(userId) {
    try {
      const response = await fetch(`${API_URL}/users/profile/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          firstName: document.getElementById("first-name").value,
          // lastName: document.getElementById("last-name").value,
          phone: document.getElementById("phone").value,
          // birthdate: document.getElementById("birthdate").value,
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const updatedUser = await response.json();
      localStorage.setItem("user", JSON.stringify(updatedUser));
      showSuccessMessage("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      showErrorMessage("Failed to update profile");
    }
  }

  function clearMessages() {
    const existingAlerts = document.querySelectorAll(".alert");
    existingAlerts.forEach((alert) => alert.remove());
  }

  async function updatePassword() {
    const currentPassword = document.getElementById("current-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    // Clear previous messages
    clearMessages();

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      showErrorMessage("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      showErrorMessage("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      showErrorMessage("New password must be at least 6 characters long");
      return;
    }

    try {
      // First verify current password
      const verifyResponse = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: JSON.parse(localStorage.getItem("user")).email,
          password: currentPassword,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error("Current password is incorrect");
      }

      // If current password is correct, proceed with update
      const updateResponse = await fetch(
        `${API_URL}/users/profile/${
          JSON.parse(localStorage.getItem("user"))._id
        }/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.message || "Failed to update password");
      }

      showSuccessMessage("Password updated successfully");
      securityForm.reset();
    } catch (error) {
      console.error("Error updating password:", error);
      showErrorMessage(error.message || "Failed to update password");
    }
  }

  async function updatePreferences(userId) {
    try {
      const response = await fetch(`${API_URL}/users/profile/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          preferences: {
            promotionalEmails: document.querySelector(
              '[name="promotional-emails"]'
            ).checked,
            orderUpdates: document.querySelector('[name="order-updates"]')
              .checked,
            theme: document.querySelector('[name="theme"]:checked').value,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to update preferences");

      const updatedUser = await response.json();
      localStorage.setItem("user", JSON.stringify(updatedUser));
      showSuccessMessage("Preferences updated successfully");
    } catch (error) {
      console.error("Error updating preferences:", error);
      showErrorMessage("Failed to update preferences");
    }
  }

  function renderAddresses(addresses) {
    const container = document.getElementById("addresses-list");

    if (!addresses || addresses.length === 0) {
      container.innerHTML = `
        <div class="empty-message">
          You haven't saved any addresses yet.
        </div>
      `;
      return;
    }

    container.innerHTML = addresses
      .map(
        (address) => `
      <div class="address-card ${address.isDefault ? "default" : ""}">
        <h3>${address.label || "Primary Address"}</h3>
        <p>${address.street}</p>
        <p>${address.city}, ${address.state} ${address.zipCode}</p>
        <p>${address.country}</p>
        <div class="address-actions">
          <button class="edit-address" data-id="${address._id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-address" data-id="${address._id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `
      )
      .join("");

    // Add event listeners to action buttons
    document.querySelectorAll(".edit-address").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const addressId = e.currentTarget.dataset.id;
        editAddress(addressId);
      });
    });

    document.querySelectorAll(".delete-address").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const addressId = e.currentTarget.dataset.id;
        deleteAddress(addressId);
      });
    });
  }

  function showAddAddressForm() {
    // Implementation would use the profile update endpoint
    alert("Add address functionality would use the profile update endpoint");
  }

  function editAddress(addressId) {
    // Implementation would use the profile update endpoint
    alert(`Edit address ${addressId} would use the profile update endpoint`);
  }

  async function deleteAddress(addressId) {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      // Since your API doesn't have a specific address endpoint,
      // we'll need to handle this through the profile update
      const user = JSON.parse(localStorage.getItem("user"));
      const updatedAddresses = user.addresses.filter(
        (addr) => addr._id !== addressId
      );

      const response = await fetch(`${API_URL}/users/profile/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          addresses: updatedAddresses,
        }),
      });

      if (!response.ok) throw new Error("Failed to delete address");

      const updatedUser = await response.json();
      localStorage.setItem("user", JSON.stringify(updatedUser));
      renderAddresses(updatedUser.addresses || []);
      showSuccessMessage("Address deleted successfully");
    } catch (error) {
      console.error("Error deleting address:", error);
      showErrorMessage("Failed to delete address");
    }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const userId = JSON.parse(localStorage.getItem("user"))._id;
        const response = await fetch(`${API_URL}/users/profile/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            avatar: event.target.result,
          }),
        });

        if (!response.ok) throw new Error("Failed to update avatar");

        const updatedUser = await response.json();
        profilePicture.src = updatedUser.avatar;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        showSuccessMessage("Profile picture updated successfully");
      } catch (error) {
        console.error("Error updating avatar:", error);
        showErrorMessage("Failed to update profile picture");
      }
    };
    reader.readAsDataURL(file);
  }

  function showSuccessMessage(message) {
    const alert = document.createElement("div");
    alert.className = "alert alert-success";
    alert.innerHTML = `
      <i class="fas fa-check-circle"></i> ${message}
    `;

    // Insert after the security form heading
    const securityTab = document.getElementById("security");
    const heading = securityTab.querySelector("h2");
    securityTab.insertBefore(alert, heading.nextSibling);

    setTimeout(() => alert.remove(), 5000);
  }

  function showErrorMessage(message) {
    const alert = document.createElement("div");
    alert.className = "alert alert-danger";
    alert.innerHTML = `
      <i class="fas fa-exclamation-circle"></i> ${message}
    `;

    // Insert after the security form heading
    const securityTab = document.getElementById("security");
    const heading = securityTab.querySelector("h2");
    securityTab.insertBefore(alert, heading.nextSibling);

    setTimeout(() => alert.remove(), 5000);
  }
});
