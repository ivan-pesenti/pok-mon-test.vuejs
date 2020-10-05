// Import section
import { loadPokemonFromApi, loadPokemonTypesFromApi } from "./api.js";
import { getPokemonById, filterPokemonByType, pagingPokemonList } from "./utils.js";

let clrOne = getComputedStyle(document.documentElement)
.getPropertyValue('--' + 'grass' + '-clr');

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