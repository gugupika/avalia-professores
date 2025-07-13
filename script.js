// Configurações
const API_URL = "http://localhost:3000/avaliacoes";
let areaSelecionada = null;

// 1. Verificação de Conexão
async function verificarConexao() {
    try {
        const teste = await fetch(API_URL);
        if (!teste.ok) throw new Error("Servidor offline");
        console.log("✅ Conexão estabelecida com JSON Server");
        return true;
    } catch (error) {
        console.error("❌ Falha na conexão:", error);
        mostrarAlerta(`
            <strong>Servidor offline!</strong><br><br>
            Execute no terminal:<br>
            <code>json-server --watch db.json --port 3000</code>
        `, "erro");
        return false;
    }
}

// 2. Função para mostrar alertas
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

// 3. Enviar Avaliação (Persistente)
async function enviarAvaliacao(dados) {
    try {
        // Validação
        if (!dados.professor || !dados.disciplina || dados.nota < 1) {
            throw new Error("Preencha todos os campos obrigatórios");
        }

        // Adiciona timestamp
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

// 4. Deletar Avaliação
async function deletarAvaliacao(id) {
    if (!confirm('Tem certeza que deseja apagar PERMANENTEMENTE esta avaliação?')) return;

    try {
        const resposta = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!resposta.ok) throw new Error("Falha ao excluir");
        
        mostrarAlerta("Avaliação excluída com sucesso!");
        carregarAvaliacoes(areaSelecionada);
    } catch (error) {
        console.error("Erro ao excluir:", error);
        mostrarAlerta(`Falha ao excluir: ${error.message}`, "erro");
    }
}

// 5. Carregar Avaliações
async function carregarAvaliacoes(area) {
    try {
        const resposta = await fetch(`${API_URL}?area=${area}&_sort=timestamp&_order=desc`);
        const dados = await resposta.json();

        const container = document.getElementById('lista-disciplinas');
        container.innerHTML = '';

        if (!dados.length) {
            container.innerHTML = `
                <div class="col-12 text-center py-4 text-muted">
                    <i class="fas fa-info-circle fa-2x mb-3"></i>
                    <p>Nenhuma avaliação encontrada</p>
                </div>
            `;
            return;
        }

        dados.forEach(aval => {
            const div = document.createElement('div');
            div.className = `col-md-6 avaliacao-item ${aval.area}`;
            div.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h5>${aval.disciplina}</h5>
                        <p class="text-muted">Prof. ${aval.professor}</p>
                    </div>
                    <button onclick="deletarAvaliacao(${aval.id})" class="btn-excluir">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                <div class="estrelas-avaliacao my-2">
                    ${'<i class="fas fa-star"></i>'.repeat(aval.nota)}
                    ${'<i class="far fa-star"></i>'.repeat(5 - aval.nota)}
                    <span class="ms-2">${aval.nota.toFixed(1)}</span>
                </div>
                ${aval.comentario ? `<p class="comentario">"${aval.comentario}"</p>` : ''}
                <small class="d-block text-end text-muted">${aval.data}</small>
            `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error("Erro ao carregar:", error);
        mostrarAlerta("Erro ao carregar avaliações", "erro");
    }
}

// 6. Configuração Inicial
document.addEventListener('DOMContentLoaded', async function() {
    // Verifica conexão
    await verificarConexao();

    // Configura Estrelas
    document.querySelectorAll('.estrelas i').forEach(estrela => {
        estrela.addEventListener('click', function() {
            const valor = parseInt(this.getAttribute('data-value'));
            document.getElementById('nota').value = valor;
            
            document.querySelectorAll('.estrelas i').forEach((s, i) => {
                s.classList.toggle('fas', i < valor);
                s.classList.toggle('far', i >= valor);
            });
        });
    });

    // Configura Formulário
    document.getElementById('form-avaliacao').addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!areaSelecionada) {
            mostrarAlerta("Selecione uma área primeiro!", "aviso");
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
            mostrarAlerta("✅ Avaliação registrada com sucesso!");
            this.reset();
            document.querySelectorAll('.estrelas i').forEach(s => {
                s.classList.remove('fas');
                s.classList.add('far');
            });
            await carregarAvaliacoes(areaSelecionada);
        } catch (error) {
            mostrarAlerta(`❌ ${error.message}`, "erro");
        }
    });
});

// Funções Globais para chamada via HTML
window.selecionarArea = function(area) {
    areaSelecionada = area;
    document.getElementById('conteudo-dinamico').classList.remove('hidden');
    document.getElementById('area-selecionada-texto').textContent = 
        `Área: ${area.charAt(0).toUpperCase() + area.slice(1)}`;
    carregarAvaliacoes(area);
};

window.mostrarAba = function(aba) {
    document.querySelectorAll('.aba-conteudo').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    
    document.getElementById(`aba-${aba}`).classList.remove('hidden');
    event.target.classList.add('active');
};