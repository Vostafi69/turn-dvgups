class LocalStorage {
  #_key;

  constructor(key) {
    this.#_key = key;
  }

  getItem() {
    const storage = localStorage.getItem(this.#_key);
    let _storage = false;

    if (storage) {
      try {
        _storage = JSON.parse(storage);
      } catch (error) {
        console.log(error);
      }
    }

    return _storage;
  }

  setItem(value) {
    const _value = JSON.stringify(value);
    localStorage.setItem(this.#_key, _value);

    return true;
  }

  removeItem() {
    localStorage.removeItem(this.#_key);
  }
}

export default LocalStorage;
