/* Assembles a Bingo card */
export default class BingoCard {
    public data: BingoCardItem[][];

    constructor(boardData?: BingoCardItem[][]) {
        this.data = boardData || [];
    }

    render(element: HTMLElement) {
        // element is the container
        for(let i = 0; i < this.data.length; i++) {
            let row = this.data[i];
            let rowElement = document.createElement("div")
            rowElement.classList.add("bingo-row");
            element.appendChild(rowElement);
            for (let j = 0; j < row.length; j++) {
                row[j].render(rowElement);
            }
        }
    }
}

export class BingoCardItem {
    public text: string;
    public state: boolean;
    public togglable: boolean;
    private element: HTMLElement;
    private longClickTimeout: number | undefined = undefined;

    constructor(text: string, state: boolean = false, togglable: boolean = true) {
        this.text = text;
        this.state = state;
        this.togglable = togglable;

        this.element = document.createElement("div");
        this.element.classList.add("bingo-item");
        if (this.state) this.element.classList.add("active");
        this.element.innerText = this.text;
        this.element.addEventListener("click", () => this.onClick());
    }

    render(element: HTMLElement) {
        element.appendChild(this.element);
    }

    private onClick() {
        if (!this.togglable) return;
        this.state = !this.state;
        if (this.state)
            this.element.classList.add("active");
        else
            this.element.classList.remove("active");
    }
}