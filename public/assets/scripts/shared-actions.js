document.querySelector('.btn').addEventListener('click', () => {
    document.querySelector('.body').classList.toggle('open-side-nav');
});

document.querySelectorAll('summary').forEach(smr => {
    smr.setAttribute('title', 'More...');
})

// document.querySelectorAll('details').forEach(dts => {
//     dts.addEventListener('dblclick', event => {
//         event.stopPropagation();
//         if(dts.getAttribute('open') == '')
//             dts.removeAttribute('open');
//     })
// })

const modal = document.querySelector('.modal-container');
modal.addEventListener('click', event => {
    if(Array.from(event.target.classList).includes('modal-container')) {
        document.body.classList.remove('open-modal');
    }
});

function openModal(type, docCategoryId) {
    let endpoint = '', 
        data = null, 
        callBack = null;

    switch (type) {
        case 'editDocument': {
            endpoint = 'get-doc-by-doc-category';
            data = { 'doc-category-id': docCategoryId };
            callBack = ({ e, m, d }) => {
                if(e) {
                    alert(e);
                    return;
                }
                console.log(d);
                new ModalContent(type, d).buildModalContent(modal);
                document.body.classList.add('open-modal');
            };
            break;            
        }

        case 'editQuestLib':
            
            break;

        case 'editClassFileAttaches': {
            endpoint = 'get-all-doc-and-doc-categories';
            data = {};
            callBack = ({ e, m, d }) => {
                if(e) {
                    alert(e);
                    return;
                }
                console.log(d);
                new ModalContent(type, d).buildModalContent(modal);
                document.body.classList.add('open-modal');
            };
            break;
        }
        default:
            break;
    }

    if(!callBack) return;

    RequestHandler.sendRequest('ajax/' + endpoint, data).then(callBack).catch(error => {
        console.log(error);
    });
}

function resetModal(body, header) {
    if(header)
        document.body.querySelector('.modal .modal-header').innerHTML = '';
    if(body)
        document.body.querySelector('.modal .modal-body').innerHTML = '';
}