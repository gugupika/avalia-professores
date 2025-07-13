// Configuração
const API_URL = "http://localhost:3000/avaliacoes";

// Estrelas interativas
document.querySelectorAll('.estrelas i').forEach(star => {
    star.addEventListener('click', function() {
        const value = parseInt(this.getAttribute('data-value'));
        document.getElementById('nota').value = value;
        
        document.querySelectorAll('.estrelas i').forEach((s, i) => {
            s.classList.toggle('ativa', i < value);
        });
    });
});

// Enviar avaliação
document.getElementById('form-avaliacao').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const avaliacao = {
        professor: document.getElementById('professor').value,
        area: document.getElementById('area').value,
        curso: document.getElementById('curso').value,
        disciplina: document.getElementById('disciplina').value,
        nota: parseInt(document.getElementById('nota').value),
        comentario: document.getElementById('comentario').value,
        data: new Date().toLocaleDateString()
    };
    
    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(avaliacao)
    }).then(() => {
        alert("Avaliação enviada!");
        this.reset();
        carregarAvaliacoes();
    });
});

// Carregar avaliações
function carregarAvaliacoes() {
    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            let html = '';
            data.forEach(aval => {
                html += `
                    <div class="avaliacao ${aval.area}">
                        <h5>${aval.professor}</h5>
                        <p><strong>${aval.curso} - ${aval.disciplina}</strong></p>
                        <div class="mb-2">
                            ${'<i class="fas fa-star ativa"></i>'.repeat(aval.nota)}
                            ${'<i class="far fa-star"></i>'.repeat(5 - aval.nota)}
                        </div>
                        <p>${aval.comentario}</p>
                        <small class="text-muted">${aval.data}</small>
                    </div>
                `;
            });
            document.getElementById('avaliacoes').innerHTML = html;
        });
}

// Iniciar
carregarAvaliacoes();
