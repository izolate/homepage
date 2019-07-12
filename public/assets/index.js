function handleWindowLoad() {
  console.log('Hello, world!');

  if (window.hljs) {
    window.hljs.initHighlightingOnLoad();
  }
};

window.addEventListener('load', handleWindowLoad);
