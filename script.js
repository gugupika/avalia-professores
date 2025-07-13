// Banco de dados "fake" (substitua por JSON Server depois)
let avaliacoes = [];

function adicionarAvaliacao() {
    const professor = document.getElementById('nome-professor').value;
    const curso = document.getElementById('nome-curso').value;
    const semestre = document.getElementById('semestre').value;
    const dificuldade = document.getElementById('dificuldade').value;
    const comentario = document.getElementById('comentario').value;

    if (!professor || !curso || !semestre) {
        alert("Preencha todos os campos!");
        return;
    }

    const avaliacao = {
        professor,
        curso,
        semestre,
        dificuldade,
        comentario,
        data: new Date().toLocaleDateString()
    };

    avaliacoes.push(avaliacao);
    atualizarListaAvaliacoes();
    alert("Avaliação enviada!");
}

function atualizarListaAvaliacoes() {
    const lista = document.getElementById('lista-avaliacoes');
    lista.innerHTML = '';

    avaliacoes.forEach(avaliacao => {
        const item = document.createElement('div');
        item.className = 'avaliacao-item';
        item.innerHTML = `
            <h3>${avaliacao.professor}</h3>
            <p><strong>Curso:</strong> ${avaliacao.curso} (${avaliacao.semestre})</p>
            <p><strong>Dificuldade:</strong> ${avaliacao.dificuldade}</p>
            <p>${avaliacao.comentario}</p>
            <small>${avaliacao.data}</small>
        `;
        lista.appendChild(item);
    });
}
