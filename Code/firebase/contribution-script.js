import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

async function handleFormSubmit() {
    const fileInput = document.getElementById('file-upload');
    const file = fileInput.files[0];

    if (!file) {
        alert('Per favor, adjunta un fitxer.');
        return;
    }

    const user = auth.currentUser;

    if (user) {
        const userEmail = user.email;
        console.log('User email:', userEmail);

        // Sube el archivo a Firebase Storage
        const storageRef = ref(storage, `requestedGames/${userEmail}/${file.name}`);
        try {
            const snapshot = await uploadBytes(storageRef, file);
            console.log('File uploaded successfully:', snapshot);

            const downloadURL = await getDownloadURL(snapshot.ref);
            console.log('Download URL:', downloadURL);

            // Buscar el documento del usuario en Firestore usando el correo electrónico
            const userQuery = query(collection(db, 'users'), where('email', '==', userEmail));
            const querySnapshot = await getDocs(userQuery);

            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                // Actualizar el atributo de requestedGame del usuario en Firestore
                await updateDoc(doc(db, 'users', userDoc.id), { requestedGame: downloadURL });
                console.log('Firestore document updated successfully');

                alert('La teva proposta s\'ha enviat correctament.');

                // Actualiza la interfaz
                const form = document.querySelector('.form');
                const title = document.getElementById('form-title');
                title.textContent = 'Proposta enviada!';

                const textarea = document.getElementById('proposal-textarea');
                textarea.style.display = 'none';

                const fileLabel = document.querySelector('.file-label');
                fileLabel.style.display = 'none';

                const fileNameDisplay = document.getElementById('file-name');
                fileNameDisplay.style.display = 'none';

                const submitButton = document.getElementById('submit-btn');
                submitButton.style.display = 'none';

                const backButton = document.getElementById('back-btn');
                backButton.textContent = "Tornar a la pàgina d'inici";

            } else {
                console.error('User document does not exist.');
                alert('El document de l\'usuari no existeix.');
            }

        } catch (error) {
            console.error('Error uploading file or updating document:', error);
            alert('Hi ha hagut un error en pujar el fitxer o actualitzar el document.');
        }
    } else {
        alert('Has d\'estar identificat per enviar una proposta.');
    }
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('User is signed in:', user.email);
    } else {
        console.log('No user is signed in.');
    }
});

document.getElementById('file-upload').addEventListener('change', function (event) {
    const fileName = event.target.files[0] ? event.target.files[0].name : '';
    const fileNameDisplay = document.getElementById('file-name');
    fileNameDisplay.textContent = fileName ? `🗸 ${fileName}` : '';
});

document.getElementById('submit-btn').addEventListener('click', async function () {
    if (confirm('Segur que vols enviar la proposta?')) {
        await handleFormSubmit();
    }
});

document.getElementById('back-btn').addEventListener('click', function () {
    window.location.href = 'home-page.html'; // Cambia esto a la URL correcta
});
