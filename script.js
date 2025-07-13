// Configurações
const API_URL = "http://localhost:3000/avaliacoes";
let areaSelecionada = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Configura estrelas interativas
    document.querySelectorAll('.estrelas i').forEach(star => {
        star.addEventListener('click', function() {
            const value = parseInt(this.getAttribute('data-value'));
            document.getElementById('nota').value = value;
            
            document.querySelectorAll('.estrelas i').forEach((s, i) => {
                if (i < value) {
                    s.classList.remove('far');
                    s.classList.add('fas', 'ativa');
                } else {
                    s.classList.remove('fas', 'ativa');
                    s.classList.add('far');
                }
            });
        });
    });

    // Configura formulário
    document.getElementById('form-avaliacao').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!areaSelecionada) {
            alert("Selecione uma área primeiro!");
            return;
        }

        const avaliacao = {
            area: areaSelecionada,
            professor: document.getElementById('professor').value.trim(),
            disciplina: document.getElementById('disciplina').value.trim(),
            nota: parseInt(document.getElementById('nota').value),
            comentario: document.getElementById('comentario').value.trim(),
            data: new Date().toLocaleDateString('pt-BR')
        };

        if (!avaliacao.professor || !avaliacao.disciplina || avaliacao.nota === 0) {
            alert("Preencha todos os campos obrigatórios!");
            return;
        }

        try {
            await enviarAvaliacao(avaliacao);
            alert('✅ Avaliação registrada!');
            this.reset();
            resetEstrelas();
            carregarDisciplinas(areaSelecionada);
        } catch (error) {
            alert('❌ Erro: ' + error.message);
        }
    });
});

// Funções principais
async function enviarAvaliacao(avaliacao) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(avaliacao)
    });
    
    if (!response.ok) throw new Error('Falha ao salvar');
    return await response.json();
}

async function deletarAvaliacao(id) {
    if (!confirm('Tem certeza que deseja apagar esta avaliação permanentemente?')) return;
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Falha ao deletar');
        carregarDisciplinas(areaSelecionada);
    } catch (error) {
        alert('Erro ao apagar: ' + error.message);
    }
}

async function carregarDisciplinas(area) {
    try {
        const response = await fetch(`${API_URL}?area=${area}`);
        const avaliacoes = await response.json();
        
        const container = document.getElementById('lista-disciplinas');
        container.innerHTML = '';
        
        if (!avaliacoes || avaliacoes.length === 0) {
            container.innerHTML = '<p class="text-muted">Nenhuma avaliação encontrada.</p>';
            return;
        }
        
        avaliacoes.forEach(aval => {
            const card = document.createElement('div');
            card.className = 'col-md-6 mb-4';
            card.innerHTML = `
                <div class="card ${aval.area}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5 class="card-title">${aval.disciplina}</h5>
                                <h6 class="card-subtitle mb-2 text-muted">Prof. ${aval.professor}</h6>
                            </div>
                            <button onclick="deletarAvaliacao(${aval.id})" 
                                    class="btn btn-sm btn-outline-danger">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        <div class="avaliacao-media my-2">
                            ${'<i class="fas fa-star"></i>'.repeat(aval.nota)}
                            ${'<i class="far fa-star"></i>'.repeat(5 - aval.nota)}
                            <span class="ms-2">${aval.nota.toFixed(1)}</span>
                        </div>
                        ${aval.comentario ? `<p class="card-text">"${aval.comentario}"</p>` : ''}
                        <small class="text-muted">Avaliado em ${aval.data}</small>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar:", error);
        document.getElementById('lista-disciplinas').innerHTML = `
            <p class="text-danger">Erro ao carregar avaliações. Recarregue a página.</p>
        `;
    }
}

// Funções auxiliares
function resetEstrelas() {
    document.querySelectorAll('.estrelas i').forEach(s => {
        s.classList.remove('fas', 'ativa');
        s.classList.add('far');
    });
    document.getElementById('nota').value = 0;
}

function carregarArea(area) {
    areaSelecionada = area;
    document.getElementById('conteudo-dinamico').classList.remove('hidden');
    document.querySelector('.header-principal p').textContent = 
        `Área selecionada: ${area.charAt(0).toUpperCase() + area.slice(1)}`;
    carregarDisciplinas(area);
}

function mostrarAba(aba) {
    document.querySelectorAll('.aba-conteudo').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    
    document.getElementById(`aba-${aba}`).classList.remove('hidden');
    event.target.classList.add('active');
}