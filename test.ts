import { expect } from 'chai';
import {
  DefaultOptions, Spoiler, SpoilerChangeStateEvent, SpoilerFactory, SpoilerGroup,
  SpoilerGroupFactory
} from "./index";

function init(html: string): void {
  document.body.innerHTML = html;
}

function elem(id: string): Element {
  return document.getElementById(id) as Element;
}

function sendEvent(id: string, eventType: string): void {
  elem(id).dispatchEvent(new Event(eventType, { bubbles: true }));
}

function hasClass(id: string, className: string): boolean {
  return elem(id).classList.contains(className);
}

describe("Spoiler", function () {
  it('should create spoilers', function () {
    init(`<div class="js-spoiler" id="spoiler"></div>`);

    let spoiler = SpoilerFactory.createComp(Spoiler, elem('spoiler'));
    expect(spoiler).to.not.be.null;
    expect(spoiler.root).to.be.equal(elem('spoiler'));
    expect(SpoilerFactory.fromRoot(elem('spoiler'))).to.be.equal(spoiler);
    expect(spoiler.opened).to.be.false;
    expect(elem('spoiler').classList.contains('js-spoiler--closed')).to.be.true;
  });

  it('should create opened spoiler', function () {
    init(`<div class="js-spoiler js-spoiler--opened" id="spoiler"></div>`);

    let spoiler = SpoilerFactory.createComp(Spoiler, elem('spoiler'));
    expect(spoiler.opened).to.be.true;
    expect(elem('spoiler').classList.contains('js-spoiler--opened')).to.be.true;
  });

  it('should set opened', function () {
    init(`<div class="js-spoiler" id="spoiler"></div>`);

    let spoiler = SpoilerFactory.createComp(Spoiler, elem('spoiler'));
    expect(spoiler.opened).to.be.false;
    expect(spoiler.setOpened(false)).to.be.true;
    expect(spoiler.opened).to.be.false;
    expect(spoiler.setOpened(true)).to.be.true;
    expect(spoiler.opened).to.be.true;
  });

  it('should toggle', function () {
    init(`<div class="js-spoiler" id="spoiler"></div>`);

    let spoiler = SpoilerFactory.createComp(Spoiler, elem('spoiler'));
    expect(spoiler.opened).to.be.false;
    expect(spoiler.toggle()).to.be.true;
    expect(spoiler.opened).to.be.true;
    expect(spoiler.toggle()).to.be.true;
    expect(spoiler.opened).to.be.false;
  });

  it('should open spoiler on click', function () {
    init(`<div class="js-spoiler" id="spoiler">
      <button class="js-spoiler__head" id="spoiler-head"></button>
      <div class="js-spoiler__body" id="spoiler-body"></div>
    </div>`);

    let spoiler = SpoilerFactory.createComp(Spoiler, elem('spoiler'));
    expect(spoiler.opened).to.be.false;
    sendEvent('spoiler-head', 'click');
    expect(spoiler.opened).to.be.true;
    expect(elem('spoiler').classList.contains('js-spoiler--opened')).to.be.true;
    expect(elem('spoiler').classList.contains('js-spoiler--closed')).to.be.false;
    expect(elem('spoiler-head').classList.contains('js-spoiler__head--opened')).to.be.true;
    expect(elem('spoiler-body').classList.contains('js-spoiler__body--opened')).to.be.true;
    expect(elem('spoiler-head').classList.contains('js-spoiler__head--closed')).to.be.false;
    expect(elem('spoiler-body').classList.contains('js-spoiler__body--closed')).to.be.false;

    sendEvent('spoiler-head', 'click');
    expect(elem('spoiler').classList.contains('js-spoiler--opened')).to.be.false;
    expect(elem('spoiler').classList.contains('js-spoiler--closed')).to.be.true;
    expect(elem('spoiler-head').classList.contains('js-spoiler__head--opened')).to.be.false;
    expect(elem('spoiler-body').classList.contains('js-spoiler__body--opened')).to.be.false;
    expect(elem('spoiler-head').classList.contains('js-spoiler__head--closed')).to.be.true;
    expect(elem('spoiler-body').classList.contains('js-spoiler__body--closed')).to.be.true;
  });

  it('should fire events', function () {
    init(`<div class="js-spoiler" id="spoiler">
      <button class="js-spoiler__head" id="spoiler-head"></button>
      <div class="js-spoiler__body"></div>
    </div>`);

    let spoiler = SpoilerFactory.createComp(Spoiler, elem('spoiler'));
    expect(spoiler.opened).to.be.false;
    elem('spoiler').addEventListener(DefaultOptions.afterChangeStateEvent || '', function (e: SpoilerChangeStateEvent) {
      expect(e.detail.newStateIsOpened).to.be.true;
    });
    spoiler.toggle();
  });

  it('should cancel switching from event handler', function () {
    init(`<div class="js-spoiler" id="spoiler">
      <button class="js-spoiler__head" id="spoiler-head"></button>
      <div class="js-spoiler__body"></div>
    </div>`);

    let spoiler = SpoilerFactory.createComp(Spoiler, elem('spoiler'));
    elem('spoiler').addEventListener(DefaultOptions.beforeChangeStateEvent || '', (e: SpoilerChangeStateEvent) => {
      expect(e.detail.newStateIsOpened).to.be.true;
      e.preventDefault();
    });
    expect(spoiler.opened).to.be.false;
    expect(spoiler.toggle()).to.be.false;
    expect(spoiler.opened).to.be.false;
  });

  it('should sync text', function () {
    init(`<div class="js-spoiler" id="spoiler">
      <button class="js-spoiler__head" id="spoiler-head" data-spoiler-opened-text="Opened" data-spoiler-closed-text="Closed"></button>
      <div class="js-spoiler__body"></div>
    </div>`);

    let spoiler = SpoilerFactory.createComp(Spoiler, elem('spoiler'));
    expect(spoiler.opened).to.be.false;
    expect(elem('spoiler-head').textContent).to.be.equal('Closed');
    spoiler.setOpened(true);
    expect(elem('spoiler-head').textContent).to.be.equal('Opened');
  });

  it('should handle nested spoilers', function () {
    init(`<div class="js-spoiler" id="spoiler">
      <button class="js-spoiler__head" id="spoiler-head"></button>
      <div class="js-spoiler__body">
        <div class="js-spoiler" id="spoiler-nested">
          <button class="js-spoiler__head" id="spoiler-nested-head"></button>
          <div class="js-spoiler__body"></div>
        </div>      
      </div>
    </div>`);

    SpoilerFactory.init();
    let spoiler = SpoilerFactory.fromRoot(elem('spoiler')) as Spoiler;
    spoiler.setOpened(true);
    expect(elem('spoiler-head').classList.contains('js-spoiler__head--opened')).to.be.true;
    expect(elem('spoiler-nested-head').classList.contains('js-spoiler__head--opened')).to.be.false;
  });
});

describe("SpoilerGroup", function () {
  it('should create spoiler group', function () {
    init(`<div class="js-spoiler-group" id="spoiler-group">
      <div class="js-spoiler" id="spoiler1"></div>
      <div class="js-spoiler" id="spoiler2"></div>
      <div class="js-spoiler" id="spoiler3"></div>
    </div>`);

    SpoilerFactory.init();
    let group = SpoilerGroupFactory.createComp(SpoilerGroup, elem('spoiler-group'));
    expect(group).to.not.be.null;
    expect(group.exclusive).to.be.false;
    expect(group.spoilerCount).to.be.equal(3);

    let spoiler1 = SpoilerFactory.fromRoot(elem('spoiler1')) as Spoiler,
        spoiler2 = SpoilerFactory.fromRoot(elem('spoiler2')) as Spoiler,
        spoiler3 = SpoilerFactory.fromRoot(elem('spoiler3')) as Spoiler;

    expect(spoiler1.setOpened(true));

    expect(spoiler1.opened).to.be.true;
    expect(spoiler2.opened).to.be.false;
    expect(spoiler3.opened).to.be.false;

    expect(spoiler2.setOpened(true));

    expect(spoiler1.opened).to.be.true;
    expect(spoiler2.opened).to.be.true;
    expect(spoiler3.opened).to.be.false;
  });

  it('should create exclusive spoiler group', function () {
    init(`<div class="js-spoiler-group" id="spoiler-group" data-spoiler-group-exclusive>
      <div class="js-spoiler" id="spoiler1"></div>
      <div class="js-spoiler" id="spoiler2"></div>
      <div class="js-spoiler" id="spoiler3"></div>
    </div>`);

    SpoilerFactory.init();
    let group = SpoilerGroupFactory.createComp(SpoilerGroup, elem('spoiler-group'));
    expect(group.exclusive).to.be.true;

    let spoiler1 = SpoilerFactory.fromRoot(elem('spoiler1')) as Spoiler,
        spoiler2 = SpoilerFactory.fromRoot(elem('spoiler2')) as Spoiler,
        spoiler3 = SpoilerFactory.fromRoot(elem('spoiler3')) as Spoiler;

    expect(spoiler1.setOpened(true));

    expect(spoiler1.opened).to.be.true;
    expect(spoiler2.opened).to.be.false;
    expect(spoiler3.opened).to.be.false;

    expect(spoiler2.setOpened(true));

    expect(spoiler1.opened).to.be.false;
    expect(spoiler2.opened).to.be.true;
    expect(spoiler3.opened).to.be.false;
  });

  it('should close already opened spoilers', function () {
    init(`<div class="js-spoiler-group" id="spoiler-group" data-spoiler-group-exclusive>
      <div class="js-spoiler js-spoiler--opened" id="spoiler1"></div>
      <div class="js-spoiler js-spoiler--opened" id="spoiler2"></div>
      <div class="js-spoiler js-spoiler--opened" id="spoiler3"></div>
    </div>`);

    SpoilerFactory.init();
    let group = SpoilerGroupFactory.createComp(SpoilerGroup, elem('spoiler-group'));
    expect(group.exclusive).to.be.true;

    let spoiler1 = SpoilerFactory.fromRoot(elem('spoiler1')) as Spoiler,
        spoiler2 = SpoilerFactory.fromRoot(elem('spoiler2')) as Spoiler,
        spoiler3 = SpoilerFactory.fromRoot(elem('spoiler3')) as Spoiler;

    expect(spoiler1.opened).to.be.true;
    expect(spoiler2.opened).to.be.false;
    expect(spoiler3.opened).to.be.false;
  });

  it('should open first spoiler by default', function () {
    init(`<div class="js-spoiler-group" id="spoiler-group" data-spoiler-group-exclusive data-spoiler-group-opened-index="0">
      <div class="js-spoiler" id="spoiler1"></div>
      <div class="js-spoiler" id="spoiler2"></div>
      <div class="js-spoiler" id="spoiler3"></div>
    </div>`);

    SpoilerFactory.init();
    let group = SpoilerGroupFactory.createComp(SpoilerGroup, elem('spoiler-group'));
    expect(group.exclusive).to.be.true;

    let spoiler1 = SpoilerFactory.fromRoot(elem('spoiler1')) as Spoiler,
        spoiler2 = SpoilerFactory.fromRoot(elem('spoiler2')) as Spoiler,
        spoiler3 = SpoilerFactory.fromRoot(elem('spoiler3')) as Spoiler;

    expect(spoiler1.opened).to.be.true;
    expect(spoiler2.opened).to.be.false;
    expect(spoiler3.opened).to.be.false;
  });
});
