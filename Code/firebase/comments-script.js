import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
const gameTitle = document.getElementById("gameTitle").textContent;

document.addEventListener('DOMContentLoaded', async () => {
    const commentForm = document.querySelector('.review-container button');
    const commentTextarea = document.querySelector('.review-container textarea');
    const submitButton = document.getElementById('submit-comment');

    submitButton.addEventListener('click', async (event) => {
        event.preventDefault();

        const commentText = commentTextarea.value.trim();
        if (commentText === "") {
            alert("El comentari no pot estar buit.");
            return;
        }

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const username = user.displayName || user.email;

                try {
                    const docRef = await addDoc(collection(db, "comments"), {
                        gameTitle: gameTitle,
                        username: username,
                        timestamp: serverTimestamp(),
                        comment: commentText
                    });
                    console.log("Comentari desat amb ID: ", docRef.id);
                    addCommentToPage(username, new Date().toLocaleString(), commentText);
                    commentTextarea.value = "";
                } catch (e) {
                    console.error("Error afegint el comentari: ", e);
                }
            } else {
                alert("Has d'iniciar sessió per deixar un comentari.");
            }
        });
    });

    await loadComments();
});

async function loadComments() {
    try {
        const q = query(collection(db, "comments"), where("gameTitle", "==", gameTitle));
        const querySnapshot = await getDocs(q);

        const commentsTitle = document.querySelector('.comments-title');

        if (querySnapshot.empty) {
            const noCommentsMessage = document.createElement('p');
            noCommentsMessage.textContent = "Encara no hi han comentaris en aquest joc.";
            noCommentsMessage.classList.add('no-comments-message');
            commentsTitle.parentNode.insertBefore(noCommentsMessage, commentsTitle.nextSibling);
        } else {
            commentsTitle.style.display = 'block';

            querySnapshot.forEach((doc) => {
                const commentData = doc.data();
                const username = commentData.username;
                const timestamp = commentData.timestamp.toDate().toLocaleString();
                const commentText = commentData.comment;

                addCommentToPage(username, timestamp, commentText);
            });
        }
    } catch (e) {
        console.error("Error carregant els comentaris: ", e);
    }
}

function addCommentToPage(username, date, commentText) {
    const commentsContainer = document.createElement('div');
    commentsContainer.classList.add('comment');

    const commentHTML = `
        <p><strong class="username">@${username}</strong></p>
        <p class="timestamp">${date}</p>
        <p>${commentText}</p>
    `;

    commentsContainer.innerHTML = commentHTML;

    const commentsSection = document.querySelector('.comments-section');
    commentsSection.appendChild(commentsContainer);
}
