const uniqueKey = ((key = 0) => {
  return () => `${window.name}[${++key}]`;
})();

export default uniqueKey;
