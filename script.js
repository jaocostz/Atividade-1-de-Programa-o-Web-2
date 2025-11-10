class RickAndMortyAPI {
    constructor() {
        this.baseURL = 'https://rickandmortyapi.com/api/character';
        this.currentPage = 1;
        this.totalPages = 0;
        this.currentSearch = '';
        this.isLoading = false;
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadCharacters();
    }

    initializeElements() {
        this.charactersContainer = document.getElementById('charactersContainer');
        this.searchInput = document.getElementById('searchInput');
        this.searchButton = document.getElementById('searchButton');
        this.loadMoreButton = document.getElementById('loadMoreButton');
        this.loadMoreContainer = document.getElementById('loadMoreContainer');
        this.loadingElement = document.getElementById('loading');
        this.errorElement = document.getElementById('errorMessage');
    }

    attachEventListeners() {
        this.searchButton.addEventListener('click', () => this.handleSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
        this.loadMoreButton.addEventListener('click', () => this.loadMoreCharacters());
    }

    async handleSearch() {
        const searchTerm = this.searchInput.value.trim();
        this.currentSearch = searchTerm;
        this.currentPage = 1;
        this.charactersContainer.innerHTML = '';
        this.loadMoreContainer.style.display = 'none';
        this.hideError();
        this.showLoading();
        
        await this.loadCharacters();
    }

    async loadCharacters() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading();
        this.hideError();

        try {
            const url = this.currentSearch 
                ? `${this.baseURL}?name=${encodeURIComponent(this.currentSearch)}&page=${this.currentPage}`
                : `${this.baseURL}?page=${this.currentPage}`;

            const response = await fetch(url);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Nenhum personagem encontrado com esse nome.');
                } else {
                    throw new Error('Erro ao carregar personagens. Tente novamente.');
                }
            }

            const data = await response.json();
            this.totalPages = data.info.pages;
            
            if (this.currentPage === 1) {
                this.charactersContainer.innerHTML = '';
            }
            
            this.displayCharacters(data.results);
            this.updateLoadMoreButton(data.info.next);
            
        } catch (error) {
            this.showError(error.message);
            if (this.currentPage === 1) {
                this.charactersContainer.innerHTML = '';
            }
        } finally {
            this.hideLoading();
            this.isLoading = false;
        }
    }

    displayCharacters(characters) {
        if (!characters || characters.length === 0) {
            this.showError('Nenhum personagem encontrado.');
            return;
        }

        characters.forEach(character => {
            const characterCard = this.createCharacterCard(character);
            this.charactersContainer.appendChild(characterCard);
        });
    }

    createCharacterCard(character) {
        const card = document.createElement('div');
        card.className = 'character-card';
        
        const statusClass = `status-${character.status.toLowerCase()}`;
        
        card.innerHTML = `
            <img src="${character.image}" alt="${character.name}" class="character-image">
            <div class="character-info">
                <h3 class="character-name">${character.name}</h3>
                <div class="character-detail">
                    <span class="status-indicator ${statusClass}"></span>
                    ${character.status} - ${character.species}
                </div>
                <div class="character-detail">
                    <strong>Origem:</strong> ${character.origin.name}
                </div>
                <div class="character-detail">
                    <strong>Localização:</strong> ${character.location.name}
                </div>
                <div class="character-detail">
                    <strong>Aparece em:</strong> ${character.episode.length} episódio(s)
                </div>
            </div>
        `;
        
        return card;
    }

    async loadMoreCharacters() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.loadMoreButton.disabled = true;
            this.loadMoreButton.textContent = 'Carregando...';
            
            await this.loadCharacters();
            
            this.loadMoreButton.disabled = false;
            this.loadMoreButton.textContent = 'Carregar Mais';
        }
    }

    updateLoadMoreButton(nextPage) {
        if (nextPage) {
            this.loadMoreContainer.style.display = 'block';
        } else {
            this.loadMoreContainer.style.display = 'none';
        }
    }

    showLoading() {
        this.loadingElement.style.display = 'block';
    }

    hideLoading() {
        this.loadingElement.style.display = 'none';
    }

    showError(message) {
        this.errorElement.textContent = message;
        this.errorElement.style.display = 'block';
    }

    hideError() {
        this.errorElement.style.display = 'none';
    }
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new RickAndMortyAPI();
});