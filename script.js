// Variável global para armazenar a área selecionada
let areaSelecionada = null;

// Inicialização das estrelas
document.addEventListener('DOMContentLoaded', function() {
    // Configura interação das estrelas
    document.querySelectorAll('.estrelas i').forEach(star => {
        star.addEventListener('click', function() {
            const value = parseInt(this.getAttribute('data-value'));
            document.getElementById('nota').value = value;
            
            // Atualiza visualização
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

    // Configura envio do formulário
    document.getElementById('form-avaliacao').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const avaliacao = {
            area: areaSelecionada,
            professor: document.getElementById('professor').value,
            disciplina: document.getElementById('disciplina').value,
            nota: parseInt(document.getElementById('nota').value),
            comentario: document.getElementById('comentario').value,
            data: new Date().toLocaleDateString('pt-BR')
        };

        // Envia para o JSON Server
        fetch('http://localhost:3000/avaliacoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(avaliacao)
        }).then(response => {
            if (response.ok) {
                alert('Avaliação enviada com sucesso!');
                this.reset();
                // Reseta estrelas
                document.querySelectorAll('.estrelas i').forEach(s => {
                    s.classList.remove('fas', 'ativa');
                    s.classList.add('far');
                });
                document.getElementById('nota').value = 0;
            }
        }).catch(error => {
            console.error('Erro:', error);
            alert('Erro ao enviar avaliação. Tente novamente.');
        });
    });
});

// Função para carregar área selecionada
function carregarArea(area) {
    areaSelecionada = area;
    document.getElementById('conteudo-dinamico').classList.remove('hidden');
    
    // Atualiza o título
    document.querySelector('.header-principal p').textContent = 
        `Área selecionada: ${area.charAt(0).toUpperCase() + area.slice(1)}`;
    
    // Carrega disciplinas da área
    carregarDisciplinas(area);
}

// Função para alternar entre abas
function mostrarAba(aba) {
    // Esconde todas as abas
    document.querySelectorAll('.aba-conteudo').forEach(el => {
        el.classList.add('hidden');
    });
    
    // Mostra a aba selecionada
    document.getElementById(`aba-${aba}`).classList.remove('hidden');
    
    // Atualiza estado das abas
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Função para carregar disciplinas (simulada)
function carregarDisciplinas(area) {
    // Simulação - na prática, você buscaria do JSON Server
    const disciplinas = {
        exatas: ['Cálculo', 'Física', 'Álgebra Linear'],
        humanas: ['Filosofia', 'História', 'Sociologia'],
        biologicas: ['Genética', 'Bioquímica', 'Anatomia'],
        terra: ['Geologia', 'Oceanografia', 'Meteorologia']
    };
    
    const container = document.getElementById('lista-disciplinas');
    container.innerHTML = '';
    
    disciplinas[area].forEach(disciplina => {
        const card = document.createElement('div');
        card.className = 'col-md-6 mb-4';
        card.innerHTML = `
            <div class="card disciplina-card">
                <div class="card-body">
                    <h5 class="card-title">${disciplina}</h5>
                    <div class="avaliacao-media mb-2">
                        ${'<i class="fas fa-star"></i>'.repeat(4)}${'<i class="far fa-star"></i>'.repeat(1)}
                        <span class="ms-2">4.2</span>
                    </div>
                    <button class="btn btn-sm btn-outline-primary">
                        Ver Comentários
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}