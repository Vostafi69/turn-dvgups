export class Dish {
  _ratios = ["4:3", "16:9", "1:1", "1:2"];

  _dish = false;
  _conference = false;
  _cameras = 0;
  _margin = 10;
  _aspect = 0;
  _video = false;
  _ratio = this.ratio();

  constructor(scenary) {
    this._scenary = scenary;
    this.create();
    this.render();

    return this;
  }

  /**
   * @param {number} camerasCount
   */
  set setCamerasCount(camerasCount) {
    this._cameras = camerasCount;
  }

  create() {
    try {
      this._conference = document.createElement("div");
      this._conference.classList.add("Conference");

      this._dish = document.createElement("div");
      this._dish.classList.add("Dish");

      this._conference.appendChild(this._dish);
    } catch (e) {
      console.error("Could not create");
    }
  }

  append() {
    this._scenary.appendChild(this._conference);
  }

  dimensions() {
    this._width = this._dish.offsetWidth - this._margin * 2;
    this._height = this._dish.offsetHeight - this._margin * 2;
  }

  render(profiles) {
    if (this._dish.children) {
      for (let i = this._cameras; i < this._dish.children.length; i++) {
        const camera = this._dish.children[i];
        this._dish.removeChild(camera);
      }
    }

    for (let i = this._dish.children.length; i < this._cameras; i++) {
      const camera = document.createElement("div");

      const { userId, userName } = profiles[i];

      camera.setAttribute("data-user-id", userId);
      camera.classList.add("profile");

      camera.innerHTML = `
        <div class="profile__meta">
          <div class="profile__name">${userName}</div>
          <div class="profile__group">БО241ПИН</div>
        </div>
        <div class="profile__streams">
          <img class="profile__audio-stream icon" src="img/micro-off.svg" alt="microphone" />
        </div>
        <div class="profile__video-container">
          <video class="profile__video" style="" />
        </div>
      `;

      this._dish.appendChild(camera);
    }
  }

  resizer(width) {
    for (let s = 0; s < this._dish.children.length; s++) {
      const element = this._dish.children[s];

      element.style.margin = this._margin + "px";
      element.style.width = width + "px";
      element.style.height = width * this._ratio + "px";
      element.setAttribute("data-aspect", this._ratios[this._aspect]);
    }
  }

  resize() {
    this.dimensions();

    let max = 0;
    let i = 1;
    while (i < 5000) {
      let area = this.area(i);
      if (area === false) {
        max = i - 1;
        break;
      }
      i++;
    }

    max = max - this._margin * 2;

    this.resizer(max);
  }

  ratio() {
    var ratio = this._ratios[this._aspect].split(":");
    return ratio[1] / ratio[0];
  }

  area(increment) {
    let i = 0;
    let w = 0;
    let h = increment * this._ratio + this._margin * 2;
    while (i < this._dish.children.length) {
      if (w + increment > this._width) {
        w = 0;
        h = h + increment * this._ratio + this._margin * 2;
      }
      w = w + increment + this._margin * 2;
      i++;
    }
    if (h > this._height || increment > this._width) return false;

    return increment;
  }

  ratios() {
    return this._ratios;
  }

  cameras() {
    return this._cameras;
  }

  aspect(i) {
    this._aspect = i;
    this._ratio = this.ratio();
    this.resize();
  }

  expand() {
    const screens = this._conference.querySelector(".Screen");
    if (screens) {
      this._conference.removeChild(screens);
    } else {
      let screen = document.createElement("div");
      screen.classList.add("Screen");
      this._conference.prepend(screen);
    }
    this.resize();
  }
}
