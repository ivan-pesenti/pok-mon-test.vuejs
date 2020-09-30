import  { Pokemon }  from "./Pokemon.js";
import { formatStyles } from "./utils.js";

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
                        var pokemonToAdd = new Pokemon(
                            innerResponse.data.id,
                            innerResponse.data.name,
                            innerResponse.data.sprites.front_default,
                            innerResponse.data.types.map(obj => {
                                return obj.type.name;
                            }),
                            formatStyles(innerResponse.data.types)
                        );

                        // sort types of Pokémon in order to present them everytime in the same way
                        pokemonToAdd.types = pokemonToAdd.types.sort((a, b) => {
                            return (a > b) ? 1 : -1;
                        });    
                        
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

export { loadPokemonFromApi, loadPokemonTypesFromApi };