function Pokemon() {
    this.id = 0;
    this.name = '';
    this.img = '';
    this.types = [];
}

var app = new Vue({
    el: '#main-component',
    data: {
        pokemonList: null,
        pokemonListEnriched: [],
        count: 0,
        error: ''
    },
    mounted: function() {
        axios
        .get('https://pokeapi.co/api/v2/pokemon/?limit=9&offset=')
           .then(response => {            
                this.pokemonList = response.data.results;   

                this.pokemonList.forEach(element => {
                    axios
                        .get(element.url)
                        .then(innerResponse => {
                            // this.pokemonListEnriched.push(innerResponse.data.sprites)
                            
                            var pokemonToAdd = new Pokemon();
                            pokemonToAdd.id = innerResponse.data.id;
                            pokemonToAdd.name = innerResponse.data.name;
                            pokemonToAdd.img = innerResponse.data.sprites.front_default;
                            pokemonToAdd.types = innerResponse.data.types.map(obj => {
                                return obj.type.name;
                            });

                            this.pokemonListEnriched.push(pokemonToAdd);
                        })
                        .catch(error => console.error(error));
                });
                
           })
           .catch(function (error) {
            vm.error = 'Could not reach the PokeAPI.co!';
           });
    }    
});