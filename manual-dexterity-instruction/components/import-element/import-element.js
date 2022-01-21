class ImportElement extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.innerHTML = "";
		this.appendChild(document.querySelector(`template[data-is=${this.tagName.toLowerCase()}]`)?.content.cloneNode(true));
	}
}
