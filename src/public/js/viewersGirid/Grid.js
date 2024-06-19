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
    while (this._grid.firstChild) {
      this._grid.removeChild(this._grid.firstChild);
    }

    if (this._items.length !== 0) {
      this._items.forEach((item) => {
        this._grid.appendChild(item);
      });
    }

    PARTICIPANTS_SWIPER.update();
  }
}
