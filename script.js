const state = {
    products: [],
    filteredProducts: [],
    categories: [],
    currentPage: 1,
    productsPerPage: 8,
    currentCategory: '',
    searchQuery: ''
};

const elements = {
    productGrid: document.getElementById('productGrid'),
    categoryFilter: document.querySelector('.category-filter'),
    searchBar: document.querySelector('.search-bar'),
    pagination: document.getElementById('pagination'),
    loading: document.getElementById('loading'),
    modal: document.getElementById('modal'),
    modalContent: document.getElementById('modalContent'),
    closeBtn: document.querySelector('.close-btn')
};

async function fetchData() {
    elements.loading.style.display = 'block';
    try {
        const productsResponse = await fetch('https://fakestoreapi.com/products');
        state.products = await productsResponse.json();
        state.filteredProducts = [...state.products];

        const categoriesResponse = await fetch('https://fakestoreapi.com/products/categories');
        state.categories = await categoriesResponse.json();
        populateCategories();
        renderProducts();
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        elements.loading.style.display = 'none';
    }
}

function populateCategories() {
    state.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        elements.categoryFilter.appendChild(option);
    });
}

function renderProducts() {
    const start = (state.currentPage - 1) * state.productsPerPage;
    const end = start + state.productsPerPage;
    const paginatedProducts = state.filteredProducts.slice(start, end);

    elements.productGrid.innerHTML = '';
    paginatedProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p class="price">$${product.price.toFixed(2)}</p>
            <p>Category: ${product.category}</p>
        `;
        card.addEventListener('click', () => showProductDetails(product));
        elements.productGrid.appendChild(card);
    });

    renderPagination();
}

function renderPagination() {
    const pageCount = Math.ceil(state.filteredProducts.length / state.productsPerPage);
    elements.pagination.innerHTML = `
        <button onclick="changePage(${state.currentPage - 1})" ${state.currentPage === 1 ? 'disabled' : ''}>Previous</button>
        <span>Page ${state.currentPage} of ${pageCount}</span>
        <button onclick="changePage(${state.currentPage + 1})" ${state.currentPage === pageCount ? 'disabled' : ''}>Next</button>
    `;
}

function changePage(page) {
    const pageCount = Math.ceil(state.filteredProducts.length / state.productsPerPage);
    if (page >= 1 && page <= pageCount) {
        state.currentPage = page;
        renderProducts();
    }
}

function filterProducts() {
    state.filteredProducts = state.products.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(state.searchQuery.toLowerCase());
        const matchesCategory = state.currentCategory ? product.category === state.currentCategory : true;
        return matchesSearch && matchesCategory;
    });
    state.currentPage = 1;
    renderProducts();
}

function showProductDetails(product) {
    elements.modalContent.innerHTML = `
        <img src="${product.image}" alt="${product.title}">
        <h2>${product.title}</h2>
        <p class="price">$${product.price.toFixed(2)}</p>
        <p><strong>Category:</strong> ${product.category}</p>
        <p><strong>Description:</strong> ${product.description}</p>
        <p><strong>Rating:</strong> ${product.rating.rate} (${product.rating.count} reviews)</p>
    `;
    elements.modal.style.display = 'flex';
}

elements.searchBar.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    filterProducts();
});

elements.categoryFilter.addEventListener('change', (e) => {
    state.currentCategory = e.target.value;
    filterProducts();
});

elements.closeBtn.addEventListener('click', () => {
    elements.modal.style.display = 'none';
});

elements.modal.addEventListener('click', (e) => {
    if (e.target === elements.modal) {
        elements.modal.style.display = 'none';
    }
});

fetchData();