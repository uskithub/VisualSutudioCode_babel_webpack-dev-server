window.addEventListener('load', e => {
  console.log('load');

  let b = document.querySelector('#button');
  
  b.addEventListener('click', e => {
    console.log('click');
  });
});
