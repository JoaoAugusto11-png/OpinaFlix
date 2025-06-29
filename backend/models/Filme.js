const { db } = require('../config/firebase');

class Filme {
    constructor(data) {
        this.id = data.id;
        this.titulo = data.titulo;
        this.ano = data.ano;
        this.genero = data.genero;
        this.poster = data.poster;
        this.sinopse = data.sinopse;
        this.diretor = data.diretor;
        this.elenco = data.elenco;
        this.duracao = data.duracao;
        this.tipo = data.tipo || 'movie';
        this.tmdb_id = data.tmdb_id;
        this.dataCadastro = data.dataCadastro;
    }

    static async criar(titulo, ano, genero, poster, dadosExtras = {}) {
        try {
            const novoFilme = {
                titulo: titulo.toLowerCase(), // Para facilitar busca
                titulo_original: titulo,
                ano: parseInt(ano) || new Date().getFullYear(),
                genero,
                poster: poster || '',
                sinopse: dadosExtras.sinopse || '',
                diretor: dadosExtras.diretor || '',
                elenco: dadosExtras.elenco || [],
                duracao: dadosExtras.duracao || 0,
                tipo: dadosExtras.tipo || 'movie',
                tmdb_id: dadosExtras.tmdb_id || null,
                dataCadastro: new Date().toISOString(),
                ativo: true
            };

            const docRef = await db.collection('filmes').add(novoFilme);
            
            return new Filme({
                id: docRef.id,
                ...novoFilme
            });

        } catch (error) {
            throw new Error('Erro ao criar filme: ' + error.message);
        }
    }

    static async listarTodos(limit = 20, tipo = null) {
        try {
            let query = db.collection('filmes').where('ativo', '==', true);
            
            if (tipo) {
                query = query.where('tipo', '==', tipo);
            }
            
            query = query.orderBy('dataCadastro', 'desc').limit(limit);
            
            const snapshot = await query.get();
            const filmes = [];
            
            snapshot.forEach(doc => {
                filmes.push(new Filme({
                    id: doc.id,
                    ...doc.data()
                }));
            });
            
            return filmes;

        } catch (error) {
            throw new Error('Erro ao listar filmes: ' + error.message);
        }
    }

    static async encontrarPorId(id) {
        try {
            const doc = await db.collection('filmes').doc(id).get();
            
            if (!doc.exists) {
                return null;
            }
            
            return new Filme({
                id: doc.id,
                ...doc.data()
            });

        } catch (error) {
            throw new Error('Erro ao buscar filme por ID: ' + error.message);
        }
    }

    static async buscarPorTitulo(titulo, limit = 10) {
        try {
            const tituloLower = titulo.toLowerCase();
            
            const snapshot = await db.collection('filmes')
                .where('ativo', '==', true)
                .where('titulo', '>=', tituloLower)
                .where('titulo', '<=', tituloLower + '\uf8ff')
                .limit(limit)
                .get();
            
            const filmes = [];
            snapshot.forEach(doc => {
                filmes.push(new Filme({
                    id: doc.id,
                    ...doc.data()
                }));
            });
            
            return filmes;

        } catch (error) {
            throw new Error('Erro ao buscar filmes por título: ' + error.message);
        }
    }

    static async encontrarPorTmdbId(tmdbId) {
        try {
            const snapshot = await db.collection('filmes')
                .where('tmdb_id', '==', tmdbId)
                .where('ativo', '==', true)
                .get();
            
            if (snapshot.empty) {
                return null;
            }
            
            const doc = snapshot.docs[0];
            return new Filme({
                id: doc.id,
                ...doc.data()
            });

        } catch (error) {
            throw new Error('Erro ao buscar filme por TMDB ID: ' + error.message);
        }
    }

    static async atualizar(id, dados) {
        try {
            const filmeRef = db.collection('filmes').doc(id);
            
            const dadosAtualizacao = {
                ...dados,
                dataAtualizacao: new Date().toISOString()
            };
            
            await filmeRef.update(dadosAtualizacao);
            
            return await Filme.encontrarPorId(id);

        } catch (error) {
            throw new Error('Erro ao atualizar filme: ' + error.message);
        }
    }

    static async deletar(id) {
        try {
            // Soft delete
            await db.collection('filmes').doc(id).update({
                ativo: false,
                dataExclusao: new Date().toISOString()
            });
            
            return true;

        } catch (error) {
            throw new Error('Erro ao deletar filme: ' + error.message);
        }
    }
}

module.exports = Filme;