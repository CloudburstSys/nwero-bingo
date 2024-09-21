import Emote from "./Emote";
import * as Modal from "./Modal";

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
                if (i == 0 && j == 0)
                    row[j].addTopLeftCurve(30);
                if (i == 0 && j == 4)
                    row[j].addTopRightCurve(30);
                if (i == 4 && j == 0)
                    row[j].addBottomLeftCurve(30);
                if (i == 4 && j == 4)
                    row[j].addBottomRightCurve(30);
                
                row[j].render(rowElement);
            }
        }
    }
}

export class BingoCardItem {
    public name: string;
    public description: string;
    public category: BingoItemCategory;
    public state: boolean;
    public togglable: boolean;
    protected element: HTMLElement;
    private longHoldTimeout: number | undefined = undefined;

    constructor(name: string, description: string, category: BingoItemCategory, state: boolean = false, togglable: boolean = true) {
        this.name = name;
        this.description = description;
        this.category = category;
        this.state = state;
        this.togglable = togglable;

        this.element = document.createElement("div");
        this.element.classList.add("bingo-item");
        this.element.classList.add(this.category);
        if (this.state) this.element.classList.add("active");
        let textElement = document.createElement("span");
        Emote.convert(this.name).then(str => textElement.innerHTML = str);
        this.element.appendChild(textElement);
        //let cfrb = document.createElement("img");
        //cfrb.src = "/Evilzyzz.gif";
        //this.element.appendChild(cfrb);
        this.element.addEventListener("mousedown", (e: MouseEvent) => this.onClick(e));
        this.element.addEventListener("touchstart", (e: TouchEvent) => { this.longHoldTimeout = setTimeout(() => this.onLongHold(e), 500) as unknown as number; });
        this.element.addEventListener("touchend", () => clearTimeout(this.longHoldTimeout));
        this.element.addEventListener("touchmove", () => clearTimeout(this.longHoldTimeout));
    }

    static fromBoardJSON(data: { name: string, description: string, category: string }): BingoCardItem {
        let category: BingoItemCategory;
        switch (data?.category) {
            case "chat":
                category = BingoItemCategory.Chat;
                break;
            case "neuro":
                category = BingoItemCategory.Neuro;
                break;
            case "evil":
                category = BingoItemCategory.Evil;
                break;
            case "both":
                category = BingoItemCategory.Both;
            case "vedal":
                category = BingoItemCategory.Vedal;
                break;
            case "partner":
                category = BingoItemCategory.CollabPartner;
                break;
            default:
                category = BingoItemCategory.Chat;
        }

        return new this(data?.name, data?.description, category);
    }

    addTopLeftCurve(value: number) {
        this.element.style.borderTopLeftRadius = `${value}px`;
    }
    addTopRightCurve(value: number) {
        this.element.style.borderTopRightRadius = `${value}px`;
    }
    addBottomLeftCurve(value: number) {
        this.element.style.borderBottomLeftRadius = `${value}px`;
    }
    addBottomRightCurve(value: number) {
        this.element.style.borderBottomRightRadius = `${value}px`;
    }

    render(element: HTMLElement) {
        element.appendChild(this.element);
    }

    private onLongHold(e: TouchEvent) {
        Modal.showModal(this.name, this.description);
    }

    private onClick(e: MouseEvent) {
        if (e.which === 3 || e.button === 2) {
            Modal.showModal(this.name, this.description);
        } else if (e.which === 1 || e.button === 0) {
            if (!this.togglable) return;
            this.state = !this.state;
            if (this.state)
                this.element.classList.add("active");
            else
                this.element.classList.remove("active");
        }
    }
}

/**
 * An extension of BingoCardItem used for free spaces.
 */
export class BingoCardFreeSpace extends BingoCardItem {
    private imageUrl: string;
    private altText: string;
    public artistName: string;
    public sourceUrl: string;
    private stretched: boolean;

    constructor(imageUrl: string, altText: string, artistName: string, sourceUrl: string, streched: boolean = false) {
        super("Free Space", `the stream starts (selected automatically)<br/><br/>Art credit: <a href="${sourceUrl}" target="_blank">${artistName}</a>`, BingoItemCategory.Chat, true, false);

        this.imageUrl = imageUrl;
        this.altText = altText;
        this.artistName = artistName;
        this.sourceUrl = sourceUrl;
        this.stretched = streched;

        this.element.innerHTML = `<img class="bingo-image${this.stretched ? " stretch" : ""}" src="${this.imageUrl}" alt="${this.altText}" />`;
    }
}

export enum BingoItemCategory {
    Chat = "chat",
    Neuro = "neuro",
    Evil = "evil",
    Both = "both",
    Vedal = "vedal",
    CollabPartner = "partner"
}