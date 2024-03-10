/**
 * Модуль создания модключения
 * @module Connection
 */

/**
 * Создает подключение через getInstance метод
 * @example
 * const connection = Connection.getInstance();
 */
class Connection {
  /**
   * @type {RTCMultiConnection}
   */
  static #_instance = null;

  /**
   * Создает объект класса RTCMultiConnection
   * @returns {RTCMultiConnection} объект класса типа RTCMultiConnection
   * @see {@link https://github.com/muaz-khan/RTCMultiConnection GitHub}
   */
  static getInstance() {
    if (!this.#_instance) {
      this.#_instance = new RTCMultiConnection();
    }

    return this.#_instance;
  }
}

export default Connection;
