export const isComparer = (v1, v2) => {
  if (!v1) {
    return -1;
  } else if (!v2) {
    return 1;
  }
  if (v1.trim) {
    return v1.trim().localeCompare(v2.trim());
  } else {
    return v1.localeCompare(v2);
  }
};

export const isNumericComparer = (v1, v2) => {
  if (!v1) {
    return -1;
  } else if (!v2) {
    return 1;
  }

  if (v1 > v2) {
    return 1;
  } else if (v1 == v2) {
    return 0;
  } else {
    return -1;
  }
};

export const convertResponseToCamelCase = (response) => {
  let returnItem = {};
  for (var key in response) {
    let newKey = key.substring(0, 1).toLowerCase() + key.substring(1, key.length);
    returnItem[newKey] = response[key];
  }
  return returnItem;
};
