// app.js (Final Corrected Version - Student Leaderboard Included)

// --- 1. GLOBAL STATE & CONSTANTS ---
const API_BASE_URL = 'https://classroom-hjmsogmxk-simbalol1xs-projects.vercel.app';
let currentUser = null;
let isEditingClass = false;
let taughtClassesCache = [];
let enrolledClassesCache = [];
let currentViewedClassId = null;
let currentViewedClassTeacherId = null; // For optimization

const CLIENT_PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

// --- REMOVED DUPLICATE LEADERBOARD VARIABLE DECLARATIONS FROM HERE ---
let classRosterSection, rosterClassNameTitle, classRosterTableBody, classRosterMessage;
// Variables for a separate student leaderboard section are no longer needed as we unify the view.

// --- 2. DOM ELEMENT REFERENCES (omitted for brevity) ---
let authSection, loginSectionWrapper, registerSectionWrapper, /* ... all other elements */ darkModeToggle;

// --- 3. DOM Element Assignment (omitted for brevity) ---
function assignDOMElements() {
    authSection = document.getElementById('authSection');
    loginSectionWrapper = document.getElementById('loginSectionWrapper');
    registerSectionWrapper = document.getElementById('registerSectionWrapper');
    forgotPasswordSectionWrapper = document.getElementById('forgotPasswordSectionWrapper');
    loginForm = document.getElementById('loginForm');
    registerForm = document.getElementById('registerForm');
    forgotPasswordForm = document.getElementById('forgotPasswordForm');
    loginEmailInput = document.getElementById('loginEmail');
    loginPasswordInput = document.getElementById('loginPassword');
    loginSubmitBtn = document.getElementById('loginSubmitBtn');
    regFirstNameInput = document.getElementById('regFirstName');
    regLastNameInput = document.getElementById('regLastName');
    regEmailInput = document.getElementById('regEmail');
    regPasswordInput = document.getElementById('regPassword');
    regPasswordConfirmInput = document.getElementById('regPasswordConfirm');
    regRoleSelect = document.getElementById('regRole');
    registerSubmitBtn = document.getElementById('registerSubmitBtn');
    passwordStrengthMeter = document.getElementById('password-strength-meter');
    passwordStrengthBar = document.getElementById('password-strength-bar');
    passwordStrengthText = document.getElementById('password-strength-text');
    passwordConfirmMessage = document.getElementById('password-confirm-message');
    togglePasswordVisibility = document.getElementById('togglePasswordVisibility');
    forgotPasswordEmailInput = document.getElementById('forgotPasswordEmail');
    forgotPasswordSubmitBtn = document.getElementById('forgotPasswordSubmitBtn');
    loginMessage = document.getElementById('loginMessage');
    registerMessage = document.getElementById('registerMessage');
    forgotPasswordMessage = document.getElementById('forgotPasswordMessage');
    userInfoDisplay = document.getElementById('userInfoDisplay');
    loggedInUserFullName = document.getElementById('loggedInUserFullName');
    loggedInUserRole = document.getElementById('loggedInUserRole');
    logoutBtn = document.getElementById('logoutBtn');
    profileBtn = document.getElementById('profileBtn');
    mainContent = document.getElementById('mainContent');
    teacherDashboard = document.getElementById('teacherDashboard');
    studentDashboard = document.getElementById('studentDashboard');
    classActionSection = document.getElementById('classActionSection');
    classFormTitle = document.getElementById('classFormTitle');
    classForm = document.getElementById('classForm');
    editingClassIdInput = document.getElementById('editingClassIdInput');
    classNameInput_form = document.getElementById('classNameInput_form');
    classDescriptionInput_form = document.getElementById('classDescriptionInput_form');
    classJoinPasswordInput_form = document.getElementById('classJoinPasswordInput_form');
    classFormMessage = document.getElementById('classFormMessage');
    submitClassBtn = document.getElementById('submitClassBtn');
    cancelClassEditBtn = document.getElementById('cancelClassEditBtn');
    taughtClassesSection = document.getElementById('taughtClassesSection');
    filterTaughtClassesInput = document.getElementById('filterTaughtClassesInput');
    if (teacherDashboard) teacherMyTaughtClassesListDiv = teacherDashboard.querySelector('#myTaughtClassesList');
    loadTaughtClassesBtn = document.getElementById('loadTaughtClassesBtn');
    classRosterSection = document.getElementById('classRosterSection');
    rosterClassNameTitle = document.getElementById('rosterClassName');
    classRosterTableBody = document.getElementById('classRosterTableBody');
    classRosterMessage = document.getElementById('classRosterMessage');
    backToTaughtClassesBtn = document.getElementById('backToTaughtClassesBtn');
    joinClassSection = document.getElementById('joinClassSection');
    joinClassForm = document.getElementById('joinClassForm');
    classCodeInput = document.getElementById('classCodeInput');
    classJoinPasswordInput_student = document.getElementById('classJoinPassword_student');
    joinClassSubmitBtn = document.getElementById('joinClassSubmitBtn');
    joinClassMessage = document.getElementById('joinClassMessage');
    enrolledClassesSection = document.getElementById('enrolledClassesSection');
    filterEnrolledClassesInput = document.getElementById('filterEnrolledClassesInput');
    if (studentDashboard) studentMyEnrolledClassesListDiv = studentDashboard.querySelector('#myEnrolledClassesList');
    loadEnrolledClassesBtn = document.getElementById('loadEnrolledClassesBtn');
    copyrightYearEl = document.getElementById('copyrightYear');
    showRegisterFormBtn = document.getElementById('showRegisterFormBtn');
    showLoginFormBtn = document.getElementById('showLoginFormBtn');
    showForgotPasswordFormBtn = document.getElementById('showForgotPasswordFormBtn');
    backToLoginFromForgotBtn = document.getElementById('backToLoginFromForgotBtn');
    profileSection = document.getElementById('profileSection');
    backToDashboardBtn_profile = document.getElementById('backToDashboardBtn_profile');
    profileInfoForm = document.getElementById('profileInfoForm');
    profileFirstNameInput = document.getElementById('profileFirstName');
    profileLastNameInput = document.getElementById('profileLastName');
    profileEmailDisplay = document.getElementById('profileEmailDisplay');
    updateProfileBtn = document.getElementById('updateProfileBtn');
    profileInfoMessage = document.getElementById('profileInfoMessage');
    changePasswordForm = document.getElementById('changePasswordForm');
    currentPasswordInput = document.getElementById('currentPassword');
    newPasswordInput = document.getElementById('newPassword');
    confirmNewPasswordInput = document.getElementById('confirmNewPassword');
    changePasswordBtn = document.getElementById('changePasswordBtn');
    changePasswordMessage = document.getElementById('changePasswordMessage');
    classViewSection = document.getElementById('classViewSection');
    backToDashboardBtn_classView = document.getElementById('backToDashboardBtn_classView');
    classViewName = document.getElementById('classViewName');
    announcementForm = document.getElementById('announcementForm');
    announcementTitleInput = document.getElementById('announcementTitleInput');
    announcementContentInput = document.getElementById('announcementContent');
    postAnnouncementBtn = document.getElementById('postAnnouncementBtn');
    announcementFormMessage = document.getElementById('announcementFormMessage');
    announcementsList = document.getElementById('announcementsList');
    editAnnouncementModal = document.getElementById('editAnnouncementModal');
    editAnnouncementForm = document.getElementById('editAnnouncementForm');
    editAnnouncementIdInput = document.getElementById('editAnnouncementIdInput');
    editAnnouncementTitleInput = document.getElementById('editAnnouncementTitleInput');
    editAnnouncementContentInput = document.getElementById('editAnnouncementContentInput');
    saveAnnouncementChangesBtn = document.getElementById('saveAnnouncementChangesBtn');
    cancelAnnouncementEditBtn = document.getElementById('cancelAnnouncementEditBtn');
    editAnnouncementMessage = document.getElementById('editAnnouncementMessage');
    darkModeToggle = document.getElementById('darkModeToggle');

    // Student-specific leaderboard elements are removed as classRosterSection will be used for both.
}


// --- 4. CORE & HELPER FUNCTIONS ---
function showUIMessage(el, msg, type = 'info', time = 5000, isHtml = false) { if (!el) return; if (isHtml) el.innerHTML = msg; else el.textContent = msg; el.className = `message-area ${type}-message`; el.style.display = (msg && msg.trim() !== '') ? 'block' : 'none'; if (time > 0 && msg && msg.trim() !== '') { setTimeout(() => { if (el) { el.style.display = 'none'; el.textContent = ''; } }, time); } }
function setSectionVisibility(el, show) { if (el) el.classList.toggle('hidden', !show); }
function showAuthSection(sectionName) { if (loginSectionWrapper) setSectionVisibility(loginSectionWrapper, sectionName === 'login'); if (registerSectionWrapper) setSectionVisibility(registerSectionWrapper, sectionName === 'register'); if (forgotPasswordSectionWrapper) setSectionVisibility(forgotPasswordSectionWrapper, sectionName === 'forgotPassword'); if (loginMessage && sectionName !== 'login') showUIMessage(loginMessage, ''); if (registerMessage && sectionName !== 'register') showUIMessage(registerMessage, ''); if (forgotPasswordMessage && sectionName !== 'forgotPassword') showUIMessage(forgotPasswordMessage, ''); if (sectionName !== 'register' && passwordStrengthBar) { passwordStrengthBar.style.width = '0%'; passwordStrengthBar.className = 'password-strength-bar'; if (passwordStrengthText) passwordStrengthText.textContent = ''; if (passwordConfirmMessage) passwordConfirmMessage.textContent = ''; } }
function showMainContentView(viewName) { 
    const isProfile = viewName === 'profile'; 
    const isClassView = viewName === 'classView'; 
    // Unified view for teacher roster and student leaderboard using classRosterSection
    const isRosterOrLeaderboardView = viewName === 'teacherRoster' || viewName === 'studentLeaderboard';

    setSectionVisibility(profileSection, isProfile); 
    setSectionVisibility(classViewSection, isClassView);
    setSectionVisibility(classRosterSection, isRosterOrLeaderboardView);
    
    const showDashboard = !isProfile && !isClassView && !isRosterOrLeaderboardView; 

    if (currentUser) { 
        if (currentUser.role === 'teacher') { setSectionVisibility(teacherDashboard, showDashboard); } 
        else if (currentUser.role === 'student') { setSectionVisibility(studentDashboard, showDashboard); } 
    } 
}
function setButtonLoading(btn, isLoading, customText = 'Loading...') { if (!btn) return; if (isLoading) { btn.dataset.originalText = btn.textContent; btn.disabled = true; btn.textContent = customText; } else { btn.disabled = false; btn.textContent = btn.dataset.originalText || 'Submit'; } }
function filterListByName(list, filterText, nameKey = 'className') { if (!list) return []; const lowerText = (filterText || "").toLowerCase(); return list.filter(item => item && typeof item[nameKey] === 'string' && item[nameKey].toLowerCase().includes(lowerText)); }
async function apiFetch(endpoint, method = 'GET', body = null, button = null) { if (button) setButtonLoading(button, true); const headers = { 'Content-Type': 'application/json' }; if (currentUser && currentUser.token) { headers['Authorization'] = `Bearer ${currentUser.token}`; } try { const response = await fetch(`${API_BASE_URL}${endpoint}`, { method, headers, body: body ? JSON.stringify(body) : null }); if (!response.ok && [401, 403].includes(response.status) && !endpoint.includes('/login') && !endpoint.includes('/register') && !endpoint.includes('/forgot-password') && !endpoint.includes('/reset-password')) { handleLogoutDueToAuthError('Your session has expired or is invalid. Please login again.'); } return response; } catch (err) { console.error("API Fetch Error:", err); const relevantMessageArea = loginMessage || (document.getElementById('authSection') ? document.getElementById('authSection').querySelector('.message-area') : null) || document.body; if (relevantMessageArea) showUIMessage(relevantMessageArea, "Network Error. Please check your connection or try again later.", "error", 0); return { ok: false, status: 503, json: async () => ({ message: "Network Error: Could not connect to the server." }) }; } finally { if (button) setButtonLoading(button, false); } }
function updateUIBasedOnLoginState() { 
    const isLoggedIn = !!(currentUser && currentUser.token); 
    const allMajorSections = [authSection, mainContent, userInfoDisplay, teacherDashboard, studentDashboard, classRosterSection, profileSection, classViewSection]; 
    allMajorSections.forEach(el => { if (el) setSectionVisibility(el, false); }); 
    showAuthSection('none'); 
    if (isLoggedIn) { 
        setSectionVisibility(mainContent, true); 
        setSectionVisibility(userInfoDisplay, true); 
        if(loggedInUserFullName) loggedInUserFullName.textContent = `${currentUser.firstName} ${currentUser.lastName}`; 
        if(loggedInUserRole) loggedInUserRole.textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1); 
        showMainContentView('dashboard'); 
        if (currentUser.role === 'teacher') { 
            resetClassFormToCreateMode(); 
            loadMyTaughtClasses(); 
        } else if (currentUser.role === 'student') { 
            if(joinClassForm) joinClassForm.reset(); 
            if(joinClassMessage) showUIMessage(joinClassMessage, ''); 
            loadMyEnrolledClasses(); 
        } 
    } else { 
        setSectionVisibility(authSection, true); 
        showAuthSection('login'); 
        if(loginForm) loginForm.reset(); 
        if(registerForm) registerForm.reset(); 
        if(forgotPasswordForm) forgotPasswordForm.reset(); 
    } 
}
function handleLogoutDueToAuthError(message = 'You have been logged out.') { currentUser = null; localStorage.removeItem('classroomUser'); taughtClassesCache = []; enrolledClassesCache = []; currentViewedClassId = null; updateUIBasedOnLoginState(); if(loginMessage) showUIMessage(loginMessage, message, 'info', 7000); }
function checkInitialLoginState() { try { const userStr = localStorage.getItem('classroomUser'); if (userStr) { currentUser = JSON.parse(userStr); if (!currentUser || !currentUser.token || !currentUser.id || !currentUser.role || !currentUser.firstName || !currentUser.lastName) { currentUser = null; localStorage.removeItem('classroomUser'); } } } catch(e) { console.error("Error parsing user from localStorage:", e); currentUser = null; localStorage.removeItem('classroomUser'); } updateUIBasedOnLoginState(); }
function resetClassFormToCreateMode() { isEditingClass = false; if(editingClassIdInput) editingClassIdInput.value = ''; if(classForm) classForm.reset(); if(classFormTitle) classFormTitle.textContent = 'Create New Class'; if(submitClassBtn) submitClassBtn.textContent = 'Create Class'; if(cancelClassEditBtn) setSectionVisibility(cancelClassEditBtn, false); if(classFormMessage) showUIMessage(classFormMessage, ''); }
async function copyToClipboard(text, button) { try { await navigator.clipboard.writeText(text); if (button) { const originalText = button.textContent; button.textContent = 'Copied!'; setTimeout(() => { button.textContent = originalText; }, 1500); } } catch (err) { console.error('Failed to copy text: ', err); } }
function formatDate(dateString) { if (!dateString) return 'N/A'; return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }

function getInitials(firstName, lastName) {
    const firstInitial = firstName ? firstName[0].toUpperCase() : '';
    const lastInitial = lastName ? lastName[0].toUpperCase() : '';
    return `${firstInitial}${lastInitial}` || '??';
}


function applyTheme(theme) { if (theme === 'dark') { document.body.classList.add('dark-mode'); } else { document.body.classList.remove('dark-mode'); } }
function handleThemeToggle() { const currentTheme = localStorage.getItem('theme') || 'light'; const newTheme = currentTheme === 'light' ? 'dark' : 'light'; localStorage.setItem('theme', newTheme); applyTheme(newTheme); }
function checkInitialTheme() { const savedTheme = localStorage.getItem('theme'); if (savedTheme) { applyTheme(savedTheme); } }


// This function now renders the LEADERBOARD/ROSTER for both teachers and students.
function renderClassRoster(leaderboardData, className, classId, isTeacherView = false) {
    // Parameter `leaderboardData` is actually the roster data from the API.
    // Let's rename for clarity within the function.
    const rosterItems = leaderboardData;

    if (!rosterClassNameTitle || !classRosterTableBody || !classRosterMessage) return;
    rosterClassNameTitle.textContent = `Leaderboard for ${className || 'Selected Class'}`;
    classRosterTableBody.innerHTML = ''; 
    showUIMessage(classRosterMessage, '');
    
    if (!rosterItems || rosterItems.length === 0) {
        return showUIMessage(classRosterMessage, 'No students are enrolled in this class to display.', 'info', 0);
    }
    
    // Sort students by coursePoints (descending) and calculate ranks
    const rankedAndSortedItems = [];
    if (rosterItems && rosterItems.length > 0) {
        const sortedData = [...rosterItems].sort((a, b) => {
            const pointsA = a.Enrollment?.coursePoints ?? -1;
            const pointsB = b.Enrollment?.coursePoints ?? -1;
            if (pointsB !== pointsA) {
                return pointsB - pointsA; // Sort descending by points
            }
            // Optional: secondary sort by name for consistent tie-breaking
            const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
            const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
            return nameA.localeCompare(nameB);
        });

        let currentRank = 0;
        let lastScore = -Infinity; // Ensures the first student gets rank 1
        sortedData.forEach((item, index) => {
            const currentStudentScore = item.Enrollment?.coursePoints ?? -1;
            if (currentStudentScore !== lastScore) {
                currentRank = index + 1; // Standard competition ranking (1, 2, 2, 4)
                lastScore = currentStudentScore;
            }
            rankedAndSortedItems.push({ ...item, displayRank: currentRank });
        });
    }

    const tableHead = classRosterTableBody.parentElement.querySelector('thead');
    if (tableHead) {
        tableHead.innerHTML = `<tr><th>Rank</th><th>Name</th><th>Score</th>${isTeacherView ? '<th>Actions</th>' : ''}</tr>`;
    }

    rankedAndSortedItems.forEach((item) => {
        const rank = item.displayRank;
        const coursePoints = item.Enrollment?.coursePoints ?? 0;
        const initials = getInitials(item.firstName, item.lastName);
        const tr = document.createElement('tr');
        if (rank === 1) tr.classList.add('rank-1');
        if (rank === 2) tr.classList.add('rank-2');
        if (rank === 3) tr.classList.add('rank-3');
        
        // Prepare score display and input field
        const scoreDisplay = `<span class="score-text">${coursePoints}</span>`;
        const scoreInput = `<input type="number" class="score-input hidden" value="${coursePoints}" data-original-score="${coursePoints}" min="0" style="width:70px; text-align:center;">`;

        let teacherActionsHTML = '';
        if (isTeacherView) {
            teacherActionsHTML = `
                <button class="edit-score-btn btn-edit small-btn" data-student-id="${item.id}" data-class-id="${classId}">Edit Score</button>
                <button class="save-score-btn btn-primary small-btn hidden" data-student-id="${item.id}" data-class-id="${classId}">Save</button>
                <button class="cancel-score-btn btn-secondary small-btn hidden" data-student-id="${item.id}" data-class-id="${classId}">Cancel</button>
                <button class="remove-student-btn btn-danger small-btn" data-student-id="${item.id}" data-class-id="${classId}">Remove</button>
            `;
        }
        const studentNameDisplay = `${item.firstName} ${item.lastName}${item.id === currentUser.id ? ' (You)' : ''}`;

        tr.innerHTML = `
            <td class="leaderboard-rank">${rank}</td>
            <td class="leaderboard-student-info">
                <div class="leaderboard-avatar">${initials}</div>
                <span class="leaderboard-name">${studentNameDisplay}</span>
            </td>
            <td class="leaderboard-points score-cell">${scoreDisplay}${isTeacherView ? scoreInput : ''}</td>
            ${isTeacherView ? `<td class="actions-cell">${teacherActionsHTML}</td>` : ''}
        `;
        classRosterTableBody.appendChild(tr);
    });
}

// Unified function to load and display the leaderboard/roster
async function loadClassLeaderboard(classId) {
    const isStudent = currentUser.role === 'student';
    // Both roles will use the 'classRosterSection', logical view name helps showMainContentView
    showMainContentView(isStudent ? 'studentLeaderboard' : 'teacherRoster'); 

    const messageEl = classRosterMessage; // Use the message area from classRosterSection
    showUIMessage(messageEl, 'Loading leaderboard...', 'info', 0);

    const response = await apiFetch(`/classes/${classId}/roster`); // Corrected API endpoint

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Error fetching leaderboard." }));
        showUIMessage(messageEl, errorData.message, "error", 0);
        return;
    }
    const data = await response.json();
    // Use data.roster and data.isTeacherView from the API response
    renderClassRoster(data.roster, data.className, classId, data.isTeacherView);
}

// Event listener for editing scores (teacher only) - moved to main DOMContentLoaded
// This needs to be inside DOMContentLoaded or setupEventListeners to ensure classRosterTableBody exists.
/*
document.addEventListener('DOMContentLoaded', () => {
    if (classRosterTableBody) {
        classRosterTableBody.addEventListener('change', async (e) => {
            if (e.target.classList.contains('edit-score-input')) {
                const studentId = e.target.dataset.studentId;
                const classId = e.target.dataset.classId;
                const newScore = parseInt(e.target.value, 10);
                if (!isNaN(newScore)) {
                    const res = await apiFetch(`/classes/${classId}/students/${studentId}/score`, 'PUT', { coursePoints: newScore });
                    if (res.ok) {
                        showUIMessage(classRosterMessage, 'Score updated!', 'success', 2000);
                        loadClassLeaderboard(classId);
                    } else {
                        showUIMessage(classRosterMessage, 'Failed to update score.', 'error', 3000);
                    }
                }
            }
        });
    }
}); // This will be integrated into the main DOMContentLoaded or setupEventListeners
*/


function renderTaughtClasses(list) {
    if (!teacherMyTaughtClassesListDiv) return;
    teacherMyTaughtClassesListDiv.innerHTML = '';
    if (!list || list.length === 0) {
        const currentFilter = filterTaughtClassesInput ? filterTaughtClassesInput.value : "";
        const message = currentFilter ? 'No classes match your filter.' : "You haven't created any classes yet.";
        teacherMyTaughtClassesListDiv.innerHTML = `<p class="info-message" style="display:block; text-align:center;">${message}</p>`;
        return;
    }
    const ul = document.createElement('ul');
    ul.className = 'styled-list';
    list.forEach(cls => {
        const li = document.createElement('li');
        li.dataset.classId = cls.id;
        const unreadCount = parseInt(cls.unreadAnnouncements, 10) || 0;
        const badgeHTML = unreadCount > 0 ? `<span class="badge">${unreadCount}</span>` : '';
        li.innerHTML = `
            <div class="class-details">
                <span class="class-name">${cls.className}</span>
                <div class="class-info-group">                    
                    <span class="class-info-item code">Code: <strong>${cls.classCode}</strong></span>
                    <button class="copy-code-btn small-btn" data-class-code="${cls.classCode}">Copy Code</button>
                    <span class="class-info-item students">${cls.studentCount || 0} Student(s)</span>
                </div>
                ${cls.description ? `<p class="class-description">${cls.description}</p>` : ''}
            </div>
            <div class="list-item-actions">
                <button class="view-announcements-btn btn-info" data-class-id="${cls.id}">Announcements ${badgeHTML}</button>
                <button class="edit-btn btn-edit">Edit</button>
                <button class="info-btn btn-info">Roster</button>
                <button class="delete-btn btn-danger">Delete</button>
            </div>
        `;
        ul.appendChild(li);
    });
    teacherMyTaughtClassesListDiv.appendChild(ul);
}


function renderEnrolledClasses(list) {
    if (!studentMyEnrolledClassesListDiv) return;
    if (!list || list.length === 0) {
        studentMyEnrolledClassesListDiv.innerHTML = '<p class="info-message">You are not enrolled in any classes.</p>';
        return;
    }
    const listHtml = list.map(cls => {
        const enrollmentDate = cls.Enrollment?.enrollmentDate; 
        const teacherName = cls.Teacher ? `${cls.Teacher.firstName} ${cls.Teacher.lastName}` : 'N/A';
        const unreadCount = parseInt(cls.unreadAnnouncements, 10) || 0;
        const badgeHTML = unreadCount > 0 ? `<span class="badge">${unreadCount}</span>` : '';
        return `
            <li data-class-id="${cls.id}">
                <div class="class-details">
                    <span class="class-name">${cls.className}</span>
                    <div class="class-info-group">
                        <span class="class-info-item code">Code: ${cls.classCode || 'N/A'}</span>
                        <span class="class-info-item teacher">Teacher: ${teacherName}</span>
                        <span class="class-info-item date">Enrolled: ${formatDate(enrollmentDate)}</span>
                    </div>
                </div>
                <div class="list-item-actions">
                    <button class="view-announcements-btn btn-info" data-class-id="${cls.id}">Announcements</button>
                    <button class="view-leaderboard-btn btn-secondary" data-class-id="${cls.id}">Leaderboard</button>
                    <button class="leave-btn btn-warning" data-class-id="${cls.id}" data-class-name="${cls.className}">Leave Class</button>
                </div>
            </li>
        `;
    }).join('');
    studentMyEnrolledClassesListDiv.innerHTML = `<ul class="styled-list">${listHtml}</ul>`;
}

// renderStudentLeaderboard function is no longer needed.


function renderAnnouncements(announcements, isTeacherOfThisClass = false) {
    if (!announcementsList) return;
    announcementsList.innerHTML = ''; 
    if (!announcements || announcements.length === 0) {
        announcementsList.innerHTML = `<p class="info-message" style="display:block; text-align:center;">No announcements have been posted for this class yet.</p>`;
        return;
    }
    announcements.forEach(announcement => {
        const card = document.createElement('div');
        card.className = 'announcement-card';
        card.dataset.announcementId = announcement.id; 
        const formattedDate = new Date(announcement.createdAt).toLocaleString();
        const teacherActionsHTML = isTeacherOfThisClass ? `
            <div class="announcement-actions">
                <button class="edit-announcement-btn btn-edit" data-announcement-id="${announcement.id}">Edit</button>
                <button class="delete-announcement-btn btn-danger" data-announcement-id="${announcement.id}">Delete</button>
            </div>
        ` : '';
        card.innerHTML = `
            <h3>${announcement.title}</h3>
            <p>${announcement.content}</p>
            <div class="announcement-date">Posted: ${formattedDate}</div>
            ${teacherActionsHTML}
        `;
        announcementsList.appendChild(card);
    });
}

async function handleLoginSubmit(e) { e.preventDefault(); if (!loginEmailInput || !loginPasswordInput || !loginMessage || !loginSubmitBtn) return; const email = loginEmailInput.value.trim(); const password = loginPasswordInput.value; if (!email || !password) return showUIMessage(loginMessage, 'Email and Password are required.', 'error'); const response = await apiFetch('/users/login', 'POST', { email, password }, loginSubmitBtn); let data; try { data = await response.json(); } catch (e) { const responseText = await response.text().catch(() => "Could not read response text."); console.error("Login error: Failed to parse JSON response. Status:", response.status, "Response body:", responseText, e); showUIMessage(loginMessage, `Login failed. Server returned an unexpected response (Status: ${response.status}). Check console for details.`, "error", 0); return; } if (response.ok && data && data.user && data.token) { currentUser = data.user; currentUser.token = data.token; localStorage.setItem('classroomUser', JSON.stringify(currentUser)); if(loginForm) loginForm.reset(); showUIMessage(loginMessage, ''); updateUIBasedOnLoginState(); } else { showUIMessage(loginMessage, (data && data.message) || `Login failed (Status: ${response.status}). Please check your credentials.`, "error"); } }
async function handleRegisterSubmit(e) { e.preventDefault(); if (!regPasswordInput || !regPasswordConfirmInput || !CLIENT_PASSWORD_COMPLEXITY_REGEX || !registerMessage || !registerSubmitBtn || !regFirstNameInput || !regLastNameInput || !regEmailInput || !regRoleSelect) return; if (regPasswordInput.value !== regPasswordConfirmInput.value) return showUIMessage(registerMessage, 'Passwords do not match.', 'error'); if (!CLIENT_PASSWORD_COMPLEXITY_REGEX.test(regPasswordInput.value)) { return showUIMessage(registerMessage, 'Password does not meet all requirements.', 'error', 7000, false); } const payload = { firstName: regFirstNameInput.value.trim(), lastName: regLastNameInput.value.trim(), email: regEmailInput.value.trim(), password: regPasswordInput.value, role: regRoleSelect.value }; if (!payload.firstName || !payload.lastName || !payload.email || !payload.password || !payload.role) return showUIMessage(registerMessage, "All fields are required.", "error"); const response = await apiFetch('/users/register', 'POST', payload, registerSubmitBtn); const data = await response.json(); if (response.ok) { showUIMessage(registerMessage, data.message || "Registration successful! Please login.", "success", 7000); if(registerForm) registerForm.reset(); if (passwordStrengthBar) { passwordStrengthBar.style.width = '0%'; passwordStrengthBar.className = 'password-strength-bar'; if (passwordStrengthText) passwordStrengthText.textContent = ''; if (passwordConfirmMessage) passwordConfirmMessage.textContent = ''; } setTimeout(() => { showAuthSection('login'); }, 2500); } else { showUIMessage(registerMessage, data.message || "Registration failed. Please try again.", "error"); } }
async function handleForgotPasswordSubmit(e) { e.preventDefault(); if (!forgotPasswordEmailInput || !forgotPasswordMessage || !forgotPasswordSubmitBtn) return; const email = forgotPasswordEmailInput.value.trim(); if (!email) { return showUIMessage(forgotPasswordMessage, 'Please enter your account email address.', 'error'); } const response = await apiFetch('/users/forgot-password', 'POST', { email }, forgotPasswordSubmitBtn); const data = await response.json(); if (response.ok) { showUIMessage(forgotPasswordMessage, data.message, 'success', 10000); if(forgotPasswordForm) forgotPasswordForm.reset(); } else { showUIMessage(forgotPasswordMessage, data.message || 'An error occurred. Please try again later.', 'error'); } }
async function handleCreateOrUpdateClassSubmit(e) { e.preventDefault(); if(!classNameInput_form || !classFormMessage || !submitClassBtn) return; const className = classNameInput_form.value.trim(); if (!className) { return showUIMessage(classFormMessage, 'Class name is required.', 'error'); } const payload = { className, description: classDescriptionInput_form.value.trim() || null, joinPassword: classJoinPasswordInput_form.value }; const endpoint = isEditingClass ? `/classes/${editingClassIdInput.value}` : '/classes'; const method = isEditingClass ? 'PUT' : 'POST'; const response = await apiFetch(endpoint, method, payload, submitClassBtn); const data = await response.json(); if (response.ok) { showUIMessage(classFormMessage, data.message || `Class '${payload.className}' was saved successfully!`, 'success'); resetClassFormToCreateMode(); loadMyTaughtClasses(); } else { showUIMessage(classFormMessage, data.message || "Failed to save class. Please try again.", 'error'); } }
async function loadMyTaughtClasses() { if (!currentUser || currentUser.role !== 'teacher' || !loadTaughtClassesBtn) return; const response = await apiFetch('/classes/taught', 'GET', null, loadTaughtClassesBtn); if (!response.ok) { const data = await response.json().catch(() => ({ message: "Error fetching taught classes."})); if(classFormMessage) showUIMessage(classFormMessage, data.message || "Failed to load your classes.", "error", 0); return; } const data = await response.json(); taughtClassesCache = data.classes || []; renderTaughtClasses(filterListByName(taughtClassesCache, filterTaughtClassesInput ? filterTaughtClassesInput.value : "")); }
async function loadMyEnrolledClasses() { if (!currentUser || currentUser.role !== 'student' || !loadEnrolledClassesBtn) return; const response = await apiFetch('/classes/enrolled', 'GET', null, loadEnrolledClassesBtn); if (!response.ok) { const data = await response.json().catch(() => ({ message: "Error fetching enrolled classes."})); if(joinClassMessage) showUIMessage(joinClassMessage, data.message || "Failed to load your enrolled classes.", "error", 0); return; } const data = await response.json(); enrolledClassesCache = data.classes || []; renderEnrolledClasses(filterListByName(enrolledClassesCache, filterEnrolledClassesInput ? filterEnrolledClassesInput.value : "")); }
async function handleUpdateProfileSubmit(e) { e.preventDefault(); const payload = { firstName: profileFirstNameInput.value, lastName: profileLastNameInput.value }; if (!payload.firstName || !payload.lastName) { return showUIMessage(profileInfoMessage, 'First and last names cannot be empty.', 'error'); } const response = await apiFetch('/users/profile', 'PUT', payload, updateProfileBtn); const data = await response.json(); if(response.ok) { showUIMessage(profileInfoMessage, data.message, 'success'); currentUser.firstName = data.user.firstName; currentUser.lastName = data.user.lastName; localStorage.setItem('classroomUser', JSON.stringify(currentUser)); if(profileEmailDisplay) profileEmailDisplay.textContent = currentUser.email;  loggedInUserFullName.textContent = `${currentUser.firstName} ${currentUser.lastName}`; } else { showUIMessage(profileInfoMessage, data.message, 'error'); } }
async function handleChangePasswordSubmit(e) { e.preventDefault(); const payload = { currentPassword: currentPasswordInput.value, newPassword: newPasswordInput.value, confirmNewPassword: confirmNewPasswordInput.value }; if (!payload.currentPassword || !payload.newPassword || !payload.confirmNewPassword) { return showUIMessage(changePasswordMessage, 'All fields are required.', 'error'); } if (payload.newPassword !== payload.confirmNewPassword) { return showUIMessage(changePasswordMessage, 'New passwords do not match.', 'error'); } const response = await apiFetch('/users/change-password', 'PUT', payload, changePasswordBtn); const data = await response.json(); if (response.ok) { showUIMessage(changePasswordMessage, data.message, 'success'); changePasswordForm.reset(); } else { showUIMessage(changePasswordMessage, data.message, 'error'); } }



async function handlePostAnnouncementSubmit(e) { e.preventDefault(); const title = announcementTitleInput.value.trim(); const content = announcementContentInput.value.trim(); if (!title || !content) { return showUIMessage(announcementFormMessage, 'Title and content are required.', 'error'); } const payload = { title, content }; const response = await apiFetch(`/classes/${currentViewedClassId}/announcements`, 'POST', payload, postAnnouncementBtn); const data = await response.json(); if (response.ok) { showUIMessage(announcementFormMessage, 'Announcement posted!', 'success'); if (announcementForm) announcementForm.reset(); await reloadAnnouncements(); } else { showUIMessage(announcementFormMessage, data.message || 'Failed to post announcement.', 'error'); } }


async function loadClassView(classId, focusOn = 'announcements') {
    try {
        currentViewedClassId = classId;
        apiFetch(`/classes/${classId}/announcements/mark-as-read`, 'POST');
        const [classDetailsRes, announcementsRes] = await Promise.all([
            apiFetch(`/classes/${classId}`),
            apiFetch(`/classes/${classId}/announcements`)
        ]);
        if (!classDetailsRes.ok || !announcementsRes.ok) {
            showUIMessage(announcementFormMessage, 'Could not load class data. Please go back and try again.', 'error', 0);
            return;
        }
        const classDetails = await classDetailsRes.json();
    currentViewedClassTeacherId = classDetails.teacherId; // Store teacherId
        const announcements = await announcementsRes.json();
        const isTeacherOfThisClass = currentUser.role === 'teacher' && classDetails.teacherId === currentUser.id;
        classViewName.textContent = classDetails.className;
        renderAnnouncements(announcements, isTeacherOfThisClass);
        setSectionVisibility(announcementForm.parentElement, isTeacherOfThisClass);
        showUIMessage(announcementFormMessage, ''); 
        if (announcementForm) announcementForm.reset();
        showMainContentView('classView'); 
        if (currentUser.role === 'teacher') {
            loadMyTaughtClasses();
        } else {
            loadMyEnrolledClasses();
        }
    } catch(err) {
        console.error("Error loading class view:", err);
        showUIMessage(announcementFormMessage, 'An unexpected error occurred.', 'error', 0);
    }
}



function setupEventListeners() {
    if (showRegisterFormBtn) showRegisterFormBtn.addEventListener('click', () => showAuthSection('register'));
    if (showLoginFormBtn) showLoginFormBtn.addEventListener('click', () => showAuthSection('login'));
    if (showForgotPasswordFormBtn) showForgotPasswordFormBtn.addEventListener('click', () => showAuthSection('forgotPassword'));
    if (backToLoginFromForgotBtn) backToLoginFromForgotBtn.addEventListener('click', () => showAuthSection('login'));
    if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit);
    if (registerForm) registerForm.addEventListener('submit', handleRegisterSubmit);
    if (forgotPasswordForm) forgotPasswordForm.addEventListener('submit', handleForgotPasswordSubmit);
    if (classForm) classForm.addEventListener('submit', handleCreateOrUpdateClassSubmit);
    if (announcementForm) announcementForm.addEventListener('submit', handlePostAnnouncementSubmit);
    if (darkModeToggle) darkModeToggle.addEventListener('click', handleThemeToggle);
    if(profileBtn) profileBtn.addEventListener('click', () => { profileFirstNameInput.value = currentUser.firstName; profileLastNameInput.value = currentUser.lastName; profileEmailDisplay.textContent = currentUser.email; showUIMessage(profileInfoMessage, ''); showUIMessage(changePasswordMessage, ''); if (changePasswordForm) changePasswordForm.reset(); showMainContentView('profile'); });
    if (backToDashboardBtn_profile) backToDashboardBtn_profile.addEventListener('click', () => showMainContentView('dashboard'));
    if (backToDashboardBtn_classView) backToDashboardBtn_classView.addEventListener('click', () => showMainContentView('dashboard'));
    if (backToTaughtClassesBtn) backToTaughtClassesBtn.addEventListener('click', () => showMainContentView('dashboard'));
    // Removed: backToDashboardBtn_studentLeaderboard listener, as its section is removed. backToTaughtClassesBtn handles this.

    if (profileInfoForm) profileInfoForm.addEventListener('submit', handleUpdateProfileSubmit);
    if (changePasswordForm) changePasswordForm.addEventListener('submit', handleChangePasswordSubmit);
    if (logoutBtn) logoutBtn.addEventListener('click', () => handleLogoutDueToAuthError('You have been successfully logged out.'));
    if (loadTaughtClassesBtn) loadTaughtClassesBtn.addEventListener('click', loadMyTaughtClasses);
    if (filterTaughtClassesInput) filterTaughtClassesInput.addEventListener('input', () => renderTaughtClasses(filterListByName(taughtClassesCache, filterTaughtClassesInput.value)));
    if (cancelClassEditBtn) cancelClassEditBtn.addEventListener('click', resetClassFormToCreateMode);
    
    if (teacherMyTaughtClassesListDiv) {
        teacherMyTaughtClassesListDiv.addEventListener('click', async (e) => {
            const classLi = e.target.closest('li[data-class-id]'); if (!classLi) return; const classId = parseInt(classLi.dataset.classId, 10);
            if (e.target.matches('.view-announcements-btn') || e.target.closest('.view-announcements-btn')) { e.stopPropagation(); if (classId) { loadClassView(classId, 'announcements'); } return; }
            const classObject = taughtClassesCache.find(c => c.id === classId);
            if (e.target.matches('.copy-code-btn')) { e.stopPropagation(); copyToClipboard(e.target.dataset.classCode, e.target); }
            else if (e.target.matches('.delete-btn')) { e.stopPropagation(); if (!classObject) return; if (confirm(`Are you sure you want to delete "${classObject.className}"? This action is permanent and will unenroll all students.`)) { const btn = e.target; const response = await apiFetch(`/classes/${classId}`, 'DELETE', null, btn); if (response.ok) { if(classFormMessage) showUIMessage(classFormMessage, "Class deleted successfully.", 'success'); loadMyTaughtClasses(); } else { const data = await response.json().catch(()=>({message: "Error deleting class."})); if(classFormMessage) showUIMessage(classFormMessage, data.message || "Failed to delete class.", 'error',0); } } } 
            else if (e.target.matches('.info-btn')) { e.stopPropagation(); loadClassLeaderboard(classId); } 
            else if (e.target.matches('.edit-btn')) { e.stopPropagation(); if (!classObject) return; isEditingClass = true; if(editingClassIdInput) editingClassIdInput.value = classObject.id; if(classNameInput_form) classNameInput_form.value = classObject.className; if(classJoinPasswordInput_form) classJoinPasswordInput_form.value = ''; if(classFormTitle) classFormTitle.textContent = `Edit Class: ${classObject.className}`; if(submitClassBtn) submitClassBtn.textContent = 'Update Class'; if(cancelClassEditBtn) setSectionVisibility(cancelClassEditBtn, true); if(classDescriptionInput_form) classDescriptionInput_form.value = classObject.description || ''; if (classActionSection) classActionSection.scrollIntoView({ behavior: 'smooth' }); } 
        });
    }
    if (classRosterTableBody) { 
        // Event listener for editing scores (teacher only)
        classRosterTableBody.addEventListener('click', async (e) => {
            const target = e.target;
            const row = target.closest('tr');
            if (!row) return;

            const scoreCell = row.querySelector('.score-cell');
            const scoreText = scoreCell ? scoreCell.querySelector('.score-text') : null;
            const scoreInput = scoreCell ? scoreCell.querySelector('.score-input') : null;
            
            const actionsCell = row.querySelector('.actions-cell');
            const editBtn = actionsCell ? actionsCell.querySelector('.edit-score-btn') : null;
            const saveBtn = actionsCell ? actionsCell.querySelector('.save-score-btn') : null;
            const cancelBtn = actionsCell ? actionsCell.querySelector('.cancel-score-btn') : null;

            // Handle "Edit Score" button click
            if (target.classList.contains('edit-score-btn') && scoreText && scoreInput && editBtn && saveBtn && cancelBtn) {
                scoreText.classList.add('hidden');
                scoreInput.classList.remove('hidden');
                scoreInput.value = scoreText.textContent; // Ensure input has current text value
                scoreInput.dataset.originalScore = scoreText.textContent; // Store original
                scoreInput.focus();

                editBtn.classList.add('hidden');
                saveBtn.classList.remove('hidden');
                cancelBtn.classList.remove('hidden');
            }
            // Handle "Cancel Edit" button click
            else if (target.classList.contains('cancel-score-btn') && scoreText && scoreInput && editBtn && saveBtn && cancelBtn) {
                scoreText.classList.remove('hidden');
                scoreInput.classList.add('hidden');
                scoreInput.value = scoreInput.dataset.originalScore; // Revert to original

                editBtn.classList.remove('hidden');
                saveBtn.classList.add('hidden');
                cancelBtn.classList.add('hidden');
            }
            // Handle "Save Score" button click
            else if (target.classList.contains('save-score-btn') && scoreInput && currentUser.role === 'teacher') {
                const studentId = target.dataset.studentId;
                const classId = target.dataset.classId;
                const newScore = parseInt(scoreInput.value, 10);

                if (!isNaN(newScore) && newScore >= 0) {
                    setButtonLoading(target, true, 'Saving...');
                    const res = await apiFetch(`/classes/${classId}/students/${studentId}/score`, 'PUT', { coursePoints: newScore });
                    setButtonLoading(target, false); // Re-enable button
                    // target.textContent = 'Save'; // This line is redundant

                    if (res.ok) {
                        showUIMessage(classRosterMessage, 'Score updated successfully!', 'success', 2000);
                        loadClassLeaderboard(classId); 
                    } else {
                        const errData = await res.json().catch(() => ({ message: 'Failed to update score. Please try again.'}));
                        showUIMessage(classRosterMessage, errData.message, 'error', 3000);
                        scoreInput.value = scoreInput.dataset.originalScore; // Revert to original on error
                    }
                } else {
                    showUIMessage(classRosterMessage, 'Invalid score. Please enter a non-negative number.', 'error', 3000);
                    scoreInput.value = scoreInput.dataset.originalScore; // Revert to original
                }
            }
            // Handle "Remove Student" button click (existing logic)
            else if (target.matches('.remove-student-btn')) { 
                const studentId = e.target.dataset.studentId; 
                const classId = e.target.dataset.classId; 
                const studentRow = e.target.closest('tr'); 
                const studentName = studentRow.querySelector('.leaderboard-name').textContent;
                const btn = e.target; 
                if (confirm(`Are you sure you want to remove ${studentName} from this class?`)) { 
                    const response = await apiFetch(`/classes/${classId}/students/${studentId}`, 'DELETE', null, btn); 
                    if (response.ok) { 
                        showUIMessage(classRosterMessage, "Student removed successfully.", 'success'); 
                        loadClassLeaderboard(classId); // Refresh the leaderboard
                        loadMyTaughtClasses(); // Refresh student count on dashboard
                    } else { 
                        const data = await response.json().catch(()=>({message:"Error removing student."})); 
                        showUIMessage(classRosterMessage, data.message || "Failed to remove student.", 'error',0); 
                    } 
                } 
            } 
        }); 
    }
    if (joinClassForm) { joinClassForm.addEventListener('submit', async (e) => { e.preventDefault(); if(!classCodeInput || !joinClassMessage || !joinClassSubmitBtn || !classJoinPasswordInput_student) return; const classCode = classCodeInput.value.trim(); const classJoinPassword = classJoinPasswordInput_student.value; if (!classCode) return showUIMessage(joinClassMessage, "A class code is required.", "error"); const payload = { classCode, classJoinPassword: classJoinPassword || undefined }; const response = await apiFetch('/classes/join', 'POST', payload, joinClassSubmitBtn); const data = await response.json(); if (response.ok) { showUIMessage(joinClassMessage, data.message, "success"); joinClassForm.reset(); loadMyEnrolledClasses(); } else { showUIMessage(joinClassMessage, data.message || "Failed to join class.", "error"); } }); }
    if (loadEnrolledClassesBtn) loadEnrolledClassesBtn.addEventListener('click', loadMyEnrolledClasses);
    if (filterEnrolledClassesInput) filterEnrolledClassesInput.addEventListener('input', () => renderEnrolledClasses(filterListByName(enrolledClassesCache, filterEnrolledClassesInput.value)));
    if (studentMyEnrolledClassesListDiv) {
        studentMyEnrolledClassesListDiv.addEventListener('click', async (e) => {
            const classLi = e.target.closest('li[data-class-id]'); if (!classLi) return; const classId = parseInt(classLi.dataset.classId, 10);
            
            if (e.target.matches('.leave-btn')) { e.stopPropagation(); const className = e.target.dataset.className; const btn = e.target; if (confirm(`Are you sure you want to leave "${className}"?`)) { const response = await apiFetch(`/classes/leave/${classId}`, 'DELETE', null, btn); const data = await response.json(); if (response.ok) { if(joinClassMessage) showUIMessage(joinClassMessage, data.message, 'success'); loadMyEnrolledClasses(); } else { if(joinClassMessage) showUIMessage(joinClassMessage, data.message || 'Failed to leave class.', 'error',0); } } } 
            else if (e.target.matches('.view-announcements-btn')) { e.stopPropagation(); if (classId) { loadClassView(classId, 'announcements'); } }
            else if (e.target.matches('.view-leaderboard-btn')) { e.stopPropagation(); if (classId) { loadClassLeaderboard(classId); }
            }
        });
    }
    if (togglePasswordVisibility) { togglePasswordVisibility.addEventListener('click', () => { const isPassword = regPasswordInput.type === 'password'; regPasswordInput.type = isPassword ? 'text' : 'password'; togglePasswordVisibility.textContent = isPassword ? '🙈' : '👁️'; }); }
    const validatePasswords = () => { if (!regPasswordConfirmInput || !passwordConfirmMessage) return; if (regPasswordConfirmInput.value.length > 0) { if (regPasswordInput.value === regPasswordConfirmInput.value) { passwordConfirmMessage.textContent = 'Passwords match!'; passwordConfirmMessage.className = 'password-confirm-message match'; } else { passwordConfirmMessage.textContent = 'Passwords do not match.'; passwordConfirmMessage.className = 'password-confirm-message no-match'; } } else { passwordConfirmMessage.textContent = ''; } };
    if (regPasswordInput) { regPasswordInput.addEventListener('input', () => { if (!passwordStrengthBar || !passwordStrengthText) return; const password = regPasswordInput.value; if (password.length === 0) { passwordStrengthBar.style.width = '0%'; passwordStrengthBar.className = 'password-strength-bar'; passwordStrengthText.textContent = ''; passwordConfirmMessage.textContent = ''; passwordConfirmMessage.className = 'password-confirm-message'; return; } let score = 0; if (password.length >= 8) score++; if (/[a-z]/.test(password)) score++; if (/[A-Z]/.test(password)) score++; if (/[0-9]/.test(password)) score++; if (/[!@#$%^&*]/.test(password)) score++; let barWidth = (score / 5) * 100; let barClass = 'strength-weak'; let strengthTextVal = 'Weak'; switch (score) { case 3: barClass = 'strength-medium'; strengthTextVal = 'Medium'; break; case 4: case 5: barClass = 'strength-strong'; strengthTextVal = 'Strong'; break; } passwordStrengthBar.style.width = `${barWidth}%`; passwordStrengthBar.className = `password-strength-bar ${barClass}`; passwordStrengthText.textContent = strengthTextVal; passwordStrengthText.style.color = getComputedStyle(document.documentElement).getPropertyValue(`--strength-${strengthTextVal.toLowerCase()}`); validatePasswords(); }); }
    if (regPasswordConfirmInput) { regPasswordConfirmInput.addEventListener('input', validatePasswords); }
    function openEditAnnouncementModal(announcement) { if (!editAnnouncementModal) return; editAnnouncementIdInput.value = announcement.id; editAnnouncementTitleInput.value = announcement.title; editAnnouncementContentInput.value = announcement.content; showUIMessage(editAnnouncementMessage, ''); setSectionVisibility(editAnnouncementModal, true); }
    function closeEditAnnouncementModal() { if (!editAnnouncementModal) return; setSectionVisibility(editAnnouncementModal, false); }
    async function reloadAnnouncements() { if (!currentViewedClassId) return; const announcementsRes = await apiFetch(`/classes/${currentViewedClassId}/announcements`); if (announcementsRes.ok) { const announcements = await announcementsRes.json(); const classDetailsRes = await apiFetch(`/classes/${currentViewedClassId}`); if(classDetailsRes.ok) { const classDetails = await classDetailsRes.json(); const isTeacherOfThisClass = currentUser.role === 'teacher' && classDetails.teacherId === currentUser.id; renderAnnouncements(announcements, isTeacherOfThisClass); } } }
    if (announcementsList) { announcementsList.addEventListener('click', async (e) => { const announcementCard = e.target.closest('.announcement-card'); if (!announcementCard) return; const announcementId = announcementCard.dataset.announcementId; if (e.target.matches('.delete-announcement-btn')) { if (confirm('Are you sure you want to delete this announcement? This action is permanent.')) { const response = await apiFetch(`/classes/${currentViewedClassId}/announcements/${announcementId}`, 'DELETE', null, e.target); if (response.ok) { showUIMessage(announcementFormMessage, 'Announcement deleted.', 'success'); await reloadAnnouncements(); } else { const data = await response.json(); showUIMessage(announcementFormMessage, data.message || 'Failed to delete announcement.', 'error'); } } } else if (e.target.matches('.edit-announcement-btn')) { const announcementsRes = await apiFetch(`/classes/${currentViewedClassId}/announcements`); if (announcementsRes.ok) { const announcements = await announcementsRes.json(); const announcementToEdit = announcements.find(a => a.id == announcementId); if (announcementToEdit) { openEditAnnouncementModal(announcementToEdit); } } } }); }
    if (editAnnouncementForm) { editAnnouncementForm.addEventListener('submit', async (e) => { e.preventDefault(); const announcementId = editAnnouncementIdInput.value; const payload = { title: editAnnouncementTitleInput.value.trim(), content: editAnnouncementContentInput.value.trim() }; if (!payload.title || !payload.content) { return showUIMessage(editAnnouncementMessage, 'Title and content cannot be empty.', 'error'); } const response = await apiFetch(`/classes/${currentViewedClassId}/announcements/${announcementId}`, 'PUT', payload, saveAnnouncementChangesBtn); const data = await response.json(); if (response.ok) { closeEditAnnouncementModal(); showUIMessage(announcementFormMessage, 'Announcement updated successfully!', 'success'); await reloadAnnouncements(); } else { showUIMessage(editAnnouncementMessage, data.message || 'Failed to update announcement.', 'error'); } }); }
    if (cancelAnnouncementEditBtn) { cancelAnnouncementEditBtn.addEventListener('click', closeEditAnnouncementModal); }
}

document.addEventListener('DOMContentLoaded', () => {
    assignDOMElements();
    setupEventListeners();
    checkInitialTheme();
    checkInitialLoginState();
    if(copyrightYearEl) copyrightYearEl.textContent = `© ${new Date().getFullYear()} Classroom Pro.`;
    console.log("Classroom Pro App Initialized (Final with Notification Logic)");
});






