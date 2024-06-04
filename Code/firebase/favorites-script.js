import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, query, collection, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

// Función para mostrar los juegos destacados
function showHighlightedGames(highlightedGames) {
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach((card) => {
        const gameTitle = card.querySelector('h3').textContent.toUpperCase();
        if (highlightedGames.includes(gameTitle)) {
            card.style.display = 'flex';
        }
    });
}

// Observador para verificar el estado de la autenticación
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('Usuario autenticado:', user.email);
        const userEmail = user.email;
        const userQuery = query(collection(db, 'users'), where('email', '==', userEmail));
        getDocs(userQuery).then((querySnapshot) => {
            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const userData = userDoc.data();
                const highlightedGames = userData.highlightedGames || [];
                showHighlightedGames(highlightedGames);
            }
        }).catch((error) => {
            console.error('Error al obtener el documento del usuario:', error);
        });
    } else {
        console.log('No hay ningún usuario autenticado.');
    }
});
