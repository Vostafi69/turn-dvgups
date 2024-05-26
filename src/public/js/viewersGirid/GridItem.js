export class GridItem {
  constructor(participantId, participantName, participantGroup) {
    this._id = participantId;
    this._participantName = participantName;
    this._participantGroup = participantGroup;

    return this._createGridItem();
  }

  get id() {
    return this._id;
  }

  _createGridItem() {
    const gridItem = document.createElement("div");
    gridItem.classList.add("swiper-slide");
    gridItem.classList.add("grid__slide");

    gridItem.innerHTML = `
              <div class="participant">
                <div class="participant__wrapper" data-participant-id='${this._id}'>
                  <div class="participant__title">${this._participantName}</div>
                </div>
              </div>`;

    return gridItem;
  }
}
