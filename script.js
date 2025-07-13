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

// Variáveis globais
let areaSelecionada = null;

// Funções de UI
function mostrarAlerta(mensagem, tipo = "sucesso") {
    const container = document.getElementById('alert-container');
    const alerta = document.createElement('div');
    alerta.className = `alerta alerta-${tipo}`;
    alerta.innerHTML = `
        <p>${mensagem}</p>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    container.appendChild(alerta);
    setTimeout(() => alerta.remove(), 5000);
}

// Funções do Firestore
async function enviarAvaliacao(dados) {
    try {
        await db.collection("avaliacoes").add({
            ...dados,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        mostrarAlerta("✅ Avaliação registrada com sucesso!");
        return true;
    } catch (error) {
        console.error("Erro ao enviar:", error);
        mostrarAlerta(`❌ Erro: ${error.message}`, "erro");
        return false;
    }
}

async function carregarAvaliacoes(area) {
    try {
        const container = document.getElementById('lista-disciplinas');
        container.innerHTML = '<p class="text-center">Carregando...</p>';

        const snapshot = await db.collection("avaliacoes")
            .where("area", "==", area)
            .orderBy("timestamp", "desc")
            .get();

        container.innerHTML = '';
        
        if (snapshot.empty) {
            container.innerHTML = `
                <div class="col-12 text-center py-4 text-muted">
                    <i class="fas fa-info-circle fa-2x mb-3"></i>
                    <p>Nenhuma avaliação encontrada</p>
                </div>
            `;
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            const div = document.createElement('div');
            div.className = `col-md-6 mb-4 avaliacao-item ${data.area}`;
            div.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h5>${data.disciplina}</h5>
                        <p class="text-muted">Prof. ${data.professor}</p>
                    </div>
                    <button onclick="deletarAvaliacao('${doc.id}')" class="btn-excluir">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                <div class="estrelas-avaliacao my-2">
                    ${'<i class="fas fa-star"></i>'.repeat(data.nota)}
                    ${'<i class="far fa-star"></i>'.repeat(5 - data.nota)}
                    <span class="ms-2">${data.nota.toFixed(1)}</span>
                </div>
                ${data.comentario ? `<p class="comentario">"${data.comentario}"</p>` : ''}
                <small class="d-block text-end text-muted">${data.data}</small>
            `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error("Erro ao carregar:", error);
        mostrarAlerta("Erro ao carregar avaliações", "erro");
    }
}

async function deletarAvaliacao(id) {
    if (!confirm('Tem certeza que deseja apagar esta avaliação?')) return;
    
    try {
        await db.collection("avaliacoes").doc(id).delete();
        mostrarAlerta("🗑️ Avaliação excluída com sucesso!");
        carregarAvaliacoes(areaSelecionada);
    } catch (error) {
        console.error("Erro ao excluir:", error);
        mostrarAlerta(`❌ Falha ao excluir: ${error.message}`, "erro");
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Configura estrelas
    document.querySelectorAll('.estrelas i').forEach(star => {
        star.addEventListener('click', function() {
            const value = parseInt(this.getAttribute('data-value'));
            document.getElementById('nota').value = value;
            
            document.querySelectorAll('.estrelas i').forEach((s, i) => {
                s.classList.toggle('fas', i < value);
                s.classList.toggle('far', i >= value);
            });
        });
    });

    // Configura formulário
    document.getElementById('form-avaliacao').addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!areaSelecionada) {
            mostrarAlerta("⚠️ Selecione uma área primeiro!", "aviso");
            return;
        }

        const dados = {
            area: areaSelecionada,
            professor: document.getElementById('professor').value.trim(),
            disciplina: document.getElementById('disciplina').value.trim(),
            nota: parseInt(document.getElementById('nota').value),
            comentario: document.getElementById('comentario').value.trim(),
            data: new Date().toLocaleDateString('pt-BR')
        };

        if (!dados.professor || !dados.disciplina || dados.nota < 1) {
            mostrarAlerta("⚠️ Preencha todos os campos obrigatórios!", "aviso");
            return;
        }

        const sucesso = await enviarAvaliacao(dados);
        if (sucesso) {
            this.reset();
            document.querySelectorAll('.estrelas i').forEach(s => {
                s.classList.remove('fas');
                s.classList.add('far');
            });
            document.getElementById('nota').value = 0;
        }
    });
});

// Funções globais
window.selecionarArea = function(area) {
    areaSelecionada = area;
    document.getElementById('conteudo-dinamico').classList.remove('d-none');
    document.getElementById('area-selecionada-texto').textContent = 
        `Área: ${area.charAt(0).toUpperCase() + area.slice(1)}`;
    mostrarAba('avaliar');
    carregarAvaliacoes(area);
};

window.mostrarAba = function(aba) {
    document.querySelectorAll('.aba-conteudo').forEach(el => el.classList.add('d-none'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    
    document.getElementById(`aba-${aba}`).classList.remove('d-none');
    event.target.classList.add('active');
    
    if (aba === 'disciplinas') {
        carregarAvaliacoes(areaSelecionada);
    }
};