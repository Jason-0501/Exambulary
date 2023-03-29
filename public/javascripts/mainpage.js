let bar=new Array(10);
for(step=1;step<10;step++){
    document.getElementById('bar'+step).textContent = bar[step];
}
bar.addEventListener('mouseover', () => {
    bar.style.width = '15px';})