declare module '@yaireo/tagify' {
  export default class Tagify {
    constructor(element: HTMLElement, settings?: any);
    addTags(tags: string[] | string): void;
    removeAllTags(): void;
    on(event: string, callback: (event: any) => void): void;
    destroy(): void;
    [key: string]: any; // Allow for additional dynamic properties
  }
}
