export const gallery = (() => {

    const GALLERY_PATH = './assets/gallery/';

    /**
     * @param {string[]} images
     * @returns {HTMLDivElement}
     */
    const buildMasonry = (images) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'row g-2 mt-3';

        const colLeft = document.createElement('div');
        colLeft.className = 'col-6';
        const colRight = document.createElement('div');
        colRight.className = 'col-6';

        images.forEach((file, i) => {
            const img = document.createElement('img');
            img.src = './assets/images/placeholder.webp';
            img.setAttribute('data-src', GALLERY_PATH + encodeURIComponent(file));
            img.setAttribute('data-file', file);
            img.alt = `image ${i + 1}`;
            img.className = 'd-block rounded-3 mb-2 cursor-pointer';
            img.style.maxWidth = '100%';
            img.style.width = '100%';
            img.style.height = 'auto';
            img.addEventListener('click', () => {
                if (window.undangan && window.undangan.guest) {
                    window.undangan.guest.modal(img);
                }
            });

            if (i % 2 === 0) {
                colLeft.appendChild(img);
            } else {
                colRight.appendChild(img);
            }
        });

        wrapper.appendChild(colLeft);
        wrapper.appendChild(colRight);

        return wrapper;
    };

    /**
     * @returns {Promise<boolean>}
     */
    const init = async () => {
        const container = document.getElementById('gallery-container');
        if (!container) {
            return false;
        }

        let files;
        try {
            const res = await fetch(GALLERY_PATH + 'gallery.json');
            if (!res.ok) {
                return false;
            }
            files = await res.json();
        } catch {
            return false;
        }

        if (!files || files.length === 0) {
            const section = document.getElementById('gallery');
            if (section) {
                section.remove();
            }
            return false;
        }

        container.appendChild(buildMasonry(files));

        return true;
    };

    return {
        init,
    };
})();
