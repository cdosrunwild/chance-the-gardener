$(document).ready(function() {
	createUserSelect();
});

let emailAdd,
pw;

function logIn() {
	const loginBtn = document.getElementById('login-btn'),
	loadingSpinner = document.getElementById('login-progress-spinner'),
	emailInput = document.getElementById('email-input'),
	pwInput = document.getElementById('password-input');
	// Disable inputs.
	emailInput.setAttribute("disabled", "");
	pwInput.setAttribute("disabled", "");
	loginBtn.setAttribute("disabled", "");
	// Show loading spinner.
	loadingSpinner.classList.remove("d-none");

	emailAdd = emailInput.value;
	pw = pwInput.value;

	// Check if credentials are valid, and generate a session token with the API.
	var apiRequest = {
		"url": "https://my.farmbot.io/api/tokens",
		"method": "POST",
		"timeout": 0,
		"headers": {
			"content-type": "application/json"
		},
		"data": JSON.stringify({
			"user": {
				"email": emailAdd,
				"password": pw
			}
		}),
	};
	$.ajax(apiRequest)
		.done(function (response) {
			// If valid, save the session token and proceed.
			sessionToken = response.token.encoded;
			console.log("Session token generated: " + sessionToken);
			processCredentials();
		})
		.fail(function (err) {
			if (err.responseJSON.auth == "Bad email or password.") {
				// TODO: Tell user incorrect credentials.
				console.log('Invalid login credentials');
			} else {
				// TODO: Generic fail error.
			}
			// Re-enable inputs.
			emailInput.removeAttribute("disabled");
			pwInput.removeAttribute("disabled");
			loginBtn.removeAttribute("disabled");
			// Hide loading spinner.
			loadingSpinner.classList.add("d-none");
		});
}

async function processCredentials() {
	// Check if there are other past users in the app.
	const newUserEmailObj = {email: emailAdd},
	matchingUser = await getDbRowWhere('user', newUserEmailObj);

	// Ask to merge if no match, otherwise do it automatically.
	if (matchingUser.length > 0) {
		// If there's a match, update the db entry with new password.
		const newUserPwObj = {password: pw}
		await updateDbRowWhere('user', newUserEmailObj, newUserPwObj);

		// Set this user as logged in.
		localStorage.setItem('lastLoginUserID', matchingUser[0].userId);

		// Check if user only exists due to import, and grab their farm data if so.
		const newUserIdObj = {userId: matchingUser[0].userId},
		matchingUserDevice = await getDbRowWhere('device', newUserIdObj);
		if (matchingUserDevice.length = 0) {
			// Get their farm details and save to db.
			const lightPin = await findLightPin(),
			farmSize = await getFarmSize(),
			newDeviceObj = {
				xMax: farmSize[0],
				yMax: farmSize[1],
				lightPinNum: lightPin,
				zScanHeight: 0,
				userId: matchingUser[0].userId
			};

			await addDbTableRow('device', newDeviceObj);
		}
		
		// Move to main menu when done.
		changePage('main-menu.html');
	} else {	
		// If no matching email, ask if they updated email and want to merge with an existing user.
		// Check if there's any users in db to merge with.
		const userDbLength = await getDbTableSize('user');
		if (userDbLength >= 1) {
			const mergeModal = new bootstrap.Modal(document.getElementById('merge-user-modal'));
			mergeModal.show();
		} else {
			saveUserToDb();
		}
	}
}

async function mergeAccount() {
	const newUserCredsObj = {email: emailAdd, password: pw};
	// Grab existing account from db.
	const oldUserId = parseInt(document.getElementById("user-select").value),
	oldUserIdObj = {userId: oldUserId};

	// Update that db acc with new credentials.
	await updateDbRowWhere('user', oldUserIdObj, newUserCredsObj);

	// Save the user ID as last logged in.
	localStorage.setItem('lastLoginUserID', oldUserId);

	// Move to main menu when done.
	changePage('main-menu.html');
}

async function saveUserToDb() {
	// Create new user in db.
	const newUserCredsObj = {email: emailAdd, password: pw};
	await addDbTableRow('user', newUserCredsObj);

	// Save the new user ID as last logged in.
	const newUserEmailObj = {email: emailAdd},
	newUserObj = await getDbRowWhere('user', newUserEmailObj),
	newUserId = newUserObj[0].userId;
	localStorage.setItem('lastLoginUserID', newUserId);

	// Get their farm details and save to db.
	const lightPin = await findLightPin(),
	farmSize = await getFarmSize(),
	newDeviceObj = {
		xMax: farmSize[0],
		yMax: farmSize[1],
		lightPinNum: lightPin,
		zScanHeight: 0,
		userId: newUserId
	};

	await addDbTableRow('device', newDeviceObj);

	// Move to main menu when done.
	changePage('main-menu.html');
}

function backToMergePrompt() {
	const mergeModal = new bootstrap.Modal(document.getElementById('merge-user-modal'));
	mergeModal.show();
}

function showMergeConfirmationModal() {
	const mergeModal = new bootstrap.Modal(document.getElementById('merge-user-process-modal'));
	mergeModal.show();
}

function hideShowPwText() {
	const pwInput = document.getElementById('password-input'),
	hideShowIcon = document.getElementById('pw-hide-show-icon');

	if (pwInput.type === 'password') {
		pwInput.type = 'text';
		hideShowIcon.classList.remove('bi-eye-slash-fill');
		hideShowIcon.classList.add('bi-eye-fill');
	} else {
		pwInput.type = 'password';
		hideShowIcon.classList.remove('bi-eye-fill');
		hideShowIcon.classList.add('bi-eye-slash-fill');
	}
  }