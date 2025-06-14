
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = typeof __firebase_config !== 'undefined' ? __firebase_config : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : "default-app-id";
const apiKey = "AIzaSyASqkgIpeMm5MoHOJE6bg7h86w-uc7mmgA";

let db, auth, userId;

const authStatus = document.getElementById("auth-status");
const root = document.getElementById("app-root");

function setAuthStatus(msg) {
    if (authStatus) authStatus.textContent = msg;
}

function showRoot(content) {
    if (root) root.innerHTML = content;
}

function askGemini(question, docs) {
    const prompt = `Você é um assistente jurídico. Responda com base nos documentos abaixo:\n${docs}\n\nPergunta: ${question}`;
    return fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    }).then(res => res.json());
}

function renderUI() {
    showRoot(`
        <div class="mb-4">
            <label class="block mb-2 font-semibold">Pergunta para IA:</label>
            <textarea id="user-question" rows="4" class="w-full border rounded p-2"></textarea>
        </div>
        <button id="run-ai" class="bg-blue-600 text-white px-4 py-2 rounded">Executar IA</button>
        <div id="ai-result" class="mt-6 p-4 bg-gray-100 rounded text-gray-800 whitespace-pre-wrap"></div>
    `);

    document.getElementById("run-ai").addEventListener("click", async () => {
        const question = document.getElementById("user-question").value;
        const docs = "Documento de teste legal.";  // Aqui você pode integrar o Firestore futuramente
        const res = await askGemini(question, docs);
        const output = res.candidates?.[0]?.content?.parts?.[0]?.text || "Nenhuma resposta da IA.";
        document.getElementById("ai-result").textContent = output;
    });
}

function init() {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    onAuthStateChanged(auth, user => {
        if (user) {
            userId = user.uid;
            setAuthStatus("Conectado | ID: " + userId.substring(0, 8) + "...");
            renderUI();
        } else {
            signInAnonymously(auth).catch(err => {
                console.error(err);
                setAuthStatus("Falha na autenticação.");
            });
        }
    });
}

init();
