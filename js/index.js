function Pokemon() {
    this.id = 0;
    this.name = '';
    this.img = '';
    this.types = [];
    this.backgroundStyles = {};
}

async function loadPokemonFromApi(generarion = 1) {
    var pokemonListRaw = [];
    var pokemonList = [];

    await axios
        .get('https://pokeapi.co/api/v2/generation/' + generarion + '/')
        .then(response => {
            pokemonListRaw = response.data.pokemon_species;
            
            // add id property to the pokémon for sorting purpose
            pokemonListRaw.forEach(element => {
                element.url = element.url.slice(0, -1);
                element.id = parseInt(element.url.substring(element.url.lastIndexOf("/") + 1));
            });
            
            // order pokemon based on id
            pokemonListRaw.sort((a, b) => {
                return (a.id > b.id) ? 1 : -1;
            });

        })
        .catch(error => console.error(error));

        

        for (let index = 0; index < pokemonListRaw.length; index++) {
            const element = pokemonListRaw[index];
            
            await axios
                    .get(element.url.replace('-species', ''))
                    .then(innerResponse => {
                        var pokemonToAdd = new Pokemon();
                        pokemonToAdd.id = innerResponse.data.id;
                        pokemonToAdd.name = innerResponse.data.name;
                        pokemonToAdd.img = innerResponse.data.sprites.front_default;
                        pokemonToAdd.types = innerResponse.data.types.map(obj => {
                            return obj.type.name;
                        });
                        pokemonToAdd.types = pokemonToAdd.types.sort((a, b) => {
                            return (a > b) ? 1 : -1;
                        });
    
                        pokemonToAdd.backgroundStyles = formatStyles(pokemonToAdd.types);
    
                        pokemonList.push(pokemonToAdd);
    
                    })
                    .catch(error => {console.error(error)});
        }
        
        return pokemonList;
}

async function loadPokemonTypesFromApi(){
    var types = [];
    await axios 
            .get('https://pokeapi.co/api/v2/type/')
            .then(response => {
                types = response.data.results.map(obj => {
                    return obj.name;
                });
            })
            .catch(error => console.error(error));

    return types;
}

function formatStyles(typesArr) {
    if (typesArr.length == 1) {
        let clrOne = getComputedStyle(document.documentElement)
        .getPropertyValue('--' + typesArr[0] + '-clr');
        return {
            background: 'linear-gradient(135deg, ' + clrOne + ' 100%, #fff 0%)'
        };
    }
    else {
        let clrOne = getComputedStyle(document.documentElement)
        .getPropertyValue('--' + typesArr[0] + '-clr');
        let clrTwo = getComputedStyle(document.documentElement)
        .getPropertyValue('--' + typesArr[1] + '-clr');
        return {
            background: 'linear-gradient(135deg, ' + clrOne + ' 55%, ' + clrTwo + ' 45%)'
        }   
    }
}
    
function getPokemonById(pokemonList, id) {
    return pokemonList.filter(function (element) {
        return element.id === id;
    });
}


function pagingPokemonList(pokemonList, offset, limit) {
    return pokemonList.slice(offset, offset + limit);
}

function filterPokemonByType(pokemonList, type) {
    return pokemonList.filter(function (item) {
       return item.types.includes(type); 
    });
}

var app = new Vue({
    el: '#app-container',
    data: {
        isLoading: true,
        pokemonListRaw: [],
        pokemonList: [],
        pokemonListOrig: [],
        selectedPokemon: null,
        count: 0,
        error: '',
        displayObject: {
            pokemonList: []
        },
        pagingObject: {
            itemsPerPage: 10,
            offset: 0,
            isPreviousBtnDisabled: true,
            isNextBtnDisabled: false,
            totalPages: 0,
            currentPage: 1
        },
        filterObject: {
            selectedType: '',
            types: []
        }
    },
    mounted: function() {
        // in this section we're going to load all of the data from the PokeAPI.co
        // the resources needed are Pokémon and types   
        
        loadPokemonFromApi(1)
            .then(response => {               
                this.pokemonList = response;
                this.pokemonListOrig = this.pokemonList;
                this.pagingObject.totalPages = Math.floor(this.pokemonList.length / this.pagingObject.itemsPerPage + 1);
                this.displayObject.pokemonList = pagingPokemonList(this.pokemonList, this.pagingObject.offset, this.pagingObject.itemsPerPage);
                this.isLoading = false;
            })
            .catch(error => console.error(error));

        loadPokemonTypesFromApi()
            .then(response => {
                this.filterObject.types = response;
            })
            .catch(error => console.error(error));
           
    },
    methods: {
        nextPage: function () {
            this.pagingObject.isPreviousBtnDisabled = false;
            this.pagingObject.offset += this.pagingObject.itemsPerPage;
            this.pagingObject.currentPage++;

            this.displayObject.pokemonList = pagingPokemonList(this.pokemonList, this.pagingObject.offset, this.pagingObject.itemsPerPage);

            if ((this.pokemonList.length - this.pagingObject.offset) < this.pagingObject.itemsPerPage) {
                this.pagingObject.isNextBtnDisabled = true;
            }
        },
        previousPage: function () {
            this.pagingObject.isNextBtnDisabled = false;
            this.pagingObject.offset -= this.pagingObject.itemsPerPage;  
            this.pagingObject.currentPage--;  
            
            this.displayObject.pokemonList = pagingPokemonList(this.pokemonList, this.pagingObject.offset, this.pagingObject.itemsPerPage);

            if (this.pagingObject.offset < this.pagingObject.itemsPerPage) {
                this.pagingObject.isPreviousBtnDisabled = true;
            }
        },
        goToPage: function (n) {
            this.pagingObject.offset = (n-1) * this.pagingObject.itemsPerPage;
            this.pagingObject.currentPage = n;  
            
            this.displayObject.pokemonList = pagingPokemonList(this.pokemonList, this.pagingObject.offset, this.pagingObject.itemsPerPage);

            // enable the next and previous buttons
            this.pagingObject.isNextBtnDisabled = false;
            this.pagingObject.isPreviousBtnDisabled = false;

            // check if we have to disabled the previuos or the next button
             if ((this.pokemonList.length - this.pagingObject.offset) < this.pagingObject.itemsPerPage) {
                this.pagingObject.isNextBtnDisabled = true;
            }

            if (this.pagingObject.offset < this.pagingObject.itemsPerPage) {
                this.pagingObject.isPreviousBtnDisabled = true;
            }
        },
        selectPokemon: function (id) {
            this.selectedPokemon = getPokemonById(this.pokemonList, id)[0];
        },
        searchByType: function (searchedType) {
            if (searchedType === '') {
                alert('Please select a type to search for!!!');
            }
            else
            {
                this.pokemonList = filterPokemonByType(this.pokemonList, searchedType);
                this.pagingObject.offset = 0;
                this.pagingObject.isPreviousBtnDisabled = true;
                if (this.pokemonList.length <= this.pagingObject.itemsPerPage) {
                    this.pagingObject.totalPages = 1;
                    this.pagingObject.isNextBtnDisabled = true;
                } else {
                    this.pagingObject.totalPages = Math.floor(this.pokemonList.length / this.pagingObject.itemsPerPage + 1);
    
                }
    
                this.pagingObject.currentPage = 1;
    
                this.displayObject.pokemonList = pagingPokemonList(this.pokemonList, this.pagingObject.offset, this.pagingObject.itemsPerPage);
            }
        },
        clearFilter: function () {
            this.pokemonList = this.pokemonListOrig;
            this.pagingObject.offset = 0;
            this.pagingObject.currentPage = 1;
            this.pagingObject.totalPages = Math.floor(this.pokemonList.length / this.pagingObject.itemsPerPage + 1);
            this.filterObject.selectedType = '';
            this.displayObject.pokemonList = pagingPokemonList(this.pokemonList, this.pagingObject.offset, this.pagingObject.itemsPerPage);
        }
    }    
});