import icons from 'url:../../img/icons.svg'; //Parcel 2
import View from './View.js';

class BookmarksView extends View {
  parentElement = document.querySelector('.bookmarks__list');
  errorMessage = 'No bookmarks yet. Find a nice recipe and bookmark it :)';

  generateMarkup() {
    return this.data
      .map(data => {
        const id = window.location.hash.slice(1);
        return `<li class="preview">
            <a class="preview__link ${
              data.id === id ? 'preview__link--active' : ''
            }" href="#${data.id}">
            <figure class="preview__fig">
                <img src="${data.image}" alt="${data.title}" />
            </figure>
            <div class="preview__data">
                <h4 class="preview__title">${data.title}</h4>
                <p class="preview__publisher">${data.publisher}</p>
                <div class="preview__user-generated ${
                  this.data.key ? '' : 'hidden'
                }">
                <svg>
                    <use href="${icons}#icon-user"></use>
                </svg>
                </div>
            </div>
            </a>
        </li>`;
      })
      .join('');
  }
}

export default new BookmarksView();
