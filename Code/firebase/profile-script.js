import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, updateProfile, updatePassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, query, collection, where, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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

onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById('display-username').textContent = '@' + (user.displayName || 'Anonymous');
        document.getElementById('display-email').textContent = user.email;

        const userQuery = query(collection(db, 'users'), where('email', '==', user.email));
        const querySnapshot = await getDocs(userQuery);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            if (userData.photoURL) {
                document.getElementById('profile-image').src = userData.photoURL;
            }

            if (userData.requestedGame) {
                document.querySelector('.badge').style.display = 'inline-block';
            }
        } else {
            alert("No s'ha trobat el document de l'usuari.");
        }
    } else {
        alert("No hi ha cap usuari autenticat.");
        window.location.href = 'login.html';
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
    const user = auth.currentUser;
    const userEmail = user.email;
    const file = imageInput.files[0];
    if (file && user) {
        const reader = new FileReader();
        reader.onload = async function (e) {
            const imageUrl = e.target.result;
            try {
                const storageRef = ref(storage, `profile_images/${userEmail}/${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(snapshot.ref);

                const userQuery = query(collection(db, 'users'), where('email', '==', user.email));
                const querySnapshot = await getDocs(userQuery);

                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];
                    await updateDoc(doc(db, 'users', userDoc.id), { photoURL: downloadURL });

                    profileImage.src = imageUrl;

                    alert('Imatge pujada correctament.');
                } else {
                    alert("No s'ha trobat el document de l'usuari.");
                }
            } catch (error) {
                alert("Error al pujar l'imatge: " + error.message);
            }
        };
        reader.readAsDataURL(file);
    }
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
        alert("El nom d'usuari es obligatori.");
        return;
    }

    const user = auth.currentUser;

    try {
        await updateProfile(user, { displayName: username });
        document.getElementById('display-username').textContent = '@' + username;
        alert("S'ha actualizat el nom de l'usuari correctament.");

        const userQuery = query(collection(db, 'users'), where('email', '==', user.email));
        const querySnapshot = await getDocs(userQuery);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            await updateDoc(doc(db, 'users', userDoc.id), { username });
        } else {
            alert("No s'ha trobat el document de l'usuari.");
        }

        localStorage.setItem('username', username);
    } catch (error) {
        alert(error.message);
    }
});

savePasswordBtn.addEventListener('click', async function () {
    const password = document.getElementById('edit-password').value;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
        alert("La contrasenya ha de tenir una longitud mínima de 8 caràcters, incloure almenys una lletra majúscula, una minúscula, un número i un caràcter especial.");
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
            alert("Aquesta acció requereix que tornis a iniciar sessió per confirmar la teva identitat.");
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
