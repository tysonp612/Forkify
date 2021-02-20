import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, KEY } from './config.js';
import { getJSON, sendJSON } from './helper.js';

//state contains all the data needed for controller and render
export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    resultsPerPage: RES_PER_PAGE,
    page: 1,
  },
  bookmarks: [],
};

export const loadRecipe = async function (id) {
  // const res = await fetch(`${API_URL}/${id}`);

  // // convert data with .json

  // const data = await res.json();

  // //assume for error, throw error and make message

  // if (!res.ok) throw new Error(`${data.message} (${res.status})`);

  // declare data.recipe with object destruction
  try {
    const data = await getJSON(`${API_URL}/${id}?key=${KEY}`);

    const { recipe } = data.data;

    //make new recipe object to remove _ in original name

    state.recipe = {
      id: recipe.id,
      title: recipe.title,
      publisher: recipe.publisher,
      sourceUrl: recipe.source_url,
      servings: recipe.servings,
      cookingTime: recipe.cooking_time,
      ingredients: recipe.ingredients,
      image: recipe.image_url,
      ...(recipe.key && { key: recipe.key }),
    };
    //Array.some method will loop over bookmark array and return true if some of the items match with the condition
    if (state.bookmarks.some(bm => bm.id === state.recipe.id)) {
      state.recipe.bookmarked = true;
    } else {
      state.recipe.bookmarked = false;
    }
    // console.log(state.recipe);
  } catch (err) {
    console.error(`${err} Something went wrong`);
    throw err;
  }
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return (state.recipe = {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    image: recipe.image_url,
    ...(recipe.key && { key: recipe.key }),
  });
};
export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;

    const data = await getJSON(`${API_URL}?search=${query}&key=${KEY}`);

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        sourceUrl: rec.source_url,
        servings: rec.servings,
        cookingTime: rec.cooking_time,
        ingredients: rec.ingredients,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
  } catch (err) {
    throw err;
  }
};

//get the pagination
export const getSearchResultPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage; // page 1: array start at 0, return 10 result
  const end = page * state.search.resultsPerPage; //page 2: slice array at 11, end at 20
  // //return 10 results for page 1
  console.log(start, end);
  return state.search.results.slice(start, end);
};

export const updateServing = numServing => {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * numServing) / state.recipe.servings;
  });
  state.recipe.servings = numServing;
};

export const addBookmark = function (recipe) {
  // Add bookmark
  state.bookmarks.push(recipe);
  persistBookmarks();

  //Mark current recipe as bookmark
  if (state.recipe.id === recipe.id) {
    state.recipe.bookmarked = true;
  }
};
export const deleteBookMark = recipe => {
  //method used to find index of item from an array
  //Delete bookmark
  const index = state.bookmarks.findIndex(el => el.id === recipe.id);
  state.bookmarks.splice(index, 1);
  persistBookmarks();
  //Mark current recipe as not bookmarked
  if (recipe.id === state.recipe.id) {
    state.recipe.bookmarked = false;
  }
};

const persistBookmarks = () => {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

const init = (() => {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
})();

export const uploadRecipe = async function (newRecipe) {
  //transfer raw data to formatted data
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingrArr = ing[1].replaceAll(' ', '').split(',');

        if (ingrArr.length !== 3)
          throw new Error(
            'Wrong ingredient format! Please use the correct format'
          );
        const [quantity, unit, description] = ingrArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };
    const data = await sendJSON(`${API_URL}?key=${KEY}`, recipe);
    createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
