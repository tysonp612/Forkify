import icons from 'url:../../img/icons.svg'; //Parcel 2
import View from './View.js';

class PaginationView extends View {
  parentElement = document.querySelector('.pagination');

  addHandlerSearchNext(handler) {
    this.parentElement.addEventListener('click', function (e) {
      e.preventDefault();
      const btn = e.target.closest('.btn--inline');
      if (!btn) return;
      // make the connection between the button and the page by using data set from html
      const goToPage = +btn.dataset.goto;
      console.log(goToPage);
      return handler(goToPage);
    });
  }

  //   addHandlerSearchPrev(handler) {
  //     this.parentElement
  //       .querySelector('.pagination__btn--prev')
  //       .addEventListener('click', function (e) {
  //         e.preventDefault();
  //         handler();
  //       });
  //   }

  generateMarkup() {
    const currentPage = this.data.page;
    //Num of pages needed
    const numPages = Math.ceil(
      this.data.results.length / this.data.resultsPerPage
    );
    //page 1, there are other pages
    if (currentPage === 1 && numPages > 1) {
      return `
  <button data-goto="${
    currentPage + 1
  }"class="btn--inline pagination__btn--next">
        <span>Page ${currentPage + 1}</span>
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-right"></use>
        </svg>
      </button>`;
    }

    //page 1 , no other page
    if (currentPage < numPages) {
      return `
    <button data-goto="${
      currentPage + 1
    }" class="btn--inline pagination__btn--next">
            <span>Page ${currentPage + 1}</span>
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-right"></use>
            </svg>
    </button>
    <button data-goto="${
      currentPage - 1
    }" class="btn--inline pagination__btn--prev">
            <svg class="search__icon">
                <use href="${icons}#icon-arrow-left"></use>
            </svg>
            <span>Page ${currentPage - 1}</span>
    </button>`;
    }
    //last page
    if (currentPage === numPages) {
      return `
    <button data-goto="${
      currentPage - 1
    }" class="btn--inline pagination__btn--prev">
        <svg class="search__icon">
            <use href="${icons}#icon-arrow-left"></use>
        </svg>
        <span>Page ${currentPage - 1}</span>
    </button>`;
    }
    //other page
    if (currentPage === 1 && numPages === 1) {
      return '';
    }
  }
}

export default new PaginationView();
