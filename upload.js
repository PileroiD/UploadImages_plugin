export default class Upload {
    constructor(selector, options = {}) {
        this.files = [];
        this.options = options;
        this.onUpload = this.options.onUpload || this.noop;

        this.input = document.querySelector(selector);
        this.preview = this.element('div', ['preview']);
        this.open = this.element('button', ['btn'], 'Open');
        this.upload = this.element('button', ['btn', 'primary'], 'Upload');
        this.upload.style.display = 'none';

        if (this.options.multi) {
            this.input.setAttribute('multiple', true);
        }

        if (this.options.accept && Array.isArray(this.options.accept)) {
            this.input.setAttribute('accept', this.options.accept.join(','));
        }

        this.input.insertAdjacentElement('afterend', this.preview);
        this.input.insertAdjacentElement('afterend', this.upload);
        this.input.insertAdjacentElement('afterend', this.open);

        this.open.addEventListener('click', this.triggerInput);
        this.upload.addEventListener('click', this.uploadHandler);

        this.input.addEventListener('change', this.changeHandler);
        this.preview.addEventListener('click', this.removeHandler);
    }

    noop() {}

    element(tag, classes = [], content) {
        const node = document.createElement(tag);

        if (classes.length) {
            node.classList.add(...classes);
        }

        if (content) {
            node.textContent = content;
        }

        return node;
    }

    triggerInput = () => this.input.click();

    changeHandler = event => {
        if (event.target.files.length === 0) {
            return
        }

        this.upload.style.display = 'inline-block';

        this.files = Array.from(event.target.files); // Array.from {{}, {}} => [{}, {}]

        this.preview.innerHTML = '';

        this.files.forEach(file => {
            if (!file.type.match(/image/gi)) {
                return
            }

            const reader = new FileReader();

            reader.onload = ev => { // Обработчик события reader.addEventListener('onload', (ev) => ...)
                const src = ev.target.result;
                // console.log(file);
                this.preview.insertAdjacentHTML('afterbegin', `
                    <div class="preview-image">
                        <div class="preview-remove" data-name="${file.name}">&times;</div>
                        <img src="${src}" alt="${file.name}">
                        <div class="preview-info">
                            <span>${file.name.slice(0, 10)}...${file.name.split('.').pop()}</span>
                            ${this.formatBytes(file.size, 1)}
                        </div>
                    </div>
                `);
            }

            reader.readAsDataURL(file);
        });
    }

    formatBytes(bytes, decimals = 2) {
        if (!+bytes) {
            return '0 Bytes';
        }

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }

    removeHandler = event => {
        if (!event.target.dataset.name) {
            return
        }

        const { name } = event.target.dataset; // img name

        this.files = this.files.filter(file => file.name !== name);

        if (!this.files.length) {
            this.upload.style.display = 'none';
        }

        const block = this.preview.querySelector(`[data-name="${name}"]`).parentNode;

        block.classList.add('removing');
        setTimeout(() => block.remove(), 300);
    }

    clearPreview = el => {
        el.style.bottom = '4px';
        el.innerHTML = `<div class="preview-info-progress"></div>`;
    };

    uploadHandler = () => {
        this.preview.querySelectorAll('.preview-remove').forEach(el => el.remove());
        const previewInfo = this.preview.querySelectorAll('.preview-info').forEach(el => this.clearPreview(el));
        this.onUpload(files, previewInfo);
    };
}