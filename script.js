const aiServices = [
    { name: "ChatGPT", loginRequired: true },
    { name: "Microsoft Copilot", loginRequired: false },
    { name: "Grammarly", loginRequired: true },
    { name: "IBM Watson", loginRequired: true },
    { name: "Midjourney", loginRequired: true },
    { name: "Starryai", loginRequired: true },
    { name: "AI Town", loginRequired: false },
    { name: "Ghibli AI", loginRequired: false },
    { name: "Grok AI", loginRequired: false },
    { name: "Deepseek AI", loginRequired: false },
    { name: "Craiyon", loginRequired: false },
    { name: "Leonardo AI", loginRequired: true },
    { name: "RunwayML", loginRequired: true },
    { name: "ElevenLabs", loginRequired: true },
    { name: "Synthesia", loginRequired: true }
];
let selectedAIs = [];
let currentAIForLogin = null;

// Start on search page
showPage("searchPage");
if (localStorage.getItem("user")) {
    // User logged in, allow full functionality
}

function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    if (email && password) {
        localStorage.setItem("user", JSON.stringify({ email }));
        showPage("aiSelectionPage");
        renderAIList();
    } else {
        alert("Please enter email and password");
    }
}

function signup() {
    login(); // Simplified: signup same as login
}

function showPage(pageId) {
    document.querySelectorAll(".container").forEach(page => page.style.display = "none");
    document.getElementById(pageId).style.display = "block";
}

function renderAIList() {
    const aiList = document.getElementById("aiList");
    aiList.innerHTML = "";
    const showLoginRequired = document.getElementById("loginRequiredToggle").checked;
    const showNoLogin = document.getElementById("noLoginToggle").checked;
    aiServices.filter(ai => 
        (!showLoginRequired && !showNoLogin) || 
        (showLoginRequired && ai.loginRequired) || 
        (showNoLogin && !ai.loginRequired)
    ).forEach(ai => {
        const div = document.createElement("div");
        div.className = "ai-item";
        div.innerHTML = `<input type="checkbox" value="${ai.name}" onchange="updateSelectedAIs()"> ${ai.name} (${ai.loginRequired ? "Login Required" : "No Login"})`;
        aiList.appendChild(div);
    });
}

function filterAIs(type) {
    if (type === "login" && document.getElementById("loginRequiredToggle").checked) {
        document.getElementById("noLoginToggle").checked = false;
    } else if (type === "no-login" && document.getElementById("noLoginToggle").checked) {
        document.getElementById("loginRequiredToggle").checked = false;
    }
    renderAIList();
}

function updateSelectedAIs() {
    selectedAIs = Array.from(document.querySelectorAll("#aiList input:checked")).map(input => input.value);
}

function goToSearch() {
    if (selectedAIs.length === 0) {
        alert("Please select at least one AI");
        return;
    }
    checkAILogins(() => {
        showPage("searchPage");
        performSearch(true); // Auto-search with selected AIs
    });
}

function checkAILogins(callback) {
    const logins = JSON.parse(localStorage.getItem("aiLogins") || "{}");
    const nextAI = aiServices.find(ai => selectedAIs.includes(ai.name) && ai.loginRequired && !logins[ai.name]);
    if (nextAI) {
        currentAIForLogin = nextAI.name;
        document.getElementById("aiName").textContent = nextAI.name;
        document.getElementById("loginModal").style.display = "flex";
    } else {
        callback();
    }
}

function saveAICredentials() {
    const email = document.getElementById("aiEmail").value;
    const password = document.getElementById("aiPassword").value;
    if (email && password) {
        const logins = JSON.parse(localStorage.getItem("aiLogins") || "{}");
        logins[currentAIForLogin] = { email, password };
        localStorage.setItem("aiLogins", JSON.stringify(logins));
        document.getElementById("loginModal").style.display = "none";
        checkAILogins(() => showPage("searchPage"));
    } else {
        alert("Please enter credentials");
    }
}

function closeModal() {
    document.getElementById("loginModal").style.display = "none";
}

function performSearch(useSelected = false) {
    const query = document.getElementById("searchQuery").value;
    if (!query) {
        alert("Please enter a query");
        return;
    }
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<div class='tabs'></div>";
    const searchAIs = useSelected ? selectedAIs : aiServices.filter(ai => !ai.loginRequired).map(ai => ai.name);
    searchAIs.forEach((ai, index) => {
        const tab = document.createElement("div");
        tab.className = `tab ${index === 0 ? "active" : ""}`;
        tab.textContent = ai;
        tab.onclick = () => switchTab(ai);
        resultsDiv.querySelector(".tabs").appendChild(tab);

        const content = document.createElement("div");
        content.className = `tab-content ${index === 0 ? "active" : ""}`;
        content.id = `result-${ai}`;
        content.textContent = `Mock result from ${ai} for "${query}"`; // Mock API response
        resultsDiv.appendChild(content);
    });
    if (!localStorage.getItem("user")) {
        resultsDiv.innerHTML += "<p>Login to access more AIs <button onclick='showPage(\"loginPage\")'>Login</button></p>";
    } else {
        resultsDiv.innerHTML += "<p>Select specific AIs <button onclick='showPage(\"aiSelectionPage\"); renderAIList()'>Go to Selection</button></p>";
    }
}

function switchTab(ai) {
    document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));
    document.querySelector(`.tab[onclick*="${ai}"]`).classList.add("active");
    document.getElementById(`result-${ai}`).classList.add("active");
}