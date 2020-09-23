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

function getPokemonFromApi(pokemonListByGeneration, offset, take) {  
    var pokemonList = [];

    pokemonListByGeneration.sort((a, b) => {
        return (a.url > b.url) ? 1 : -1;
    });

    pokemonListByGeneration.slice(offset, offset + take).forEach(element => {
        axios
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
            
        });

        pokemonList.sort((a, b) => {
            return (a.id > b.id) ? 1 : -1;
        });
        
        return pokemonList;
}

var app = new Vue({
    el: '#main-component',
    data: {
        pokemonListRaw: null,
        pokemonList: [],
        count: 0,
        error: '',
        pagingObject: {
            itemsPerPage: 10,
            offset: 0,
            isPreviousBtnDisabled: true,
            isNextBtnDisabled: false
        }
    },
    mounted: function() {
        axios
        .get('https://pokeapi.co/api/v2/generation/1/')
           .then(response => {            
                this.pokemonListRaw = response.data.pokemon_species;  
                
                // place the call with default values in order to get some initial content
                this.pokemonList = getPokemonFromApi(this.pokemonListRaw, this.pagingObject.offset, this.pagingObject.itemsPerPage);
           })
           .catch(function (error) {
            vm.error = 'Could not reach the PokeAPI.co!';
           });
    },
    methods: {
        nextPage: function () {
            this.pagingObject.isPreviousBtnDisabled = false;
            this.pagingObject.offset += this.pagingObject.itemsPerPage;
            this.pokemonList = getPokemonFromApi(this.pokemonListRaw, this.pagingObject.offset, this.pagingObject.itemsPerPage);

            if ((this.pokemonListRaw.length - this.pagingObject.offset) < this.pagingObject.itemsPerPage) {
                this.pagingObject.isNextBtnDisabled = true;
            }
        },
        previousPage: function () {
            this.pagingObject.isNextBtnDisabled = false;
            this.pagingObject.offset -= this.pagingObject.itemsPerPage;                
            this.pokemonList = getPokemonFromApi(this.pokemonListRaw, this.pagingObject.offset, this.pagingObject.itemsPerPage);

            if (this.pagingObject.offset < this.pagingObject.itemsPerPage) {
                this.pagingObject.isPreviousBtnDisabled = true;
            }
        }
    }    
});