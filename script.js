// Configurações do servidor
const API_URL = "http://localhost:3000/avaliacoes";
let areaSelecionada = null;

// 1. Função para verificar conexão com o servidor
async function verificarServidor() {
    try {
        const teste = await fetch(API_URL);
        if (!teste.ok) throw new Error("Servidor não respondeu");
        console.log("✅ Servidor conectado");
        return true;
    } catch (error) {
        console.error("❌ Erro na conexão:", error);
        mostrarAlerta(`
            <strong>Servidor offline!</strong><br><br>
            Execute no terminal:<br>
            <code>json-server --watch db.json --port 3000</code>
        `, "danger");
        return false;
    }
}

// 2. Função para enviar avaliação (persistente)
async function enviarAvaliacao(dados) {
    try {
        // Garante que todos os campos estão preenchidos
        if (!dados.professor || !dados.disciplina || !dados.nota) {
            throw new Error("Preencha todos os campos obrigatórios");
        }

        // Adiciona timestamp para ordenação
        dados.timestamp = new Date().getTime();

        const resposta = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) throw new Error("Erro ao salvar no servidor");

        return await resposta.json();
    } catch (error) {
        console.error("Erro no envio:", error);
        throw error;
    }
}

// 3. Função para deletar avaliação
async function deletarAvaliacao(id) {
    if (!confirm('Tem certeza que deseja apagar PERMANENTEMENTE esta avaliação?')) return;

    try {
        const resposta = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!resposta.ok) throw new Error("Erro ao excluir");
        
        mostrarAlerta("Avaliação excluída com sucesso!", "success");
        carregarAvaliacoes(areaSelecionada);
    } catch (error) {
        console.error("Erro ao excluir:", error);
        mostrarAlerta(`Falha ao excluir: ${error.message}`, "danger");
    }
}

// 4. Função para carregar avaliações
async function carregarAvaliacoes(area) {
    try {
        const resposta = await fetch(`${API_URL}?area=${area}&_sort=timestamp&_order=desc`);
        const dados = await resposta.json();

        const container = document.getElementById('lista-disciplinas');
        container.innerHTML = '';

        if (!dados.length) {
            container.innerHTML = `
                <div class="aviso">
                    <i class="fas fa-info-circle"></i>
                    Nenhuma avaliação encontrada
                </div>
            `;
            return;
        }

        dados.forEach(avaliacao => {
            const card = document.createElement('div');
            card.className = `avaliacao-card ${avaliacao.area}`;
            card.innerHTML = `
                <div class="cabecalho">
                    <h3>${avaliacao.disciplina}</h3>
                    <button onclick="deletarAvaliacao(${avaliacao.id})" class="btn-excluir">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                <p class="professor">Professor: ${avaliacao.professor}</p>
                <div class="avaliacao">
                    ${'<i class="fas fa-star"></i>'.repeat(avaliacao.nota)}
                    ${'<i class="far fa-star"></i>'.repeat(5 - avaliacao.nota)}
                    <span>${avaliacao.nota.toFixed(1)}</span>
                </div>
                ${avaliacao.comentario ? `<p class="comentario">"${avaliacao.comentario}"</p>` : ''}
                <small class="data">${avaliacao.data}</small>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar:", error);
        mostrarAlerta("Erro ao carregar avaliações. Recarregue a página.", "danger");
    }
}

// 5. Configuração inicial
document.addEventListener('DOMContentLoaded', async function() {
    // Verifica conexão com o servidor
    await verificarServidor();

    // Configura estrelas interativas
    document.querySelectorAll('.estrelas i').forEach(estrela => {
        estrela.addEventListener('click', function() {
            const valor = this.getAttribute('data-value');
            document.getElementById('nota').value = valor;
            
            document.querySelectorAll('.estrelas i').forEach((s, i) => {
                s.classList.toggle('fas', i < valor);
                s.classList.toggle('far', i >= valor);
            });
        });
    });

    // Configura formulário
    document.getElementById('form-avaliacao').addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!areaSelecionada) {
            mostrarAlerta("Selecione uma área primeiro!", "warning");
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

        try {
            await enviarAvaliacao(dados);
            mostrarAlerta("Avaliação registrada com sucesso!", "success");
            this.reset();
            document.querySelectorAll('.estrelas i').forEach(s => {
                s.classList.remove('fas');
                s.classList.add('far');
            });
            await carregarAvaliacoes(areaSelecionada);
        } catch (error) {
            mostrarAlerta(`Erro: ${error.message}`, "danger");
        }
    });
});

// Funções auxiliares
function mostrarAlerta(mensagem, tipo) {
    const alerta = document.createElement('div');
    alerta.className = `alerta alerta-${tipo}`;
    alerta.innerHTML = `
        <p>${mensagem}</p>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    document.body.appendChild(alerta);
    setTimeout(() => alerta.remove(), 5000);
}

// Funções globais para chamada via HTML
window.selecionarArea = function(area) {
    areaSelecionada = area;
    document.getElementById('conteudo-dinamico').classList.remove('hidden');
    document.querySelector('.area-selecionada').textContent = area.toUpperCase();
    carregarAvaliacoes(area);
};

window.mostrarAba = function(aba) {
    document.querySelectorAll('.aba').forEach(el => el.classList.add('hidden'));
    document.getElementById(`aba-${aba}`).classList.remove('hidden');
};