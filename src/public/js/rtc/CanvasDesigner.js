/**
 * Модуль создания модключения
 * @module CanvasDesigner
 */

/**
 * Создает подключение через getInstance метод
 * @example
 * const connection = Connection.getInstance();
 */
class Canvas {
  /**
   * @type {CanvasDesigner}
   */
  static #_instance = null;

  /**
   * Создает объект класса CanvasDesigner
   * @returns {CanvasDesigner} объект класса типа CanvasDesigner
   * @see {@link https://github.com/muaz-khan/RTCMultiConnection GitHub}
   */
  static getInstance() {
    if (!this.#_instance) {
      this.#_instance = new CanvasDesigner();
    }

    return this.#_instance;
  }
}

export default Canvas;
