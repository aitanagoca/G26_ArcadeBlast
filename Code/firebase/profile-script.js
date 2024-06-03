import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, updateProfile, updatePassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyBorKfyhu643HNOFAdPr_jSsrmDgG7ig1I",
    authDomain: "arcadeblast-c28e9.firebaseapp.com",
    projectId: "arcadeblast-c28e9",
    storageBucket: "arcadeblast-c28e9.appspot.com",
    messagingSenderId: "195192005739",
    appId: "1:195192005739:web:01b1c129085ea47acd7d2e",
    measurementId: "G-N4LLYWXM3Q"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const storage = getStorage();
const db = getFirestore();

const editBtn = document.getElementById('edit-btn');
const saveUsernameBtn = document.getElementById('save-username-btn');
const savePasswordBtn = document.getElementById('save-password-btn');
const backBtn = document.getElementById('back-btn');
const cancelBtn = document.getElementById('cancel-btn');
const profileImage = document.getElementById('profile-image');
const imageInput = document.getElementById('image-input');
const editForm = document.getElementById('edit-form');
const profileInfo = document.querySelector('.profile-info');
const buttonContainer = document.getElementById('button-container');
const contributorBadge = document.getElementById('contributor-badge');
const uploadBtn = document.getElementById('upload-btn');

// Show user profile information
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('display-username').textContent = '@' + (user.displayName || 'Anonymous');
        document.getElementById('display-email').textContent = user.email;
        if (user.photoURL) {
            document.getElementById('profile-image').src = user.photoURL;
        }
    } else {
        alert("No hay ningún usuario autenticado.");
        window.location.href = 'login.html';  // Redirigir a la página de inicio de sesión
    }
});

editBtn.addEventListener('click', function () {
    editForm.style.display = 'block';
    profileInfo.style.display = 'none';
    editBtn.style.display = 'none';
    backBtn.style.display = 'none';
    profileImage.style.cursor = 'pointer';
    document.querySelector('.form-field i.show-password').classList.add('hidden');
    uploadBtn.style.display = 'inline-block';
});

uploadBtn.addEventListener('click', function () {
    imageInput.click();
});

cancelBtn.addEventListener('click', function () {
    editForm.style.display = 'none';
    profileInfo.style.display = 'block';
    editBtn.style.display = 'inline-block';
    backBtn.style.display = 'inline-block';
    profileImage.style.cursor = 'default';
});

saveUsernameBtn.addEventListener('click', async function () {
    const username = document.getElementById('edit-username').value;

    if (!username) {
        alert("El nombre de usuario es obligatorio.");
        return;
    }

    const user = auth.currentUser;

    try {
        await updateProfile(user, { displayName: username });
        document.getElementById('display-username').textContent = '@' + username;
        alert("Se actualizó el nombre de usuario correctamente.");

        // Guardar/Actualizar datos del usuario en Firestore
        const userDoc = doc(db, 'users', user.uid);
        await setDoc(userDoc, { username }, { merge: true });

        // Actualizar nombre de usuario en el local storage
        localStorage.setItem('username', username);
    } catch (error) {
        alert(error.message);
    }
});

savePasswordBtn.addEventListener('click', async function () {
    const password = document.getElementById('edit-password').value;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
        alert("La contraseña debe tener una longitud mínima de 8 caracteres, incluir al menos una letra mayúscula, una minúscula, un número y un carácter especial.");
        document.getElementById('edit-password').value = "";
        return;
    }

    const user = auth.currentUser;

    try {
        await updatePassword(user, password);
        alert("La contraseña se actualizó correctamente.");
        document.getElementById('edit-password').value = "";
    } catch (error) {
        if (error.code === 'auth/requires-recent-login') {
            alert("Esta acción requiere que inicies sesión nuevamente para confirmar tu identidad.");
            // Redirige al usuario a la página de inicio de sesión para que pueda volver a iniciar sesión.
            window.location.href = 'login.html';
        } else {
            alert(error.message);
        }
    }
});

profileImage.addEventListener('click', function () {
    if (editForm.style.display === 'block') {
        imageInput.click();
    }
});

imageInput.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            profileImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

backBtn.addEventListener('click', function () {
    window.location.href = 'home-page.html';
});

document.querySelectorAll('.show-password').forEach(item => {
    item.addEventListener('click', event => {
        let input = event.target.previousElementSibling;
        if (input.type === 'password') {
            input.type = 'text';
            event.target.classList.remove('fa-eye');
            event.target.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            event.target.classList.remove('fa-eye-slash');
            event.target.classList.add('fa-eye');
        }
    });
});
