import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './view/recipeView.js';
import searchView from './view/searchView.js';
import resultsView from './view/resultsView.js';
import paginationView from './view/paginationView.js';
import bookmarksView from './view/bookmarksView.js';
import addRecipeView from './view/addRecipeView.js';
// import icons from '../img/icons.svg'; //Parcel 1

const { async } = require('q');

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////
// Make a dynamic spinner which can apply to any page load
// recipeView.renderSpinner();

//1 Fetch the API with async funtion

const controlRecipe = async function () {
  //Always use try..catch in async await function

  try {
    //get the hash
    const id = window.location.hash.slice(1);
    // console.log(id);
    if (!id) return;

    //loading Spinner
    recipeView.renderSpinner();

    //0) Upadate results view to mark selected search result
    resultsView.update(model.getSearchResultPage());
    bookmarksView.render(model.state.bookmarks);

    //1 Loading recipe, because model... is async function, which return a promise, so have to await it
    await model.loadRecipe(id);

    //2 Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};
controlRecipe();

const controlSearchResults = async function () {
  try {
    //1) Get search query
    const query = searchView.getQuery();
    if (!query) return;
    resultsView.renderSpinner();
    //2) Load search results
    await model.loadSearchResults(query);
    searchView.clearInput();

    //3) Render results
    resultsView.render(model.getSearchResultPage(1));

    //4) Render initial pagination button
    paginationView.render(model.state.search);
    // console.log(model.state.search.results);
  } catch (err) {
    resultsView.renderError(err);
  }
};

controlSearchResults();

const controlPagination = function (goToPage) {
  resultsView.render(model.getSearchResultPage(goToPage));

  //4) Render initial pagination button
  paginationView.render(model.state.search);
};
// controlPagination();
//Subcriber: only trigger once to connect 2 modules

const controlServing = function (numServing) {
  //update the recipe serving (in state)

  model.updateServing(numServing);

  //render the view
  // recipeView.render(model.state.recipe);

  //update method will only render DOM emlem necessarily to be changed
  recipeView.update(model.state.recipe);
};

const controlAddBookMark = function () {
  //If return false in bookmark array
  if (!model.state.recipe.bookmarked) {
    // 1) Add new bookmark to the array, turn bookmarked to true
    model.addBookmark(model.state.recipe);

    // console.log(model.state.bookmarks);

    // 2) Update book mark icon
    recipeView.update(model.state.recipe);

    // 3) Render bookmarks
    bookmarksView.render(model.state.bookmarks);
  } else {
    model.deleteBookMark(model.state.recipe);
    // console.log(model.state.recipe.bookmarked);
    recipeView.update(model.state.recipe);
    bookmarksView.render(model.state.bookmarks);
  }
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //Upload new recipe

    await model.uploadRecipe(newRecipe);

    //Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);

    //Success message
    addRecipeView.renderMessage();

    //Render
    recipeView.render(model.state.recipe);

    //Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    //Change ID in URL
    // window.history.pushState(null, '', `#${model.state.recipe.id}`);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
};
const init = () => {
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerUpdateServings(controlServing);
  recipeView.addHandlerAddBookmark(controlAddBookMark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerSearchNext(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
// //As we click on different id, or the page load after click, the recipe will be rendered
// ['hashchange', 'load'].forEach(ev =>
//   window.addEventListener(ev, controlRecipe)
// );
