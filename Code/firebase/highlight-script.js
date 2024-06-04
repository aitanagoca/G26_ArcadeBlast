import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, query, collection, where, getDocs, updateDoc, doc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

function toggleFavorite() {
    const gameTitle = document.querySelector('.game-title').textContent.trim();

    const user = auth.currentUser;

    if (user) {
        const userEmail = user.email;

        const userQuery = query(collection(db, 'users'), where('email', '==', userEmail));
        getDocs(userQuery).then((querySnapshot) => {
            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const userDocRef = doc(db, 'users', userDoc.id);

                const userData = userDoc.data();
                const highlightedGames = userData.highlightedGames || [];
                if (highlightedGames.includes(gameTitle)) {
                    updateDoc(userDocRef, {
                        highlightedGames: arrayRemove(gameTitle)
                    }).then(() => {
                        console.log('Juego desmarcado correctamente.');
                        markStarIcon(gameTitle, false);
                    }).catch((error) => {
                        console.error('Error al desmarcar el juego:', error);
                    });
                } else {
                    updateDoc(userDocRef, {
                        highlightedGames: arrayUnion(gameTitle)
                    }).then(() => {
                        console.log('Juego destacado correctamente.');
                        markStarIcon(gameTitle, true);
                    }).catch((error) => {
                        console.error('Error al destacar el juego:', error);
                    });
                }
            } else {
                console.error('No se encontraron documentos de usuario para el correo electrónico:', userEmail);
            }
        }).catch((error) => {
            console.error('Error al realizar la consulta de usuario:', error);
        });
    } else {
        console.error('No hay ningún usuario autenticado.');
    }
}

function markStarIcon(gameTitle, isHighlighted) {
    const starIcon = document.getElementById('star');
    if (gameTitle === starIcon.dataset.gameTitle) {
        if (isHighlighted) {
            starIcon.classList.add('fas', 'fa-star', 'star-selected');
        } else {
            starIcon.classList.add('fas', 'fa-star');
        }
    }
}

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
                for (const game of highlightedGames) {
                    markStarIcon(game, true);
                }
            }
        }).catch((error) => {
            console.error('Error al obtener el documento del usuario:', error);
        });
    } else {
        console.log('No hay ningún usuario autenticado.');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const starIcon = document.getElementById('star');
    starIcon.dataset.gameTitle = document.querySelector('.game-title').textContent.trim();
    starIcon.addEventListener('click', toggleFavorite);
});
