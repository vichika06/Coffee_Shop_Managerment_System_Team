
// Script for Admin-Menu filtering, editing, adding, deleting, and marking unavailable

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
                if (typeof saveMenuToStorage === 'function') saveMenuToStorage();
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
                if (window.confirm('Are you sure you want to delete this menu item?')) {
                    menuCard.remove();
                    if (window.applyMenuFilters) window.applyMenuFilters();
                    if (typeof saveMenuToStorage === 'function') saveMenuToStorage();
                }
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
                                <label for="menu-edit-image">Image (optional)</label>
                                <input id="menu-edit-image" type="file" accept="image/*">
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
                    imageInput.addEventListener('change', () => {
                        const file = imageInput.files && imageInput.files[0];
                        if (!file) { previewImg.src = ''; previewImg.style.display = 'none'; return; }
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            previewImg.src = e.target.result;
                            previewImg.style.display = 'block';
                        };
                        reader.readAsDataURL(file);
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
                    if (imageEl) imageEl.value = '';
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
                            const rows = card.querySelectorAll('.menu-info-row');
                            // write back to card
                            card.querySelector('.menu-card-title').textContent = nameEl.value;
                            const badge = card.querySelector('.menu-card-badge');
                            if (badge) badge.textContent = categoryEl.value;
                            if (rows && rows[0]) {
                                const vals = rows[0].querySelectorAll('.menu-info-value');
                                const priceNum = parseFloat(priceEl.value || 0) || 0;
                                const costNum = parseFloat(costEl.value || 0) || 0;
                                if (vals[0]) vals[0].textContent = `$${priceNum.toFixed(2)}`;
                                if (vals[1]) vals[1].textContent = `$${costNum.toFixed(2)}`;

                                // update profit and margin in second row if present
                                if (rows[1]) {
                                    const vals2 = rows[1].querySelectorAll('.menu-info-value');
                                    const profitNum = priceNum - costNum;
                                    const profitText = `$${profitNum.toFixed(2)}`;
                                    const marginText = priceNum > 0 ? `${((profitNum / priceNum) * 100).toFixed(1)}%` : '-';
                                    if (vals2[0]) vals2[0].textContent = marginText;
                                    if (vals2[1]) vals2[1].textContent = profitText;
                                }
                            }
                            const descNode = card.querySelector('.menu-card-description');
                            if (descNode) descNode.textContent = descEl.value;
                            const imgNode = card.querySelector('.menu-card-image img');
                            if (imgNode) imgNode.src = previewImg.src || imgNode.src || '';
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
                            if (typeof saveMenuToStorage === 'function') saveMenuToStorage();
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
                            const priceNum = parseFloat(priceEl.value || 0) || 0;
                            const costNum = parseFloat(costEl.value || 0) || 0;
                            const price = priceNum.toFixed(2);
                            const cost = costNum.toFixed(2);
                            const profitNum = priceNum - costNum;
                            const profitText = `$${profitNum.toFixed(2)}`;
                            const marginText = priceNum > 0 ? `${((profitNum / priceNum) * 100).toFixed(1)}%` : '-';
                            const description = descEl.value || '';
                            const imgSrc = previewImg.src || '';
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
                                            <p class="menu-info-value">${marginText}</p>
                                        </div>
                                        <div>
                                            <p class="menu-info-label">Profit</p>
                                            <p class="menu-info-value">${profitText}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="menu-card-actions">
                                    <button class="menu-btn-unavailable">Mark Unavailable</button>
                                    <button class="menu-btn-edit"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
                                    <button class="menu-btn-delete"><i class="fa-solid fa-trash"></i> Delete</button>
                                </div>`;

                            group.appendChild(card);

                            // ensure the new card is clickable for add-to-cart
                            if (typeof attachItemClicks === 'function') attachItemClicks();

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
                                if (typeof saveMenuToStorage === 'function') saveMenuToStorage();
                            });

                            const newDelete = card.querySelector('.menu-btn-delete');
                            if (newDelete) newDelete.addEventListener('click', () => {
                                if (window.confirm('Are you sure you want to delete this menu item?')) {
                                    card.remove();
                                    if (window.applyMenuFilters) window.applyMenuFilters();
                                    if (typeof saveMenuToStorage === 'function') saveMenuToStorage();
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
                            if (typeof saveMenuToStorage === 'function') saveMenuToStorage();
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
                                imageEl.value = '';
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

                                        // update profit and margin
                                        if (rows && rows[0] && rows[1]) {
                                            const priceNum = parseFloat(priceEl.value || 0) || 0;
                                            const costNum = parseFloat(costEl.value || 0) || 0;
                                            const profitNum = priceNum - costNum;
                                            const profitText = `$${profitNum.toFixed(2)}`;
                                            const marginText = priceNum > 0 ? `${((profitNum / priceNum) * 100).toFixed(1)}%` : '-';
                                            const vals2 = rows[1].querySelectorAll('.menu-info-value');
                                            if (vals2[0]) vals2[0].textContent = marginText;
                                            if (vals2[1]) vals2[1].textContent = profitText;
                                        }

                                        // description
                                        const descNode = card.querySelector('.menu-card-description');
                                        if (descNode) descNode.textContent = descEl.value;

                                        // image
                                        const imgNode = card.querySelector('.menu-card-image img');
                                        if (imgNode) imgNode.src = previewImg.src || imgNode.src || '';

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
                                        if (typeof saveMenuToStorage === 'function') saveMenuToStorage();
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


// compute profit and margin for existing cards on load
function computeProfitForCard(card) {
    if (!card) return;
    const rows = card.querySelectorAll('.menu-info-row');
    if (rows && rows[0] && rows[1]) {
        const vals = rows[0].querySelectorAll('.menu-info-value');
        const vals2 = rows[1].querySelectorAll('.menu-info-value');
        const priceNum = parseFloat((vals[0]?.textContent || '').replace('$','')) || 0;
        const costNum = parseFloat((vals[1]?.textContent || '').replace('$','')) || 0;
        const profitNum = priceNum - costNum;
        const profitText = `$${profitNum.toFixed(2)}`;
        const marginText = priceNum > 0 ? `${((profitNum / priceNum) * 100).toFixed(1)}%` : '-';
        if (vals2[0]) vals2[0].textContent = marginText;
        if (vals2[1]) vals2[1].textContent = profitText;
    }
}

function computeProfitForAll() {
    const cards = document.querySelectorAll('.menu-card');
    cards.forEach(c => computeProfitForCard(c));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', computeProfitForAll);
} else {
    computeProfitForAll();
}

menuEditBtn();
staff_menu_DeleteBtn();
markUnavailableBtn();
menuFilter();
add_menu_item_btn();

// --- Persistence: save menu items to localStorage so Orders page can reflect Admin Menu ---
function getMenuItemsFromDOM() {
    const items = [];
    document.querySelectorAll('.menu-card').forEach(card => {
        const title = card.querySelector('.menu-card-title')?.textContent.trim() || '';
        const category = card.querySelector('.menu-card-badge')?.textContent.trim() || '';
        const priceTxt = card.querySelector('.menu-info-row .menu-info-value')?.textContent.trim() || '';
        const price = parseFloat(priceTxt.replace('$','')) || 0;
        const img = card.querySelector('.menu-card-image img')?.src || '';
        const desc = card.querySelector('.menu-card-description')?.textContent.trim() || '';
        const statusEl = card.querySelector('.menu-card-status');
        const status = statusEl ? (statusEl.classList.contains('unavailable') ? 'unavailable' : 'available') : 'available';
        items.push({ title, category, price, img, desc, status });
    });
    return items;
}

function saveMenuToStorage() {
    try {
        const items = getMenuItemsFromDOM();
        localStorage.setItem('menuItems', JSON.stringify(items));
        // notify other code in the same window that menu items changed
        try { window.dispatchEvent(new Event('menuItemsUpdated')); } catch(e){}
        // if this page has a menu-grid (Orders), re-render immediately
        try { if (document.querySelector('.menu-grid')) renderMenuForOrders(); } catch(e){}
    } catch (e) {
        console.error('Failed to save menu to storage', e);
    }
}

// Listen for programmatic same-window updates (fired by saveMenuToStorage)
window.addEventListener && window.addEventListener('menuItemsUpdated', () => {
    if (document.querySelector('.menu-grid')) renderMenuForOrders();
});

function renderMenuForOrders() {
    const grid = document.querySelector('.menu-grid');
    if (!grid) return;
    let items = [];
    try { items = JSON.parse(localStorage.getItem('menuItems') || '[]'); } catch(e) { items = []; }
    // if there are no stored items, do not clear existing markup (allow static/demo cards)
    if (!items || items.length === 0) return;

    // we have stored items — replace the grid with persisted menu
    grid.innerHTML = '';
    items.forEach(it => {
        const card = document.createElement('div');
        card.className = 'menu-pos-card';
        card.innerHTML = `
            <div class="menu-image"><img src="${it.img || 'img/Espresso.jpg'}" alt="${it.title}"></div>
            <h4 class="menu-name">${it.title}</h4>
            <span class="menu-category">${it.category}</span>
            <p class="menu-price">$${(it.price||0).toFixed(2)}</p>
            <div class="hover-sign"><i class="fa-solid fa-plus"></i></div>`;
        grid.appendChild(card);
    });
    // bind click handlers for newly rendered POS cards
    if (typeof attachItemClicks === 'function') attachItemClicks();
}

// ensure we render orders menu from storage on orders page
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // only seed storage from DOM if there are admin `.menu-card` elements on this page
        if (!localStorage.getItem('menuItems') && document.querySelectorAll('.menu-card').length) saveMenuToStorage();
        renderMenuForOrders();
    });
} else {
    if (!localStorage.getItem('menuItems') && document.querySelectorAll('.menu-card').length) saveMenuToStorage();
    renderMenuForOrders();
}

// When menuItems changes in another tab/window, re-render POS menu so Orders follows Admin changes.
window.addEventListener && window.addEventListener('storage', (e) => {
    if (!e) return;
    if (e.key === 'menuItems') {
        // only try to render if we have a menu-grid on this page
        if (document.querySelector('.menu-grid')) renderMenuForOrders();
    }
});


// Script for Admin-Orders

function itemClick_to_cart() {
    // Encapsulated cart state and helpers for Admin Orders / POS
    const cartState = new Map(); // key -> {key, title, price, img, qty}
    const CART_TAX_RATE = 0.10; // 10%

    function formatCurrency(n) { return `$${n.toFixed(2)}`; }

    function createCartOverlay() {
        if (document.getElementById('cart-overlay')) return;
        const tpl = `
        <div class="cart-overlay" id="cart-overlay" style="display:none;">
          <div class="cart-popup">
            <div class="cart-header">
              <h3 class="cart-title">Cart</h3>
              <div class="clear-cart" title="Clear cart">Trash</div>
            </div>
            <div class="cart-items-list"></div>
            <div class="cart-summary">
              <div class="summary-row"><span>Subtotal</span><span class="cart-subtotal">$0.00</span></div>
              <div class="summary-row"><span>Tax (10%)</span><span class="cart-tax">$0.00</span></div>
              <div class="total-row"><span>Total</span><strong class="total-price">$0.00</strong></div>
              <div style="display:flex;gap:8px;margin-top:8px;"><button class="pay-cash">Pay Cash</button><button class="pay-card">Pay Card</button></div>
            </div>
          </div>
        </div>`;
        const div = document.createElement('div'); div.innerHTML = tpl; document.body.appendChild(div.firstElementChild);
        const overlay = document.getElementById('cart-overlay');
        const clearBtn = overlay.querySelector('.clear-cart');
        clearBtn.addEventListener('click', () => {
            if (!cartState.size) return;
            if (!window.confirm || window.confirm('Clear cart?')) {
                cartState.clear(); renderCart();
            }
        });
    }

    function renderCart() {
        const overlay = document.getElementById('cart-overlay');
        const pageCartBox = document.querySelector('.cart-section .cart-box');
        let container, list;
        if (pageCartBox) {
            container = pageCartBox;
            list = container.querySelector('.cart-items-list');
            if (!list) {
                list = document.createElement('div'); list.className = 'cart-items-list';
                const empty = container.querySelector('.cart-empty'); if (empty) empty.remove();
                container.appendChild(list);
                // add inline summary area if missing
                if (!container.querySelector('.cart-summary')) {
                    const summary = document.createElement('div');
                    summary.className = 'cart-summary';
                    summary.innerHTML = `
                        <div class="summary-row"><span>Subtotal</span><span class="cart-subtotal">$0.00</span></div>
                        <div class="summary-row"><span>Tax (10%)</span><span class="cart-tax">$0.00</span></div>
                        <div class="total-row"><span>Total</span><strong class="total-price">$0.00</strong></div>
                        <div style="display:flex;gap:8px;margin-top:8px;"><button class="pay-cash">Pay Cash</button><button class="pay-card">Pay Card</button></div>
                    `;
                    container.appendChild(summary);
                }
            }
        } else if (overlay) { container = overlay; list = overlay.querySelector('.cart-items-list'); }
        else return;

        list.innerHTML = '';
        let subtotal = 0;
        cartState.forEach(item => {
            const row = document.createElement('div'); row.className = 'cart-item';
            row.innerHTML = `
                <div class="item-image"><img src="${item.img}" alt="${item.title}"/></div>
                <div class="item-details"><div class="item-name">${item.title}</div><div class="item-price">${formatCurrency(item.price)} each</div></div>
                <div class="quantity-controls"><button class="qty-decr">-</button><span class="qty">${item.qty}</span><button class="qty-incr">+</button></div>
                <div class="remove-item" title="Remove">X</div>`;

            row.querySelector('.qty-incr').addEventListener('click', () => { item.qty++; renderCart(); });
            row.querySelector('.qty-decr').addEventListener('click', () => { if (item.qty>1) item.qty--; else cartState.delete(item.key); renderCart(); });
            row.querySelector('.remove-item').addEventListener('click', () => { cartState.delete(item.key); renderCart(); });

            list.appendChild(row); subtotal += item.price * item.qty;
        });

        const tax = subtotal * CART_TAX_RATE; const total = subtotal + tax;
        const subtotalEl = container.querySelector('.cart-subtotal'); const taxEl = container.querySelector('.cart-tax'); const totalEl = container.querySelector('.total-price');
        if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
        if (taxEl) taxEl.textContent = formatCurrency(tax);
        if (totalEl) totalEl.textContent = formatCurrency(total);

        if (pageCartBox) {
            if (cartState.size === 0) {
                if (!pageCartBox.querySelector('.cart-empty')) {
                    const empty = document.createElement('div'); empty.className = 'cart-empty';
                    empty.innerHTML = `<p class="cart-icon">🛍️</p><p class="cart-empty-text">Cart is empty<br><small>Add items to get started</small></p>`;
                    pageCartBox.innerHTML = ''; pageCartBox.appendChild(empty);
                }
            }
        }

        if (overlay && !pageCartBox) overlay.style.display = cartState.size ? 'block' : 'none';

        // wire payment buttons after rendering so handlers exist
        wirePaymentButtons();
    }

    // attach handlers to pay buttons (overlay or inline). idempotent (uses dataset.bound)
    function wirePaymentButtons() {
        const buttons = document.querySelectorAll('.pay-cash, .pay-card');
        buttons.forEach(btn => {
            if (btn.dataset.bound) return;
            btn.dataset.bound = '1';
            btn.addEventListener('click', () => {
                if (!cartState.size) { alert('Cart is empty'); return; }
                const items = Array.from(cartState.values()).map(it => ({ title: it.title, price: it.price, qty: it.qty }));
                const subtotalNum = items.reduce((s,i) => s + (i.price * i.qty), 0);
                const taxNum = subtotalNum * CART_TAX_RATE;
                const totalNum = subtotalNum + taxNum;
                const subtotal = formatCurrency(subtotalNum);
                const tax = formatCurrency(taxNum);
                const total = formatCurrency(totalNum);
                const storeName = document.querySelector('.title .text p')?.textContent.trim() || document.title || 'Coffee Shop';
                const method = btn.classList.contains('pay-cash') ? 'Cash' : 'Card';

                // determine location if present on page, fallback to hostname or 'Main Branch'
                const pageLocation = document.querySelector('.store-location')?.textContent.trim()
                    || document.querySelector('.title .text small')?.textContent.trim()
                    || window.location.hostname || 'Main Branch';

                // open printable receipt in new window (pass location)
                _openPrintableReceipt(storeName, items, subtotal, tax, total, method, pageLocation);

                // clear cart after payment
                cartState.clear();
                renderCart();
            });
        });
    }

    function addItemToCartFromCard(card) {
        if (!card) return;
        let title='', priceNum=0, img='';
        if (card.classList.contains('menu-pos-card')) {
            title = card.querySelector('.menu-name')?.textContent.trim() || 'Item';
            const p = card.querySelector('.menu-price')?.textContent.trim() || '';
            priceNum = parseFloat(p.replace('$','')) || 0;
            img = card.querySelector('.menu-image img')?.src || '';
        } else {
            title = card.querySelector('.menu-card-title')?.textContent.trim() || 'Item';
            const p = card.querySelector('.menu-info-row .menu-info-value')?.textContent.trim() || '';
            priceNum = parseFloat(p.replace('$','')) || 0;
            img = card.querySelector('.menu-card-image img')?.src || '';
        }
        const key = `${title}::${priceNum}`;
        if (cartState.has(key)) cartState.get(key).qty++; else cartState.set(key, { key, title, price: priceNum, img, qty: 1 });
        renderCart();
    }

    function attachItemClicks() {
        const cards = document.querySelectorAll('.menu-card, .menu-pos-card');
        cards.forEach(card => {
            if (card._cartBound) return; card._cartBound = true;
            card.addEventListener('click', (e) => { if (e.target.closest('.menu-card-actions') || e.target.closest('.menu-pos-actions')) return; addItemToCartFromCard(card); });
        });
    }

    function bindPosClicks() {
        createCartOverlay(); attachItemClicks();
        // ensure inline cart summary exists so totals + pay buttons are visible
        const pageCartBox = document.querySelector('.cart-section .cart-box');
        if (pageCartBox && !pageCartBox.querySelector('.cart-summary')) {
            const summary = document.createElement('div');
            summary.className = 'cart-summary';
            summary.innerHTML = `
                <div class="summary-row"><span>Subtotal</span><span class="cart-subtotal">$0.00</span></div>
                <div class="summary-row"><span>Tax (10%)</span><span class="cart-tax">$0.00</span></div>
                <div class="total-row"><span>Total</span><strong class="total-price">$0.00</strong></div>
                <div style="display:flex;gap:8px;margin-top:8px;"><button class="pay-cash">Pay Cash</button><button class="pay-card">Pay Card</button></div>
            `;
            pageCartBox.appendChild(summary);
        }
        const pageClear = document.querySelector('.cart-section .clear-cart');
        if (pageClear && !pageClear._bound) { pageClear._bound = true; pageClear.addEventListener('click', () => { if (!cartState.size) return; if (!window.confirm || window.confirm('Clear cart?')) { cartState.clear(); renderCart(); } }); }
        renderCart();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindPosClicks); else bindPosClicks();
}

// --- Payment + Receipt helpers (added inside file-level scope) ---
// Note: we keep these outside the function so they can be re-used by other code if needed.
function _buildReceiptHtml(storeName, items, subtotal, tax, total, paymentMethod, location) {
        const now = new Date();
        const date = now.toLocaleDateString();
        const time = now.toLocaleTimeString();
        // generate a simple receipt id using timestamp + random suffix
        const rid = 'R-' + now.getFullYear().toString().slice(-2) + ('0'+(now.getMonth()+1)).slice(-2) + ('0'+now.getDate()).slice(-2) + '-' + now.getTime().toString().slice(-5) + '-' + Math.floor(Math.random()*9000+1000);

        // build item rows with columns: Item, Qty, Unit, Line Total
        let rows = '';
        items.forEach(it => {
                const unit = (it.price || 0).toFixed(2);
                const line = ((it.price || 0) * (it.qty || 0)).toFixed(2);
                rows += `<tr>
                        <td style="padding:6px 0">${it.title}</td>
                        <td style="text-align:center">${it.qty}</td>
                        <td style="text-align:right">$${unit}</td>
                        <td style="text-align:right">$${line}</td>
                </tr>`;
        });

        return `
        <html><head><title>Receipt</title>
        <style>
            body{font-family:Arial;padding:18px;color:#111}
            h2{text-align:center;margin:6px 0}
            .meta{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:8px 0;font-size:14px;align-items:start}
            .meta .left{display:block}
            .meta .right{text-align:right}
            table{width:100%;border-collapse:collapse;margin-top:8px}
            th{text-align:left;padding:6px 0;border-bottom:1px solid #ddd}
            td{padding:6px 0}
            .right-col{text-align:right}
        </style>
        </head><body>
        <h2>${storeName || 'Receipt'}</h2>
        <div class="meta">
            <div class="left">
                <div><strong>Location:</strong> ${location || 'Main Branch'}</div>
            </div>
            <div class="right">
                <div>Receipt ID: <strong>${rid}</strong></div>
                <div>Date: ${date}</div>
                <div>Time: ${time}</div>
            </div>
        </div>
        <table>
            <thead>
                <tr><th>Item</th><th style="text-align:center">Qty</th><th class="right-col">Unit</th><th class="right-col">Line Total</th></tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
        <hr>
        <div style="margin-top:8px">
            <div style="display:flex;justify-content:space-between"><div>Subtotal</div><div>${subtotal}</div></div>
            <div style="display:flex;justify-content:space-between"><div>Tax</div><div>${tax}</div></div>
            <div style="display:flex;justify-content:space-between;font-weight:700"><div>Total (${paymentMethod})</div><div>${total}</div></div>
        </div>
        <div style="margin-top:12px;text-align:center"><small>Thank you for your purchase</small></div>
        </body></html>`;
}

function _openPrintableReceipt(storeName, items, subtotal, tax, total, paymentMethod, location) {
    const html = _buildReceiptHtml(storeName, items, subtotal, tax, total, paymentMethod, location);
    const w = window.open('', '_blank', 'width=600,height=800');
    if (!w) { alert('Popup blocked. Please allow popups to print the receipt.'); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
    // give browser a moment then call print
    setTimeout(() => { w.print(); }, 300);
}
itemClick_to_cart();