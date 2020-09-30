function formatStyles(typesArr) {
    if (typesArr.length == 1) {
        let clrOne = getComputedStyle(document.documentElement)
        .getPropertyValue('--' + typesArr[0].type.name + '-clr');
        return {
            background: 'linear-gradient(135deg, ' + clrOne + ' 100%, #fff 0%)'
        };
    }
    else {
        let clrOne = getComputedStyle(document.documentElement)
        .getPropertyValue('--' + typesArr[0].type.name + '-clr');
        
        let clrTwo = getComputedStyle(document.documentElement)
        .getPropertyValue('--' + typesArr[1].type.name + '-clr');
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

export { formatStyles, getPokemonById, pagingPokemonList, filterPokemonByType };