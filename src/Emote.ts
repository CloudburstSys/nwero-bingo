export default class Emote {
  public name: string;
  public url: string;

  constructor(name: string) {
    this.name = name;
    this.url = `/assets/emotes/${this.name}.webp`;
  }

  /**
   * Converts a string representation of an emote to an Emote
   * @param str The string representation to convert.
   * @returns The Emote created, or null if invalid.
   */
  static async fromString(str: string): Promise<Emote | null> {
    let emoteRegex = /:([a-z]{3,}):/g;
    let result = emoteRegex.exec(str);

    if (result != null) {
      let isReal = await fetch(`/assets/emotes/${result[1]}.webp`).then((res) => (res.status != 200 ? false : true));

      if (isReal) return new this(result[1]);
    }

    return null;
  }

  /**
   * Converts an entire string, replacing emotes with HTML to render emotes.
   * @param str The string to convert
   * @returns The converted string
   */
  static async convert(str: string): Promise<string> {
    let strArray = str.split(" ");

    for (let i in strArray) {
      let emote = await this.fromString(strArray[i]);

      if (emote != null) strArray[i] = emote.toHTML();
    }

    return strArray.join(" ");
  }

  toHTML() {
    return `<img class="emote" src="${this.url}" alt="${this.name}" />`;
  }
}
