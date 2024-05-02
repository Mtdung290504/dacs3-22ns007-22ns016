const [btnManageClassDocument, btnManageStudent] = ['#manage-class-documents', '#manage-student'].map(selector => document.querySelector(selector));

btnManageClassDocument.addEventListener('click', () => {
    resetModal();
    RequestHandler.sendRequest('ajax/get-all-doc-and-doc-categories', {})
    .then(({ e, m, d }) => {
        if(e) {
            alert(e);
            return;
        }
        // console.log(d);
        new ModalContent('editClassFileAttaches', d).buildModalContent(modal);
        document.body.classList.add('open-modal');
    }).catch(error => {
        console.log(error);
    });
});

btnManageStudent.addEventListener('click', () => {
    resetModal();
    RequestHandler.sendRequest('ajax/student-from-class', {}, 'GET')
    .then(({ e, m, d }) => {
        if(e) {
            alert(e);
            return;
        }
        // console.log(d);
        new ModalContent('manageStudent', d).buildModalContent(modal);
        document.body.classList.add('open-modal');
    }).catch(error => {
        console.log(error);
    });
})