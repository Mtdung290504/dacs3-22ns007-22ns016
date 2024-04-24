document.querySelector('#find-class').addEventListener('input', event => {
    document.querySelectorAll('.class-box a').forEach(_class => {
        _class.style.display = _class.textContent
        .toLocaleLowerCase()
        .includes(event.target.value.toLocaleLowerCase()) ? 'block' : 'none';
    });
});

document.querySelector('#find-document').addEventListener('input', event => {
    event.target.closest('.big-ctn').querySelectorAll('.document-category:not(.big-category)').forEach(dc => {
        dc.parentElement.style.display = dc.textContent.toLocaleLowerCase()
        .includes(event.target.value.toLocaleLowerCase()) ? 'block' : 'none';
    });
});

document.querySelector('#find-quest-lib').addEventListener('input', event => {
    event.target.closest('.big-ctn').querySelectorAll('.document-category:not(.big-category)').forEach(dc => {
        dc.parentElement.style.display = dc.textContent.toLocaleLowerCase()
        .includes(event.target.value.toLocaleLowerCase()) ? 'block' : 'none';
    });
});

document.querySelectorAll('details .detail input[type="text"]').forEach(ipt => {
    ipt.addEventListener('input', event =>{
        ipt.parentElement.querySelectorAll('a').forEach(a => {
            a.style.display = a.textContent.toLocaleLowerCase()
            .includes(event.target.value.toLocaleLowerCase()) ? 'block' : 'none';
        });
    });
});

document.querySelectorAll('.icon.edit-icon.edit-doc-icon').forEach(icon => {
    icon.addEventListener('click', event => {
        event.preventDefault();
        const docId = icon.closest('summary').dataset.docId;
        openModal('editDocument', docId);
    });
});

document.querySelectorAll('.icon.edit-icon.edit-quest-lib-icon').forEach(icon => {
    icon.addEventListener('click', event => {
        event.preventDefault();
        const questLibId = icon.closest('summary').dataset.questLibId;
        openModal('editQuestLib', questLibId);
    });
});

document.querySelectorAll('.icon.download-icon').forEach(icon => {
    icon.addEventListener('click', event => {
        event.preventDefault();
        const docId = icon.closest('summary').dataset.docId;
        //Send ajax request to get necesary data
    });
});

const modal = document.querySelector('.modal-container');
modal.addEventListener('click', event => {
    if(Array.from(event.target.classList).includes('modal-container')) {
        document.body.classList.remove('open-modal');
    }
});

function openModal(type, documentId) {
    document.body.classList.add('open-modal');
    document.body.querySelector('.modal .modal-body').innerHTML = '';//Reset modal
    alert(documentId);

    //Send ajax request to get necesary data
    //Ex: const data = RequestHandler.getDocumentDataBy(documentId);
    const data = {
        categoryId: 1,
        categoryName: 'Bộ slide Mạng MT',
        docList: [
            {id: 14, name: 'Chuong_1.pptx'},
            {id: 21, name: 'Chuong_2.pptx'},
            {id: 34, name: 'Chuong_3.pptx'},
            {id: 36, name: 'Chuong_4.pptx'},
            {id: 49, name: 'Chuong_5.pptx'},
            {id: 50, name: 'Chuong_6.pptx'},
            {id: 50, name: 'Chuong_7.pptx'},
            {id: 50, name: 'Chuong_8.pptx'},
        ]
    };
    
    new ModalContent(type, data).buildModalContent(modal);
}