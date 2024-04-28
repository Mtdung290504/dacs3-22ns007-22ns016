const sender = new RequestHandler();

// input to find classes
document.querySelector('#find-class').addEventListener('input', event => {
    document.querySelectorAll('.class-box a').forEach(_class => {
        _class.style.display = _class.textContent
        .toLocaleLowerCase()
        .includes(event.target.value.toLocaleLowerCase()) ? 'block' : 'none';
    });
});

// input to find document categories
document.querySelector('#find-document').addEventListener('input', event => {
    event.target.closest('.big-ctn').querySelectorAll('.document-category:not(.big-category)').forEach(dc => {
        dc.parentElement.style.display = dc.textContent.toLocaleLowerCase()
        .includes(event.target.value.toLocaleLowerCase()) ? 'block' : 'none';
    });
});

// input to find quest lib
document.querySelector('#find-quest-lib').addEventListener('input', event => {
    event.target.closest('.big-ctn').querySelectorAll('.document-category:not(.big-category)').forEach(dc => {
        dc.parentElement.style.display = dc.textContent.toLocaleLowerCase()
        .includes(event.target.value.toLocaleLowerCase()) ? 'block' : 'none';
    });
});

// input to find sub document in document categories
document.querySelectorAll('details .detail input[type="text"]').forEach(ipt => {
    ipt.addEventListener('input', event =>{
        ipt.parentElement.querySelectorAll('a').forEach(a => {
            a.style.display = a.textContent.toLocaleLowerCase()
            .includes(event.target.value.toLocaleLowerCase()) ? 'block' : 'none';
        });
    });
});

// btn to edit doc category and it docs
function addActionEditDoc() {
    document.querySelectorAll('.icon.edit-icon.edit-doc-icon').forEach(icon => {
        icon.addEventListener('click', event => {
            event.preventDefault();
            const docCategoryId = icon.closest('summary').dataset.docCategoryId;
            openModal('editDocument', docCategoryId);
        });
    });    
}
addActionEditDoc();

// btn to edit quest lib and it quests
document.querySelectorAll('.icon.edit-icon.edit-quest-lib-icon').forEach(icon => {
    icon.addEventListener('click', event => {
        event.preventDefault();
        const questLibId = icon.closest('summary').dataset.questLibId;
        openModal('editQuestLib', questLibId);
    });
});

// btn to download all file in doccategory
document.querySelectorAll('.icon.download-icon').forEach(icon => {
    icon.addEventListener('click', event => {
        event.preventDefault();
        const docCategoryId = icon.closest('summary').dataset.docCategoryId;
        //Send ajax request to get necesary data
    });
});

// btn to create class
document.querySelector('#create-class').addEventListener('click', async ()=>{
    const className = prompt('Tên lớp học:');
    if(className.length > 49) {
        alert('Tên lớp học quá dài!')
        return;
    }
    const formData = new FormData();
    formData.append('class-name', className);

    try {
        const response = await fetch('/ajax/add-class', {
            method: 'POST',
            body: formData
        });

        if(response.ok) {
            const { e, m, d } = await response.json();
            const { navItem, gridItem } = d;
            document.querySelector('.class-box').innerHTML += gridItem;
            document.querySelector('.side-nav').innerHTML += navItem;
            alert(m);
        }

    } catch (error) {
        console.error(error.message);
    }
});

// btn to create new doc category
function addActionCreateDoc() {
    document.querySelector('#new-doc-category').addEventListener('click', async () => {
        const categoryName = prompt('Tên danh mục tài liệu:');
        if(categoryName.length > 49) {
            alert('Tên danh mục tài liệu quá dài!');
            return;
        }
        const formData = new FormData();
        formData.append('doc-category-name', categoryName);

        try {
            const response = await fetch('/ajax/add-doc-category', {
                method: 'POST',
                body: formData
            });

            if(response.ok) {
                const { e, m, d } = await response.json();
                const { docCategoryItem } = d;
                document.querySelector('#document-category-container').innerHTML += docCategoryItem;
                addActionEditDoc();
                addActionCreateDoc();
                alert(m);
            }

        } catch (error) {
            console.error(error.message);
        }
    });
}
addActionCreateDoc();

const modal = document.querySelector('.modal-container');
modal.addEventListener('click', event => {
    if(Array.from(event.target.classList).includes('modal-container')) {
        document.body.classList.remove('open-modal');
    }
});

function openModal(type, documentId) {
    document.body.classList.add('open-modal');
    document.body.querySelector('.modal .modal-body').innerHTML = '';//Reset modal

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