// Configuração Firebase (substitua com seus dados)
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Variáveis globais
let avaliacoes = [];

// Sistema de estrelas
document.querySelectorAll('#estrelas span').forEach(estrela => {
    estrela.addEventListener('click', function() {
        const valor = parseInt(this.getAttribute('data-value'));
        document.getElementById('nota').value = valor;
        
        // Atualiza visualização
        document.querySelectorAll('#estrelas span').forEach((s, i) => {
            s.textContent = i < valor ? '★' : '☆';
            s.classList.toggle('ativa', i < valor);
        });
    });
});

// Adicionar avaliação
function adicionarAvaliacao() {
    const professor = document.getElementById('nome-professor').value;
    const curso = document.getElementById('nome-curso').value;
    const semestre = document.getElementById('semestre').value;
    const area = document.getElementById('area-curso').value;
    const nota = document.getElementById('nota').value;
    const comentario = document.getElementById('comentario').value;

    if (!professor || !curso || !semestre || !area || nota === "0") {
        alert("Preencha todos os campos obrigatórios!");
        return;
    }

    db.collection("avaliacoes").add({
        professor,
        curso,
        semestre,
        area,
        nota: parseInt(nota),
        comentario,
        data: new Date().toLocaleDateString(),
        respostas: [],
        likes: 0
    }).then(() => {
        alert("Avaliação enviada com sucesso!");
        carregarAvaliacoes();
    });
}

// Carregar avaliações
function carregarAvaliacoes() {
    db.collection("avaliacoes").onSnapshot(snapshot => {
        avaliacoes = [];
        snapshot.forEach(doc => {
            avaliacoes.push({ id: doc.id, ...doc.data() });
        });
        atualizarListaAvaliacoes();
    });
}

// Atualizar lista na tela
function atualizarListaAvaliacoes() {
    const lista = document.getElementById('lista-avaliacoes');
    lista.innerHTML = '';

    // Agrupa por professor
    const professores = [...new Set(avaliacoes.map(av => av.professor))];
    
    professores.forEach(prof => {
        const avalsProfessor = avaliacoes.filter(av => av.professor === prof);
        const media = calcularMedia(avalsProfessor);

        const professorDiv = document.createElement('div');
        professorDiv.className = 'mb-4';
        professorDiv.innerHTML = `
            <h3 class="h6">${prof} <span class="media-nota">${media} ★</span></h3>
            <div id="avals-${prof.replace(/\s+/g, '-')}"></div>
        `;
        lista.appendChild(professorDiv);

        // Adiciona cada avaliação
        avalsProfessor.forEach(aval => {
            const avalDiv = document.createElement('div');
            avalDiv.className = `avaliacao-item p-3 mb-3 ${aval.area}`;
            avalDiv.innerHTML = `
                <div class="d-flex justify-content-between">
                    <small class="text-muted">${aval.curso} (${aval.semestre})</small>
                    <small>${aval.data}</small>
                </div>
                <div class="mt-2 mb-2">
                    ${'★'.repeat(aval.nota)}${'☆'.repeat(5 - aval.nota)}
                </div>
                <p>${aval.comentario}</p>
                <div class="d-flex gap-2">
                    <button onclick="curtirAvaliacao('${aval.id}')" class="btn-like btn btn-sm btn-outline-secondary">
                        Curtir (${aval.likes})
                    </button>
                    <button onclick="toggleResposta('${aval.id}')" class="btn-resposta btn btn-sm btn-outline-primary">
                        Responder
                    </button>
                </div>
                <div id="respostas-${aval.id}" class="respostas mt-2"></div>
                <div id="form-resposta-${aval.id}" class="mt-2 d-none">
                    <textarea id="texto-resposta-${aval.id}" class="form-control mb-2" placeholder="Sua resposta..."></textarea>
                    <button onclick="enviarResposta('${aval.id}')" class="btn btn-sm btn-primary">Enviar</button>
                </div>
            `;
            document.getElementById(`avals-${prof.replace(/\s+/g, '-')}`).appendChild(avalDiv);

            // Carrega respostas
            aval.respostas.forEach(resposta => {
                document.getElementById(`respostas-${aval.id}`).innerHTML += `
                    <div class="resposta mb-2 p-2 bg-light rounded">
                        <small>${resposta}</small>
                    </div>
                `;
            });
        });
    });
}

// Funções auxiliares
function calcularMedia(avaliacoes) {
    const total = avaliacoes.reduce((sum, av) => sum + av.nota, 0);
    return (total / avaliacoes.length).toFixed(1);
}

function curtirAvaliacao(id) {
    const aval = avaliacoes.find(a => a.id === id);
    db.collection("avaliacoes").doc(id).update({
        likes: aval.likes + 1
    });
}

function toggleResposta(id) {
    const form = document.getElementById(`form-resposta-${id}`);
    form.classList.toggle('d-none');
}

function enviarResposta(id) {
    const texto = document.getElementById(`texto-resposta-${id}`).value;
    if (!texto) return;

    const aval = avaliacoes.find(a => a.id === id);
    const novasRespostas = [...aval.respostas, texto];
    
    db.collection("avaliacoes").doc(id).update({
        respostas: novasRespostas
    }).then(() => {
        document.getElementById(`texto-resposta-${id}`).value = "";
        toggleResposta(id);
    });
}

// Inicialização
carregarAvaliacoes();
