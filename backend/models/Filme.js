class Filme {
    constructor(id, titulo, ano, genero, poster) {
        this.id = id;
        this.titulo = titulo;
        this.ano = ano;
        this.genero = genero;
        this.poster = poster;
    }
}

// Exemplo de armazenamento em memória (substitua por banco de dados depois)
const filmes = [
    new Filme(1, "O Poderoso Chefão", 1972, "Crime", "https://...")
];