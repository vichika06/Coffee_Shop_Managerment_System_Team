document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form submission

    // Get input values
    const username = document.getElementById("Username").value;
    const password = document.getElementById("password").value;
    const messageDiv = document.getElementById("message");

    // Simple validation (for demonstration purposes)
    if (username === "admin" && password === "123") {
        messageDiv.style.color = "green";
        messageDiv.innerHTML = "<i class=\"fa-solid fa-circle-check\"></i>Login successful! Redirecting...";

        setTimeout(function() {
            window.location.href = "dashboard.html";
        }, 500);
    }
    else {
        messageDiv.style.color = "red";
        messageDiv.innerHTML = "<i class=\"fa-solid fa-circle-exclamation\"></i>Invalid username or password. Please try again.";

        document.getElementById("password").value = ""; 
        document.getElementById("Username").value = ""; 
        document.getElementById("Username").focus();
    }
});
