//Function to fetch data via API
async function fetchDataAsync(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

//Function to create elements
function elementCreator(tag, { ...props }) {
  const el = document.createElement(tag);
  Object.assign(el, props);
  return el;
}
