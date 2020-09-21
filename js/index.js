var app = new Vue({
    el: '#main-component',
    data: {
        pokemonList: null,
        pokemonListEnriched: null,
        count: 0,
        error: ''
    },
    mounted: function() {
        axios
        .get('https://pokeapi.co/api/v2/pokemon/?limit=9&offset=')
           .then(response => {            
                this.pokemonList = response.data.results;               
           })
           .catch(function (error) {
            vm.error = 'Could not reach the PokeAPI.co!';
           }); 
    }    
});