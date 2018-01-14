import * as base from '@zcomp/base';
export interface SpoilerOptions extends base.ComponentOptions {
    headSelector?: string;
    bodySelector?: string;
    openedClass?: string;
    closedClass?: string;
    initedClass?: string;
    headOpenedClass?: string;
    headClosedClass?: string;
    bodyOpenedClass?: string;
    bodyClosedClass?: string;
    beforeChangeStateEvent?: string;
    afterChangeStateEvent?: string;
    openedTextAttr: string;
    closedTextAttr: string;
}
export declare const DefaultOptions: SpoilerOptions;
export interface SpoilerChangeStateEvent extends CustomEvent {
    detail: {
        newStateIsOpened?: boolean;
    };
}
export declare class Spoiler extends base.Component<SpoilerOptions> {
    constructor(root: Element, options: SpoilerOptions);
    toggle(): boolean;
    readonly opened: boolean;
    setOpened(value: boolean): boolean;
    /** Protected area **/
    protected _isOpened: boolean;
    protected _onHeadClick(e: Event): void;
    protected _syncText(): void;
    protected _syncClasses(): void;
}
export interface SpoilerGroupOptions extends base.ComponentOptions {
    spoilerRootSelector?: string;
    spoilerAfterChangeStateEvent?: string;
    exclusiveAttr?: string;
    defaultExclusive?: boolean;
    openedIndexAttr?: string;
    defaultOpenedIndex?: number;
}
export declare const DefaultGroupOptions: SpoilerGroupOptions;
export declare class SpoilerGroup extends base.Component<SpoilerGroupOptions> {
    constructor(root: Element, options: SpoilerGroupOptions);
    readonly exclusive: boolean;
    readonly spoilerCount: number;
    /** Protected area **/
    protected _curOpenedSpoiler: Spoiler | null;
    protected _exclusive: boolean;
    protected _onSpoilerStateChanged(e: SpoilerChangeStateEvent): void;
}
export declare const SpoilerFactory: base.ComponentFactory<Spoiler, SpoilerOptions>;
export declare const SpoilerGroupFactory: base.ComponentFactory<SpoilerGroup, SpoilerGroupOptions>;
