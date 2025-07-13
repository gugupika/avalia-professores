// Configurações globais
const API_URL = "http://localhost:3000/avaliacoes";
let areaSelecionada = null;

// 1. Função para testar conexão com o servidor
async function verificarConexao() {
    try {
        const teste = await fetch(API_URL);
        if (!teste.ok) throw new Error("Servidor offline");
        console.log("✅ Conexão com JSON Server estabelecida");
        return true;
    } catch (error) {
        console.error("❌ Erro na conexão:", error);
        alert("Servidor não está respondendo!\n\nExecute no terminal:\njson-server --watch db.json --port 3000");
        return false;
    }
}

// 2. Função para enviar avaliação (completa)
async function enviarAvaliacao(dados) {
    try {
        // Adiciona timestamp para ordenação
        dados.timestamp = new Date().getTime(); 
        
        const resposta = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.message || "Erro desconhecido");
        }

        return await resposta.json();
    } catch (error) {
        console.error("Erro no envio:", error);
        throw error;
    }
}

// 3. Função para deletar avaliação (completa)
async function deletarAvaliacao(id) {
    if (!confirm('Tem certeza que deseja apagar PERMANENTEMENTE esta avaliação?')) return;

    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!resposta.ok) throw new Error("Falha ao excluir");

        // Atualiza a lista
        await carregarAvaliacoes(areaSelecionada); 
        alert("🗑️ Avaliação excluída com sucesso!");
    } catch (error) {
        console.error("Erro ao excluir:", error);
        alert(`❌ Falha: ${error.message}`);
    }
}

// 4. Função para carregar avaliações (completa)
async function carregarAvaliacoes(area) {
    try {
        const resposta = await fetch(`${API_URL}?area=${area}&_sort=timestamp&_order=desc`);
        const dados = await resposta.json();

        const container = document.getElementById('lista-disciplinas');
        container.innerHTML = '';

        if (!dados.length) {
            container.innerHTML = `
                <div class="aviso-vazio">
                    <i class="fas fa-info-circle"></i>
                    Nenhuma avaliação encontrada
                </div>
            `;
            return;
        }

        dados.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card-avaliacao';
            card.innerHTML = `
                <div class="cabecalho-avaliacao">
                    <h3>${item.disciplina}</h3>
                    <button onclick="deletarAvaliacao(${item.id})" class="botao-excluir">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                <div class="detalhes-avaliacao">
                    <span class="professor">${item.professor}</span>
                    <div class="estrelas">
                        ${'★'.repeat(item.nota)}${'☆'.repeat(5 - item.nota)}
                        <span>${item.nota.toFixed(1)}</span>
                    </div>
                    ${item.comentario ? `<p class="comentario">"${item.comentario}"</p>` : ''}
                    <small class="data">${item.data}</small>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar:", error);
        container.innerHTML = `
            <div class="erro-carregamento">
                <i class="fas fa-exclamation-triangle"></i>
                Erro ao carregar avaliações
            </div>
        `;
    }
}

// 5. Configuração inicial da página
document.addEventListener('DOMContentLoaded', async function() {
    // Verifica conexão
    await verificarConexao();

    // Configura estrelas interativas
    document.querySelectorAll('.estrelas i').forEach(estrela => {
        estrela.addEventListener('click', function() {
            const valor = parseInt(this.getAttribute('data-value'));
            document.getElementById('nota').value = valor;
            
            // Atualiza visualização
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
            alert("⚠️ Selecione uma área primeiro!");
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

        // Validação
        if (!dados.professor || !dados.disciplina) {
            alert("⚠️ Preencha professor e disciplina!");
            return;
        }

        if (dados.nota < 1 || dados.nota > 5) {
            alert("⚠️ Avalie com 1 a 5 estrelas!");
            return;
        }

        try {
            await enviarAvaliacao(dados);
            alert("✅ Avaliação registrada!");
            this.reset();
            document.getElementById('nota').value = 0;
            document.querySelectorAll('.estrelas i').forEach(s => {
                s.classList.remove('fas');
                s.classList.add('far');
            });
            await carregarAvaliacoes(areaSelecionada);
        } catch (error) {
            alert(`❌ Erro: ${error.message}`);
        }
    });
});

// 6. Funções globais para chamada via HTML
window.selecionarArea = function(area) {
    areaSelecionada = area;
    document.getElementById('conteudo-dinamico').classList.remove('hidden');
    document.querySelector('.area-selecionada').textContent = 
        `Área: ${area.charAt(0).toUpperCase() + area.slice(1)}`;
    carregarAvaliacoes(area);
};

window.mostrarAba = function(aba) {
    document.querySelectorAll('.aba').forEach(el => el.classList.add('hidden'));
    document.getElementById(`aba-${aba}`).classList.remove('hidden');
};