export default interface SavedCard {
    stateKey: string,
    data: SavedCardItem[][]
}

export interface SavedCardItem {
    text: string,
    state: boolean
}