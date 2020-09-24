function Pokemon() {
    this.id = 0;
    this.name = '';
    this.img = '';
    this.types = [];
    this.backgroundStyles = {};
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

async function getPokemonFromApi(pokemonListByGeneration, offset, take) {  
    var pokemonList = [];

    pokemonListByGeneration.sort((a, b) => {
        return (a.id > b.id) ? 1 : -1;
    });

    var arrayTmp = pokemonListByGeneration.slice(offset, offset + take);

    for (let index = 0; index < arrayTmp.length; index++) {
        const element = arrayTmp[index];

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
                .catch(error => console.error(error));        
    }   
    
    return pokemonList;
}
    
async function getPokemonFromApiByType(pokemonListByGeneration, offset, take, type) {
    var pokemonList = [];

    pokemonListByGeneration.sort((a, b) => {
        return (a.id > b.id) ? 1 : -1;
    });

    for (let index = 0; index < pokemonListByGeneration.length; index++) {
        const element = pokemonListByGeneration[index];

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

                    // surround it with if/else statement
                    if (pokemonToAdd.types.includes(type)) {
                        pokemonList.push(pokemonToAdd);                        
                    }
                })
                .catch(error => console.error(error)); 
    }

    return pokemonList.slice(offset, offset + take);
}

async function getPokemonById(id){
    var pokemon = new Pokemon();
    axios
        .get('https://pokeapi.co/api/v2/pokemon/' + id)
        .then((response) => {
            pokemon.id = id;
            pokemon.name = response.data.name;
            pokemon.img = response.data.sprites.versions["generation-v"]["black-white"].animated.front_default;

        })
        .catch((error) => console.error(error));

        return pokemon;
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

function pagingPokemonList(pokemonList, offset, limit) {
    return pokemonList.slice(offset, offset + limit);
}

var app = new Vue({
    el: '#app-container',
    data: {
        pokemonListRaw: [],
        pokemonList: [],
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
                this.displayObject.pokemonList = pagingPokemonList(this.pokemonList, this.pagingObject.offset, this.pagingObject.itemsPerPage);

            })
            .catch(error => console.error(error));

        loadPokemonTypesFromApi()
            .then(response => {
                this.filterObject.types = response;
            })
            .catch(error => console.error(error));


        // axios
        //     .get('https://pokeapi.co/api/v2/type/')
        //     .then(response => {
        //         this.filterObject.types = response.data.results.map(obj => {
        //             return obj.name;
        //         });
        //     })
        //     .catch(error => console.error(error));
           
    },
    methods: {
        nextPage: function () {
            this.pagingObject.isPreviousBtnDisabled = false;
            this.pagingObject.offset += this.pagingObject.itemsPerPage;
            this.pagingObject.currentPage++;   
            getPokemonFromApi(this.pokemonListRaw, this.pagingObject.offset, this.pagingObject.itemsPerPage)
                .then(result => {
                    this.pokemonList = result;
                })
                .catch(error => console.error(error));

            if ((this.pokemonListRaw.length - this.pagingObject.offset) < this.pagingObject.itemsPerPage) {
                this.pagingObject.isNextBtnDisabled = true;
            }
        },
        previousPage: function () {
            this.pagingObject.isNextBtnDisabled = false;
            this.pagingObject.offset -= this.pagingObject.itemsPerPage;  
            this.pagingObject.currentPage--;   
            getPokemonFromApi(this.pokemonListRaw, this.pagingObject.offset, this.pagingObject.itemsPerPage)
                .then(result => {
                    this.pokemonList = result;
                })
                .catch(error => console.error(error));

            if (this.pagingObject.offset < this.pagingObject.itemsPerPage) {
                this.pagingObject.isPreviousBtnDisabled = true;
            }
        },
        goToPage: function (n) {
            this.pagingObject.offset = (n-1) * this.pagingObject.itemsPerPage;
            this.pagingObject.currentPage = n;   
            getPokemonFromApi(this.pokemonListRaw, this.pagingObject.offset, this.pagingObject.itemsPerPage)
                .then(result => {
                    this.pokemonList = result;
                })
                .catch(error => console.error(error));

            // check if we have to disabled the previuos or the next button
            if ((this.pokemonListRaw.length - this.pagingObject.offset) < this.pagingObject.itemsPerPage) {
                this.pagingObject.isNextBtnDisabled = true;
            }

            if (this.pagingObject.offset < this.pagingObject.itemsPerPage) {
                this.pagingObject.isPreviousBtnDisabled = true;
            }
        },
        selectPokemon: function (id) {
            getPokemonById(id)
                .then(result => {
                    this.selectedPokemon = result;
                })
                .catch(error => console.error(error));
        },
        searchByType: function (searchedType) {
            getPokemonFromApiByType(this.pokemonListRaw, this.pagingObject.offset, this.pagingObject.itemsPerPage, searchedType)
                .then(result => {
                    this.pokemonList = result;
                    this.pagingObject.offset = 0;
                    this.pagingObject.isPreviousBtnDisabled = true;
                    if (result.length <= this.pagingObject.itemsPerPage) {
                        this.pagingObject.totalPages = 1
                        this.pagingObject.isNextBtnDisabled = true;
                    } else {
                        this.pagingObject.totalPages = Math.round(result.length / this.pagingObject.itemsPerPage + 1);
                        // check to see if next button could be clicked
                        if ((result.length - this.pagingObject.offset) < this.pagingObject.itemsPerPage) {
                            this.pagingObject.isNextBtnDisabled = true;
                        }
                    }
                    this.currentPage = 1;
                })
                .catch(error => console.error(error));
        }
    }    
});