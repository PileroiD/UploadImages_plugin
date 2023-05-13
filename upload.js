function formatBytes(bytes, decimals = 2) {
    if (!+bytes) {
        return '0 Bytes';
    }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const element = (tag, classes = [], content) => {
    const node = document.createElement(tag);

    if (classes.length) {
        node.classList.add(...classes);
    }

    if (content) {
        node.textContent = content;
    }

    return node;
};

const noop = () => {};

export function upload(selector, options = {}) {
    let files = [];
    const onUpload = options.onUpload || noop;

    const input = document.querySelector(selector);
    const preview = element('div', ['preview']);

    const open = element('button', ['btn'], 'Open');
    const upload = element('button', ['btn', 'primary'], 'Upload');
    upload.style.display = 'none'; // hide upload button until we drop images

    if (options.multi) {
        input.setAttribute('multiple', true);
    }

    if (options.accept && Array.isArray(options.accept)) {
        input.setAttribute('accept', options.accept.join(','));
    }

    input.insertAdjacentElement('afterend', preview);
    input.insertAdjacentElement('afterend', upload);
    input.insertAdjacentElement('afterend', open);

    const triggerInput = () => input.click();

    const changeHandler = event => {
        if (event.target.files.length === 0) {
            return
        }

        upload.style.display = 'inline-block';

        files = Array.from(event.target.files); // Array.from {{}, {}} => [{}, {}]

        preview.innerHTML = '';

        files.forEach(file => {
            if (!file.type.match(/image/gi)) {
                return
            }

            const reader = new FileReader();

            reader.onload = ev => { // Обработчик события reader.addEventListener('onload', (ev) => ...)
                const src = ev.target.result;
                // console.log(file);
                preview.insertAdjacentHTML('afterbegin', `
                    <div class="preview-image">
                        <div class="preview-remove" data-name="${file.name}">&times;</div>
                        <img src="${src}" alt="${file.name}">
                        <div class="preview-info">
                            <span>${file.name.slice(0, 10)}...${file.name.split('.').pop()}</span>
                            ${formatBytes(file.size, 1)}
                        </div>
                    </div>
                `);
            }

            reader.readAsDataURL(file);
        });
    }

    const removeHandler = event => {
        if (!event.target.dataset.name) {
            return
        }

        const { name } = event.target.dataset; // img name

        files = files.filter(file => file.name !== name);

        if (!files.length) {
            upload.style.display = 'none';
        }

        const block = preview.querySelector(`[data-name="${name}"]`).parentNode;

        block.classList.add('removing');
        setTimeout(() => block.remove(), 300);
    }

    const clearPreview = (el) => {
        el.style.bottom = '4px';
        el.innerHTML = `<div class="preview-info-progress"></div>`;
    };

    const uploadHandler = () => {
        preview.querySelectorAll('.preview-remove').forEach(el => el.remove());
        const previewInfo = preview.querySelectorAll('.preview-info').forEach(el => clearPreview(el));
        onUpload(files, previewInfo);
    };

    open.addEventListener('click', triggerInput);
    upload.addEventListener('click', uploadHandler);

    input.addEventListener('change', changeHandler);
    preview.addEventListener('click', removeHandler);
}