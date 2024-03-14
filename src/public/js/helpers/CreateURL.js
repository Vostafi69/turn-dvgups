class CreateURL {
  static addParams(baseURL, params) {
    if (params) {
      const newURL = new URL(baseURL);

      for (const paramName in params) {
        if (Object.hasOwnProperty.call(params, paramName)) {
          newURL.searchParams.set(paramName, params[paramName]);
        }
      }

      return newURL;
    }
  }
}

export default CreateURL;
