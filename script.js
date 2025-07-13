// Configuração do Firebase (SUBSTITUA com seus dados!)
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
};

// Inicialização
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Variável global
let areaSelecionada = null;

// Funções Principais
async function enviarAvaliacao() {
    const dados = {
        area: areaSelecionada,
        professor: document.getElementById('professor').value.trim(),
        disciplina: document.getElementById('disciplina').value.trim(),
        nota: parseInt(document.getElementById('nota').value),
        comentario: document.getElementById('comentario').value.trim(),
        data: new Date().toLocaleDateString('pt-BR'),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection("avaliacoes").add(dados);
        alert("✅ Avaliação registrada!");
        carregarAvaliacoes(areaSelecionada);
    } catch (error) {
        alert(`❌ Erro: ${error.message}`);
    }
}

async function carregarAvaliacoes(area) {
    const lista = document.getElementById('lista-disciplinas');
    lista.innerHTML = "Carregando...";

    const snapshot = await db.collection("avaliacoes")
        .where("area", "==", area)
        .orderBy("timestamp", "desc")
        .get();

    lista.innerHTML = '';
    snapshot.forEach(doc => {
        const data = doc.data();
        lista.innerHTML += `
            <div class="avaliacao-card ${data.area}">
                <h4>${data.disciplina}</h4>
                <p>Professor: ${data.professor}</p>
                <div class="estrelas">
                    ${'<i class="fas fa-star"></i>'.repeat(data.nota)}
                    ${'<i class="far fa-star"></i>'.repeat(5 - data.nota)}
                </div>
                <button onclick="deletarAvaliacao('${doc.id}')">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        `;
    });
}

async function deletarAvaliacao(id) {
    if (confirm("Tem certeza?")) {
        await db.collection("avaliacoes").doc(id).delete();
        carregarAvaliacoes(areaSelecionada);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Configura estrelas e formulário
});