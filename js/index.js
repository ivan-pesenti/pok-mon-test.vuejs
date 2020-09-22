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

var app = new Vue({
    el: '#main-component',
    data: {
        pokemonListRaw: null,
        pokemonList: [],
        count: 0,
        error: ''
    },
    mounted: function() {
        axios
        .get('https://pokeapi.co/api/v2/pokemon/?limit=9&offset=')
           .then(response => {            
                this.pokemonListRaw = response.data.results;   

                this.pokemonListRaw.forEach(element => {
                    axios
                        .get(element.url)
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

                            this.pokemonList.push(pokemonToAdd);

                            this.pokemonList.sort((a, b) => {
                                return (a.id > b.id) ? 1 : -1;
                            });
                        })
                        .catch(error => console.error(error));
                });
                
           })
           .catch(function (error) {
            vm.error = 'Could not reach the PokeAPI.co!';
           });
    }    
});