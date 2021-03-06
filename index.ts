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

export const DefaultOptions: SpoilerOptions = {
  rootSelector: '.js-spoiler',
  headSelector: '.js-spoiler__head',
  bodySelector: '.js-spoiler__body',
  openedClass: 'js-spoiler--opened',
  closedClass: 'js-spoiler--closed',
  initedClass: 'js-spoiler--inited',
  headOpenedClass: 'js-spoiler__head--opened',
  headClosedClass: 'js-spoiler__head--closed',
  bodyOpenedClass: 'js-spoiler__body--opened',
  bodyClosedClass: 'js-spoiler__body--closed',
  beforeChangeStateEvent: 'before-spoiler-change-state',
  afterChangeStateEvent: 'after-spoiler-change-state',
  openedTextAttr: 'data-spoiler-opened-text',
  closedTextAttr: 'data-spoiler-closed-text'
};

export interface SpoilerChangeStateEvent extends CustomEvent {
  detail: {
    newStateIsOpened?: boolean;
  }
}

export class Spoiler extends base.Component<SpoilerOptions> {
  constructor(root: Element, options: SpoilerOptions) {
    super(root, options);

    let head = this.root.querySelector(this.options.headSelector || DefaultOptions.headSelector || '');
    if (head) {
      head.addEventListener('click', this._onHeadClick.bind(this));
    }

    if (this.options.openedClass && this.root.classList.contains(this.options.openedClass)) {
      this.setOpened(true);
    } else {
      this._syncClasses();
    }

    if (this.options.initedClass) {
      this.root.classList.add(this.options.initedClass);
    }

    this._syncText();
  }

  toggle(): boolean {
    return this.setOpened(!this.opened);
  }

  get opened(): boolean { return this._isOpened; }

  setOpened(value: boolean): boolean {
    value = !!value;

    if (value === this._isOpened) {
      return true;
    }

    if (this.options.beforeChangeStateEvent) {
      let beforeEvent = new CustomEvent(this.options.beforeChangeStateEvent, {
        bubbles: true,
        cancelable: true,
        detail: {
          newStateIsOpened: value
        }
      });
      if (!this.root.dispatchEvent(beforeEvent)) {
        return false;
      }
    }

    this._isOpened = value;

    this._syncClasses();
    this._syncText();

    if (this.options.afterChangeStateEvent) {
      let afterEvent = new CustomEvent(this.options.afterChangeStateEvent, {
        bubbles: true,
        cancelable: false,
        detail: {
          newStateIsOpened: value
        }
      });
      this.root.dispatchEvent(afterEvent);
    }

    return true;
  }

  /** Protected area **/

  protected _isOpened: boolean = false;

  protected _onHeadClick(e: Event): void {
    this.toggle();
    e.preventDefault();
  }

  protected _syncText(): void {
    const setText = (attr: string) => {
      this._each(`[${attr}]`, elem => {
        elem.textContent = elem.getAttribute(attr);
      });
    };

    if (this.options.openedTextAttr && this.opened) {
      setText(this.options.openedTextAttr);
    }

    if (this.options.closedTextAttr && !this.opened) {
      setText(this.options.closedTextAttr);
    }
  }

  protected _syncClasses() {
    const setClasses = (selector: string, openedClass?: string, closedClass?: string) => {
      this._each(selector, elem => {
        elem.classList.toggle(openedClass || '', this._isOpened);
        elem.classList.toggle(closedClass || '', !this._isOpened);
      });
    };

    if (this.options.headSelector) {
      setClasses(this.options.headSelector, this.options.headOpenedClass, this.options.headClosedClass);
    }

    if (this.options.bodySelector) {
      setClasses(this.options.bodySelector, this.options.bodyOpenedClass, this.options.bodyClosedClass);
    }

    if (this.options.openedClass) {
      this.root.classList.toggle(this.options.openedClass, this._isOpened);
    }

    if (this.options.closedClass) {
      this.root.classList.toggle(this.options.closedClass, !this._isOpened);
    }
  }
}

export interface SpoilerGroupOptions extends base.ComponentOptions {
  spoilerRootSelector?: string;
  spoilerAfterChangeStateEvent?: string;
  exclusiveAttr?: string;
  defaultExclusive?: boolean;
  openedIndexAttr?: string;
  defaultOpenedIndex?: number;
}

export const DefaultGroupOptions: SpoilerGroupOptions = {
  rootSelector: '.js-spoiler-group',
  spoilerRootSelector: DefaultOptions.rootSelector,
  spoilerAfterChangeStateEvent: DefaultOptions.afterChangeStateEvent,
  exclusiveAttr: 'data-spoiler-group-exclusive',
  defaultExclusive: false,
  openedIndexAttr: 'data-spoiler-group-opened-index',
  defaultOpenedIndex: -1
};

export class SpoilerGroup extends base.Component<SpoilerGroupOptions> {
  constructor(root: Element, options: SpoilerGroupOptions) {
    super(root, options);

    if (base.checkBinaryOptionAttr(this.root, this.options.exclusiveAttr, this.options.defaultExclusive || false)) {
      this._exclusive = true;
    }

    if (this.root.querySelector(this.options.rootSelector || DefaultOptions.rootSelector || '')) {
      throw new Error('Spoiler groups cannot be nested');
    }

    let openedIndex: number = this.options.defaultOpenedIndex || -1;
    if (this.options.openedIndexAttr && this.root.hasAttribute(this.options.openedIndexAttr)) {
      let index = +('' + this.root.getAttribute(this.options.openedIndexAttr));
      if (!isNaN(index)) {
        openedIndex = index;
      }
    }

    if (!this.options.spoilerAfterChangeStateEvent) {
      throw new Error('spoilerAfterChangeStateEvent option is empty');
    }

    if (!this.options.spoilerRootSelector) {
      throw new Error('spoilerRootSelector option is empty');
    }

    let spoilers = this.root.querySelectorAll(this.options.spoilerRootSelector);
    if (this.exclusive) {
      for (let q = 0; q < spoilers.length; ++q) {
        let spoiler = SpoilerFactory.fromRoot(spoilers[q]);
        if (spoiler && spoiler.opened) {
          if (this._curOpenedSpoiler != null) {
            spoiler.setOpened(false);
          } else {
            this._curOpenedSpoiler = spoiler;
          }
        }
      }

      this.root.addEventListener(this.options.spoilerAfterChangeStateEvent, this._onSpoilerStateChanged.bind(this));
    }

    if (this._curOpenedSpoiler == null && openedIndex >= 0 && openedIndex < spoilers.length) {
      let spoilerToOpen = SpoilerFactory.fromRoot(spoilers[openedIndex]);
      if (spoilerToOpen) {
        spoilerToOpen.setOpened(true);
      }
    }
  }

  get exclusive(): boolean { return this._exclusive; }

  get spoilerCount(): number {
    return this.root.querySelectorAll(this.options.spoilerRootSelector || '').length;
  }

  /** Protected area **/

  protected _curOpenedSpoiler: Spoiler|null = null;
  protected _exclusive: boolean = false;

  protected _onSpoilerStateChanged(e: SpoilerChangeStateEvent): void {
    if (e.detail.newStateIsOpened && this.exclusive) {
      if (this._curOpenedSpoiler && this._curOpenedSpoiler.root !== e.target) {
        this._curOpenedSpoiler.setOpened(false);
      }
      this._curOpenedSpoiler = SpoilerFactory.fromRoot(e.target as Element);
    }
  }
}

export const SpoilerFactory = new base.ComponentFactory('spoiler', DefaultOptions, Spoiler);
export const SpoilerGroupFactory = new base.ComponentFactory('spoiler-group', DefaultGroupOptions, SpoilerGroup);
