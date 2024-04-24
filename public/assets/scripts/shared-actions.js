document.querySelector('.btn').addEventListener('click', () => {
    document.querySelector('.body').classList.toggle('open-side-nav');
});

document.querySelectorAll('summary').forEach(smr => {
    smr.setAttribute('title', 'More...');
})

document.querySelectorAll('details').forEach(dts => {
    dts.addEventListener('dblclick', event => {
        event.stopPropagation();
        if(dts.getAttribute('open') == '')
            dts.removeAttribute('open');
    })
})