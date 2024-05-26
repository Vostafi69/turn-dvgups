import { PARTICIPANTS_SWIPER } from "../modules/swiper";

export class Grid {
  _items = [];

  constructor(grid) {
    this._grid = grid;
  }

  update(viewers) {
    if (!this._grid) throw new Error("Контейнер не предоставлен!");

    this._items = viewers;
    this._update();
  }

  _update() {
    [].forEach.call(this._grid.children, (child) => {
      child.remove();
    });

    if (this._items.length !== 0) {
      this._items.forEach((item) => {
        this._grid.appendChild(item);
      });
    }

    PARTICIPANTS_SWIPER.update();
  }
}
