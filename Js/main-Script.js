function menuFilter() {
document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.category-list a');
    const statusSelect = document.getElementById('status-filter');
    const menuCards = document.querySelectorAll('.menu-card');

    let currentCategory = 'all';
    let currentStatus = 'all';

    function getCardCategory(card) {
        const known = ['coffee', 'tea', 'sandwiches', 'others'];
        // check for a matching class first
        for (const k of known) if (card.classList.contains(k)) return k;

        // fallback to badge text
        const badge = card.querySelector('.menu-card-badge');
        if (badge) {
            const txt = badge.textContent.trim().toLowerCase();
            for (const k of known) if (txt.includes(k)) return k;
            if (txt.includes('sandwich')) return 'sandwiches';
            if (txt.includes('coffee')) return 'coffee';
            if (txt.includes('tea')) return 'tea';
            if (txt.includes('other')) return 'others';
        }
        return 'unknown';
    }

    function getCardStatus(card) {
        const statusEl = card.querySelector('.menu-card-status');
        if (!statusEl) return 'unknown';
        if (statusEl.classList.contains('available')) return 'available';
        if (statusEl.classList.contains('unavailable')) return 'unavailable';
        const txt = statusEl.textContent.trim().toLowerCase();
        if (txt.includes('unavail') || txt.includes('out')) return 'unavailable';
        if (txt.includes('avail')) return 'available';
        return 'unknown';
    }

    function applyFilters() {
        menuCards.forEach(card => {
            const cardCategory = getCardCategory(card);
            const cardStatus = getCardStatus(card);

            const matchesCategory = currentCategory === 'all' || cardCategory === currentCategory;
            const matchesStatus = currentStatus === 'all' || cardStatus === currentStatus;

            card.style.display = (matchesCategory && matchesStatus) ? 'block' : 'none';
        });
    }

    // expose the filter applier so other functions (e.g. status toggle) can re-run filters
    window.applyMenuFilters = applyFilters;

    // category buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            currentCategory = button.id.replace('-btn', '');
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            applyFilters();
        });
    });

    // status select
    if (statusSelect) {
        statusSelect.addEventListener('change', (e) => {
            currentStatus = e.target.value;
            applyFilters();
        });
    }

    // initial apply
    applyFilters();
});
}
function markUnavailableBtn() {
    function attachHandlers() {
        const unavailableButtons = document.querySelectorAll('.menu-btn-unavailable');
        unavailableButtons.forEach(button => {
            button.addEventListener('click', () => {
                const menuCard = button.closest('.menu-card');
                if (!menuCard) return;
                const statusEl = menuCard.querySelector('.menu-card-status');
                if (!statusEl) return;

                const txt = statusEl.textContent.trim().toLowerCase();
                const isUnavailable = statusEl.classList.contains('unavailable') || txt.includes('unavail') || txt.includes('out');
                const isAvailable = !isUnavailable;

                if (isAvailable) {
                    statusEl.innerText = 'Unavailable';
                    statusEl.classList.remove('available');
                    statusEl.classList.add('unavailable');
                    button.innerText = 'Mark Available';
                } else {
                    statusEl.innerText = 'Available';
                    statusEl.classList.remove('unavailable');
                    statusEl.classList.add('available');
                    button.innerText = 'Mark Unavailable';
                }
                if (window.applyMenuFilters) window.applyMenuFilters();
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachHandlers);
    } else {
        attachHandlers();
    }
}
function staff_menu_DeleteBtn() {
    const deleteButtons = document.querySelectorAll('.menu-btn-delete,.delete-staff-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const menuCard = button.closest('.menu-card, .staff-card');
            if (menuCard) {
                window.confirm('Are you sure you want to delete this menu item?') &&
                menuCard.remove();
                if (window.applyMenuFilters) window.applyMenuFilters();
            }
        });
    });
}
function add_menu_item_btn() { 
    const addBtn = document.querySelector('.add-menu-btn');
    if (!addBtn) return;
    addBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // open popup in "new" mode using the exposed API
        if (window.menuEditApi && window.menuEditApi.openForNew) {
            // set title + button text for create mode
            const titleEl = document.querySelector('#menu-edit-overlay .popup-title');
            const updateBtnEl = document.getElementById('menu-edit-update');
            if (titleEl) titleEl.textContent = 'Add New Menu Item';
            if (updateBtnEl) updateBtnEl.textContent = 'Add Item';
            window.menuEditApi.openForNew();
        } else {
            // fallback: create popup then open
            menuEditBtn();
            setTimeout(() => {
                const titleEl = document.querySelector('#menu-edit-overlay .popup-title');
                const updateBtnEl = document.getElementById('menu-edit-update');
                if (titleEl) titleEl.textContent = 'Add New Menu Item';
                if (updateBtnEl) updateBtnEl.textContent = 'Add Item';
                window.menuEditApi?.openForNew && window.menuEditApi.openForNew();
            }, 50);
        }
    });
}
function menuEditBtn() {
        function createEditPopup() {
                if (document.getElementById('menu-edit-overlay')) return;
                const tpl = `
                <div class="popup-overlay" id="menu-edit-overlay">
                    <div class="popup" id="menu-edit-popup">
                        <button class="close-btn" id="menu-edit-close">&times;</button>
                        <div class="popup-header">
                            <h2 class="popup-title">Edit Menu Item</h2>
                        </div>
                        <div class="popup-body">
                            <div class="form-group">
                                <label for="menu-edit-name">Item Name</label>
                                <input id="menu-edit-name" type="text" placeholder="Enter item name">
                            </div>
                            <div class="form-group">
                                <label for="menu-edit-category">Category</label>
                                <select id="menu-edit-category">
                                    <option>Coffee</option>
                                    <option>Tea</option>
                                    <option>Sandwiches</option>
                                    <option>Others</option>
                                </select>
                            </div>
                            <div class="price-row">
                                <div class="form-group">
                                    <label for="menu-edit-price">Price ($)</label>
                                    <input id="menu-edit-price" type="number" step="0.01">
                                </div>
                                <div class="form-group">
                                    <label for="menu-edit-cost">Cost ($)</label>
                                    <input id="menu-edit-cost" type="number" step="0.01">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="menu-edit-description">Description</label>
                                <textarea id="menu-edit-description"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="menu-edit-image">Image URL (optional)</label>
                                <input id="menu-edit-image" type="text">
                                <div class="image-preview"><img id="menu-edit-preview" src="" alt="Preview"></div>
                            </div>
                            <div class="availability">
                                <label class="switch">
                                    <input id="menu-edit-available" type="checkbox" aria-label="Available">
                                    <span class="slider"></span>
                                </label>
                                <span id="menu-edit-available-label">Available for sale</span>
                            </div>
                        </div>
                        <div class="popup-footer">
                            <button class="btn-cancel" id="menu-edit-cancel">Cancel</button>
                            <button class="btn-update" id="menu-edit-update">Update Item</button>
                        </div>
                    </div>
                </div>`;

                const div = document.createElement('div');
                div.innerHTML = tpl;
                document.body.appendChild(div.firstElementChild);

                // hide overlay by default so popup doesn't appear on page load/refresh
                const createdOverlay = document.getElementById('menu-edit-overlay');
                if (createdOverlay) createdOverlay.style.display = 'none';

                // wire popup behavior
                const overlay = document.getElementById('menu-edit-overlay');
                const closeBtn = document.getElementById('menu-edit-close');
                const cancelBtn = document.getElementById('menu-edit-cancel');
                const imageInput = document.getElementById('menu-edit-image');
                const previewImg = document.getElementById('menu-edit-preview');
                const availToggle = document.getElementById('menu-edit-available');
                const availLabel = document.getElementById('menu-edit-available-label');

                function closePopup() { overlay && (overlay.style.display = 'none'); }
                function openPopup() { overlay && (overlay.style.display = 'flex'); }

                if (closeBtn) closeBtn.addEventListener('click', closePopup);
                if (cancelBtn) cancelBtn.addEventListener('click', closePopup);

                if (imageInput && previewImg) {
                        imageInput.addEventListener('input', () => {
                                const v = imageInput.value.trim();
                                if (!v) { previewImg.src = ''; previewImg.style.display = 'none'; return; }
                                previewImg.src = v; previewImg.style.display = 'block';
                        });
                }

                if (availToggle && availLabel) {
                        availToggle.addEventListener('change', () => {
                                availLabel.textContent = availToggle.checked ? 'Available for sale' : 'Not available';
                        });
                }

                // gather important elements for external API
                const nameEl = document.getElementById('menu-edit-name');
                const categoryEl = document.getElementById('menu-edit-category');
                const priceEl = document.getElementById('menu-edit-price');
                const costEl = document.getElementById('menu-edit-cost');
                const descEl = document.getElementById('menu-edit-description');
                const imageEl = document.getElementById('menu-edit-image');

                const updateBtn = document.getElementById('menu-edit-update');
                const closeBtn2 = document.getElementById('menu-edit-close');
                const cancelBtn2 = document.getElementById('menu-edit-cancel');

                function clearForm() {
                    if (nameEl) nameEl.value = '';
                    if (categoryEl) categoryEl.value = 'Coffee';
                    if (priceEl) priceEl.value = '';
                    if (costEl) costEl.value = '';
                    if (descEl) descEl.value = '';
                    if (imageEl) imageEl.value = '';
                    if (previewImg) { previewImg.src = ''; previewImg.style.display = 'none'; }
                    if (availToggle) { availToggle.checked = true; availLabel.textContent = 'Available for sale'; }
                }

                function populateFromCard(card) {
                    if (!card) return;
                    if (nameEl) nameEl.value = card.querySelector('.menu-card-title')?.textContent.trim() || '';
                    if (categoryEl) categoryEl.value = card.querySelector('.menu-card-badge')?.textContent.trim() || 'Coffee';
                    const rows = card.querySelectorAll('.menu-info-row');
                    if (rows && rows[0]) {
                        const vals = rows[0].querySelectorAll('.menu-info-value');
                        if (priceEl) priceEl.value = parseFloat(vals[0]?.textContent.trim().replace('$','')) || '';
                        if (costEl) costEl.value = parseFloat(vals[1]?.textContent.trim().replace('$','')) || '';
                    }
                    if (descEl) descEl.value = card.querySelector('.menu-card-description')?.textContent.trim() || '';
                    const img = card.querySelector('.menu-card-image img')?.src || '';
                    if (imageEl) imageEl.value = img;
                    if (previewImg) { previewImg.src = img; previewImg.style.display = img ? 'block' : 'none'; }
                    const statusEl = card.querySelector('.menu-card-status');
                    const isUnavailable = statusEl && (statusEl.classList.contains('unavailable') || /unavail/i.test(statusEl.textContent));
                    if (availToggle) availToggle.checked = !isUnavailable;
                }

                // attach a simple API to window so other functions can reuse the popup
                window.menuEditApi = {
                    openForCard(card) {
                        populateFromCard(card);
                        if (createdOverlay) createdOverlay.style.display = 'flex';

                        // attach one-time update handler for this card
                        const handler = function doUpdate() {
                            // write back to card
                            card.querySelector('.menu-card-title').textContent = nameEl.value;
                            const badge = card.querySelector('.menu-card-badge');
                            if (badge) badge.textContent = categoryEl.value;
                            if (rows && rows[0]) {
                                const vals = rows[0].querySelectorAll('.menu-info-value');
                                if (vals[0]) vals[0].textContent = `$${parseFloat(priceEl.value || 0).toFixed(2)}`;
                                if (vals[1]) vals[1].textContent = `$${parseFloat(costEl.value || 0).toFixed(2)}`;
                            }
                            const descNode = card.querySelector('.menu-card-description');
                            if (descNode) descNode.textContent = descEl.value;
                            const imgNode = card.querySelector('.menu-card-image img');
                            if (imgNode) imgNode.src = imageEl.value;
                            const statusNode = card.querySelector('.menu-card-status');
                            if (statusNode) {
                                if (availToggle.checked) {
                                    statusNode.textContent = 'Available';
                                    statusNode.classList.remove('unavailable');
                                    statusNode.classList.add('available');
                                } else {
                                    statusNode.textContent = 'Unavailable';
                                    statusNode.classList.remove('available');
                                    statusNode.classList.add('unavailable');
                                }
                            }
                            // cleanup
                            updateBtn.removeEventListener('click', handler);
                            if (createdOverlay) createdOverlay.style.display = 'none';
                            if (window.applyMenuFilters) window.applyMenuFilters();
                        };

                        // remove any previous handler to avoid duplication
                        // ensure a single click handler on the Update button
                        if (updateBtn) {
                            updateBtn.replaceWith(updateBtn.cloneNode(true));
                            const newUpdate = document.getElementById('menu-edit-update');
                            if (newUpdate) newUpdate.addEventListener('click', handler);
                        }
                    },
                    openForNew() {
                        clearForm();
                        if (createdOverlay) createdOverlay.style.display = 'flex';

                        // one-time handler to create a new card
                        const handler = function doCreate() {
                            // build new card element
                            const group = document.querySelector('.menu-card-group');
                            if (!group) return;
                            const card = document.createElement('div');
                            card.className = 'menu-card';
                            const title = nameEl.value || 'New Item';
                            const category = categoryEl.value || 'Others';
                            const price = parseFloat(priceEl.value || 0).toFixed(2);
                            const cost = parseFloat(costEl.value || 0).toFixed(2);
                            const description = descEl.value || '';
                            const imgSrc = imageEl.value || '';
                            const availableClass = availToggle.checked ? 'available' : 'unavailable';
                            const statusText = availToggle.checked ? 'Available' : 'Unavailable';

                            card.innerHTML = `
                                <div class="menu-card-header">
                                    <h2 class="menu-card-title">${title}</h2>
                                    <span class="menu-card-badge">${category}</span>
                                    <span class="menu-card-status ${availableClass}">${statusText}</span>
                                </div>
                                <div class="menu-card-image">
                                    <img src="${imgSrc}" alt="${title}">
                                </div>
                                <p class="menu-card-description">${description}</p>
                                <div class="menu-card-info">
                                    <div class="menu-info-row">
                                        <div>
                                            <p class="menu-info-label">Price</p>
                                            <p class="menu-info-value">$${price}</p>
                                        </div>
                                        <div>
                                            <p class="menu-info-label">Cost</p>
                                            <p class="menu-info-value">$${cost}</p>
                                        </div>
                                    </div>
                                    <div class="menu-info-row">
                                        <div>
                                            <p class="menu-info-label">Profit Margin</p>
                                            <p class="menu-info-value">-</p>
                                        </div>
                                        <div>
                                            <p class="menu-info-label">Profit</p>
                                            <p class="menu-info-value">-</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="menu-card-actions">
                                    <button class="menu-btn-unavailable">Mark Unavailable</button>
                                    <button class="menu-btn-edit"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
                                    <button class="menu-btn-delete"><i class="fa-solid fa-trash"></i> Delete</button>
                                </div>`;

                            group.appendChild(card);

                            // attach handlers for new card buttons
                            const newUnavailable = card.querySelector('.menu-btn-unavailable');
                            if (newUnavailable) newUnavailable.addEventListener('click', () => {
                                const statusEl = card.querySelector('.menu-card-status');
                                if (!statusEl) return;
                                const txt = statusEl.textContent.trim().toLowerCase();
                                const isUnavailable = statusEl.classList.contains('unavailable') || txt.includes('unavail') || txt.includes('out');
                                if (isUnavailable) {
                                    statusEl.textContent = 'Available';
                                    statusEl.classList.remove('unavailable');
                                    statusEl.classList.add('available');
                                    newUnavailable.innerText = 'Mark Unavailable';
                                } else {
                                    statusEl.textContent = 'Unavailable';
                                    statusEl.classList.remove('available');
                                    statusEl.classList.add('unavailable');
                                    newUnavailable.innerText = 'Mark Available';
                                }
                                if (window.applyMenuFilters) window.applyMenuFilters();
                            });

                            const newDelete = card.querySelector('.menu-btn-delete');
                            if (newDelete) newDelete.addEventListener('click', () => {
                                if (window.confirm('Are you sure you want to delete this menu item?')) {
                                    card.remove();
                                    if (window.applyMenuFilters) window.applyMenuFilters();
                                }
                            });

                            const newEdit = card.querySelector('.menu-btn-edit');
                            if (newEdit) newEdit.addEventListener('click', () => {
                                if (window.menuEditApi && window.menuEditApi.openForCard) window.menuEditApi.openForCard(card);
                            });

                            // cleanup
                            updateBtn.removeEventListener('click', handler);
                            if (createdOverlay) createdOverlay.style.display = 'none';
                            if (window.applyMenuFilters) window.applyMenuFilters();
                        };

                        // replace update button to ensure no duplicate handlers
                        if (updateBtn) {
                            updateBtn.replaceWith(updateBtn.cloneNode(true));
                            const newUpdate = document.getElementById('menu-edit-update');
                            if (newUpdate) newUpdate.addEventListener('click', handler);
                        }
                    }
                };

                return { openPopup, closePopup };
        }

        function attachEditHandlers() {
                createEditPopup();
                const editButtons = document.querySelectorAll('.menu-btn-edit');
                editButtons.forEach(btn => {
                        btn.addEventListener('click', (e) => {
                                const card = btn.closest('.menu-card');
                                if (!card) return;

                                // ensure popup exists
                                createEditPopup();

                                // populate fields
                                const nameEl = document.getElementById('menu-edit-name');
                                const categoryEl = document.getElementById('menu-edit-category');
                                const priceEl = document.getElementById('menu-edit-price');
                                const costEl = document.getElementById('menu-edit-cost');
                                const descEl = document.getElementById('menu-edit-description');
                                const imageEl = document.getElementById('menu-edit-image');
                                const previewImg = document.getElementById('menu-edit-preview');
                                const availToggle = document.getElementById('menu-edit-available');

                                nameEl.value = card.querySelector('.menu-card-title')?.textContent.trim() || '';
                                categoryEl.value = card.querySelector('.menu-card-badge')?.textContent.trim() || 'Coffee';

                                // price / cost extraction
                                const rows = card.querySelectorAll('.menu-info-row');
                                if (rows && rows[0]) {
                                        const vals = rows[0].querySelectorAll('.menu-info-value');
                                        const priceTxt = vals[0]?.textContent.trim().replace('$','') || '';
                                        const costTxt = vals[1]?.textContent.trim().replace('$','') || '';
                                        priceEl.value = parseFloat(priceTxt) || '';
                                        costEl.value = parseFloat(costTxt) || '';
                                }

                                descEl.value = card.querySelector('.menu-card-description')?.textContent.trim() || '';
                                const img = card.querySelector('.menu-card-image img')?.src || '';
                                imageEl.value = img;
                                if (previewImg) { previewImg.src = img; previewImg.style.display = img ? 'block' : 'none'; }

                                const statusEl = card.querySelector('.menu-card-status');
                                const isUnavailable = statusEl && (statusEl.classList.contains('unavailable') || /unavail/i.test(statusEl.textContent));
                                if (availToggle) availToggle.checked = !isUnavailable;

                                // set title + button text for edit mode (reset if previously used for Add)
                                const titleEl = document.querySelector('#menu-edit-overlay .popup-title');
                                const updateBtnEl = document.getElementById('menu-edit-update');
                                if (titleEl) titleEl.textContent = 'Edit Menu Item';
                                if (updateBtnEl) updateBtnEl.textContent = 'Update Item';

                                // show popup
                                const overlay = document.getElementById('menu-edit-overlay');
                                if (overlay) overlay.style.display = 'flex';

                                // update handler (one-time attach)
                                const updateBtn = document.getElementById('menu-edit-update');
                                const closeBtn = document.getElementById('menu-edit-close');
                                const cancelBtn = document.getElementById('menu-edit-cancel');

                                function doUpdate() {
                                        // write back to card
                                        card.querySelector('.menu-card-title').textContent = nameEl.value;
                                        const badge = card.querySelector('.menu-card-badge');
                                        if (badge) badge.textContent = categoryEl.value;

                                        // update price/cost
                                        if (rows && rows[0]) {
                                                const vals = rows[0].querySelectorAll('.menu-info-value');
                                                if (vals[0]) vals[0].textContent = `$${parseFloat(priceEl.value || 0).toFixed(2)}`;
                                                if (vals[1]) vals[1].textContent = `$${parseFloat(costEl.value || 0).toFixed(2)}`;
                                        }

                                        // description
                                        const descNode = card.querySelector('.menu-card-description');
                                        if (descNode) descNode.textContent = descEl.value;

                                        // image
                                        const imgNode = card.querySelector('.menu-card-image img');
                                        if (imgNode) imgNode.src = imageEl.value;

                                        // status
                                        const statusNode = card.querySelector('.menu-card-status');
                                        if (statusNode) {
                                                if (document.getElementById('menu-edit-available').checked) {
                                                        statusNode.textContent = 'Available';
                                                        statusNode.classList.remove('unavailable');
                                                        statusNode.classList.add('available');
                                                } else {
                                                        statusNode.textContent = 'Unavailable';
                                                        statusNode.classList.remove('available');
                                                        statusNode.classList.add('unavailable');
                                                }
                                        }

                                        // cleanup and close
                                        if (updateBtn) updateBtn.removeEventListener('click', doUpdate);
                                        if (closeBtn) closeBtn.removeEventListener('click', closeOverlay);
                                        if (cancelBtn) cancelBtn.removeEventListener('click', closeOverlay);

                                        const overlay = document.getElementById('menu-edit-overlay');
                                        if (overlay) overlay.style.display = 'none';
                                        if (window.applyMenuFilters) window.applyMenuFilters();
                                }

                                function closeOverlay(){
                                        const overlay = document.getElementById('menu-edit-overlay');
                                        if (overlay) overlay.style.display = 'none';
                                        if (updateBtn) updateBtn.removeEventListener('click', doUpdate);
                                        if (closeBtn) closeBtn.removeEventListener('click', closeOverlay);
                                        if (cancelBtn) cancelBtn.removeEventListener('click', closeOverlay);
                                }

                                if (updateBtn) updateBtn.addEventListener('click', doUpdate);
                                if (closeBtn) closeBtn.addEventListener('click', closeOverlay);
                                if (cancelBtn) cancelBtn.addEventListener('click', closeOverlay);
                        });
                });
        }

        if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', attachEditHandlers);
        } else {
                attachEditHandlers();
        }
}


menuEditBtn();
staff_menu_DeleteBtn();
markUnavailableBtn();
menuFilter();
add_menu_item_btn();

