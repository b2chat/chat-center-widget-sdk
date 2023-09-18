const uniqueKey = ((key = 0) => {
  return () => `${++key}${window.name}`;
})();

export default uniqueKey;
