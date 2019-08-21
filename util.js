exports.toRecords = (xs, getId = x => x.id) =>
  xs.reduce((acc, x) => {
    acc[getId(x)] = x;
    return acc;
  }, {});
